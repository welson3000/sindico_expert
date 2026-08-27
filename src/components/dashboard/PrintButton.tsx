"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white gap-2 shadow-sm print:hidden"
    >
      <Printer className="w-4 h-4 text-indigo-400" />
      Imprimir / Salvar PDF
    </Button>
  );
}
