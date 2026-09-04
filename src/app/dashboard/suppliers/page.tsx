import React from 'react';
import { getSuppliersWithRanking } from '@/services/supplier-evaluation.service';
import { SuppliersListClient } from '@/components/suppliers/SuppliersListClient';

export default async function SuppliersDashboardPage() {
  const suppliers = await getSuppliersWithRanking();
  return <SuppliersListClient suppliers={suppliers} />;
}
