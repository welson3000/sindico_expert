"use server";

import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  service_requests,
  condominiums,
  condo_technical_specs,
  request_sections,
  section_photos,
  request_items,
  proposals,
  proposal_items,
  users,
} from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { submitProposalSchema, SubmitProposalValues } from '@/schemas/proposal.schema';

async function validateSupplierAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado. Por favor faça login.');
  }

  // Fetch full user record to ensure document_cnpj_cpf and updated data
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
}

export async function getQuoteDetailsForSupplier(requestId: string) {
  const user = await validateSupplierAuth();

  // 1. Fetch Service Request
  const request = await db.query.service_requests.findFirst({
    where: eq(service_requests.id, requestId),
  });

  if (!request) {
    throw new Error('Solicitação de serviço não encontrada');
  }

  // 2. Fetch Condominium and Technical Specs
  const condo = await db.query.condominiums.findFirst({
    where: eq(condominiums.id, request.condominium_id),
  });

  const techSpecs = await db.query.condo_technical_specs.findFirst({
    where: eq(condo_technical_specs.condominium_id, request.condominium_id),
  });

  // 3. Fetch Request Sections and Photos
  const sections = await db.query.request_sections.findMany({
    where: eq(request_sections.request_id, requestId),
    orderBy: (sections, { asc }) => [asc(sections.order)],
  });

  const sectionIds = sections.map((s) => s.id);

  let photosMap: Record<string, typeof section_photos.$inferSelect[]> = {};
  if (sectionIds.length > 0) {
    const allPhotos = await db.query.section_photos.findMany({
      where: (photos, { inArray }) => inArray(photos.section_id, sectionIds),
    });

    for (const photo of allPhotos) {
      if (!photosMap[photo.section_id]) {
        photosMap[photo.section_id] = [];
      }
      photosMap[photo.section_id].push(photo);
    }
  }

  const sectionsWithPhotos = sections.map((sec) => ({
    ...sec,
    photos: photosMap[sec.id] || [],
  }));

  // 4. Fetch Request BOQ Items
  const items = await db.query.request_items.findMany({
    where: eq(request_items.request_id, requestId),
    orderBy: (items, { asc }) => [asc(items.order)],
  });

  // 5. Count total proposals for 5-supplier limit check
  const proposalsCountResult = await db
    .select({ total: count() })
    .from(proposals)
    .where(eq(proposals.request_id, requestId));

  const proposalsCount = Number(proposalsCountResult[0]?.total || 0);
  const maxSuppliers = request.max_suppliers ?? 5;
  const isLimitReached = proposalsCount >= maxSuppliers;

  // 6. BLIND BIDDING RIGID SECURITY:
  // ONLY query the current supplier's own proposal. NEVER query or return competitor proposals.
  const existingProposal = await db.query.proposals.findFirst({
    where: and(
      eq(proposals.request_id, requestId),
      eq(proposals.supplier_id, user.id)
    ),
  });

  let existingProposalItems: typeof proposal_items.$inferSelect[] = [];
  if (existingProposal) {
    existingProposalItems = await db.query.proposal_items.findMany({
      where: eq(proposal_items.proposal_id, existingProposal.id),
    });
  }

  return {
    request,
    condo: condo ? { id: condo.id, name: condo.name, address: condo.address } : null,
    techSpecs: techSpecs || null,
    sections: sectionsWithPhotos,
    items,
    supplierInfo: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'Telefone Não Informado',
      document_cnpj_cpf: user.document_cnpj_cpf || 'CNPJ Não Informado',
    },
    proposalsCount,
    maxSuppliers,
    isLimitReached,
    existingProposal: existingProposal || null,
    existingProposalItems,
  };
}

export async function submitProposal(data: SubmitProposalValues) {
  try {
    const user = await validateSupplierAuth();
    const parsed = submitProposalSchema.parse(data);

    // 1. Fetch request to check status and max suppliers limit
    const request = await db.query.service_requests.findFirst({
      where: eq(service_requests.id, parsed.requestId),
    });

    if (!request) {
      return { success: false, error: 'Solicitação de serviço não encontrada' };
    }

    if (request.status !== 'OPEN') {
      return { success: false, error: 'Esta solicitação não está aberta para recebimento de propostas.' };
    }

    // 2. Check if supplier already submitted a proposal
    const existingProposal = await db.query.proposals.findFirst({
      where: and(
        eq(proposals.request_id, parsed.requestId),
        eq(proposals.supplier_id, user.id)
      ),
    });

    if (existingProposal) {
      return { success: false, error: 'Você já enviou uma proposta comercial para esta solicitação.' };
    }

    // 3. Check 5-supplier limit
    const proposalsCountResult = await db
      .select({ total: count() })
      .from(proposals)
      .where(eq(proposals.request_id, parsed.requestId));

    const proposalsCount = Number(proposalsCountResult[0]?.total || 0);
    const maxSuppliers = request.max_suppliers ?? 5;

    if (proposalsCount >= maxSuppliers) {
      return { success: false, error: `Limite máximo de ${maxSuppliers} fornecedores atingido para esta solicitação.` };
    }

    // 4. Fetch request items to calculate amounts accurately on backend
    const reqItems = await db.query.request_items.findMany({
      where: eq(request_items.request_id, parsed.requestId),
    });

    const reqItemsMap = new Map(reqItems.map((item) => [item.id, Number(item.quantity)]));

    // Compute total proposal amount and item totals
    let calculatedGrandTotal = 0;
    const itemsToInsert = parsed.items.map((item) => {
      const qty = reqItemsMap.get(item.request_item_id);
      if (qty === undefined) {
        throw new Error(`Item da solicitação ${item.request_item_id} não encontrado`);
      }
      const itemTotal = Number((qty * item.unit_price).toFixed(2));
      calculatedGrandTotal += itemTotal;

      return {
        request_item_id: item.request_item_id,
        unit_price: item.unit_price.toFixed(2),
        total_price: itemTotal.toFixed(2),
      };
    });

    const finalGrandTotal = calculatedGrandTotal.toFixed(2);

    // 5. Execute sequential inserts (neon-http driver does not support interactive db.transaction)
    const [newProposal] = await db
      .insert(proposals)
      .values({
        request_id: parsed.requestId,
        supplier_id: user.id,
        supplier_name: user.name,
        supplier_cnpj: user.document_cnpj_cpf || 'CNPJ Não Informado',
        total_amount: finalGrandTotal,
        status: 'SUBMITTED',
      })
      .returning();

    if (itemsToInsert.length > 0) {
      const proposalItemsValues = itemsToInsert.map((item) => ({
        proposal_id: newProposal.id,
        request_item_id: item.request_item_id,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      await db.insert(proposal_items).values(proposalItemsValues);
    }

    revalidatePath(`/portal/quote/${parsed.requestId}`);
    revalidatePath('/portal/mural');

    return { success: true, proposalId: newProposal.id };
  } catch (err: any) {
    console.error('Error submitting proposal:', err);
    return {
      success: false,
      error: err?.message || 'Erro ao processar o envio da proposta comercial.',
    };
  }
}

