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
    <div className="space-y-8 print:space-y-6">
      {/* Printable Document Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SÍNDICO EXPERT — Mapa Comparativo de Preços</h1>
            <p className="text-sm text-slate-700 mt-1">
              <strong>Condomínio:</strong> {condo.name} | <strong>Solicitação:</strong> {request.title}
            </p>
            <p className="text-xs text-slate-600">{condo.address}</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Propostas Comparadas:</strong> {proposals.length}</p>
          </div>
        </div>
      </div>

      {/* 1. Cards de Destaque Analítico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* Card 1: Proposta Vencedora Global */}
        <Card className="bg-slate-900 border-slate-800 text-white shadow-xl relative overflow-hidden print:bg-white print:text-black print:border-slate-400">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none print:hidden" />
          <CardHeader className="pb-3 border-b border-slate-800 print:border-slate-300">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-amber-400 flex items-center gap-2 print:text-slate-900">
                <Trophy className="w-5 h-5 text-amber-400 print:text-slate-900" /> Proposta Vencedora Global
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-2.5 py-1 text-xs font-semibold print:bg-slate-200 print:text-slate-900 print:border-slate-400">
                Menor Preço Global
              </Badge>
            </div>
            <CardDescription className="text-slate-400 text-xs print:text-slate-600">
              Fornecedor com o menor valor total para execução global da obra.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {globalWinner ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 print:text-slate-600 font-medium block">Empresa Proponente</span>
                  <h3 className="text-xl font-bold text-slate-100 print:text-slate-900">{globalWinner.supplier_name}</h3>
                  <p className="text-xs font-mono text-slate-400 print:text-slate-700 mt-0.5">CNPJ: {globalWinner.supplier_cnpj}</p>
                </div>

                <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl flex items-center justify-between print:bg-slate-100 print:border-slate-400">
                  <div>
                    <span className="text-xs text-amber-300 print:text-slate-700 font-medium block uppercase">Valor Total Proposto</span>
                    <span className="text-2xl font-black text-amber-300 print:text-slate-900">{formatCurrency(globalWinner.total_amount)}</span>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-amber-400 print:text-slate-800 shrink-0" />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 italic text-sm">
                Nenhuma proposta comercial submetida até o momento.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Resumo de Economia Fracionada */}
        <Card className="bg-slate-900 border-slate-800 text-white shadow-xl relative overflow-hidden print:bg-white print:text-black print:border-slate-400">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none print:hidden" />
          <CardHeader className="pb-3 border-b border-slate-800 print:border-slate-300">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-emerald-400 flex items-center gap-2 print:text-slate-900">
                <TrendingDown className="w-5 h-5 text-emerald-400 print:text-slate-900" /> Resumo de Economia Fracionada
              </CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-2.5 py-1 text-xs font-semibold print:bg-slate-200 print:text-slate-900 print:border-slate-400">
                Contratação por Item
              </Badge>
            </div>
            <CardDescription className="text-slate-400 text-xs print:text-slate-600">
              Comparativo se a obra for fracionada contratando o menor preço item a item.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg print:bg-slate-100 print:border-slate-300">
                <span className="text-xs text-slate-400 print:text-slate-600 font-medium block">Contratação Global Única</span>
                <span className="text-base font-bold text-slate-200 print:text-slate-900">
                  {formatCurrency(fractionatedSummary.globalWinnerTotal)}
                </span>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-lg print:bg-slate-100 print:border-slate-300">
                <span className="text-xs text-emerald-300 print:text-slate-700 font-medium block">Menor Preço Item a Item</span>
                <span className="text-base font-bold text-emerald-300 print:text-slate-900">
                  {formatCurrency(fractionatedSummary.fractionatedTotal)}
                </span>
              </div>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-800 p-3.5 rounded-xl flex items-center justify-between print:bg-slate-100 print:border-slate-400">
              <div>
                <span className="text-xs text-emerald-300 print:text-slate-700 font-medium block uppercase">Economia Potencial Extra</span>
                <span className="text-xl font-extrabold text-emerald-300 print:text-slate-900">
                  {formatCurrency(fractionatedSummary.potentialSavings)}
                </span>
              </div>
              {fractionatedSummary.savingsPercentage > 0 && (
                <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/50 text-xs font-mono font-bold print:bg-slate-300 print:text-slate-900">
                  -{fractionatedSummary.savingsPercentage}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Matriz Comparativa Completa */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl overflow-hidden print:bg-white print:text-black print:border-slate-400">
        <CardHeader className="pb-4 border-b border-slate-800 print:border-slate-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2 print:text-slate-900">
                <Layers className="w-5 h-5 text-indigo-400 print:text-slate-900" /> Matriz Comparativa de Preços Lado a Lado
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs print:text-slate-600">
                Análise comparativa das propostas comerciais. As células em <strong className="text-emerald-400 print:text-slate-900">verde</strong> destacam o menor preço unitário de cada item.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 print:hidden">
              <span className="inline-block w-3 h-3 bg-emerald-950/80 border border-emerald-600 rounded-sm" />
              <span>Menor preço unitário do item</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {proposals.length === 0 ? (
            <div className="text-center py-16 text-slate-500 italic text-sm">
              Nenhuma proposta recebida para esta solicitação.
            </div>
          ) : (
            <Table className="w-full min-w-[700px] border-collapse print:text-xs">
              <TableHeader className="bg-slate-950/90 border-b border-slate-800 print:bg-slate-100 print:border-slate-400">
                <TableRow className="border-slate-800 hover:bg-transparent print:border-slate-400">
                  <TableHead className="text-slate-400 font-semibold w-10 text-center print:text-slate-900">#</TableHead>
                  <TableHead className="text-slate-400 font-semibold min-w-[220px] print:text-slate-900">Especificação do Item</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-center w-16 print:text-slate-900">Qtd</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-center w-16 print:text-slate-900">Unid.</TableHead>

                  {/* Colunas dinâmicas para cada fornecedor (até 5) */}
                  {proposals.map((prop, index) => {
                    const isWinner = globalWinner?.id === prop.id;
                    return (
                      <TableHead
                        key={prop.id}
                        className={`text-center min-w-[180px] p-3 border-l border-slate-800 print:border-slate-300 ${
                          isWinner ? 'bg-amber-950/30 print:bg-slate-200' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-mono font-bold text-slate-300 print:text-slate-900">
                              Proposta #{index + 1}
                            </span>
                            {isWinner && (
                              <Trophy className="w-3.5 h-3.5 text-amber-400 print:text-slate-900" />
                            )}
                          </div>
                          <div className="font-bold text-sm text-slate-100 print:text-slate-900 line-clamp-1">
                            {prop.supplier_name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 print:text-slate-700">
                            CNPJ: {prop.supplier_cnpj}
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
                    <TableRow key={item.id} className="border-slate-800 hover:bg-slate-850/40 print:border-slate-300">
                      <TableCell className="text-center font-mono text-xs text-slate-400 print:text-slate-800">
                        {index + 1}
                      </TableCell>
                      <TableCell className="space-y-0.5">
                        <div className="text-[11px] font-semibold text-indigo-400 print:text-slate-700">
                          {item.category_title} {item.subcategory_title ? `/ ${item.subcategory_title}` : ''}
                        </div>
                        <p className="text-xs font-medium text-slate-200 print:text-slate-900">{item.item_description}</p>
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-slate-200 print:text-slate-900">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center text-[11px] font-mono text-slate-400 uppercase print:text-slate-700">
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
                            className={`text-right font-mono text-xs p-3 border-l border-slate-800 print:border-slate-300 transition-colors ${
                              isLowest
                                ? 'bg-emerald-950/70 text-emerald-200 border-emerald-700/60 font-bold print:bg-slate-200 print:text-slate-900 print:border-slate-400'
                                : 'text-slate-300 print:text-slate-900'
                            }`}
                          >
                            <div className="text-xs">
                              {formatCurrency(unitPrice)} <span className="text-[10px] text-slate-400 print:text-slate-600 font-normal">/ {item.unit}</span>
                            </div>
                            <div className="text-[11px] opacity-80 mt-0.5">
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
              <tfoot className="bg-slate-950 border-t-2 border-slate-800 print:bg-slate-100 print:border-slate-400">
                <TableRow className="border-slate-800 print:border-slate-400">
                  <TableCell colSpan={4} className="p-4 text-right font-bold text-sm text-slate-200 print:text-slate-900">
                    VALOR TOTAL GLOBAL DA PROPOSTA:
                  </TableCell>

                  {proposals.map((prop) => {
                    const isWinner = globalWinner?.id === prop.id;
                    return (
                      <TableCell
                        key={prop.id}
                        className={`text-right p-4 font-mono font-extrabold text-base border-l border-slate-800 print:border-slate-400 ${
                          isWinner
                            ? 'bg-amber-950/60 text-amber-300 print:bg-slate-300 print:text-slate-900'
                            : 'text-slate-100 print:text-slate-900'
                        }`}
                      >
                        {formatCurrency(prop.total_amount)}
                        {isWinner && (
                          <div className="text-[10px] text-amber-400 font-sans font-semibold uppercase mt-0.5 print:text-slate-800">
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
