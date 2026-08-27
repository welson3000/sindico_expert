"use server";

import { db } from '@/db';
import { users, organizations } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function registerAction(values: any) {
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, values.email),
    });

    if (existingUser) {
      return { error: 'E-mail já está em uso.' };
    }

    const passwordHash = await bcrypt.hash(values.password, 10);

    // Se for Fornecedor, não precisa de organization (neste momento do MVP, ou talvez precise criar uma org p/ ele)
    // O esquema permite organization_id nullable no user.
    // Mas vamos criar uma organização para Sindico/Administradora, ou fornecedor tbm pode ter sua org.
    // A regra diz: 'organization_id (UUID FK nullable)'. 
    // Se Fornecedor, vamos deixar null.
    let orgId = null;

    if (values.role === 'ADMIN_SINDICO' || values.role === 'ADMIN_ADM') {
      const [newOrg] = await db.insert(organizations).values({
        name: values.companyName || 'Nova Organização',
        document: values.document,
      }).returning();
      orgId = newOrg.id;
    }

    await db.insert(users).values({
      organization_id: orgId,
      name: values.name,
      email: values.email,
      document_cnpj_cpf: values.document,
      password_hash: passwordHash,
      role: values.role,
    });

    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'Ocorreu um erro ao criar a conta.' };
  }
}
