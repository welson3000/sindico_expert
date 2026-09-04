'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Trophy,
  Star,
  Building2,
  Search,
  FileText,
  Phone,
  Mail,
  UserCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { SupplierRankingItem } from '@/services/supplier-evaluation.service';
import { SubmitReviewModal } from './SubmitReviewModal';

export function SuppliersListClient({ suppliers: initialSuppliers }: { suppliers: SupplierRankingItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [evalModalSupplier, setEvalModalSupplier] = useState<{ id: string; name: string } | null>(null);

  const filteredSuppliers = initialSuppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.document_cnpj_cpf.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  const totalSuppliers = initialSuppliers.length;
  const avgOverallRating =
    totalSuppliers > 0
      ? Number((initialSuppliers.reduce((sum, s) => sum + s.overallRating, 0) / totalSuppliers).toFixed(1))
      : 5.0;

  const totalCompletedWorks = initialSuppliers.reduce((sum, s) => sum + s.completedWorksCount, 0);

  const getRankBadge = (rank?: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-amber-500 text-white border-amber-600 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-md">
          <Trophy className="w-3.5 h-3.5" /> 1º Lugar (TOP 1)
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-slate-300 text-slate-900 border-slate-400 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-slate-700" /> 2º Lugar
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-amber-800/80 text-amber-100 border-amber-700 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-300" /> 3º Lugar
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-2.5 py-0.5 text-xs font-semibold">
        Rank #{rank}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Título & Descrição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" /> Módulo de Gestão & Avaliação de Fornecedores
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Ranking de pontuação, histórico de obras entregues e pareceres de avaliação dos síndicos credenciados.
          </p>
        </div>
      </div>

      {/* Cards de Métricas Analíticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md p-5 flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Fornecedores Credenciados</span>
            <span className="text-2xl font-black text-slate-900">{totalSuppliers} Empresas</span>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 text-slate-900 shadow-md p-5 flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl">
            <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Média de Satisfação</span>
            <span className="text-2xl font-black text-slate-900">{avgOverallRating} / 5.0</span>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 text-slate-900 shadow-md p-5 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Obras Registradas</span>
            <span className="text-2xl font-black text-slate-900">{totalCompletedWorks} Projetos</span>
          </div>
        </Card>
      </div>

      {/* Barra de Pesquisa */}
      <Card className="bg-white border-slate-200 p-4 shadow-sm">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar fornecedor por Razão Social, CNPJ ou E-mail..."
            className="pl-11 bg-slate-50 border-slate-200 text-slate-900 text-sm focus:border-blue-500 rounded-xl"
          />
        </div>
      </Card>

      {/* Lista de Fornecedores com Ranking */}
      {filteredSuppliers.length === 0 ? (
        <Card className="bg-white border-slate-200 text-slate-900 p-12 text-center shadow-md">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum fornecedor encontrado</h3>
          <p className="text-slate-500 text-sm mt-1">Tente ajustar o termo digitado na barra de pesquisa.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="bg-white border-slate-200 text-slate-900 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  {/* Empresa & Rank */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getRankBadge(supplier.rankPosition)}
                      <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono pt-1">
                      <span>CNPJ: <strong>{supplier.document_cnpj_cpf}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.phone}</span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Nota Geral</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-xl font-black text-slate-900 font-mono">{supplier.overallRating}</span>
                        <span className="text-xs text-slate-400">/ 5.0</span>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-mono font-bold">
                      {supplier.reviewsCount} {supplier.reviewsCount === 1 ? 'Avaliação' : 'Avaliações'}
                    </Badge>
                  </div>
                </div>

                {/* Métricas de Critérios & Indicadores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium block">Qualidade & Acabamento</span>
                    <span className="text-base font-bold text-slate-900 font-mono">⭐ {supplier.avgQuality} / 5.0</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium block">Pontualidade & Prazos</span>
                    <span className="text-base font-bold text-slate-900 font-mono">⭐ {supplier.avgPunctuality} / 5.0</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium block">Transparência de Preço</span>
                    <span className="text-base font-bold text-slate-900 font-mono">⭐ {supplier.avgPricing} / 5.0</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium block">Propostas Submetidas</span>
                    <span className="text-base font-bold text-blue-600 font-mono">{supplier.proposalsCount} Cotações</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Fornecedor Habilitado & Validado no Sistema</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEvalModalSupplier({ id: supplier.id, name: supplier.name })}
                      className="w-full sm:w-auto border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white text-xs font-semibold rounded-xl h-10 gap-1.5 cursor-pointer transition-all"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Avaliar Fornecedor
                    </Button>

                    <Link href={`/dashboard/suppliers/${supplier.id}`} className="w-full sm:w-auto">
                      <Button
                        type="button"
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl h-10 px-5 gap-1.5 shadow-md cursor-pointer transition-all"
                      >
                        <span>Ver Perfil & Avaliações</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Avaliação */}
      {evalModalSupplier && (
        <SubmitReviewModal
          isOpen={Boolean(evalModalSupplier)}
          onClose={() => setEvalModalSupplier(null)}
          supplierId={evalModalSupplier.id}
          supplierName={evalModalSupplier.name}
        />
      )}
    </div>
  );
}
