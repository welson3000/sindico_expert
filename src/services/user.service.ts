'use server';

import { db } from '@/db';
import { users, organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUserProfile(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) return null;

    let organization = null;
    if (user.organization_id) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, user.organization_id),
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      document_cnpj_cpf: user.document_cnpj_cpf || '',
      created_at: user.created_at,
      organizationName: organization?.name || 'Sem organização',
      organizationDocument: organization?.document || '',
    };
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: { name: string; phone?: string; document_cnpj_cpf?: string }) {
  try {
    await db
      .update(users)
      .set({
        name: data.name,
        phone: data.phone || null,
        document_cnpj_cpf: data.document_cnpj_cpf || null,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath('/dashboard/profile');
    revalidatePath('/portal/profile');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error: 'Falha ao atualizar o perfil.' };
  }
}
