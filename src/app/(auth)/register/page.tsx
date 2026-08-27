"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerAction } from '@/app/actions/register';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  document: z.string().min(11, 'Documento é obrigatório'),
  companyName: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['ADMIN_SINDICO', 'ADMIN_ADM', 'FORNECEDOR']),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      document: '',
      companyName: '',
      password: '',
      role: 'ADMIN_SINDICO',
    },
  });

  const selectedRole = form.watch('role');

  function onSubmit(values: RegisterValues) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(values);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push('/login?registered=true');
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro</CardTitle>
        <CardDescription>Crie sua conta no Síndico Expert</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex flex-col space-y-2 mb-4">
            <label className="text-sm font-medium">Tipo de Conta</label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register('role')}
            >
              <option value="ADMIN_SINDICO">Síndico</option>
              <option value="ADMIN_ADM">Administradora</option>
              <option value="FORNECEDOR">Fornecedor</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
            <Input 
              id="name" 
              placeholder="Seu nome" 
              {...form.register('name')} 
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              {...form.register('email')} 
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="document" className="text-sm font-medium">CPF/CNPJ</label>
            <Input 
              id="document" 
              placeholder="000.000.000-00" 
              {...form.register('document')} 
            />
            {form.formState.errors.document && (
              <p className="text-xs text-red-500">{form.formState.errors.document.message}</p>
            )}
          </div>

          {(selectedRole === 'ADMIN_SINDICO' || selectedRole === 'ADMIN_ADM') && (
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">Nome da Organização/Condomínio</label>
              <Input 
                id="companyName" 
                placeholder="Condomínio Master" 
                {...form.register('companyName')} 
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <Input 
              id="password" 
              type="password" 
              {...form.register('password')} 
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Criando conta...' : 'Cadastrar'}
          </Button>
          <div className="text-sm text-center text-gray-500">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
