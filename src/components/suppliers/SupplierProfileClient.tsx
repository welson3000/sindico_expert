'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Star,
  Building2,
  Phone,
  Mail,
  ArrowLeft,
  MessageSquare,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { SubmitReviewModal } from './SubmitReviewModal';
import { AddCompletedWorkModal } from './AddCompletedWorkModal';

interface ReviewItem {
  id: string;
  sindico_name: string;
  rating_quality: number;
  rating_punctuality: number;
  rating_pricing: number;
  overall_rating: string;
  comment: string | null;
  created_at: Date | null;
}

interface WorkItem {
  id: string;
  title: string;
  condo_name: string;
  total_value: string | null;
  scope_description: string | null;
  completion_date: Date | null;
}

interface SupplierProfileClientProps {
  data: {
    supplier: {
      id: string;
      name: string;
      email: string;
      document_cnpj_cpf: string;
      phone: string;
      created_at: Date | null;
    };
    metrics: {
      overallRating: number;
      avgQuality: number;
      avgPunctuality: number;
      avgPricing: number;
      reviewsCount: number;
      proposalsCount: number;
      completedWorksCount: number;
    };
    reviews: ReviewItem[];
    works: WorkItem[];
  };
}

export function SupplierProfileClient({ data }: SupplierProfileClientProps) {
  const { supplier, metrics, reviews, works } = data;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);

  const formatCurrency = (valStr: string | null) => {
    if (!valStr) return null;
    const num = Number(valStr);
    if (isNaN(num)) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Botão Voltar */}
      <div>
        <Link href="/dashboard/suppliers">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 gap-2 font-semibold text-xs">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Ranking de Fornecedores
          </Button>
        </Link>
      </div>

      {/* Card Principal do Fornecedor */}
      <Card className="bg-white border-slate-200 text-slate-900 shadow-xl overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-[#0E4B78] via-[#0E4B78] to-blue-900 p-6 text-white border-b border-sky-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <UserCheck className="w-4 h-4" /> Fornecedor Credenciado
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{supplier.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sky-100 mt-2 font-mono">
                <span>CNPJ: <strong>{supplier.document_cnpj_cpf}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {supplier.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {supplier.phone}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-right">
              <div>
                <span className="text-xs text-sky-200 uppercase font-semibold block">Nota Geral</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <span className="text-3xl font-black text-white font-mono">{metrics.overallRating}</span>
                  <span className="text-xs text-sky-200">/ 5.0</span>
                </div>
              </div>
              <Badge className="bg-amber-400 text-slate-900 font-extrabold text-xs px-3 py-1">
                {metrics.reviewsCount} {metrics.reviewsCount === 1 ? 'Avaliação' : 'Avaliações'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Métricas Detalhadas */}
        <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">Qualidade & Acabamento</span>
            <span className="text-lg font-bold text-slate-900 font-mono">⭐ {metrics.avgQuality} / 5.0</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">Pontualidade & Prazos</span>
            <span className="text-lg font-bold text-slate-900 font-mono">⭐ {metrics.avgPunctuality} / 5.0</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">Competitividade Preço</span>
            <span className="text-lg font-bold text-slate-900 font-mono">⭐ {metrics.avgPricing} / 5.0</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">Cotações Submetidas</span>
            <span className="text-lg font-bold text-blue-600 font-mono">{metrics.proposalsCount} Cotações</span>
          </div>
        </CardContent>

        {/* Botões de Ação do Síndico */}
        <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Avalie os serviços prestados ou registre uma nova obra no portfólio deste fornecedor.
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setIsWorkModalOpen(true)}
              variant="outline"
              className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold rounded-xl h-10 gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> + Cadastrar Obra Entregue
            </Button>

            <Button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl h-10 px-5 gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Avaliar Este Fornecedor
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid: 1. Histórico de Obras Entregues | 2. Feed de Avaliações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bloco 1: Histórico de Obras Entregues (Portfólio) */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Histórico de Obras Entregues ({works.length})
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Portfólio de obras concluídas com comprovação de execução.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {works.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic text-sm">
                Nenhuma obra cadastrada até o momento.
              </div>
            ) : (
              works.map((work) => (
                <div
                  key={work.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{work.title}</h4>
                      <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {work.condo_name}
                      </p>
                    </div>

                    {work.total_value && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-mono font-bold">
                        {formatCurrency(work.total_value)}
                      </Badge>
                    )}
                  </div>

                  {work.scope_description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
                      {work.scope_description}
                    </p>
                  )}

                  {work.completion_date && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono pt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Concluído em: {new Date(work.completion_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bloco 2: Feed de Avaliações dos Síndicos */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" /> Pareceres & Avaliações dos Síndicos ({reviews.length})
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Avaliações reais enviadas por síndicos após análise de propostas ou prestação de serviços.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic text-sm">
                Nenhum parecer cadastrado. Seja o primeiro síndico a avaliar este fornecedor!
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{rev.sindico_name}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span className="text-sm font-black text-amber-900 font-mono">{rev.overall_rating}</span>
                    </div>
                  </div>

                  {/* Notas por critério */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 font-medium">
                    <span>Qualidade: <strong>⭐ {rev.rating_quality}.0</strong></span>
                    <span>•</span>
                    <span>Pontualidade: <strong>⭐ {rev.rating_punctuality}.0</strong></span>
                    <span>•</span>
                    <span>Preço: <strong>⭐ {rev.rating_pricing}.0</strong></span>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <SubmitReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        supplierId={supplier.id}
        supplierName={supplier.name}
      />

      <AddCompletedWorkModal
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        supplierId={supplier.id}
        supplierName={supplier.name}
      />
    </div>
  );
}
