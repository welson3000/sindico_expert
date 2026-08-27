import React from 'react';
import Link from 'next/link';
import { db } from '@/db';
import { service_requests, condominiums, proposals } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, FileText, Clock } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestsPage({ params }: PageProps) {
  const { id } = await params;

  const condo = await db.query.condominiums.findFirst({
    where: eq(condominiums.id, id),
  });

  const requestsList = await db.query.service_requests.findMany({
    where: eq(service_requests.condominium_id, id),
    orderBy: (reqs, { desc }) => [desc(reqs.created_at)],
  });

  const requestsWithCounts = await Promise.all(
    requestsList.map(async (req) => {
      const pCountResult = await db
        .select({ total: count() })
        .from(proposals)
        .where(eq(proposals.request_id, req.id));

      const proposalsCount = Number(pCountResult[0]?.total || 0);
      return {
        ...req,
        proposalsCount,
      };
    })
  );

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Solicitações de Serviço</h1>
          <p className="text-slate-400 text-sm mt-1">
            Condomínio: <strong className="text-slate-200">{condo?.name || 'Condomínio'}</strong>
          </p>
        </div>

        <Link
          href={`/dashboard/condominiums/${id}/requests/new`}
          className={buttonVariants({ className: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold' })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Solicitação
        </Link>
      </div>

      {requestsWithCounts.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-white p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Nenhuma solicitação criada ainda</h3>
          <p className="text-slate-500 text-sm mt-2 mb-4">
            Crie sua primeira solicitação de serviço com dossiê fotográfico e planilha BOQ.
          </p>
          <Link
            href={`/dashboard/condominiums/${id}/requests/new`}
            className={buttonVariants({ className: 'bg-indigo-600 hover:bg-indigo-500 text-white' })}
          >
            <Plus className="h-4 w-4 mr-2" /> Criar Solicitação
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requestsWithCounts.map((req) => (
            <Card key={req.id} className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs">
                    {req.status === 'OPEN' ? 'Cotação Aberta' : req.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {req.proposalsCount} propostas
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-100 line-clamp-2">{req.title}</CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Criado em: {req.created_at ? new Date(req.created_at).toLocaleDateString('pt-BR') : 'Hoje'}</span>
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-4 border-t border-slate-800">
                <Link href={`/dashboard/condominiums/${id}/requests/${req.id}/comparison`} className="w-full">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" /> Ver Mapa Comparativo
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
