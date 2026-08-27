"use server";

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { condominiums, condo_technical_specs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { CreateCondominiumValues, CondoTechnicalSpecValues, createCondominiumSchema, condoTechnicalSpecSchema } from '@/schemas/condominium.schema';

async function validateAuth() {
  const session = await auth();
  if (!session?.user || session.user.role === 'FORNECEDOR') {
    throw new Error('Unauthorized');
  }
  if (!session.user.organization_id) {
    throw new Error('User has no organization associated');
  }
  return session.user.organization_id;
}

export async function listCondominiums() {
  const organization_id = await validateAuth();
  
  const list = await db.select().from(condominiums)
    .where(eq(condominiums.organization_id, organization_id))
    .orderBy(desc(condominiums.created_at));
    
  const withSpecs = await Promise.all(list.map(async (condo) => {
    const spec = await db.select().from(condo_technical_specs).where(eq(condo_technical_specs.condominium_id, condo.id)).limit(1);
    return { ...condo, condo_technical_specs: spec[0] || null };
  }));
  
  return withSpecs;
}

export async function createCondominium(data: CreateCondominiumValues) {
  const organization_id = await validateAuth();
  
  const parsed = createCondominiumSchema.parse(data);

  const [newCondo] = await db.insert(condominiums).values({
    organization_id,
    name: parsed.name,
    address: parsed.address,
  }).returning();

  revalidatePath('/dashboard/condominiums');
  return newCondo;
}

export async function getCondoTechnicalSpec(condoId: string) {
  const organization_id = await validateAuth();

  const condo = await db.query.condominiums.findFirst({
    where: and(
      eq(condominiums.id, condoId),
      eq(condominiums.organization_id, organization_id)
    ),
  });

  if (!condo) {
    throw new Error('Condominium not found or access denied');
  }

  const spec = await db.query.condo_technical_specs.findFirst({
    where: eq(condo_technical_specs.condominium_id, condoId),
  });

  return { condo, spec: spec || null };
}

export async function upsertCondoTechnicalSpec(condoId: string, data: CondoTechnicalSpecValues) {
  const organization_id = await validateAuth();

  // Verify ownership
  const condo = await db.query.condominiums.findFirst({
    where: and(
      eq(condominiums.id, condoId),
      eq(condominiums.organization_id, organization_id)
    ),
  });

  if (!condo) {
    throw new Error('Condominium not found or access denied');
  }

  const parsed = condoTechnicalSpecSchema.parse(data);
  const facadeTypeStr = JSON.stringify(parsed.facade_type);

  await db.insert(condo_technical_specs).values({
    condominium_id: condoId,
    total_floors: parsed.total_floors,
    floor_breakdown: parsed.floor_breakdown,
    facade_type: facadeTypeStr,
    vertical_halls_count: parsed.vertical_halls_count,
    additional_details: parsed.additional_details,
  }).onConflictDoUpdate({
    target: condo_technical_specs.condominium_id,
    set: {
      total_floors: parsed.total_floors,
      floor_breakdown: parsed.floor_breakdown,
      facade_type: facadeTypeStr,
      vertical_halls_count: parsed.vertical_halls_count,
      additional_details: parsed.additional_details,
      updated_at: new Date(),
    }
  });

  revalidatePath(`/dashboard/condominiums/${condoId}/tech-spec`);
  revalidatePath('/dashboard/condominiums');
  
  return { success: true };
}
