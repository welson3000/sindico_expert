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
      <DialogTrigger>
        <div className="inline-flex shrink-0 items-center justify-center bg-indigo-600 text-white hover:bg-indigo-500 fixed bottom-6 right-6 md:static md:bottom-auto md:right-auto rounded-full md:rounded-lg h-14 w-14 md:h-10 md:w-auto shadow-xl md:shadow-none px-4 transition-all cursor-pointer">
          <Plus className="h-6 w-6 md:mr-2 md:h-4 md:w-4" />
          <span className="hidden md:inline font-semibold text-sm">Novo Condomínio</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" /> Cadastrar Condomínio
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            Preencha os dados básicos para adicionar o novo condomínio ao sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nome do Condomínio</label>
            <Input
              placeholder="Ex: Residencial Jardins"
              {...form.register('name')}
              className="bg-slate-900 border-slate-800 text-slate-100 text-sm focus:border-indigo-500"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-400">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Endereço Completo</label>
            <Input
              placeholder="Ex: Rua Exemplo, 123 - Bairro"
              {...form.register('address')}
              className="bg-slate-900 border-slate-800 text-slate-100 text-sm focus:border-indigo-500"
            />
            {form.formState.errors.address && (
              <p className="text-xs text-rose-400">{form.formState.errors.address.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold mt-4 py-2.5 rounded-lg shadow-md"
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar Condomínio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
