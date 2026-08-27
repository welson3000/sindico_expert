"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ImageModal } from './ImageModal';
import { submitProposal } from '@/services/proposal.service';
import { Building2, Building, ShieldCheck, Camera, Calculator, Lock, CheckCircle2, AlertTriangle, Send, FileText, UserCheck } from 'lucide-react';

interface PhotoItem {
  id: string;
  section_id: string;
  photo_url: string;
  caption: string | null;
}

interface SectionItem {
  id: string;
  title: string;
  description: string | null;
  order: number | null;
  photos: PhotoItem[];
}

interface BOQItem {
  id: string;
  category_title: string;
  subcategory_title: string | null;
  item_description: string;
  unit: string;
  quantity: string;
  order: number | null;
}

interface QuoteFormProps {
  request: {
    id: string;
    title: string;
    status: string;
    max_suppliers: number | null;
    created_at: Date | null;
  };
  condo: {
    id: string;
    name: string;
    address: string;
  } | null;
  techSpecs: {
    total_floors: number | null;
    floor_breakdown: string | null;
    facade_type: string | null;
    vertical_halls_count: number | null;
    additional_details: string | null;
  } | null;
  sections: SectionItem[];
  items: BOQItem[];
  supplierInfo: {
    id: string;
    name: string;
    email: string;
    document_cnpj_cpf: string;
  };
  proposalsCount: number;
  maxSuppliers: number;
  isLimitReached: boolean;
  existingProposal: {
    id: string;
    total_amount: string;
    created_at: Date | null;
  } | null;
  existingProposalItems: {
    request_item_id: string;
    unit_price: string;
    total_price: string;
  }[];
}

export function QuoteForm({
  request,
  condo,
  techSpecs,
  sections,
  items,
  supplierInfo,
  proposalsCount,
  maxSuppliers,
  isLimitReached,
  existingProposal,
  existingProposalItems,
}: QuoteFormProps) {
  // Initialize prices from existing proposal if already submitted, or empty
  const initialPrices: Record<string, number> = {};
  if (existingProposalItems && existingProposalItems.length > 0) {
    existingProposalItems.forEach((pi) => {
      initialPrices[pi.request_item_id] = Number(pi.unit_price) || 0;
    });
  }

  const [unitPrices, setUnitPrices] = useState<Record<string, number>>(initialPrices);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string | null } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isAlreadySubmitted = Boolean(existingProposal);
  const isBlockedForNewSubmission = isLimitReached && !isAlreadySubmitted;
  const isFormDisabled = isAlreadySubmitted || isBlockedForNewSubmission;

  // Real-time calculation of item totals & global total
  const calculateItemTotal = (quantityStr: string, unitPrice: number) => {
    const qty = Number(quantityStr) || 0;
    return qty * (unitPrice || 0);
  };

  const calculateGlobalTotal = () => {
    return items.reduce((sum, item) => {
      const price = unitPrices[item.id] || 0;
      return sum + calculateItemTotal(item.quantity, price);
    }, 0);
  };

  const grandTotal = calculateGlobalTotal();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleUnitPriceChange = (itemId: string, valueStr: string) => {
    if (isFormDisabled) return;
    const num = parseFloat(valueStr);
    setUnitPrices((prev) => ({
      ...prev,
      [itemId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSubmitProposal = () => {
    // Validate that all items have a valid price > 0
    const missingItems = items.filter((item) => !unitPrices[item.id] || unitPrices[item.id] <= 0);
    if (missingItems.length > 0) {
      toast.error('Preencha o preço unitário para todos os itens da planilha antes de enviar.');
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmSubmission = () => {
    startTransition(async () => {
      try {
        const payloadItems = items.map((item) => ({
          request_item_id: item.id,
          unit_price: unitPrices[item.id] || 0,
        }));

        const result = await submitProposal({
          requestId: request.id,
          items: payloadItems,
        });

        if (result.success) {
          toast.success('Proposta comercial enviada com sucesso!');
          setIsConfirmOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || 'Erro ao enviar proposta comercial.');
        setIsConfirmOpen(false);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Fixo do Fornecedor & Status */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <UserCheck className="w-4 h-4" /> Fornecedor Logado
              </div>
              <h1 className="text-2xl font-bold text-slate-50">{supplierInfo.name}</h1>
              <p className="text-sm text-slate-400 font-mono mt-0.5">CNPJ: {supplierInfo.document_cnpj_cpf}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Vagas da Cotação:</span>
                <span className="font-semibold text-white">
                  {proposalsCount} / {maxSuppliers}
                </span>
              </div>

              {isAlreadySubmitted && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-1.5 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Proposta Enviada
                </Badge>
              )}

              {isBlockedForNewSubmission && (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 px-3 py-1.5 flex items-center gap-1.5 text-sm">
                  <Lock className="w-4 h-4" /> Vagas Esgotadas (Limite de 5 Atingido)
                </Badge>
              )}

              {!isAlreadySubmitted && !isBlockedForNewSubmission && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 px-3 py-1.5 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4" /> Cotação Aberta
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Informações da Solicitação */}
        <CardContent className="p-6 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 uppercase font-medium">Solicitação de Serviço</span>
              <h2 className="text-xl font-semibold text-slate-100">{request.title}</h2>
            </div>
            {condo && (
              <div className="text-right sm:text-right">
                <div className="flex items-center sm:justify-end gap-1.5 text-sm font-medium text-slate-200">
                  <Building2 className="w-4 h-4 text-indigo-400" /> {condo.name}
                </div>
                <p className="text-xs text-slate-400">{condo.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerta caso o limite de 5 fornecedores tenha sido atingido */}
      {isBlockedForNewSubmission && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-100">Limite de 5 Fornecedores Atingido</h4>
            <p className="text-sm text-rose-300 mt-1">
              Esta solicitação de serviço já recebeu o número máximo de 5 propostas comerciais de fornecedores concorrentes.
              Novas submissões foram encerradas para este processo de cotação.
            </p>
          </div>
        </div>
      )}

      {/* Alerta de confirmação de proposta enviada */}
      {isAlreadySubmitted && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-200 p-4 rounded-xl flex items-start gap-3 shadow-md">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-100">Sua proposta comercial já foi submetida com sucesso</h4>
            <p className="text-sm text-emerald-300 mt-1">
              Valor Total Enviado: <strong className="text-white">{formatCurrency(Number(existingProposal?.total_amount || 0))}</strong>.
              Em conformidade com as regras de Blind Bidding, seus preços estão registrados e mantidos sob sigilo absoluto.
            </p>
          </div>
        </div>
      )}

      {/* 2. Ficha Técnica do Edifício */}
      {techSpecs && (
        <Card className="bg-slate-900 border-slate-800 text-white shadow-md">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
              <Building className="w-5 h-5" /> Ficha Técnica do Condomínio
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Especificações estruturais para auxílio na orçamentação e planejamento técnico.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Total de Andares/Pavimentos</span>
              <span className="text-lg font-bold text-slate-100">{techSpecs.total_floors ?? 'Não informado'}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Prumadas/Halls Verticais</span>
              <span className="text-lg font-bold text-slate-100">{techSpecs.vertical_halls_count ?? 'Não informado'}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Tipo de Fachada</span>
              <span className="text-base font-semibold text-slate-100">{techSpecs.facade_type || 'Não informado'}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Divisão dos Pavimentos</span>
              <span className="text-base font-medium text-slate-200">{techSpecs.floor_breakdown || 'Padrão'}</span>
            </div>
            {techSpecs.additional_details && (
              <div className="col-span-full bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium mb-1">Detalhes Técnicos Adicionais</span>
                <p className="text-sm text-slate-300">{techSpecs.additional_details}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. Dossiê Fotográfico & Seções */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-md">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
            <Camera className="w-5 h-5" /> Dossiê Fotográfico e Registros Técnicos
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Examine as áreas de intervenção, patologias e fotos anexadas pelo Síndico. Clique na foto para dar zoom.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {sections.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nenhuma seção fotográfica cadastrada nesta solicitação.</p>
          ) : (
            sections.map((section, idx) => (
              <div key={section.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <span className="bg-indigo-900/60 text-indigo-300 text-xs font-mono px-2 py-0.5 rounded">
                      Seção {idx + 1}
                    </span>
                    {section.title}
                  </h3>
                  {section.description && <p className="text-sm text-slate-400 mt-1">{section.description}</p>}
                </div>

                {/* Galeria de fotos da seção */}
                {section.photos && section.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                    {section.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto({ url: photo.photo_url, caption: photo.caption })}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-800 bg-slate-900 hover:border-indigo-500 transition-all shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.photo_url}
                          alt={photo.caption || 'Foto da seção'}
                          className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                          Ampliar
                        </div>
                        {photo.caption && (
                          <div className="p-1.5 text-xs text-slate-300 truncate bg-slate-900/90 border-t border-slate-800">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">Nenhuma foto cadastrada nesta seção.</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Planilha Interativa de Preços (BOQ) */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
                <Calculator className="w-5 h-5" /> Planilha de Quantitativos e Cotação de Preços (BOQ)
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-0.5">
                Informe o seu <strong>Preço Unitário (R$)</strong> para cada item. O total é calculado automaticamente em tempo real.
              </CardDescription>
            </div>

            <div className="bg-indigo-950/70 border border-indigo-800/80 rounded-xl px-4 py-2 text-right">
              <span className="text-xs text-indigo-300 block font-medium">Valor Global da Proposta</span>
              <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 font-semibold w-12 text-center">#</TableHead>
                <TableHead className="text-slate-400 font-semibold">Categoria / Item</TableHead>
                <TableHead className="text-slate-400 font-semibold text-center w-24">Qtd</TableHead>
                <TableHead className="text-slate-400 font-semibold text-center w-24">Unid.</TableHead>
                <TableHead className="text-slate-400 font-semibold text-right w-44">Preço Unitário (R$)</TableHead>
                <TableHead className="text-slate-400 font-semibold text-right w-44">Preço Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    Nenhum item cadastrado nesta solicitação.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const unitPrice = unitPrices[item.id] || 0;
                  const itemTotal = calculateItemTotal(item.quantity, unitPrice);

                  return (
                    <TableRow key={item.id} className="border-slate-800 hover:bg-slate-850/50 transition-colors">
                      <TableCell className="text-center font-mono text-xs text-slate-400">{index + 1}</TableCell>
                      <TableCell className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.5 rounded">
                            {item.category_title}
                          </span>
                          {item.subcategory_title && (
                            <span className="text-xs text-slate-400 font-medium">/ {item.subcategory_title}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-100">{item.item_description}</p>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-slate-200">{item.quantity}</TableCell>
                      <TableCell className="text-center text-xs font-mono text-slate-400 uppercase">{item.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="relative flex items-center justify-end">
                          <span className="absolute left-3 text-xs text-slate-400 font-mono">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            disabled={isFormDisabled}
                            value={unitPrices[item.id] !== undefined ? unitPrices[item.id] : ''}
                            onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                            className="w-36 text-right pl-8 bg-slate-950 border-slate-700 text-white font-mono text-sm focus:border-indigo-500 disabled:opacity-60"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-100 text-sm">
                        {formatCurrency(itemTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="bg-slate-950/80 border-t border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 max-w-lg">
            * Ao submeter esta proposta comercial, você atesta que os preços declarados cobrem a totalidade dos escopos descritos.
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">Total Geral Proposto</span>
              <span className="text-lg font-bold text-emerald-400">{formatCurrency(grandTotal)}</span>
            </div>

            <Button
              type="button"
              disabled={isFormDisabled || isPending}
              onClick={handleSubmitProposal}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Enviar Proposta Comercial
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de Zoom na Imagem */}
      {selectedPhoto && (
        <ImageModal
          isOpen={Boolean(selectedPhoto)}
          onClose={() => setSelectedPhoto(null)}
          imageUrl={selectedPhoto.url}
          caption={selectedPhoto.caption}
        />
      )}

      {/* Modal de Confirmação de Envio */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" /> Confirmar Envio da Proposta
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-1">
              Revise as informações antes de finalizar o envio da proposta comercial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 border-y border-slate-800 my-2">
            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Fornecedor Proponente:</span>
              <p className="text-sm font-semibold text-slate-100">{supplierInfo.name}</p>
              <p className="text-xs text-slate-400 font-mono">CNPJ: {supplierInfo.document_cnpj_cpf}</p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Solicitação de Serviço:</span>
              <p className="text-sm font-semibold text-slate-100">{request.title}</p>
            </div>

            <div className="bg-indigo-950/80 border border-indigo-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-300 font-medium uppercase block">Valor Total Global</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                {items.length} Itens Precificados
              </Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-850">
              🔒 <strong>Blind Bidding Rígido:</strong> Sua proposta será registrada de forma selada e sigilosa. Nenhum outro fornecedor terá acesso aos seus valores unitários ou globais.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isPending}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Revisar Preços
            </Button>
            <Button
              type="button"
              onClick={confirmSubmission}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2"
            >
              {isPending ? 'Enviando Proposta...' : 'Confirmar e Submeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
