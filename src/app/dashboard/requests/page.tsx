import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { service_requests, condominiums, proposals } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Building2, BarChart3, Clock, Plus, ArrowRight } from 'lucide-react';
import { ShareQuoteButton } from '@/components/requests/ShareQuoteButton';

export default async function GlobalRequestsPage() {
  const session = await auth();

  if (!session?.user?.organization_id) {
    return (
      <div className="p-8 text-center text-slate-400">
        Nenhuma organização associada ao usuário.
      </div>
    );
  }

  // 1. Fetch all condominiums belonging to the user's organization
  const condoList = await db.query.condominiums.findMany({
    where: eq(condominiums.organization_id, session.user.organization_id),
  });

  const condoIds = condoList.map((c) => c.id);
  const condoMap = new Map(condoList.map((c) => [c.id, c]));

  let allRequests: typeof service_requests.$inferSelect[] = [];
  if (condoIds.length > 0) {
    allRequests = await db.query.service_requests.findMany({
      where: (reqs, { inArray }) => inArray(reqs.condominium_id, condoIds),
      orderBy: (reqs, { desc }) => [desc(reqs.created_at)],
    });
  }

  // 2. Enhance each request with condo name and proposals count
  let totalProposalsAccumulated = 0;

  const enhancedRequests = await Promise.all(
    allRequests.map(async (req) => {
      const condo = condoMap.get(req.condominium_id);

      const pCountResult = await db
        .select({ total: count() })
        .from(proposals)
        .where(eq(proposals.request_id, req.id));

      const propCount = Number(pCountResult[0]?.total || 0);
      totalProposalsAccumulated += propCount;

      return {
        ...req,
        condoName: condo?.name || 'Condomínio',
        condoAddress: condo?.address || '',
        proposalsCount: propCount,
      };
    })
  );

  const openCount = enhancedRequests.filter((r) => r.status === 'OPEN').length;
  const firstCondoId = condoList[0]?.id;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-blue-600" /> Todas as Solicitações de Serviço
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe todas as cotações abertas, propostas recebidas de fornecedores e mapas comparativos dos seus condomínios.
          </p>
        </div>

        {firstCondoId ? (
          <Link href={`/dashboard/condominiums/${firstCondoId}/requests/new`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md cursor-pointer">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/condominiums">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md cursor-pointer">
              <Plus className="w-4 h-4" /> Cadastrar Condomínio Primeiro
            </Button>
          </Link>
        )}
      </div>

      {/* Cards de Métricas e Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 text-slate-900 p-5 rounded-2xl shadow-md">
          <span className="text-xs text-slate-500 font-medium block">Total de Solicitações</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{enhancedRequests.length}</span>
        </Card>

        <Card className="bg-white border-slate-200 text-slate-900 p-5 rounded-2xl shadow-md">
          <span className="text-xs text-blue-600 font-medium block">Em Cotação Aberta</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">{openCount}</span>
        </Card>

        <Card className="bg-white border-slate-200 text-slate-900 p-5 rounded-2xl shadow-md">
          <span className="text-xs text-emerald-600 font-medium block">Propostas Recebidas</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{totalProposalsAccumulated}</span>
        </Card>
      </div>

      {/* Lista de Solicitações */}
      {enhancedRequests.length === 0 ? (
        <Card className="bg-white border-slate-200 text-slate-800 p-12 text-center rounded-2xl shadow-md">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Nenhuma solicitação criada ainda</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
            Crie sua primeira solicitação de serviço com dossiê fotográfico e planilha BOQ para receber propostas de fornecedores.
          </p>
          {firstCondoId ? (
            <Link href={`/dashboard/condominiums/${firstCondoId}/requests/new`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl shadow-md cursor-pointer">
                <Plus className="w-4 h-4" /> Criar Primeira Solicitação
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/condominiums">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl shadow-md cursor-pointer">
                <Building2 className="w-4 h-4" /> Cadastrar Condomínio
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enhancedRequests.map((req) => (
            <Card
              key={req.id}
              className="bg-white border-slate-200 text-slate-900 flex flex-col justify-between rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden hover:border-slate-300"
            >
              <CardHeader className="p-5 pb-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2.5 py-0.5 font-semibold">
                    {req.status === 'OPEN' ? 'Cotação Aberta' : req.status}
                  </Badge>

                  <Badge
                    className={
                      req.proposalsCount > 0
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-mono font-semibold'
                        : 'bg-slate-100 text-slate-600 border-slate-200 text-xs font-mono'
                    }
                  >
                    {req.proposalsCount} {req.proposalsCount === 1 ? 'Proposta' : 'Propostas'}
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2">{req.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{req.condoName}</span>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-2 text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Criada em: {req.created_at ? new Date(req.created_at).toLocaleDateString('pt-BR') : 'Hoje'}</span>
              </CardContent>

              <CardFooter className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-3">
                <ShareQuoteButton requestId={req.id} title={req.title} />

                <Link
                  href={`/dashboard/condominiums/${req.condominium_id}/requests/${req.id}/comparison`}
                  className="w-full"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl h-10 gap-2 shadow-md cursor-pointer">
                    <BarChart3 className="w-4 h-4" /> Ver Mapa Comparativo <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
