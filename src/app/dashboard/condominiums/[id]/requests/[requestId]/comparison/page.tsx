import React from 'react';
import { getRequestComparison } from '@/services/comparison.service';
import { ComparisonMatrix } from '@/components/dashboard/ComparisonMatrix';
import { PrintButton } from '@/components/dashboard/PrintButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, BarChart3 } from 'lucide-react';

interface ComparisonPageProps {
  params: Promise<{ id: string; requestId: string }>;
}

export default async function RequestComparisonPage({ params }: ComparisonPageProps) {
  const { id: condoId, requestId } = await params;

  try {
    const data = await getRequestComparison(requestId);

    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header & Ações Topo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link href={`/dashboard/condominiums/${condoId}/requests`}>
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar para Solicitações
            </Button>
          </Link>

          <PrintButton
            request={data.request}
            condo={data.condo}
            items={data.items}
            proposals={data.proposals}
            globalWinner={data.globalWinner}
            lowestPricesByItem={data.lowestPricesByItem}
            fractionatedSummary={data.fractionatedSummary}
          />
        </div>

        {/* Título da Página */}
        <div className="border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Relatório Comparativo de Mercado
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{data.request.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Condomínio: <strong className="text-slate-200">{data.condo.name}</strong> | Propostas Analisadas: <strong className="text-slate-200">{data.proposals.length}</strong>
          </p>
        </div>

        {/* Matriz Comparativa e Cards */}
        <ComparisonMatrix
          request={data.request}
          condo={data.condo}
          items={data.items}
          proposals={data.proposals}
          globalWinner={data.globalWinner}
          lowestPricesByItem={data.lowestPricesByItem}
          fractionatedSummary={data.fractionatedSummary}
        />
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="bg-rose-950/40 border border-rose-800 text-rose-200 p-6 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-12 h-12 text-rose-400" />
          <h2 className="text-xl font-bold text-rose-100">Erro ao carregar mapa comparativo</h2>
          <p className="text-sm text-rose-300">{err?.message || 'Ocorreu um erro ao processar o comparativo de preços.'}</p>
          <Link href={`/dashboard/condominiums/${condoId}/requests`} className="mt-2">
            <Button className="bg-slate-800 hover:bg-slate-700 text-white">Voltar às Solicitações</Button>
          </Link>
        </div>
      </div>
    );
  }
}
