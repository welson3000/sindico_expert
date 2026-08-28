import { getCondoTechnicalSpec } from '@/services/condominium.service';
import { TechSpecForm } from '@/components/condominiums/TechSpecForm';
import Link from 'next/link';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TechSpecPage({ params }: PageProps) {
  const { id } = await params;

  let data;
  try {
    data = await getCondoTechnicalSpec(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/condominiums"
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'text-slate-400 hover:text-white hover:bg-slate-800' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" /> Ficha Técnica Predial
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{data.condo.name}</p>
          </div>
        </div>

        <Link
          href={`/dashboard/condominiums/${id}/requests/new`}
          className={buttonVariants({ className: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl gap-2 shadow-lg' })}
        >
          <Plus className="h-4 w-4" />
          Nova Solicitação de Serviço
        </Link>
      </div>

      <div className="flex-1">
        <TechSpecForm condoId={id} initialData={data.spec} />
      </div>
    </div>
  );
}
