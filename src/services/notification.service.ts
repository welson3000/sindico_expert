'use server';

import { db } from '@/db';
import { users, service_requests, condominiums } from '@/db/schema';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';

// Transporter setup (Uses SMTP credentials from environment variables if present, or fallback test transport)
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback test transporter (logs to console cleanly)
  return null;
}

interface NewQuoteAlertParams {
  requestId: string;
  title: string;
  condoName: string;
  condoAddress: string;
  maxSuppliers: number;
}

/**
 * 1. Envia Alertas por E-mail para todos os Fornecedores Cadastrados sobre uma Nova Cotação Aberta
 */
export async function sendNewQuoteAlertToSuppliers(params: NewQuoteAlertParams) {
  try {
    const { requestId, title, condoName, condoAddress, maxSuppliers } = params;

    // Fetch all registered suppliers with emails
    const suppliers = await db.query.users.findMany({
      where: eq(users.role, 'FORNECEDOR'),
    });

    if (suppliers.length === 0) {
      console.log('Nenhum fornecedor cadastrado para notificar.');
      return { success: true, count: 0 };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const quoteUrl = `${baseUrl}/portal/quote/${requestId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4F7FA; color: #1E293B; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0E4B78; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
          .header span { color: #F97316; }
          .content { padding: 24px; line-height: 1.6; }
          .badge { display: inline-block; background: #E0F2FE; color: #0369A1; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
          .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin: 16px 0; }
          .button { display: inline-block; background: #2563EB; color: #ffffff; font-weight: 700; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin-top: 16px; text-align: center; }
          .footer { font-size: 11px; color: #94A3B8; text-align: center; padding: 16px; border-top: 1px solid #F1F5F9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>SÍNDICO <span>EXPERT</span></h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Plataforma de Cotações para Condomínios</p>
          </div>
          <div class="content">
            <span class="badge">🔔 NOVA OPORTUNIDADE DE COTAÇÃO</span>
            <h2 style="margin: 0 0 8px 0; color: #0F172A;">${title}</h2>
            <p style="font-size: 14px; color: #475569; margin: 0;">Uma nova oportunidade de serviço foi aberta para precificação sigilosa (Blind Bidding).</p>
            
            <div class="box">
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Condomínio:</strong> ${condoName}</p>
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Endereço:</strong> ${condoAddress}</p>
              <p style="margin: 0; font-size: 13px;"><strong>Limite de Vagas:</strong> <span style="color: #D97706; font-weight: 700;">Até ${maxSuppliers} propostas concorrentes</span></p>
            </div>

            <p style="font-size: 13px; color: #64748B;">Acesse o portal do fornecedor para examinar o dossiê fotográfico, a ficha técnica do edifício e submeter sua proposta comercial.</p>

            <div style="text-align: center;">
              <a href="${quoteUrl}" class="button" target="_blank">Responder Cotação Agora &rarr;</a>
            </div>
          </div>
          <div class="footer">
            Síndico Expert &bull; Este é um alerta automático gerado pelo sistema.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    const recipientEmails = suppliers.map((s) => s.email).filter(Boolean);

    if (transporter && recipientEmails.length > 0) {
      await transporter.sendMail({
        from: `"Síndico Expert Alertas" <${process.env.SMTP_FROM || 'notificacoes@sindicoexpert.com'}>`,
        to: recipientEmails.join(','),
        subject: `🔔 Nova Cotação Aberta: ${title} — ${condoName}`,
        html: htmlContent,
      });
      console.log(`E-mails de alerta enviados com sucesso para ${recipientEmails.length} fornecedores.`);
    } else {
      console.log(`[SIMULAÇÃO E-MAIL FORNECEDORES] Alerta para ${recipientEmails.length} fornecedores.`);
    }

    return { success: true, count: recipientEmails.length };
  } catch (error) {
    console.error('Erro ao enviar alertas por e-mail para fornecedores:', error);
    return { success: false, error: 'Falha no envio de notificações por e-mail.' };
  }
}

interface ProposalReceivedAlertParams {
  sindicoEmail: string;
  requestTitle: string;
  condoName: string;
  supplierName: string;
  totalAmountStr: string;
  currentProposalsCount: number;
  maxSuppliers: number;
}

/**
 * 2. Envia Notificação por E-mail ao Síndico quando uma Proposta é Submetida
 */
export async function sendProposalReceivedAlertToSindico(params: ProposalReceivedAlertParams) {
  try {
    const { sindicoEmail, requestTitle, condoName, supplierName, totalAmountStr, currentProposalsCount, maxSuppliers } = params;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F4F7FA; color: #1E293B; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0E4B78; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
          .header span { color: #F97316; }
          .content { padding: 24px; line-height: 1.6; }
          .badge { display: inline-block; background: #DCFCE7; color: #15803D; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
          .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin: 16px 0; }
          .footer { font-size: 11px; color: #94A3B8; text-align: center; padding: 16px; border-top: 1px solid #F1F5F9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>SÍNDICO <span>EXPERT</span></h1>
          </div>
          <div class="content">
            <span class="badge">📄 NOVA PROPOSTA COMERCIAL RECEBIDA</span>
            <h2 style="margin: 0 0 8px 0; color: #0F172A;">${requestTitle}</h2>
            <p style="font-size: 14px; color: #475569; margin: 0;">Uma nova proposta comercial sigilosa foi submetida por um fornecedor credenciado.</p>
            
            <div class="box">
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Condomínio:</strong> ${condoName}</p>
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Fornecedor:</strong> ${supplierName}</p>
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Valor Total Proposto:</strong> <strong style="color: #059669; font-size: 15px;">${totalAmountStr}</strong></p>
              <p style="margin: 0; font-size: 13px;"><strong>Propostas Recebidas:</strong> ${currentProposalsCount} de ${maxSuppliers} vagas</p>
            </div>

            <p style="font-size: 12px; color: #64748B;">Acesse a Matriz Comparativa no Dashboard para visualizar a análise lado a lado dos valores e a economia potencial fracionada.</p>
          </div>
          <div class="footer">
            Síndico Expert &bull; Notificação automática do sistema.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    if (transporter && sindicoEmail) {
      await transporter.sendMail({
        from: `"Síndico Expert" <${process.env.SMTP_FROM || 'notificacoes@sindicoexpert.com'}>`,
        to: sindicoEmail,
        subject: `📩 Nova Proposta Recebida (${currentProposalsCount}/${maxSuppliers}): ${requestTitle}`,
        html: htmlContent,
      });
      console.log(`E-mail de confirmação de proposta enviado para o Síndico: ${sindicoEmail}`);
    } else {
      console.log(`[SIMULAÇÃO E-MAIL SÍNDICO] Notificação para ${sindicoEmail}: Proposta de ${supplierName}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao notificar síndico sobre proposta:', error);
    return { success: false };
  }
}

/**
 * 3. Gerador de Links de Compartilhamento Direto via WhatsApp para Fornecedores
 */
export function getWhatsAppShareUrl(params: { requestId: string; title: string; condoName: string }) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const quoteUrl = `${baseUrl}/portal/quote/${params.requestId}`;

  const messageText = `🏢 *SÍNDICO EXPERT — Oportunidade de Cotação*

Olá! Há uma nova solicitação de serviço aberta para orçamentação e envio de proposta comercial:

📌 *Solicitação:* ${params.title}
🏙️ *Condomínio:* ${params.condoName}
⚡ *Vagas:* Limite de 5 Fornecedores (Propostas Seladas / Blind Bidding)

Examine a ficha técnica predial, o dossiê fotográfico e submeta sua proposta pelo link:
🔗 ${quoteUrl}`;

  const encodedMessage = encodeURIComponent(messageText);
  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
}
