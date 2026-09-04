"use server";

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { service_requests, request_sections, section_photos, request_items, condominiums, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { CreateRequestValues, createRequestSchema } from '@/schemas/request.schema';
import { sendNewQuoteAlertToSuppliers } from './notification.service';

async function validateAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado. Por favor faça login.');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  if (user.role === 'FORNECEDOR') {
    throw new Error('Fornecedores não possuem permissão para criar solicitações.');
  }

  if (!user.organization_id) {
    throw new Error('Usuário não possui uma organização associada.');
  }

  return {
    ...user,
    organization_id: user.organization_id as string,
  };
}

export async function createServiceRequest(condoId: string, data: CreateRequestValues) {
  const user = await validateAuth();
  const parsed = createRequestSchema.parse(data);

  // Check if condo belongs to user organization
  const condo = await db.query.condominiums.findFirst({
    where: and(
      eq(condominiums.id, condoId),
      eq(condominiums.organization_id, user.organization_id)
    ),
  });

  if (!condo) {
    throw new Error('Condomínio não encontrado ou acesso negado');
  }

  // 1. Create the main service request
  const [newRequest] = await db
    .insert(service_requests)
    .values({
      condominium_id: condoId,
      title: parsed.title,
      status: 'OPEN',
      created_by: user.id,
    })
    .returning();

  const requestId = newRequest.id;

  // 2. Insert sections and their photos
  if (parsed.sections && parsed.sections.length > 0) {
    for (let sIndex = 0; sIndex < parsed.sections.length; sIndex++) {
      const section = parsed.sections[sIndex];

      const [newSection] = await db
        .insert(request_sections)
        .values({
          request_id: requestId,
          title: section.title,
          description: section.description || null,
          order: sIndex,
        })
        .returning();

      if (section.photos && section.photos.length > 0) {
        const photosToInsert = section.photos.map((photo) => ({
          section_id: newSection.id,
          photo_url: photo.photo_url,
          caption: photo.caption || null,
        }));
        await db.insert(section_photos).values(photosToInsert);
      }
    }
  }

  // 3. Insert BOQ items
  if (parsed.items && parsed.items.length > 0) {
    const itemsToInsert = parsed.items.map((item, iIndex) => ({
      request_id: requestId,
      category_title: item.category_title,
      subcategory_title: item.subcategory_title || null,
      item_description: item.item_description,
      unit: item.unit,
      quantity: item.quantity.toString(),
      order: iIndex,
    }));

    await db.insert(request_items).values(itemsToInsert);
  }

  // Automatic Notification Alert for registered suppliers
  sendNewQuoteAlertToSuppliers({
    requestId,
    title: parsed.title,
    condoName: condo.name,
    condoAddress: condo.address,
    maxSuppliers: 5,
  }).catch((err) => console.error('Erro ao disparar alertas por e-mail no cadastro:', err));

  revalidatePath(`/dashboard/condominiums/${condoId}/requests`);
  revalidatePath('/dashboard/requests');
  revalidatePath('/portal/mural');

  return { success: true, requestId };
}

