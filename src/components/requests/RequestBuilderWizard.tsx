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
      {/* Wizard Step Indicator inspired by reference design */}
      <div className="mb-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-md">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Dados Gerais' },
            { num: 2, label: 'Dossiê Fotográfico' },
            { num: 3, label: 'Planilha (BOQ)' },
            { num: 4, label: 'Revisão & Publicação' },
          ].map((s, idx) => (
            <div key={s.num} className={`flex items-center ${idx < 3 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= s.num
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:inline ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all ${step > s.num ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Dados Gerais */}
        {step === 1 && (
          <Card className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Passo 1: Dados Gerais da Solicitação
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                Defina o título da solicitação de serviço e revise a Ficha Técnica do Edifício.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Título da Solicitação</label>
                <Input
                  placeholder="Ex: Restauração e Pintura de Fachada"
                  {...form.register('title')}
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-rose-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Ficha Técnica do Condomínio</h4>
                {techSpec ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div><span className="text-slate-500">Pavimentos:</span> <strong className="text-slate-900">{techSpec.total_floors}</strong></div>
                    <div><span className="text-slate-500">Elevadores/Halls:</span> <strong className="text-slate-900">{techSpec.vertical_halls_count}</strong></div>
                    <div className="col-span-2 sm:col-span-1"><span className="text-slate-500">Fachada:</span> <strong className="text-slate-900">{techSpec.facade_type}</strong></div>
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
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-md">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" /> Passo 2: Dossiê Fotográfico & Seções
                </h2>
                <p className="text-xs text-slate-500">Adicione seções (ex: Fachada Norte, Barrilete) e tire fotos pelo celular.</p>
              </div>
              <Button
                type="button"
                onClick={() => appendSection({ title: 'Nova Seção', description: '', photos: [] })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Adicionar Seção
              </Button>
            </div>

            {sectionFields.map((section, sIndex) => (
              <Card key={section.id} className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex-1 mr-4">
                    <Input
                      placeholder="Título da Seção (ex: Fachada Norte - Trincas)"
                      {...form.register(`sections.${sIndex}.title`)}
                      className="bg-white border-slate-300 text-slate-900 font-semibold text-sm focus:border-blue-500"
                    />
                    {form.formState.errors.sections?.[sIndex]?.title && (
                      <p className="text-xs text-rose-600 mt-1">{form.formState.errors.sections[sIndex].title?.message}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(sIndex)}
                    disabled={sectionFields.length === 1}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <Textarea
                    placeholder="Descrição técnica das patologias / observações desta seção..."
                    {...form.register(`sections.${sIndex}.description`)}
                    className="bg-white border-slate-300 text-slate-900 text-xs min-h-[70px] focus:border-blue-500"
                  />

                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">Fotos Anexadas</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {form.watch(`sections.${sIndex}.photos`)?.map((photo, pIndex) => (
                        <div key={pIndex} className="relative group rounded-xl border border-slate-200 overflow-hidden aspect-square bg-slate-100">
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
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <label className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 aspect-square text-slate-500 transition-all bg-slate-50">
                        {isCompressing ? (
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-blue-600 mb-1" />
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
          <Card className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-slate-100">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" /> Passo 3: Planilha de Quantitativos (BOQ)
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">Defina as categorias, especificações dos itens e quantidades esperadas.</CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => appendItem({ category_title: '1. Tratamento', item_description: '', unit: 'm²', quantity: 1 })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Adicionar Item
              </Button>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-700 font-semibold min-w-[160px]">Categoria</TableHead>
                    <TableHead className="text-slate-700 font-semibold min-w-[220px]">Descrição do Item</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-center w-24">Unid.</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-center w-28">Qtd.</TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemFields.map((item, index) => (
                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
                      <TableCell className="p-3">
                        <Input
                          placeholder="Ex: 1. Tratamento de Trincas"
                          {...form.register(`items.${index}.category_title`)}
                          className="bg-white border-slate-300 text-slate-900 text-xs focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          placeholder="Ex: Hidrojateamento e abertura de trincas"
                          {...form.register(`items.${index}.item_description`)}
                          className="bg-white border-slate-300 text-slate-900 text-xs focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          placeholder="m², un, kg"
                          {...form.register(`items.${index}.unit`)}
                          className="bg-white border-slate-300 text-slate-900 text-xs text-center font-mono focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="bg-white border-slate-300 text-slate-900 text-xs text-center font-mono font-bold focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={itemFields.length === 1}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
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
          <Card className="bg-white border-slate-200 text-slate-900 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Passo 4: Revisão e Publicação
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                Revise os dados da solicitação antes de liberar para o recebimento de propostas comerciais.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Título da Solicitação</span>
                <h3 className="text-xl font-bold text-slate-900">{form.getValues('title')}</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-blue-600">Dossiê Fotográfico ({form.getValues('sections').length} Seções)</h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {form.getValues('sections').map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-800">#{i + 1}</span>
                      <strong>{s.title}</strong> — {s.photos?.length || 0} fotos anexadas
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-blue-600">Planilha BOQ ({form.getValues('items').length} Itens Quantificados)</h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {form.getValues('items').map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-800">#{i + 1}</span>
                      <span>{item.category_title}: <strong>{item.item_description}</strong></span>
                      <span className="font-mono text-emerald-600">({item.quantity} {item.unit})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Nav */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || isPending}
            className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>

          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-md">
              Próximo Passo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md gap-2 cursor-pointer">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? 'Publicando Solicitação...' : 'Publicar para Cotação'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
