import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { service_requests, condominiums, proposals } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, ArrowRight, CheckCircle2, Lock, Clock } from 'lucide-react';

export default async function MuralPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch open service requests
  const requestsList = await db.query.service_requests.findMany({
    where: eq(service_requests.status, 'OPEN'),
    orderBy: (reqs, { desc }) => [desc(reqs.created_at)],
  });

  // Enhance each request with condo details and proposals count
  const enhancedRequests = await Promise.all(
    requestsList.map(async (req) => {
      const condo = await db.query.condominiums.findFirst({
        where: eq(condominiums.id, req.condominium_id),
      });

      const pCountResult = await db
        .select({ total: count() })
        .from(proposals)
        .where(eq(proposals.request_id, req.id));

      const proposalsCount = Number(pCountResult[0]?.total || 0);
      const maxSuppliers = req.max_suppliers ?? 5;
      const isLimitReached = proposalsCount >= maxSuppliers;

      let hasSubmitted = false;
      if (userId) {
        const userProp = await db.query.proposals.findFirst({
          where: (props, { and, eq }) => and(eq(props.request_id, req.id), eq(props.supplier_id, userId)),
        });
        hasSubmitted = Boolean(userProp);
      }

      return {
        ...req,
        condoName: condo?.name || 'Condomínio',
        condoAddress: condo?.address || '',
        proposalsCount,
        maxSuppliers,
        isLimitReached,
        hasSubmitted,
      };
    })
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-400" /> Mural de Oportunidades & Cotações
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore as solicitações de serviços abertas pelos condomínios e envie suas propostas comerciais sigilosas.
        </p>
      </div>

      {enhancedRequests.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-white p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Nenhuma solicitação aberta no momento</h3>
          <p className="text-slate-500 text-sm mt-1">Volte em breve para conferir novas oportunidades de cotação.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enhancedRequests.map((req) => (
            <Card key={req.id} className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs">
                    Vagas: {req.proposalsCount} / {req.maxSuppliers}
                  </Badge>

                  {req.hasSubmitted && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enviada
                    </Badge>
                  )}

                  {!req.hasSubmitted && req.isLimitReached && (
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Esgotada
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-lg font-bold text-slate-100 line-clamp-2">{req.title}</CardTitle>
                <CardDescription className="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{req.condoName}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2 text-xs text-slate-400">
                <p className="line-clamp-1">{req.condoAddress}</p>
              </CardContent>

              <CardFooter className="pt-4 border-t border-slate-800">
                <Link href={`/portal/quote/${req.id}`} className="w-full">
                  <Button
                    className={`w-full flex items-center justify-center gap-2 ${
                      req.hasSubmitted
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : req.isLimitReached
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-800 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {req.hasSubmitted ? 'Ver Minha Proposta' : req.isLimitReached ? 'Vagas Esgotadas' : 'Responder Cotação'}
                    <ArrowRight className="w-4 h-4" />
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
