import * as z from 'zod';

export const createCondominiumSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
});

export const condoTechnicalSpecSchema = z.object({
  total_floors: z.number().int().min(1, 'Deve ter pelo menos 1 pavimento'),
  floor_breakdown: z.string().min(3, 'Detalhamento deve ter pelo menos 3 caracteres'),
  facade_type: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de fachada'),
  vertical_halls_count: z.number().int().min(1, 'Deve ter pelo menos 1 hall de circulação'),
  additional_details: z.string().optional(),
});

export type CreateCondominiumValues = z.infer<typeof createCondominiumSchema>;
export type CondoTechnicalSpecValues = z.infer<typeof condoTechnicalSpecSchema>;
