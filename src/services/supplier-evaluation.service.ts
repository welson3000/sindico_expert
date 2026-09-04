'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, supplier_reviews, supplier_completed_works, proposals } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface SupplierRankingItem {
  id: string;
  name: string;
  email: string;
  document_cnpj_cpf: string;
  phone: string;
  overallRating: number;
  avgQuality: number;
  avgPunctuality: number;
  avgPricing: number;
  reviewsCount: number;
  proposalsCount: number;
  completedWorksCount: number;
  rankPosition?: number;
}

async function validateUserAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado. Por favor faça login.');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  return user;
}

/**
 * 1. Lista todos os fornecedores credenciados calculando Ranking de Pontuação, Médias e Obras Entregues
 */
export async function getSuppliersWithRanking(): Promise<SupplierRankingItem[]> {
  await validateUserAuth();

  // Fetch all suppliers
  const suppliers = await db.query.users.findMany({
    where: eq(users.role, 'FORNECEDOR'),
    orderBy: [desc(users.created_at)],
  });

  if (suppliers.length === 0) {
    return [];
  }

  const supplierIds = suppliers.map((s) => s.id);

  // Fetch reviews for all suppliers
  const allReviews = await db.query.supplier_reviews.findMany({
    where: (r, { inArray }) => inArray(r.supplier_id, supplierIds),
  });

  // Fetch submitted proposals for all suppliers
  const allProposals = await db.query.proposals.findMany({
    where: (p, { inArray }) => inArray(p.supplier_id, supplierIds),
  });

  // Fetch completed works for all suppliers
  const allWorks = await db.query.supplier_completed_works.findMany({
    where: (w, { inArray }) => inArray(w.supplier_id, supplierIds),
  });

  // Aggregate metrics per supplier
  const rankingList: SupplierRankingItem[] = suppliers.map((s) => {
    const reviews = allReviews.filter((r) => r.supplier_id === s.id);
    const props = allProposals.filter((p) => p.supplier_id === s.id);
    const works = allWorks.filter((w) => w.supplier_id === s.id);

    let avgQuality = 5.0;
    let avgPunctuality = 5.0;
    let avgPricing = 5.0;
    let overallRating = 5.0;

    if (reviews.length > 0) {
      const sumQ = reviews.reduce((sum, r) => sum + r.rating_quality, 0);
      const sumP = reviews.reduce((sum, r) => sum + r.rating_punctuality, 0);
      const sumC = reviews.reduce((sum, r) => sum + r.rating_pricing, 0);

      avgQuality = Number((sumQ / reviews.length).toFixed(1));
      avgPunctuality = Number((sumP / reviews.length).toFixed(1));
      avgPricing = Number((sumC / reviews.length).toFixed(1));
      overallRating = Number(((avgQuality + avgPunctuality + avgPricing) / 3).toFixed(1));
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      document_cnpj_cpf: s.document_cnpj_cpf || 'CNPJ Não Informado',
      phone: s.phone || 'Não informado',
      overallRating,
      avgQuality,
      avgPunctuality,
      avgPricing,
      reviewsCount: reviews.length,
      proposalsCount: props.length,
      completedWorksCount: works.length,
    };
  });

  // Sort by overallRating desc, then reviewsCount desc, then proposalsCount desc
  rankingList.sort((a, b) => {
    if (b.overallRating !== a.overallRating) return b.overallRating - a.overallRating;
    if (b.reviewsCount !== a.reviewsCount) return b.reviewsCount - a.reviewsCount;
    return b.proposalsCount - a.proposalsCount;
  });

  // Assign 1-based rank positions
  return rankingList.map((item, index) => ({
    ...item,
    rankPosition: index + 1,
  }));
}

/**
 * 2. Detalhes completos do Perfil do Fornecedor (Avaliações dos Síndicos + Histórico de Obras)
 */
export async function getSupplierProfileDetails(supplierId: string) {
  await validateUserAuth();

  const supplier = await db.query.users.findFirst({
    where: eq(users.id, supplierId),
  });

  if (!supplier) {
    throw new Error('Fornecedor não encontrado.');
  }

  const reviews = await db.query.supplier_reviews.findMany({
    where: eq(supplier_reviews.supplier_id, supplierId),
    orderBy: [desc(supplier_reviews.created_at)],
  });

  const works = await db.query.supplier_completed_works.findMany({
    where: eq(supplier_completed_works.supplier_id, supplierId),
    orderBy: [desc(supplier_completed_works.completion_date)],
  });

  const props = await db.query.proposals.findMany({
    where: eq(proposals.supplier_id, supplierId),
    orderBy: [desc(proposals.created_at)],
  });

  // Calculate rating summary
  let avgQuality = 5.0;
  let avgPunctuality = 5.0;
  let avgPricing = 5.0;
  let overallRating = 5.0;

  if (reviews.length > 0) {
    const sumQ = reviews.reduce((sum, r) => sum + r.rating_quality, 0);
    const sumP = reviews.reduce((sum, r) => sum + r.rating_punctuality, 0);
    const sumC = reviews.reduce((sum, r) => sum + r.rating_pricing, 0);

    avgQuality = Number((sumQ / reviews.length).toFixed(1));
    avgPunctuality = Number((sumP / reviews.length).toFixed(1));
    avgPricing = Number((sumC / reviews.length).toFixed(1));
    overallRating = Number(((avgQuality + avgPunctuality + avgPricing) / 3).toFixed(1));
  }

  return {
    supplier: {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      document_cnpj_cpf: supplier.document_cnpj_cpf || 'CNPJ Não Informado',
      phone: supplier.phone || 'Não informado',
      created_at: supplier.created_at,
    },
    metrics: {
      overallRating,
      avgQuality,
      avgPunctuality,
      avgPricing,
      reviewsCount: reviews.length,
      proposalsCount: props.length,
      completedWorksCount: works.length,
    },
    reviews,
    works,
    proposals: props,
  };
}

interface SubmitReviewValues {
  supplierId: string;
  serviceRequestId?: string;
  ratingQuality: number;
  ratingPunctuality: number;
  ratingPricing: number;
  comment?: string;
}

/**
 * 3. Envia uma Avaliação do Síndico para um Fornecedor Credenciado
 */
export async function submitSupplierReview(data: SubmitReviewValues) {
  try {
    const currentUser = await validateUserAuth();

    const quality = Math.min(5, Math.max(1, Math.round(data.ratingQuality || 5)));
    const punctuality = Math.min(5, Math.max(1, Math.round(data.ratingPunctuality || 5)));
    const pricing = Math.min(5, Math.max(1, Math.round(data.ratingPricing || 5)));

    const overall = ((quality + punctuality + pricing) / 3).toFixed(2);

    await db.insert(supplier_reviews).values({
      supplier_id: data.supplierId,
      sindico_id: currentUser.id,
      sindico_name: currentUser.name,
      service_request_id: data.serviceRequestId || null,
      rating_quality: quality,
      rating_punctuality: punctuality,
      rating_pricing: pricing,
      overall_rating: overall,
      comment: data.comment || null,
    });

    revalidatePath('/dashboard/suppliers');
    revalidatePath(`/dashboard/suppliers/${data.supplierId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao submeter avaliação do fornecedor:', error);
    return { success: false, error: error?.message || 'Falha ao registrar avaliação.' };
  }
}

interface AddCompletedWorkValues {
  supplierId: string;
  title: string;
  condoName: string;
  totalValue?: number;
  scopeDescription?: string;
}

/**
 * 4. Cadastra uma Obra Entregue no Histórico do Fornecedor
 */
export async function addCompletedWork(data: AddCompletedWorkValues) {
  try {
    await validateUserAuth();

    if (!data.title.trim() || !data.condoName.trim()) {
      return { success: false, error: 'Título da obra e nome do condomínio são obrigatórios.' };
    }

    await db.insert(supplier_completed_works).values({
      supplier_id: data.supplierId,
      title: data.title.trim(),
      condo_name: data.condoName.trim(),
      total_value: data.totalValue ? data.totalValue.toFixed(2) : null,
      scope_description: data.scopeDescription ? data.scopeDescription.trim() : null,
      completion_date: new Date(),
    });

    revalidatePath('/dashboard/suppliers');
    revalidatePath(`/dashboard/suppliers/${data.supplierId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao adicionar obra entregue:', error);
    return { success: false, error: error?.message || 'Falha ao cadastrar obra entregue.' };
  }
}
