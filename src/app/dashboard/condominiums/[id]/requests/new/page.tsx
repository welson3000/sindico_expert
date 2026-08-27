import { getCondoTechnicalSpec } from '@/services/condominium.service';
import { RequestBuilderWizard } from '@/components/requests/RequestBuilderWizard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function NewRequestPage({ params }: PageProps) {
  const { id } = await params;

  let data;
  try {
    data = await getCondoTechnicalSpec(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-6">
        <Link 
          href={`/dashboard/condominiums/${id}/requests`} 
          className={buttonVariants({ variant: "ghost", size: "icon", className: "mr-2" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Solicitação</h1>
          <p className="text-gray-500">{data.condo.name}</p>
        </div>
      </div>
      
      <div className="flex-1">
        <RequestBuilderWizard condoId={id} techSpec={data.spec} />
      </div>
    </div>
  );
}
