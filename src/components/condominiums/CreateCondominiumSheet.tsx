"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCondominiumSchema, CreateCondominiumValues } from '@/schemas/condominium.schema';
import { createCondominium } from '@/services/condominium.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';

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
      } catch (err: any) {
        setError(err.message || 'Erro ao criar condomínio');
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <div className="inline-flex shrink-0 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/80 fixed bottom-20 right-4 md:static md:bottom-auto md:right-auto rounded-full md:rounded-md h-14 w-14 md:h-10 md:w-auto shadow-lg md:shadow-none px-4">
          <Plus className="h-6 w-6 md:mr-2 md:h-4 md:w-4" />
          <span className="hidden md:inline font-medium text-sm">Novo Condomínio</span>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="md:side-right sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Cadastrar Condomínio</SheetTitle>
          <SheetDescription>
            Preencha os dados básicos do novo condomínio.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Condomínio</label>
            <Input placeholder="Residencial Jardins" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço Completo</label>
            <Input placeholder="Rua Exemplo, 123 - Bairro" {...form.register('address')} />
            {form.formState.errors.address && (
              <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Condomínio'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
