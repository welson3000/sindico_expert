import { config } from 'dotenv';
config();
import { db } from './index';
import { organizations, users, condominiums } from './schema';

import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seed start');

  try {
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create 1 organization
    const [org] = await db.insert(organizations).values({
      name: 'Condomínio Master',
      document: '12345678000199',
    }).returning();

    console.log(`Created organization: ${org.id}`);

    // Create 1 sindico
    const [sindico] = await db.insert(users).values({
      organization_id: org.id,
      name: 'João Síndico',
      email: 'sindico@master.com',
      password_hash: hashedPassword,
      role: 'ADMIN_SINDICO',
    }).returning();

    console.log(`Created sindico: ${sindico.id}`);

    // Create 1 fornecedor
    const [fornecedor] = await db.insert(users).values({
      name: 'Fornecedor XYZ',
      email: 'contato@xyz.com',
      document_cnpj_cpf: '98765432000111',
      password_hash: hashedPassword,
      role: 'FORNECEDOR',
    }).returning();

    console.log(`Created fornecedor: ${fornecedor.id}`);

    // Create 1 condominium
    const [condo] = await db.insert(condominiums).values({
      organization_id: org.id,
      name: 'Residencial Master',
      address: 'Rua Principal, 123',
    }).returning();

    console.log(`Created condominium: ${condo.id}`);

    console.log('Seed done');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();
