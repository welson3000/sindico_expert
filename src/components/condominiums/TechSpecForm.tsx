"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { condoTechnicalSpecSchema, CondoTechnicalSpecValues } from '@/schemas/condominium.schema';
import { upsertCondoTechnicalSpec, deleteCondoTechnicalSpec } from '@/services/condominium.service';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Save, ArrowLeft, Building2, Trash2 } from 'lucide-react';

const FACADE_OPTIONS = ['Pastilha', 'Textura', 'Cerâmica', 'Grafiato', 'Pele de Vidro', 'Tijolo Aparente', 'Outro'];

interface TechSpecFormProps {
  condoId: string;
  condoName: string;
  initialData?: any;
}

export function TechSpecForm({ condoId, condoName, initialData }: TechSpecFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  let initialFacade: string[] = [];
  if (initialData?.facade_type) {
    try {
      initialFacade = JSON.parse(initialData.facade_type);
    } catch (e) {}
  }

  const form = useForm<CondoTechnicalSpecValues>({
    resolver: zodResolver(condoTechnicalSpecSchema),
    defaultValues: {
      total_floors: initialData?.total_floors || 1,
      floor_breakdown: initialData?.floor_breakdown || '',
      facade_type: initialFacade,
      vertical_halls_count: initialData?.vertical_halls_count || 1,
      additional_details: initialData?.additional_details || '',
    },
  });

  function onSubmit(values: CondoTechnicalSpecValues) {
    startTransition(async () => {
      try {
        await upsertCondoTechnicalSpec(condoId, values);
        toast.success('Ficha Técnica salva com sucesso!');
      } catch (err: any) {
        toast.error(err.message || 'Erro ao salvar Ficha Técnica');
      }
    });
  }

  function handleClear() {
    if (!confirm('Tem certeza que deseja limpar os dados desta Ficha Técnica?')) {
      return;
    }
    setIsDeleting(true);
    startTransition(async () => {
      try {
        await deleteCondoTechnicalSpec(condoId);
        toast.success('Ficha Técnica limpa com sucesso!');
        form.reset({
          total_floors: 1,
          floor_breakdown: '',
          facade_type: [],
          vertical_halls_count: 1,
          additional_details: '',
        });
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'Erro ao limpar Ficha Técnica');
      } finally {
        setIsDeleting(false);
      }
    });
  }

  const currentFacade = form.watch('facade_type') || [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
      {/* Header section with title and relocated action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/condominiums"
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" /> Ficha Técnica Predial
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{condoName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <Link href={`/dashboard/condominiums/${condoId}/requests/new`}>
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              Criar Solicitação para este Condomínio
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isPending || isDeleting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Salvando...' : 'Salvar Ficha Técnica'}
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Total de Pavimentos / Andares</label>
                <Input
                  type="number"
                  min={1}
                  {...form.register('total_floors', { valueAsNumber: true })}
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {form.formState.errors.total_floors && (
                  <p className="text-xs text-rose-600">{form.formState.errors.total_floors.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Halls de Circulação Vertical / Elevadores</label>
                <Input
                  type="number"
                  min={1}
                  {...form.register('vertical_halls_count', { valueAsNumber: true })}
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {form.formState.errors.vertical_halls_count && (
                  <p className="text-xs text-rose-600">{form.formState.errors.vertical_halls_count.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Detalhamento dos Andares</label>
              <Textarea
                placeholder="Ex: Térreo, 10 andares tipo, Barriletes, Caixa d'água"
                {...form.register('floor_breakdown')}
                className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[70px]"
              />
              {form.formState.errors.floor_breakdown && (
                <p className="text-xs text-rose-600">{form.formState.errors.floor_breakdown.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Tipos de Acabamento da Fachada</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {FACADE_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`facade-${option}`}
                      checked={currentFacade.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          form.setValue('facade_type', [...currentFacade, option], { shouldValidate: true });
                        } else {
                          form.setValue('facade_type', currentFacade.filter((f) => f !== option), { shouldValidate: true });
                        }
                      }}
                      className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                      htmlFor={`facade-${option}`}
                      className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {form.formState.errors.facade_type && (
                <p className="text-xs text-rose-600">{form.formState.errors.facade_type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Observações e Detalhes Estruturais</label>
              <Textarea
                placeholder="Detalhes adicionais sobre a infraestrutura, acesso, elevadores, etc."
                className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[90px]"
                {...form.register('additional_details')}
              />
              {form.formState.errors.additional_details && (
                <p className="text-xs text-rose-600">{form.formState.errors.additional_details.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-4 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || isDeleting}
            onClick={handleClear}
            className="border-rose-300 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Limpando...' : 'Limpar Ficha Técnica Predial'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}




