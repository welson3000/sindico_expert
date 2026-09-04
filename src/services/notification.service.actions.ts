'use server';

import { db } from '@/db';
import { service_requests, condominiums } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendNewQuoteAlertToSuppliers } from './notification.service';

export async function triggerManualQuoteAlertAction(requestId: string) {
  try {
    const request = await db.query.service_requests.findFirst({
      where: eq(service_requests.id, requestId),
    });

    if (!request) {
      return { success: false, error: 'Solicitação de serviço não encontrada.' };
    }

    const condo = await db.query.condominiums.findFirst({
      where: eq(condominiums.id, request.condominium_id),
    });

    const res = await sendNewQuoteAlertToSuppliers({
      requestId: request.id,
      title: request.title,
      condoName: condo?.name || 'Condomínio',
      condoAddress: condo?.address || 'Endereço Não Informado',
      maxSuppliers: request.max_suppliers ?? 5,
    });

    return res;
  } catch (error: any) {
    console.error('Erro ao disparar alertas manuais por email:', error);
    return { success: false, error: error?.message || 'Falha ao enviar notificações.' };
  }
}
