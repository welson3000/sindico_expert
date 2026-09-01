"use client";

import { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { CreateCondominiumSheet } from '@/components/condominiums/CreateCondominiumSheet';
import { deleteCondominium } from '@/services/condominium.service';
import Link from 'next/link';
import { Building2, FileText, ClipboardList, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface CondominiumsClientProps {
  initialCondominiums: any[];
}

export function CondominiumsClient({ initialCondominiums }: CondominiumsClientProps) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(condoId: string, condoName: string) {
    if (!confirm(`Deseja realmente excluir o condomínio "${condoName}"? Esta ação removerá permanentemente a Ficha Técnica e todas as solicitações associadas.`)) {
      return;
    }
    setDeletingId(condoId);
    startTransition(async () => {
      try {
        await deleteCondominium(condoId);
        toast.success(`Condomínio "${condoName}" excluído com sucesso!`);
      } catch (err: any) {
        toast.error(err.message || 'Erro ao excluir condomínio');
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Meus Condomínios</h1>
          <p className="text-slate-400 text-sm mt-1">
            Você tem <strong className="text-slate-200">{initialCondominiums.length}</strong> condomínio(s) cadastrado(s)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Botão de Habilitar Exclusão de Condomínio */}
          {initialCondominiums.length > 0 && (
            <Button
              type="button"
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              variant={isDeleteMode ? "default" : "outline"}
              className={
                isDeleteMode
                  ? "bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-colors"
                  : "border-rose-800/80 bg-rose-950/30 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              }
            >
              {isDeleteMode ? (
                <>
                  <X className="h-4 w-4" />
                  Concluir Exclusão
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Excluir Condomínios
                </>
              )}
            </Button>
          )}

          <div className="hidden md:block">
            <CreateCondominiumSheet />
          </div>
        </div>
      </div>

      {isDeleteMode && (
        <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <span className="flex items-center gap-2 font-medium">
            <Trash2 className="h-4 w-4 text-rose-400 shrink-0" />
            Modo de exclusão ativo. Clique no ícone de lixeira do condomínio que deseja remover.
          </span>
        </div>
      )}

      {initialCondominiums.length === 0 ? (
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
          {initialCondominiums.map((condo: any) => {
            const hasSpec = !!condo.condo_technical_specs;

            return (
              <Card
                key={condo.id}
                className={`bg-slate-950 border-slate-800 text-white flex flex-col justify-between rounded-2xl shadow-xl transition-all overflow-hidden relative ${
                  isDeleteMode ? 'border-rose-900/60 ring-1 ring-rose-900/40' : 'hover:border-slate-700'
                }`}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-slate-100 leading-tight">
                      {condo.name}
                    </CardTitle>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        className={
                          hasSpec
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-0.5 font-semibold'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5 font-semibold'
                        }
                      >
                        {hasSpec ? 'Completa' : 'Pendente'}
                      </Badge>

                      {isDeleteMode && (
                        <Button
                          type="button"
                          size="icon"
                          disabled={deletingId === condo.id || isPending}
                          onClick={() => handleDelete(condo.id, condo.name)}
                          className="h-8 w-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
                          title="Excluir este condomínio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
