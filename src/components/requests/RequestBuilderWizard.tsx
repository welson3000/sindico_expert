"use client";

import { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRequestSchema, CreateRequestValues } from '@/schemas/request.schema';
import { createServiceRequest } from '@/services/request.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Camera, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, FileText, Calculator, Loader2 } from 'lucide-react';

interface RequestBuilderWizardProps {
  condoId: string;
  techSpec?: any;
}

// Client-side Canvas Image Compression helper to compress mobile photos (e.g. 8MB -> 150KB)
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export function RequestBuilderWizard({ condoId, techSpec }: RequestBuilderWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isCompressing, setIsCompressing] = useState(false);
  const router = useRouter();

  const form = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: '',
      sections: [{ title: 'Geral', description: '', photos: [] }],
      items: [{ category_title: 'Serviços Gerais', item_description: '', unit: 'un', quantity: 1 }],
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      toast.info('Otimizando imagem para envio...');
      const compressedBase64 = await compressImage(file);

      const currentPhotos = form.getValues(`sections.${sectionIndex}.photos`) || [];
      form.setValue(`sections.${sectionIndex}.photos`, [...currentPhotos, { photo_url: compressedBase64, caption: '' }]);
      toast.success('Foto otimizada e anexada!');
    } catch (err) {
      toast.error('Erro ao processar imagem.');
    } finally {
      setIsCompressing(false);
    }
  };

  function onSubmit(values: CreateRequestValues) {
    startTransition(async () => {
      try {
        await createServiceRequest(condoId, values);
        toast.success('Solicitação criada e publicada com sucesso!');
        router.push(`/dashboard/condominiums/${condoId}/requests`);
      } catch (err: any) {
        toast.error(err.message || 'Erro ao criar solicitação');
      }
    });
  }

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(['title']);
    } else if (step === 2) {
      isValid = await form.trigger(['sections']);
    } else if (step === 3) {
      isValid = await form.trigger(['items']);
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      {/* Wizard Step Indicator */}
      <div className="mb-8 flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {s}
            </div>
            {s < 4 && <div className={`flex-1 h-1 mx-2 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Dados Gerais */}
        {step === 1 && (
          <Card className="bg-slate-950 border-slate-800 text-white shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Passo 1: Dados Gerais da Solicitação
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Defina o título da solicitação de serviço e revise a Ficha Técnica do Edifício.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Título da Solicitação</label>
                <Input
                  placeholder="Ex: Restauração e Pintura de Fachada"
                  {...form.register('title')}
                  className="bg-slate-900 border-slate-800 text-white focus:border-indigo-500 text-sm"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-rose-400">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Ficha Técnica do Condomínio</h4>
                {techSpec ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-slate-400">Pavimentos:</span> <strong className="text-slate-200">{techSpec.total_floors}</strong></div>
                    <div><span className="text-slate-400">Elevadores/Halls:</span> <strong className="text-slate-200">{techSpec.vertical_halls_count}</strong></div>
                    <div className="col-span-2 sm:col-span-1"><span className="text-slate-400">Fachada:</span> <strong className="text-slate-200">{techSpec.facade_type}</strong></div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Ficha técnica do edifício pendente de preenchimento.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Dossiê Fotográfico */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-400" /> Passo 2: Dossiê Fotográfico & Seções
                </h2>
                <p className="text-xs text-slate-400">Adicione seções (ex: Fachada Norte, Barrilete) e tire fotos pelo celular.</p>
              </div>
              <Button
                type="button"
                onClick={() => appendSection({ title: 'Nova Seção', description: '', photos: [] })}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-1.5"
              >
                <Plus className="h-4 w-4" /> Adicionar Seção
              </Button>
            </div>

            {sectionFields.map((section, sIndex) => (
              <Card key={section.id} className="bg-slate-950 border-slate-800 text-white shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex-1 mr-4">
                    <Input
                      placeholder="Título da Seção (ex: Fachada Norte - Trincas)"
                      {...form.register(`sections.${sIndex}.title`)}
                      className="bg-slate-900 border-slate-800 text-white font-semibold text-sm"
                    />
                    {form.formState.errors.sections?.[sIndex]?.title && (
                      <p className="text-xs text-rose-400 mt-1">{form.formState.errors.sections[sIndex].title?.message}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(sIndex)}
                    disabled={sectionFields.length === 1}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <Textarea
                    placeholder="Descrição técnica das patologias / observações desta seção..."
                    {...form.register(`sections.${sIndex}.description`)}
                    className="bg-slate-900 border-slate-800 text-white text-xs min-h-[70px]"
                  />

                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-2">Fotos Anexadas</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {form.watch(`sections.${sIndex}.photos`)?.map((photo, pIndex) => (
                        <div key={pIndex} className="relative group rounded-xl border border-slate-800 overflow-hidden aspect-square bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.photo_url} alt="Foto anexada" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => {
                              const photos = form.getValues(`sections.${sIndex}.photos`) || [];
                              form.setValue(
                                `sections.${sIndex}.photos`,
                                photos.filter((_, i) => i !== pIndex)
                              );
                            }}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <label className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-900/60 aspect-square text-slate-400 transition-all">
                        {isCompressing ? (
                          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-indigo-400 mb-1" />
                        )}
                        <span className="text-xs font-medium">{isCompressing ? 'Processando...' : 'Tirar Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          disabled={isCompressing}
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, sIndex)}
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* STEP 3: Planilha (BOQ) */}
        {step === 3 && (
          <Card className="bg-slate-950 border-slate-800 text-white shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-slate-800">
              <div>
                <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" /> Passo 3: Planilha de Quantitativos (BOQ)
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">Defina as categorias, especificações dos itens e quantidades esperadas.</CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => appendItem({ category_title: '1. Tratamento', item_description: '', unit: 'm²', quantity: 1 })}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-1.5"
              >
                <Plus className="h-4 w-4" /> Adicionar Item
              </Button>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900 border-b border-slate-800">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400 font-semibold min-w-[160px]">Categoria</TableHead>
                    <TableHead className="text-slate-400 font-semibold min-w-[220px]">Descrição do Item</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-center w-24">Unid.</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-center w-28">Qtd.</TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemFields.map((item, index) => (
                    <TableRow key={item.id} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="p-3">
                        <Input
                          placeholder="Ex: 1. Tratamento de Trincas"
                          {...form.register(`items.${index}.category_title`)}
                          className="bg-slate-900 border-slate-800 text-white text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          placeholder="Ex: Hidrojateamento e abertura de trincas"
                          {...form.register(`items.${index}.item_description`)}
                          className="bg-slate-900 border-slate-800 text-white text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          placeholder="m², un, kg"
                          {...form.register(`items.${index}.unit`)}
                          className="bg-slate-900 border-slate-800 text-white text-xs text-center font-mono"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="bg-slate-900 border-slate-800 text-white text-xs text-center font-mono font-bold"
                        />
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={itemFields.length === 1}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Revisão */}
        {step === 4 && (
          <Card className="bg-slate-950 border-slate-800 text-white shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Passo 4: Revisão e Publicação
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Revise os dados da solicitação antes de liberar para o recebimento de propostas comerciais.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Título da Solicitação</span>
                <h3 className="text-xl font-bold text-slate-100">{form.getValues('title')}</h3>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-indigo-400">Dossiê Fotográfico ({form.getValues('sections').length} Seções)</h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {form.getValues('sections').map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">#{i + 1}</span>
                      <strong>{s.title}</strong> — {s.photos?.length || 0} fotos anexadas
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-indigo-400">Planilha BOQ ({form.getValues('items').length} Itens Quantificados)</h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {form.getValues('items').map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">#{i + 1}</span>
                      <span>{item.category_title}: <strong>{item.item_description}</strong></span>
                      <span className="font-mono text-emerald-400">({item.quantity} {item.unit})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Nav */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || isPending}
            className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>

          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Próximo Passo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? 'Publicando Solicitação...' : 'Publicar para Cotação'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
