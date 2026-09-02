import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getQuoteDetailsForSupplier } from '@/services/proposal.service';
import { QuoteForm } from '@/components/portal/QuoteForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface QuotePageProps {
  params: Promise<{ requestId: string }>;
}

export default async function SupplierQuotePage({ params }: QuotePageProps) {
  const { requestId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/portal/quote/${requestId}`);
  }

  try {
    const data = await getQuoteDetailsForSupplier(requestId);

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link href="/portal/mural">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar para o Mural de Cotações
            </Button>
          </Link>
        </div>

        <QuoteForm
          request={data.request}
          condo={data.condo}
          techSpecs={data.techSpecs}
          sections={data.sections}
          items={data.items}
          supplierInfo={data.supplierInfo}
          proposalsCount={data.proposalsCount}
          maxSuppliers={data.maxSuppliers}
          isLimitReached={data.isLimitReached}
          existingProposal={data.existingProposal}
          existingProposalItems={data.existingProposalItems}
        />
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="bg-rose-950/40 border border-rose-800 text-rose-200 p-6 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-12 h-12 text-rose-400" />
          <h2 className="text-xl font-bold text-rose-100">Não foi possível carregar a cotação</h2>
          <p className="text-sm text-rose-300">{err?.message || 'Ocorreu um erro ao carregar os detalhes desta solicitação.'}</p>
          <Link href="/portal/mural" className="mt-2">
            <Button className="bg-slate-800 hover:bg-slate-700 text-white">Voltar ao Mural</Button>
          </Link>
        </div>
      </div>
    );
  }
}
