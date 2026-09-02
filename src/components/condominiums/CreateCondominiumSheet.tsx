"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCondominiumSchema, CreateCondominiumValues } from '@/schemas/condominium.schema';
import { createCondominium } from '@/services/condominium.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateCondominiumSheet() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateCondominiumValues>({
    resolver: zodResolver(createCondominiumSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  function onSubmit(values: CreateCondominiumValues) {
    setError(null);
    startTransition(async () => {
      try {
        await createCondominium(values);
        form.reset();
        setOpen(false);
        toast.success('Condomínio cadastrado com sucesso!');
      } catch (err: any) {
        setError(err.message || 'Erro ao criar condomínio');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Novo Condomínio</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Cadastrar Condomínio
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Preencha os dados básicos para adicionar o novo condomínio ao sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nome do Condomínio</label>
            <Input
              placeholder="Ex: Residencial Jardins"
              {...form.register('name')}
              className="bg-white border-slate-300 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Endereço Completo</label>
            <Input
              placeholder="Ex: Rua Exemplo, 123 - Bairro"
              {...form.register('address')}
              className="bg-white border-slate-300 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {form.formState.errors.address && (
              <p className="text-xs text-rose-600">{form.formState.errors.address.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4 py-2.5 rounded-xl shadow-md cursor-pointer"
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar Condomínio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

