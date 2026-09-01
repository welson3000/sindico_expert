'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Milestone,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { toggleRoadmapItemStatus, createRoadmapItem, deleteRoadmapItem } from '@/services/roadmap.service';

interface RoadmapItem {
  id: string;
  phase: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  order: number | null;
}

export function RoadmapClient({ items: initialItems }: { items: RoadmapItem[] }) {
  const [items, setItems] = useState<RoadmapItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhase, setNewPhase] = useState('Novos Recursos Solicitados');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Agrupar itens por fase
  const phasesMap = new Map<string, RoadmapItem[]>();
  items.forEach((item) => {
    const list = phasesMap.get(item.phase) || [];
    list.push(item);
    phasesMap.set(item.phase, list);
  });

  const handleToggle = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Atualização otimista na UI
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_completed: nextStatus } : item))
    );

    startTransition(async () => {
      await toggleRoadmapItemStatus(id, nextStatus);
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const res = await createRoadmapItem({
        phase: newPhase || 'Novos Recursos Solicitados',
        title: newTitle.trim(),
        description: newDescription.trim(),
      });

      if (res.success) {
        setNewTitle('');
        setNewDescription('');
        setShowAddModal(false);
        // recarrega a página via router refresh ou atualiza estado
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente remover esta etapa da guia de evolução?')) return;
    setItems((prev) => prev.filter((item) => item.id !== id));

    startTransition(async () => {
      await deleteRoadmapItem(id);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" /> Guia de Evolução do Projeto
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe em tempo real o progresso do Síndico Expert e altere o status das etapas conforme o avanço das solicitações.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(!showAddModal)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Solicitar Novo Recurso
        </Button>
      </div>

      {/* Card de Progresso Geral */}
      <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block mb-1">
              Progresso do Desenvolvimento
            </span>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Milestone className="w-5 h-5 text-blue-600" />
              {completedCount} de {totalCount} etapas concluídas
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-blue-600 font-mono">{progressPercent}%</span>
            <span className="text-xs text-slate-500 font-medium max-w-[100px] leading-tight">
              {progressPercent === 100 ? 'Projeto 100% Concluído!' : 'Em evolução contínua'}
            </span>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Form de Inclusão de Nova Solicitação / Recurso */}
      {showAddModal && (
        <Card className="bg-blue-50/70 border border-blue-200 text-slate-900 shadow-lg rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <h3 className="font-bold text-blue-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> Cadastrar Novo Recurso na Guia de Evolução
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
              className="text-slate-500 hover:text-slate-800 text-xs"
            >
              Fechar
            </Button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Fase / Agrupamento</label>
                <Input
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value)}
                  placeholder="Ex: Fase 6: Recursos Futuros"
                  className="bg-white border-slate-300 text-slate-900 text-sm focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Título da Funcionalidade</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Integração com WhatsApp para notificações"
                  className="bg-white border-slate-300 text-slate-900 text-sm focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Descrição Detalhada (Opcional)</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descreva o que este novo recurso deve realizar..."
                className="bg-white border-slate-300 text-slate-900 text-sm min-h-[70px] focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 shadow-md gap-2 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Adicionar à Guia
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de Fases e Etapas */}
      <div className="space-y-8">
        {Array.from(phasesMap.entries()).map(([phaseTitle, phaseItems]) => {
          const phaseCompleted = phaseItems.filter((i) => i.is_completed).length;
          const isPhaseDone = phaseCompleted === phaseItems.length;

          return (
            <div key={phaseTitle} className="space-y-3">
              {/* Título da Fase */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isPhaseDone ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {phaseTitle}
                  </h3>
                </div>

                <Badge
                  className={
                    isPhaseDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold'
                      : 'bg-blue-50 text-blue-800 border-blue-200 text-xs font-semibold'
                  }
                >
                  {phaseCompleted} / {phaseItems.length} concluídas
                </Badge>
              </div>

              {/* Grid de Etapas */}
              <div className="grid grid-cols-1 gap-3">
                {phaseItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all border rounded-xl shadow-sm ${
                      item.is_completed
                        ? 'bg-white border-emerald-200/80 shadow-emerald-500/5'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Botão de Check / Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id, item.is_completed)}
                          className={`mt-0.5 shrink-0 rounded-lg p-1.5 transition-all cursor-pointer ${
                            item.is_completed
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          title={item.is_completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                        >
                          {item.is_completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-base font-bold transition-all ${
                                item.is_completed ? 'text-slate-800 line-through decoration-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </h4>

                            {item.is_completed ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] px-2 py-0.5 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluído
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[11px] px-2 py-0.5 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> Em Desenvolvimento
                              </Badge>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Botão de Ação Direta para Concluir */}
                      <div className="flex items-center gap-2 justify-end shrink-0">
                        <Button
                          type="button"
                          onClick={() => handleToggle(item.id, item.is_completed)}
                          className={
                            item.is_completed
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg h-9 px-3.5 cursor-pointer border border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg h-9 px-3.5 shadow-sm cursor-pointer gap-1.5'
                          }
                        >
                          {item.is_completed ? (
                            <span>Desmarcar</span>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Marcar como Concluído
                            </>
                          )}
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir etapa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
