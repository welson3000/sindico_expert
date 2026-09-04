'use server';

import { db } from '@/db';
import { project_roadmap_items } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DEFAULT_ROADMAP_ITEMS = [
  // Fase 1
  {
    phase: 'Fase 1: Gestão de Condomínios & Ficha Técnica',
    title: 'Cadastro e Listagem de Condomínios',
    description: 'Gestão completa dos edifícios cadastrados pela organização com visualização em grid.',
    is_completed: true,
    order: 1,
  },
  {
    phase: 'Fase 1: Gestão de Condomínios & Ficha Técnica',
    title: 'Ficha Técnica Predial Interativa',
    description: 'Campos detalhados para registro de andares, elevadores/prumadas, tipos de fachada e observações.',
    is_completed: true,
    order: 2,
  },
  {
    phase: 'Fase 1: Gestão de Condomínios & Ficha Técnica',
    title: 'Ações Globais na Ficha Técnica (Salvar & Criar Solicitação)',
    description: 'Relocação dos botões de ação para a barra superior direita com melhor usabilidade.',
    is_completed: true,
    order: 3,
  },
  {
    phase: 'Fase 1: Gestão de Condomínios & Ficha Técnica',
    title: 'Botão "Limpar Ficha Técnica Predial"',
    description: 'Limpa todos os dados da ficha no banco de dados e reseta o formulário mantendo a tela aberta para novo preenchimento.',
    is_completed: true,
    order: 4,
  },
  {
    phase: 'Fase 1: Gestão de Condomínios & Ficha Técnica',
    title: 'Modo de Exclusão de Condomínios com Lixeira',
    description: 'Botão de alternância "Excluir Condomínios" que ativa ícones de lixeira com remoção em cascata.',
    is_completed: true,
    order: 5,
  },

  // Fase 2
  {
    phase: 'Fase 2: Solicitações de Serviço & Dossiê Fotográfico',
    title: 'Assistente (Wizard em 4 Passos) para Nova Solicitação',
    description: 'Criação estruturada de cotações com Dados Gerais, Dossiê Fotográfico, Planilha BOQ e Revisão Final.',
    is_completed: true,
    order: 6,
  },
  {
    phase: 'Fase 2: Solicitações de Serviço & Dossiê Fotográfico',
    title: 'Upload e Dossiê Fotográfico de Patologias',
    description: 'Registro visual de fotos divididas por seções (ex: Fachada, Barrilete, Terraço).',
    is_completed: true,
    order: 7,
  },
  {
    phase: 'Fase 2: Solicitações de Serviço & Dossiê Fotográfico',
    title: 'Planilha Quantitativa de Serviços (BOQ)',
    description: 'Inclusão de itens com categoria, subcategoria, unidade de medida e quantidades.',
    is_completed: true,
    order: 8,
  },

  // Fase 3
  {
    phase: 'Fase 3: Cotações Comercial & Blind Bidding',
    title: 'Portal Exclusivo para Fornecedores Credenciados',
    description: 'Submissão sigilosa de propostas comerciais no modelo Blind Bidding (Propostas Seladas).',
    is_completed: true,
    order: 9,
  },
  {
    phase: 'Fase 3: Cotações Comercial & Blind Bidding',
    title: 'Trava de Segurança e Limite de 5 Fornecedores',
    description: 'Controle de vagas em tempo real para fechamento automático da cotação.',
    is_completed: true,
    order: 10,
  },
  {
    phase: 'Fase 3: Cotações Comercial & Blind Bidding',
    title: 'Matriz Comparativa de Preços Lado a Lado',
    description: 'Quadro comparativo automático destacando a Proposta Vencedora Global e o Menor Preço por Item.',
    is_completed: true,
    order: 11,
  },
  {
    phase: 'Fase 3: Cotações Comercial & Blind Bidding',
    title: 'Análise de Economia Fracionada Item a Item',
    description: 'Cálculo do potencial de economia extra caso o síndico opte por contratar fornecedores por item.',
    is_completed: true,
    order: 12,
  },

  // Fase 4
  {
    phase: 'Fase 4: Design System & Identidade Visual',
    title: 'Redesign Visual Ocean Blue (#0E4B78) & Cards Brancos',
    description: 'Novo padrão estético moderno inspirado no design de referência com paleta alegre e vibrante.',
    is_completed: true,
    order: 13,
  },
  {
    phase: 'Fase 4: Design System & Identidade Visual',
    title: 'Padronização Integral de Todas as Telas',
    description: 'Ajuste de tipografia, sombras, selos de status e botões em todas as telas do sistema.',
    is_completed: true,
    order: 14,
  },

  // Fase 5
  {
    phase: 'Fase 5: Perfil, Acessibilidade & Guia de Evolução',
    title: 'Gestão de Perfil do Usuário e Organização',
    description: 'Página /dashboard/profile para edição de nome, telefone, documento e dados cadastrais.',
    is_completed: true,
    order: 15,
  },
  {
    phase: 'Fase 5: Perfil, Acessibilidade & Guia de Evolução',
    title: 'Visibilidade Mobile do Botão de Cadastro de Condomínio',
    description: 'Ajuste no cabeçalho e contêiner mobile garantindo visibilidade total do botão "+ Novo Condomínio".',
    is_completed: true,
    order: 17,
  },
  {
    phase: 'Fase 5: Perfil, Acessibilidade & Guia de Evolução',
    title: 'Limites do BOQ: Unidade (Até 4 caracteres) & Quantidade (Até 4 números)',
    description: 'Validação e formatação dos campos de Unidade e Quantidade na Planilha Quantitativa.',
    is_completed: true,
    order: 18,
  },
  {
    phase: 'Fase 5: Perfil, Acessibilidade & Guia de Evolução',
    title: 'Detalhamento do Fornecedor (Empresa, CNPJ, Contato, Telefone) na BOQ e Matriz',
    description: 'Preenchimento automático dos dados cadastrais do perfil do fornecedor na planilha de cotação e cabeçalho do mapa comparativo.',
    is_completed: true,
    order: 19,
  },
  {
    phase: 'Fase 5: Perfil, Acessibilidade & Guia de Evolução',
    title: 'Recurso de Acesso Direto para Fornecedores com Copiar Link da Cotação',
    description: 'Botões "Copiar Link p/ Fornecedores" e "Ver visão do fornecedor" em cada card de solicitação com redirecionamento para login/cadastro.',
    is_completed: true,
    order: 20,
  },

  // Fase 6 (Próximas melhorias / Expansão)
  {
    phase: 'Fase 6: Recursos Futuros & Expansão',
    title: 'Exportação do Mapa Comparativo em PDF Executivo',
    description: 'Geração de relatório profissional formatado em PDF para apresentação em assembleias de condomínio.',
    is_completed: true,
    order: 17,
  },
  {
    phase: 'Fase 6: Recursos Futuros & Expansão',
    title: 'Notificações Automáticas via WhatsApp & E-mail',
    description: 'Envio de alertas instantâneos para fornecedores sobre novas cotações e atualizações de propostas.',
    is_completed: true,
    order: 18,
  },
  {
    phase: 'Fase 6: Recursos Futuros & Expansão',
    title: 'Módulo de Gestão & Avaliação de Fornecedores',
    description: 'Ranking de pontuação, histórico de obras entregues e avaliações dos síndicos.',
    is_completed: false,
    order: 19,
  },
];

export async function listRoadmapItems() {
  try {
    // Sync completed status for newly implemented features
    await db
      .update(project_roadmap_items)
      .set({ is_completed: true, updated_at: new Date() })
      .where(eq(project_roadmap_items.title, 'Exportação do Mapa Comparativo em PDF Executivo'));

    await db
      .update(project_roadmap_items)
      .set({ is_completed: true, updated_at: new Date() })
      .where(eq(project_roadmap_items.title, 'Notificações Automáticas via WhatsApp & E-mail'));

    let items = await db.query.project_roadmap_items.findMany({
      orderBy: [asc(project_roadmap_items.order), asc(project_roadmap_items.created_at)],
    });

    if (items.length === 0) {
      // Seed default items
      await db.insert(project_roadmap_items).values(DEFAULT_ROADMAP_ITEMS);
      items = await db.query.project_roadmap_items.findMany({
        orderBy: [asc(project_roadmap_items.order), asc(project_roadmap_items.created_at)],
      });
    } else {
      // Check if new default items need to be added
      const existingTitles = new Set(items.map((i) => i.title));
      const missingItems = DEFAULT_ROADMAP_ITEMS.filter((i) => !existingTitles.has(i.title));
      if (missingItems.length > 0) {
        await db.insert(project_roadmap_items).values(missingItems);
        items = await db.query.project_roadmap_items.findMany({
          orderBy: [asc(project_roadmap_items.order), asc(project_roadmap_items.created_at)],
        });
      }
    }

    return items;
  } catch (error) {
    console.error('Erro ao buscar itens do roadmap:', error);
    return [];
  }
}

export async function toggleRoadmapItemStatus(id: string, isCompleted: boolean) {
  try {
    await db
      .update(project_roadmap_items)
      .set({
        is_completed: isCompleted,
        updated_at: new Date(),
      })
      .where(eq(project_roadmap_items.id, id));

    revalidatePath('/dashboard/roadmap');
    revalidatePath('/portal/roadmap');
    return { success: true };
  } catch (error) {
    console.error('Erro ao alterar status da etapa:', error);
    return { success: false, error: 'Falha ao atualizar status da etapa.' };
  }
}

export async function createRoadmapItem(data: { phase: string; title: string; description?: string }) {
  try {
    await db.insert(project_roadmap_items).values({
      phase: data.phase || 'Novos Recursos Solicitados',
      title: data.title,
      description: data.description || '',
      is_completed: false,
      order: 99,
    });

    revalidatePath('/dashboard/roadmap');
    revalidatePath('/portal/roadmap');
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar etapa:', error);
    return { success: false, error: 'Falha ao adicionar nova etapa.' };
  }
}

export async function deleteRoadmapItem(id: string) {
  try {
    await db.delete(project_roadmap_items).where(eq(project_roadmap_items.id, id));
    revalidatePath('/dashboard/roadmap');
    revalidatePath('/portal/roadmap');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir etapa:', error);
    return { success: false, error: 'Falha ao excluir etapa.' };
  }
}
