import { getCondoTechnicalSpec } from '@/services/condominium.service';
import { TechSpecForm } from '@/components/condominiums/TechSpecForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
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
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/condominiums" className={buttonVariants({ variant: "ghost", size: "icon", className: "mr-2" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ficha Técnica Predial</h1>
          <p className="text-gray-500">{data.condo.name}</p>
        </div>
      </div>
      
      <div className="flex-1">
        <TechSpecForm condoId={id} initialData={data.spec} />
      </div>
    </div>
  );
}
