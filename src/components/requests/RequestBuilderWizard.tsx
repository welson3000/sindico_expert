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
import { Camera, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

interface RequestBuilderWizardProps {
  condoId: string;
  techSpec?: any;
}

export function RequestBuilderWizard({ condoId, techSpec }: RequestBuilderWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const currentPhotos = form.getValues(`sections.${sectionIndex}.photos`) || [];
      form.setValue(`sections.${sectionIndex}.photos`, [...currentPhotos, { photo_url: base64, caption: '' }]);
    };
    reader.readAsDataURL(file);
  };

  function onSubmit(values: CreateRequestValues) {
    startTransition(async () => {
      try {
        await createServiceRequest(condoId, values);
        toast.success('Solicitação criada com sucesso!');
        router.push(`/dashboard/condominiums/${condoId}/requests`);
      } catch (err: any) {
        toast.error(err.message || 'Erro ao criar solicitação');
      }
    });
  }

  const nextStep = async () => {
    // Validate current step before proceeding
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex items-center ${
            s < 4 ? 'flex-1' : ''
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`flex-1 h-1 mx-2 ${
                step > s ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Dados Gerais */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Passo 1: Dados Gerais</CardTitle>
              <CardDescription>Defina o título da solicitação e revise os dados técnicos do edifício.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título da Solicitação</label>
                <Input placeholder="Ex: Restauração e Pintura de Fachada" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md border">
                <h3 className="text-sm font-semibold mb-2">Ficha Técnica do Condomínio</h3>
                {techSpec ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Pavimentos:</span> {techSpec.total_floors}</div>
                    <div><span className="text-gray-500">Elevadores/Halls:</span> {techSpec.vertical_halls_count}</div>
                    <div className="col-span-2"><span className="text-gray-500">Fachada:</span> {techSpec.facade_type}</div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Ficha técnica não preenchida.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Dossiê Fotográfico */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Passo 2: Dossiê Fotográfico</h2>
                <p className="text-sm text-gray-500">Adicione seções (ex: Fachada Norte, Barrilete) e tire fotos.</p>
              </div>
              <Button type="button" onClick={() => appendSection({ title: 'Nova Seção', description: '', photos: [] })} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Seção
              </Button>
            </div>

            {sectionFields.map((section, sIndex) => (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-2 flex-1 mr-4">
                    <Input placeholder="Título da Seção" {...form.register(`sections.${sIndex}.title`)} className="font-semibold" />
                    {form.formState.errors.sections?.[sIndex]?.title && (
                      <p className="text-xs text-red-500">{form.formState.errors.sections[sIndex].title?.message}</p>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(sIndex)} disabled={sectionFields.length === 1} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea placeholder="Descrição / Anotações (Opcional)" {...form.register(`sections.${sIndex}.description`)} className="min-h-[80px]" />
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Fotos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {form.watch(`sections.${sIndex}.photos`)?.map((photo, pIndex) => (
                        <div key={pIndex} className="relative group rounded-md border overflow-hidden aspect-square bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.photo_url} alt="Upload" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => {
                              const photos = form.getValues(`sections.${sIndex}.photos`) || [];
                              form.setValue(`sections.${sIndex}.photos`, photos.filter((_, i) => i !== pIndex));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square text-gray-500">
                        <Camera className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium">Tirar Foto</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Passo 3: Planilha de Quantitativos (BOQ)</CardTitle>
                <CardDescription>Defina os itens de serviço e quantidades.</CardDescription>
              </div>
              <Button type="button" onClick={() => appendItem({ category_title: '', item_description: '', unit: 'un', quantity: 1 })} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição do Item</TableHead>
                    <TableHead className="w-24">Und.</TableHead>
                    <TableHead className="w-24">Qtd.</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemFields.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-2">
                        <Input placeholder="Categoria" {...form.register(`items.${index}.category_title`)} />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input placeholder="Descrição" {...form.register(`items.${index}.item_description`)} />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input placeholder="Ex: m²" {...form.register(`items.${index}.unit`)} />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input type="number" step="0.01" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                      </TableCell>
                      <TableCell className="p-2">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={itemFields.length === 1}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {form.formState.errors.items && (
                <p className="text-xs text-red-500 mt-2">Verifique se preencheu todos os campos da planilha corretamente.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Revisão */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Passo 4: Revisão e Publicação</CardTitle>
              <CardDescription>Revise sua solicitação antes de publicar para os fornecedores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">{form.getValues('title')}</h3>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dossiê ({form.getValues('sections').length} seções)</h4>
                <ul className="list-disc pl-5 text-sm">
                  {form.getValues('sections').map((s, i) => (
                    <li key={i}>{s.title} ({s.photos?.length || 0} fotos)</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Planilha ({form.getValues('items').length} itens)</h4>
                <ul className="list-disc pl-5 text-sm">
                  {form.getValues('items').map((item, i) => (
                    <li key={i}>{item.category_title}: {item.item_description} - {item.quantity} {item.unit}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 flex justify-between md:static md:bg-transparent md:border-none md:p-0 mt-8">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || isPending}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          {step < 4 ? (
            <Button type="button" onClick={nextStep}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Publicando...' : 'Publicar para Cotação'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
