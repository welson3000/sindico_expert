"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { condoTechnicalSpecSchema, CondoTechnicalSpecValues } from '@/schemas/condominium.schema';
import { upsertCondoTechnicalSpec } from '@/services/condominium.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

const FACADE_OPTIONS = ['Pastilha', 'Textura', 'Cerâmica', 'Grafiato', 'Pele de Vidro', 'Tijolo Aparente', 'Outro'];

interface TechSpecFormProps {
  condoId: string;
  initialData?: any;
}

export function TechSpecForm({ condoId, initialData }: TechSpecFormProps) {
  const [isPending, startTransition] = useTransition();

  let initialFacade = [];
  if (initialData?.facade_type) {
    try { initialFacade = JSON.parse(initialData.facade_type); } catch (e) {}
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

  const currentFacade = form.watch('facade_type') || [];

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total de Pavimentos</label>
                <Input type="number" min={1} {...form.register('total_floors', { valueAsNumber: true })} />
                {form.formState.errors.total_floors && (
                  <p className="text-xs text-red-500">{form.formState.errors.total_floors.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Halls de Circulação Vertical / Elevadores</label>
                <Input type="number" min={1} {...form.register('vertical_halls_count', { valueAsNumber: true })} />
                {form.formState.errors.vertical_halls_count && (
                  <p className="text-xs text-red-500">{form.formState.errors.vertical_halls_count.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Detalhamento dos Andares</label>
              <Textarea 
                placeholder="Ex: Térreo, 10 andares tipo, Barriletes, Caixa d'água" 
                {...form.register('floor_breakdown')} 
              />
              {form.formState.errors.floor_breakdown && (
                <p className="text-xs text-red-500">{form.formState.errors.floor_breakdown.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipos de Acabamento da Fachada</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
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
                    />
                    <label 
                      htmlFor={`facade-${option}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {form.formState.errors.facade_type && (
                <p className="text-xs text-red-500">{form.formState.errors.facade_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações e Detalhes Estruturais</label>
              <Textarea 
                placeholder="Detalhes adicionais sobre a infraestrutura, elevadores, etc."
                className="min-h-[100px]"
                {...form.register('additional_details')} 
              />
              {form.formState.errors.additional_details && (
                <p className="text-xs text-red-500">{form.formState.errors.additional_details.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="sticky bottom-0 md:static bg-white border-t md:border-none p-4 z-10">
          <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Ficha Técnica'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
