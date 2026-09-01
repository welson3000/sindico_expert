import { listCondominiums } from '@/services/condominium.service';
import { CondominiumsClient } from '@/components/condominiums/CondominiumsClient';

export default async function CondominiumsPage() {
  const condominiums = await listCondominiums();

  return <CondominiumsClient initialCondominiums={condominiums} />;
}

