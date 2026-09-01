import { getCondoTechnicalSpec } from '@/services/condominium.service';
import { TechSpecForm } from '@/components/condominiums/TechSpecForm';
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
    <TechSpecForm condoId={id} condoName={data.condo.name} initialData={data.spec} />
  );
}

