"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, TrendingDown, Building2, Layers, CheckCircle2, ShieldCheck, HelpCircle, FileText } from 'lucide-react';
import { ProposalComparisonData, ItemLowestPriceData } from '@/services/comparison.service';

interface BOQItem {
  id: string;
  category_title: string;
  subcategory_title: string | null;
  item_description: string;
  unit: string;
  quantity: string;
  order: number | null;
}

interface ComparisonMatrixProps {
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
  items: BOQItem[];
  proposals: ProposalComparisonData[];
  globalWinner: ProposalComparisonData | null;
  lowestPricesByItem: Record<string, ItemLowestPriceData>;
  fractionatedSummary: {
    globalWinnerTotal: number;
    fractionatedTotal: number;
    potentialSavings: number;
    savingsPercentage: number;
  };
}

export function ComparisonMatrix({
  request,
  condo,
  items,
  proposals,
  globalWinner,
  lowestPricesByItem,
  fractionatedSummary,
}: ComparisonMatrixProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Printable Document Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                SÍNDICO <span className="text-orange-500 font-extrabold">EXPERT</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-800 rounded border border-slate-300">
                Relatório Comparativo de Mercado
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900">{request.title}</h1>
            <p className="text-xs text-slate-700 mt-0.5">
              <strong>Condomínio:</strong> {condo.name} &bull; {condo.address}
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-700 space-y-0.5 font-mono">
            <p><strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Propostas Analisadas:</strong> {proposals.length}</p>
          </div>
        </div>
      </div>

      {/* 1. Cards de Destaque Analítico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:mb-4 print:break-inside-avoid">
        {/* Card 1: Proposta Vencedora Global */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md relative overflow-hidden print:bg-white print:text-black print:border-slate-300 print:shadow-none">
          <CardHeader className="pb-3 print:pb-2 border-b border-slate-100 print:border-slate-300">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base print:text-sm font-bold text-amber-600 flex items-center gap-2 print:text-slate-900">
                <Trophy className="w-5 h-5 print:w-4 print:h-4 text-amber-500 print:text-slate-900" /> Proposta Vencedora Global
              </CardTitle>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-2.5 py-1 text-xs print:text-[10px] print:py-0.5 font-semibold print:bg-slate-200 print:text-slate-900 print:border-slate-400">
                Menor Preço Global
              </Badge>
            </div>
            <CardDescription className="text-slate-500 text-xs print:text-[11px] print:text-slate-600">
              Fornecedor com o menor valor total para execução global da obra.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 print:p-3">
            {globalWinner ? (
              <div className="space-y-4 print:space-y-2">
                <div>
                  <span className="text-xs print:text-[10px] text-slate-500 font-medium block">Empresa Fornecedora</span>
                  <h3 className="text-xl print:text-base font-bold text-slate-900">{globalWinner.supplier_name}</h3>
                  <p className="text-xs print:text-[10px] font-mono text-slate-500">CNPJ: {globalWinner.supplier_cnpj}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 print:p-2 rounded-xl flex items-center justify-between print:bg-amber-50/80">
                  <div>
                    <span className="text-xs print:text-[10px] text-amber-800 font-medium block uppercase">Valor Total Global</span>
                    <span className="text-2xl print:text-lg font-black text-amber-700 print:text-slate-900">{formatCurrency(globalWinner.total_amount)}</span>
                  </div>
                  <CheckCircle2 className="w-8 h-8 print:w-6 print:h-6 text-amber-600 print:text-slate-800" />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 italic text-sm">
                Nenhuma proposta comercial submetida até o momento.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Resumo de Economia Fracionada */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md relative overflow-hidden print:bg-white print:text-black print:border-slate-300 print:shadow-none">
          <CardHeader className="pb-3 print:pb-2 border-b border-slate-100 print:border-slate-300">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base print:text-sm font-bold text-emerald-600 flex items-center gap-2 print:text-slate-900">
                <TrendingDown className="w-5 h-5 print:w-4 print:h-4 text-emerald-600 print:text-slate-900" /> Resumo de Economia Fracionada
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 px-2.5 py-1 text-xs print:text-[10px] print:py-0.5 font-semibold print:bg-slate-200 print:text-slate-900 print:border-slate-400">
                Contratação por Item
              </Badge>
            </div>
            <CardDescription className="text-slate-500 text-xs print:text-[11px] print:text-slate-600">
              Comparativo se a obra for fracionada contratando o menor preço item a item.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 print:p-3 space-y-4 print:space-y-2">
            <div className="grid grid-cols-2 gap-3 print:gap-2">
              <div className="bg-slate-50 border border-slate-200 p-3 print:p-2 rounded-lg print:bg-slate-100 print:border-slate-300">
                <span className="text-xs print:text-[10px] text-slate-500 print:text-slate-600 font-medium block">Contratação Global Única</span>
                <span className="text-base print:text-xs font-bold text-slate-800 print:text-slate-900">
                  {formatCurrency(fractionatedSummary.globalWinnerTotal)}
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 print:p-2 rounded-lg print:bg-emerald-50/80 print:border-slate-300">
                <span className="text-xs print:text-[10px] text-emerald-800 print:text-slate-700 font-medium block">Menor Preço Item a Item</span>
                <span className="text-base print:text-xs font-bold text-emerald-700 print:text-slate-900">
                  {formatCurrency(fractionatedSummary.fractionatedTotal)}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 print:p-2 rounded-xl flex items-center justify-between print:bg-slate-100 print:border-slate-300">
              <div>
                <span className="text-xs print:text-[10px] text-emerald-800 print:text-slate-700 font-medium block uppercase">Economia Potencial Extra</span>
                <span className="text-xl print:text-base font-extrabold text-emerald-700 print:text-slate-900">
                  {formatCurrency(fractionatedSummary.potentialSavings)}
                </span>
              </div>
              {fractionatedSummary.savingsPercentage > 0 && (
                <Badge className="bg-emerald-600 text-white border-emerald-700 text-xs print:text-[10px] font-mono font-bold print:bg-slate-200 print:text-slate-900 print:border-slate-400">
                  -{fractionatedSummary.savingsPercentage}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Matriz Comparativa Completa */}
      <Card className="bg-white border-slate-200 text-slate-900 shadow-xl overflow-hidden print:bg-white print:text-black print:border-slate-300 print:shadow-none">
        <CardHeader className="pb-4 print:pb-2 border-b border-slate-100 print:border-slate-300 print:px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg print:text-sm font-bold text-slate-900 flex items-center gap-2 print:text-slate-900">
                <Layers className="w-5 h-5 print:w-4 print:h-4 text-blue-600 print:text-slate-900" /> Matriz Comparativa de Preços Lado a Lado
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs print:text-[11px] print:text-slate-600">
                Análise comparativa das propostas comerciais. As células em <strong className="text-emerald-700 print:text-emerald-800">verde</strong> destacam o menor preço unitário de cada item.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 print:hidden">
              <span className="inline-block w-3 h-3 bg-emerald-100 border border-emerald-400 rounded-sm" />
              <span>Menor preço unitário do item</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto print:overflow-visible">
          {proposals.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-sm">
              Nenhuma proposta recebida para esta solicitação.
            </div>
          ) : (
            <Table className="w-full min-w-[700px] print:min-w-0 border-collapse print:text-[10px] print:leading-tight">
              <TableHeader className="bg-slate-50 border-b border-slate-200 print:bg-slate-100 print:border-slate-300">
                <TableRow className="border-slate-200 hover:bg-transparent print:border-slate-300">
                  <TableHead className="text-slate-700 font-semibold w-10 print:w-6 text-center print:text-slate-900 print:p-1.5">#</TableHead>
                  <TableHead className="text-slate-700 font-semibold min-w-[220px] print:min-w-[140px] print:text-slate-900 print:p-1.5">Especificação do Item</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-center w-16 print:w-10 print:text-slate-900 print:p-1.5">Qtd</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-center w-16 print:w-10 print:text-slate-900 print:p-1.5">Unid.</TableHead>

                  {/* Colunas dinâmicas para cada fornecedor (até 5) */}
                  {proposals.map((prop, index) => {
                    const isWinner = globalWinner?.id === prop.id;
                    return (
                      <TableHead
                        key={prop.id}
                        className={`text-center min-w-[180px] print:min-w-[110px] p-3 print:p-1.5 border-l border-slate-200 print:border-slate-300 ${
                          isWinner ? 'bg-amber-50 print:bg-amber-50/80' : ''
                        }`}
                      >
                        <div className="space-y-1 print:space-y-0.5">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs print:text-[9px] font-mono font-bold text-slate-600 print:text-slate-900">
                              Proposta #{index + 1}
                            </span>
                            {isWinner && (
                              <Trophy className="w-3.5 h-3.5 print:w-3 print:h-3 text-amber-500 print:text-slate-900" />
                            )}
                          </div>
                          <div className="font-bold text-sm print:text-xs text-slate-900 print:text-slate-900 line-clamp-1" title={prop.supplier_name}>
                            {prop.supplier_name}
                          </div>
                          <div className="text-[11px] print:text-[9px] font-mono text-slate-600 print:text-slate-700">
                            CNPJ: {prop.supplier_cnpj}
                          </div>
                          <div className="text-[11px] print:text-[9px] text-slate-500 print:text-slate-700">
                            Contato: <strong className="text-slate-700">{prop.contact_name}</strong>
                          </div>
                          <div className="text-[11px] print:text-[9px] font-mono text-slate-500 print:text-slate-700">
                            Tel: {prop.supplier_phone}
                          </div>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, index) => {
                  const lowestInfo = lowestPricesByItem[item.id];

                  return (
                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50 print:border-slate-200 print:break-inside-avoid">
                      <TableCell className="text-center font-mono text-xs print:text-[10px] print:p-1.5 text-slate-500 print:text-slate-800">
                        {index + 1}
                      </TableCell>
                      <TableCell className="space-y-0.5 print:p-1.5">
                        <div className="text-[11px] print:text-[9px] font-semibold text-blue-600 print:text-slate-700">
                          {item.category_title} {item.subcategory_title ? `/ ${item.subcategory_title}` : ''}
                        </div>
                        <p className="text-xs print:text-[10px] font-medium text-slate-800 print:text-slate-900">{item.item_description}</p>
                      </TableCell>
                      <TableCell className="text-center text-xs print:text-[10px] print:p-1.5 font-semibold text-slate-800 print:text-slate-900">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center text-[11px] print:text-[10px] print:p-1.5 font-mono text-slate-500 uppercase print:text-slate-700">
                        {item.unit}
                      </TableCell>

                      {/* Células de preços para cada fornecedor */}
                      {proposals.map((prop) => {
                        const itemData = prop.itemsMap[item.id];
                        const unitPrice = itemData ? itemData.unit_price : 0;
                        const totalPrice = itemData ? itemData.total_price : 0;

                        const isLowest =
                          lowestInfo &&
                          lowestInfo.winning_proposal_ids.includes(prop.id) &&
                          unitPrice > 0;

                        return (
                          <TableCell
                            key={prop.id}
                            className={`text-right font-mono text-xs print:text-[10px] p-3 print:p-1.5 border-l border-slate-100 print:border-slate-200 transition-colors ${
                              isLowest
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold print:bg-emerald-100/90 print:text-emerald-950 print:border-emerald-400'
                                : 'text-slate-700 print:text-slate-900'
                            }`}
                          >
                            <div className="text-xs print:text-[10px]">
                              {formatCurrency(unitPrice)} <span className="text-[10px] print:text-[8px] text-slate-400 print:text-slate-600 font-normal">/ {item.unit}</span>
                            </div>
                            <div className="text-[11px] print:text-[9px] opacity-80 mt-0.5">
                              Total: {formatCurrency(totalPrice)}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>

              {/* Rodapé da Tabela com o Total Global de Cada Fornecedor */}
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 print:bg-slate-100 print:border-slate-300">
                <TableRow className="border-slate-200 print:border-slate-300">
                  <TableCell colSpan={4} className="p-4 print:p-2 text-right font-bold text-sm print:text-xs text-slate-900 print:text-slate-900">
                    VALOR TOTAL GLOBAL DA PROPOSTA:
                  </TableCell>

                  {proposals.map((prop) => {
                    const isWinner = globalWinner?.id === prop.id;
                    return (
                      <TableCell
                        key={prop.id}
                        className={`text-right p-4 print:p-2 font-mono font-extrabold text-base print:text-xs border-l border-slate-200 print:border-slate-300 ${
                          isWinner
                            ? 'bg-amber-100 text-amber-800 print:bg-amber-100 print:text-amber-950'
                            : 'text-slate-900 print:text-slate-900'
                        }`}
                      >
                        {formatCurrency(prop.total_amount)}
                        {isWinner && (
                          <div className="text-[10px] print:text-[9px] text-amber-700 font-sans font-semibold uppercase mt-0.5 print:text-slate-800">
                            ★ Vencedor Global
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </tfoot>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

