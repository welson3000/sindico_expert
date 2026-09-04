'use client';

import React, { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitSupplierReview } from '@/services/supplier-evaluation.service';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

export function SubmitReviewModal({ isOpen, onClose, supplierId, supplierName }: SubmitReviewModalProps) {
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingPunctuality, setRatingPunctuality] = useState(5);
  const [ratingPricing, setRatingPricing] = useState(5);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleRatingClick = (setter: (val: number) => void, value: number) => {
    setter(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await submitSupplierReview({
        supplierId,
        ratingQuality,
        ratingPunctuality,
        ratingPricing,
        comment: comment.trim(),
      });

      if (res.success) {
        toast.success(`Avaliação registrada com sucesso para ${supplierName}!`);
        onClose();
        setComment('');
      } else {
        toast.error(res.error || 'Falha ao registrar avaliação.');
      }
    });
  };

  const renderStarSelector = (label: string, value: number, setter: (val: number) => void) => (
    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-amber-600 font-mono">{value}.0 / 5.0</span>
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(setter, star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-slate-900 border-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Avaliar Fornecedor Credenciado
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Empresa: <strong className="text-slate-800">{supplierName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {renderStarSelector('Qualidade da Execução & Acabamento', ratingQuality, setRatingQuality)}
          {renderStarSelector('Pontualidade no Cumprimento de Prazos', ratingPunctuality, setRatingPunctuality)}
          {renderStarSelector('Competitividade & Transparência do Preço', ratingPricing, setRatingPricing)}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Parecer / Comentário do Síndico (Opcional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Descreva o atendimento, cumprimento do escopo, pontualidade e qualidade dos serviços..."
              className="bg-white border-slate-300 text-slate-900 text-xs min-h-[80px] focus:border-amber-500"
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
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs gap-2 shadow-md cursor-pointer"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 fill-white" />}
              Registrar Avaliação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
