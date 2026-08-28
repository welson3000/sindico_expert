import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { service_requests, condominiums, proposals } from '@/db/schema';
import { eq, count, inArray } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Building2, BarChart3, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-indigo-400" /> Todas as Solicitações de Serviço
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Acompanhe todas as cotações abertas, propostas recebidas de fornecedores e mapas comparativos dos seus condomínios.
        </p>
      </div>

      {/* Cards de Métricas e Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-950 border-slate-800 text-white p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-medium block">Total de Solicitações</span>
          <span className="text-2xl font-bold text-slate-100 mt-1 block">{enhancedRequests.length}</span>
        </Card>

        <Card className="bg-slate-950 border-slate-800 text-white p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-indigo-300 font-medium block">Em Cotação Aberta</span>
          <span className="text-2xl font-bold text-indigo-400 mt-1 block">{openCount}</span>
        </Card>

        <Card className="bg-slate-950 border-slate-800 text-white p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-emerald-300 font-medium block">Propostas Recebidas</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{totalProposalsAccumulated}</span>
        </Card>
      </div>

      {/* Lista de Solicitações */}
      {enhancedRequests.length === 0 ? (
        <Card className="bg-slate-950 border-slate-800 text-white p-12 text-center rounded-2xl shadow-xl">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">Nenhuma solicitação criada</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-1 mb-6">
            Acesse um dos seus condomínios cadastrados para criar novas solicitações com dossiê fotográfico e planilha BOQ.
          </p>
          <Link href="/dashboard/condominiums">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Ver Meus Condomínios
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enhancedRequests.map((req) => (
            <Card
              key={req.id}
              className="bg-slate-950 border-slate-800 text-white flex flex-col justify-between rounded-2xl shadow-xl hover:border-slate-700 transition-all overflow-hidden"
            >
              <CardHeader className="p-5 pb-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs px-2.5 py-0.5">
                    {req.status === 'OPEN' ? 'Cotação Aberta' : req.status}
                  </Badge>

                  <Badge
                    className={
                      req.proposalsCount > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono'
                        : 'bg-slate-800 text-slate-400 text-xs font-mono'
                    }
                  >
                    {req.proposalsCount} {req.proposalsCount === 1 ? 'Proposta' : 'Propostas'}
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold text-slate-100 line-clamp-2">{req.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{req.condoName}</span>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-2 text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Criada em: {req.created_at ? new Date(req.created_at).toLocaleDateString('pt-BR') : 'Hoje'}</span>
              </CardContent>

              <CardFooter className="p-4 bg-slate-900/60 border-t border-slate-800/80">
                <Link
                  href={`/dashboard/condominiums/${req.condominium_id}/requests/${req.id}/comparison`}
                  className="w-full"
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl h-10 gap-2 shadow-md">
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
