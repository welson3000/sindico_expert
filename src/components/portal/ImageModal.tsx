"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ZoomIn } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  caption?: string | null;
}

export function ImageModal({ isOpen, onClose, imageUrl, caption }: ImageModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white p-4">
        <DialogHeader className="mb-2 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ZoomIn className="w-5 h-5 text-indigo-400" />
              Detalhamento de Patologia / Registro Fotográfico
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Examine a imagem em alta resolução para precisão da cotação.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg bg-black/60 p-2 max-h-[75vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={caption || 'Foto do dossiê técnico'}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded shadow-lg"
          />
          {caption && (
            <div className="mt-3 w-full text-center bg-slate-900/90 border border-slate-800 p-2.5 rounded text-sm text-slate-200">
              <span className="font-medium text-indigo-400">Legenda:</span> {caption}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
