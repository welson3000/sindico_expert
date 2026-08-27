import * as z from 'zod';

export const photoSchema = z.object({
  photo_url: z.string().min(1, 'Foto é obrigatória'),
  caption: z.string().optional(),
});

export const sectionSchema = z.object({
  title: z.string().min(3, 'Título da seção é obrigatório'),
  description: z.string().optional(),
  photos: z.array(photoSchema).optional(),
});

export const requestItemSchema = z.object({
  category_title: z.string().min(2, 'Categoria é obrigatória'),
  subcategory_title: z.string().optional(),
  item_description: z.string().min(3, 'Descrição do item é obrigatória'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
});

export const createRequestSchema = z.object({
  title: z.string().min(5, 'Título da solicitação deve ter pelo menos 5 caracteres'),
  sections: z.array(sectionSchema).min(1, 'Adicione pelo menos uma seção fotográfica'),
  items: z.array(requestItemSchema).min(1, 'Adicione pelo menos um item na planilha de quantitativos'),
});

export type CreateRequestValues = z.infer<typeof createRequestSchema>;
export type RequestSectionValues = z.infer<typeof sectionSchema>;
export type RequestItemValues = z.infer<typeof requestItemSchema>;
export type PhotoValues = z.infer<typeof photoSchema>;
