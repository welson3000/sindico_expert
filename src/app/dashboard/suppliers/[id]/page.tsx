import React from 'react';
import { getSupplierProfileDetails } from '@/services/supplier-evaluation.service';
import { SupplierProfileClient } from '@/components/suppliers/SupplierProfileClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { id } = await params;

  try {
    const data = await getSupplierProfileDetails(id);
    return <SupplierProfileClient data={data} />;
  } catch (err: any) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="bg-rose-950/40 border border-rose-800 text-rose-200 p-6 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-12 h-12 text-rose-400" />
          <h2 className="text-xl font-bold text-rose-100">Fornecedor Não Encontrado</h2>
          <p className="text-sm text-rose-300">{err?.message || 'Não foi possível carregar o perfil do fornecedor.'}</p>
          <Link href="/dashboard/suppliers" className="mt-2">
            <Button className="bg-slate-800 hover:bg-slate-700 text-white">Voltar ao Ranking</Button>
          </Link>
        </div>
      </div>
    );
  }
}
