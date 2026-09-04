import { pgTable, uuid, text, integer, decimal, pgEnum, timestamp, boolean } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN_SINDICO', 'ADMIN_ADM', 'FORNECEDOR']);
export const statusEnum = pgEnum('status', ['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED']);
export const proposalStatusEnum = pgEnum('proposal_status', ['SUBMITTED', 'ACCEPTED', 'REJECTED']);

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  document: text('document').notNull().unique(),
  plan_status: text('plan_status').default('TRIAL'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  document_cnpj_cpf: text('document_cnpj_cpf'),
  password_hash: text('password_hash').notNull(),
  role: roleEnum('role').notNull(),
  phone: text('phone'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const condominiums = pgTable('condominiums', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  address: text('address').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const condo_technical_specs = pgTable('condo_technical_specs', {
  id: uuid('id').primaryKey().defaultRandom(),
  condominium_id: uuid('condominium_id').notNull().unique().references(() => condominiums.id),
  total_floors: integer('total_floors'),
  floor_breakdown: text('floor_breakdown'),
  facade_type: text('facade_type'),
  vertical_halls_count: integer('vertical_halls_count'),
  additional_details: text('additional_details'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const service_requests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  condominium_id: uuid('condominium_id').notNull().references(() => condominiums.id),
  title: text('title').notNull(),
  status: statusEnum('status').default('OPEN').notNull(),
  max_suppliers: integer('max_suppliers').default(5),
  created_by: uuid('created_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const request_sections = pgTable('request_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').notNull().references(() => service_requests.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').default(0),
  created_at: timestamp('created_at').defaultNow(),
});

export const section_photos = pgTable('section_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  section_id: uuid('section_id').notNull().references(() => request_sections.id, { onDelete: 'cascade' }),
  photo_url: text('photo_url').notNull(),
  caption: text('caption'),
  created_at: timestamp('created_at').defaultNow(),
});

export const request_items = pgTable('request_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').notNull().references(() => service_requests.id, { onDelete: 'cascade' }),
  category_title: text('category_title').notNull(),
  subcategory_title: text('subcategory_title'),
  item_description: text('item_description').notNull(),
  unit: text('unit').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  order: integer('order').default(0),
  created_at: timestamp('created_at').defaultNow(),
});

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_id: uuid('request_id').notNull().references(() => service_requests.id, { onDelete: 'cascade' }),
  supplier_id: uuid('supplier_id').notNull().references(() => users.id),
  supplier_name: text('supplier_name').notNull(),
  supplier_cnpj: text('supplier_cnpj').notNull(),
  total_amount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: proposalStatusEnum('status').default('SUBMITTED').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const proposal_items = pgTable('proposal_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposal_id: uuid('proposal_id').notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  request_item_id: uuid('request_item_id').notNull().references(() => request_items.id),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const project_roadmap_items = pgTable('project_roadmap_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  phase: text('phase').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  is_completed: boolean('is_completed').default(false).notNull(),
  order: integer('order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const supplier_reviews = pgTable('supplier_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplier_id: uuid('supplier_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sindico_id: uuid('sindico_id').notNull().references(() => users.id),
  sindico_name: text('sindico_name').notNull(),
  service_request_id: uuid('service_request_id').references(() => service_requests.id),
  rating_quality: integer('rating_quality').notNull().default(5),
  rating_punctuality: integer('rating_punctuality').notNull().default(5),
  rating_pricing: integer('rating_pricing').notNull().default(5),
  overall_rating: decimal('overall_rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow(),
});

export const supplier_completed_works = pgTable('supplier_completed_works', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplier_id: uuid('supplier_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  condo_name: text('condo_name').notNull(),
  completion_date: timestamp('completion_date').defaultNow(),
  total_value: decimal('total_value', { precision: 12, scale: 2 }),
  scope_description: text('scope_description'),
  created_at: timestamp('created_at').defaultNow(),
});


