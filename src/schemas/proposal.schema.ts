import { z } from 'zod';

export const proposalItemSchema = z.object({
  request_item_id: z.string().min(1, 'ID de item inválido'),
  unit_price: z.coerce.number().min(0, 'O preço unitário deve ser maior ou igual a 0'),
});

export const submitProposalSchema = z.object({
  requestId: z.string().min(1, 'ID de solicitação inválido'),
  items: z.array(proposalItemSchema).min(1, 'A proposta deve conter ao menos 1 item precificado'),
});

export type ProposalItemValues = z.infer<typeof proposalItemSchema>;
export type SubmitProposalValues = z.infer<typeof submitProposalSchema>;

