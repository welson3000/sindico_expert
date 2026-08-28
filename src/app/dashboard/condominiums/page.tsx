import { listCondominiums } from '@/services/condominium.service';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { CreateCondominiumSheet } from '@/components/condominiums/CreateCondominiumSheet';
import Link from 'next/link';
import { Building2, FileText, ClipboardList } from 'lucide-react';

export default async function CondominiumsPage() {
  const condominiums = await listCondominiums();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Meus Condomínios</h1>
          <p className="text-slate-400 text-sm mt-1">
            Você tem <strong className="text-slate-200">{condominiums.length}</strong> condomínio(s) cadastrado(s)
          </p>
        </div>
        <div className="hidden md:block">
          <CreateCondominiumSheet />
        </div>
      </div>

      {condominiums.length === 0 ? (
        <Card className="bg-slate-950/80 border-slate-800 text-white p-12 text-center flex flex-col items-center justify-center rounded-2xl shadow-xl">
          <Building2 className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-200">Nenhum condomínio cadastrado</h3>
          <p className="text-slate-400 text-sm max-w-sm mt-1 mb-6">
            Comece adicionando o seu primeiro condomínio para montar fichas técnicas e solicitações de serviço.
          </p>
          <CreateCondominiumSheet />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {condominiums.map((condo: any) => {
            const hasSpec = !!condo.condo_technical_specs;

            return (
              <Card
                key={condo.id}
                className="bg-slate-950 border-slate-800 text-white flex flex-col justify-between rounded-2xl shadow-xl hover:border-slate-700 transition-all overflow-hidden"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-slate-100 leading-tight">
                      {condo.name}
                    </CardTitle>
                    <Badge
                      className={
                        hasSpec
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-0.5 font-semibold'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5 font-semibold'
                      }
                    >
                      {hasSpec ? 'Completa' : 'Pendente'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1.5">
                    {condo.address}
                  </p>
                </CardHeader>

                <CardFooter className="p-4 bg-slate-900/60 border-t border-slate-800/80 gap-2 flex flex-col sm:flex-row">
                  <Link
                    href={`/dashboard/condominiums/${condo.id}/tech-spec`}
                    className={buttonVariants({
                      variant: 'outline',
                      className:
                        'w-full border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs rounded-xl h-10 gap-1.5',
                    })}
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    Ficha Técnica
                  </Link>

                  <Link
                    href={`/dashboard/condominiums/${condo.id}/requests`}
                    className={buttonVariants({
                      className:
                        'w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl h-10 gap-1.5 shadow-md',
                    })}
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Solicitações
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* FAB para mobile */}
      <div className="md:hidden">
        <CreateCondominiumSheet />
      </div>
    </div>
  );
}
