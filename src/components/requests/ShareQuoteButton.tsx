'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, Copy, MessageSquare, Send, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { triggerManualQuoteAlertAction } from '@/services/notification.service.actions';

interface ShareQuoteButtonProps {
  requestId: string;
  title?: string;
  condoName?: string;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export function ShareQuoteButton({
  requestId,
  title = 'Solicitação de Serviço',
  condoName = 'Condomínio',
  variant = 'outline',
  className,
}: ShareQuoteButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const quoteUrl = `${origin}/portal/quote/${requestId}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    toast.success('Link da cotação copiado com sucesso! Envie aos fornecedores.');

    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const messageText = `🏢 *SÍNDICO EXPERT — Nova Cotação Aberta*

Olá! Há uma nova oportunidade de cotação aberta no condomínio para envio de proposta comercial:

📌 *Solicitação:* ${title}
🏙️ *Condomínio:* ${condoName}
⚡ *Vagas:* Limite de 5 Fornecedores (Blind Bidding Sigiloso)

Acesse a ficha técnica predial e envie sua proposta no link:
🔗 ${quoteUrl}`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailDispatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await triggerManualQuoteAlertAction(requestId);
      if (res.success) {
        toast.success('Alertas instantâneos por e-mail disparados para a rede de fornecedores!');
      } else {
        toast.error(res.error || 'Falha ao disparar alertas por e-mail.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
        {/* Copiar Link */}
        <Button
          type="button"
          onClick={handleCopyLink}
          variant={variant}
          className={`font-semibold text-xs rounded-xl h-9 gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer ${className}`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copiado!' : 'Copiar Link cotação'}</span>
        </Button>

        {/* WhatsApp Direct Share */}
        <Button
          type="button"
          onClick={handleWhatsAppShare}
          className="font-semibold text-xs rounded-xl h-9 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
          title="Notificar fornecedores via WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Notificar via WhatsApp</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full">
        {/* Email Dispatch */}
        <Button
          type="button"
          onClick={handleEmailDispatch}
          disabled={isPending}
          variant="outline"
          className="flex-1 font-semibold text-xs rounded-xl h-9 gap-1.5 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          title="Disparar notificações automáticas por e-mail para todos os fornecedores credenciados"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 text-blue-600" />}
          <span>{isPending ? 'Disparando...' : 'Disparar Alerta E-mail'}</span>
        </Button>

        {/* Visão Fornecedor */}
        <Link href={`/portal/quote/${requestId}`} target="_blank">
          <Button
            type="button"
            variant="ghost"
            className="font-semibold text-xs rounded-xl h-9 px-3 gap-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
            title="Ver visão do fornecedor"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Visão Portal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
