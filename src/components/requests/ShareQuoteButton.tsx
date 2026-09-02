'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ShareQuoteButtonProps {
  requestId: string;
  title?: string;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export function ShareQuoteButton({ requestId, title, variant = 'outline', className }: ShareQuoteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const quoteUrl = `${origin}/portal/quote/${requestId}`;

    navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    toast.success('Link da cotação copiado com sucesso! Envie aos fornecedores.');

    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
      <Button
        type="button"
        onClick={handleCopyLink}
        variant={variant}
        className={`w-full font-semibold text-xs rounded-xl h-10 gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer ${className}`}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? 'Link Copiado!' : 'Copiar Link p/ Fornecedores'}</span>
      </Button>

      <Link href={`/portal/quote/${requestId}`} target="_blank" className="w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto font-semibold text-xs rounded-xl h-10 px-3 gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
          title="Ver como o fornecedor visualiza e preenche a planilha BOQ"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Ver visão do fornecedor</span>
        </Button>
      </Link>
    </div>
  );
}
