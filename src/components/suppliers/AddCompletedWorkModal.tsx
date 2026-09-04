'use client';

import React, { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addCompletedWork } from '@/services/supplier-evaluation.service';

interface AddCompletedWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

export function AddCompletedWorkModal({ isOpen, onClose, supplierId, supplierName }: AddCompletedWorkModalProps) {
  const [title, setTitle] = useState('');
  const [condoName, setCondoName] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !condoName.trim()) {
      toast.error('Preencha o título da obra e o condomínio.');
      return;
    }

    startTransition(async () => {
      const res = await addCompletedWork({
        supplierId,
        title: title.trim(),
        condoName: condoName.trim(),
        totalValue: totalValue ? parseFloat(totalValue) : undefined,
        scopeDescription: scopeDescription.trim(),
      });

      if (res.success) {
        toast.success(`Obra entregue registrada com sucesso para ${supplierName}!`);
        onClose();
        setTitle('');
        setCondoName('');
        setTotalValue('');
        setScopeDescription('');
      } else {
        toast.error(res.error || 'Falha ao registrar obra.');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-slate-900 border-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Cadastrar Obra Entregue / Portfólio
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Empresa: <strong className="text-slate-800">{supplierName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Título / Serviço Executado</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reforma Integral de Fachada e Impermeabilização"
              className="bg-white border-slate-300 text-slate-900 text-xs focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Condomínio Atendido</label>
              <Input
                value={condoName}
                onChange={(e) => setCondoName(e.target.value)}
                placeholder="Ex: Residencial Parque Das Flores"
                className="bg-white border-slate-300 text-slate-900 text-xs focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Valor Total da Obra (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="0.00"
                className="bg-white border-slate-300 text-slate-900 text-xs font-mono focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Descrição do Escopo / Detalhes (Opcional)</label>
            <Textarea
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Resumo dos serviços, materiais aplicados e garantia concedida..."
              className="bg-white border-slate-300 text-slate-900 text-xs min-h-[70px] focus:border-blue-500"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-2 shadow-md cursor-pointer"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Salvar no Portfólio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
