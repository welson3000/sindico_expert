"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, Loader2 } from 'lucide-react';
import { exportExecutivePDF } from '@/utils/exportExecutivePDF';

interface PrintButtonProps {
  request: {
    id: string;
    title: string;
    status: string;
    created_at: Date | null;
  };
  condo: {
    id: string;
    name: string;
    address: string;
  };
  items: any[];
  proposals: any[];
  globalWinner: any;
  lowestPricesByItem: any;
  fractionatedSummary: any;
}

export function PrintButton({
  request,
  condo,
  items,
  proposals,
  globalWinner,
  lowestPricesByItem,
  fractionatedSummary,
}: PrintButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      exportExecutivePDF({
        request,
        condo,
        items,
        proposals,
        globalWinner,
        lowestPricesByItem,
        fractionatedSummary,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF executivo:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-md transition-all"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        Exportar PDF Executivo
      </Button>

      <Button
        onClick={handlePrint}
        variant="outline"
        className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white gap-2 shadow-sm"
      >
        <Printer className="w-4 h-4 text-indigo-400" />
        Imprimir / Navegador
      </Button>
    </div>
  );
}
