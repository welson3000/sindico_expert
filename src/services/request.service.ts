"use server";

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { service_requests, request_sections, section_photos, request_items, condominiums } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { CreateRequestValues, createRequestSchema } from '@/schemas/request.schema';

async function validateAuth() {
  const session = await auth();
  if (!session?.user || session.user.role === 'FORNECEDOR') {
    throw new Error('Unauthorized');
  }
  if (!session.user.organization_id) {
    throw new Error('User has no organization associated');
  }
  return session.user;
}

export async function createServiceRequest(condoId: string, data: CreateRequestValues) {
  const user = await validateAuth();
  const parsed = createRequestSchema.parse(data);

  // Check if condo belongs to user organization
  const condo = await db.query.condominiums.findFirst({
    where: and(
      eq(condominiums.id, condoId),
      eq(condominiums.organization_id, user.organization_id!)
    )
  });

  if (!condo) {
    throw new Error('Condominium not found or access denied');
  }

  // Transaction to insert all related data atomically
  await db.transaction(async (tx) => {
    // 1. Create the main service request
    const [newRequest] = await tx.insert(service_requests).values({
      condominium_id: condoId,
      title: parsed.title,
      status: 'OPEN',
      created_by: user.id,
    }).returning();

    const requestId = newRequest.id;

    // 2. Insert sections and their photos
    for (let sIndex = 0; sIndex < parsed.sections.length; sIndex++) {
      const section = parsed.sections[sIndex];
      
      const [newSection] = await tx.insert(request_sections).values({
        request_id: requestId,
        title: section.title,
        description: section.description,
        order: sIndex,
      }).returning();

      if (section.photos && section.photos.length > 0) {
        const photosToInsert = section.photos.map(photo => ({
          section_id: newSection.id,
          photo_url: photo.photo_url,
          caption: photo.caption,
        }));
        await tx.insert(section_photos).values(photosToInsert);
      }
    }

    // 3. Insert BOQ items
    if (parsed.items && parsed.items.length > 0) {
      const itemsToInsert = parsed.items.map((item, iIndex) => ({
        request_id: requestId,
        category_title: item.category_title,
        subcategory_title: item.subcategory_title,
        item_description: item.item_description,
        unit: item.unit,
        quantity: item.quantity.toString(), // Database schema uses decimal
        order: iIndex,
      }));
      
      await tx.insert(request_items).values(itemsToInsert);
    }
  });

  revalidatePath(`/dashboard/condominiums/${condoId}/requests`);
  revalidatePath('/dashboard/requests');
  
  return { success: true };
}
