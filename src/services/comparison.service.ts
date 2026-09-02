"use server";

import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  service_requests,
  condominiums,
  request_items,
  proposals,
  proposal_items,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function validateUserAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado. Por favor faça login.');
  }
  return session.user;
}

export interface ProposalComparisonData {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_cnpj: string;
  contact_name: string;
  supplier_phone: string;
  total_amount: number;
  status: string;
  created_at: Date | null;
  itemsMap: Record<string, { unit_price: number; total_price: number }>;
}

export interface ItemLowestPriceData {
  request_item_id: string;
  min_unit_price: number;
  min_total_price: number;
  winning_proposal_ids: string[];
}

export async function getRequestComparison(requestId: string) {
  const user = await validateUserAuth();

  // 1. Fetch Service Request
  const request = await db.query.service_requests.findFirst({
    where: eq(service_requests.id, requestId),
  });

  if (!request) {
    throw new Error('Solicitação de serviço não encontrada.');
  }

  // 2. Fetch Condominium and verify organization access
  const condo = await db.query.condominiums.findFirst({
    where: eq(condominiums.id, request.condominium_id),
  });

  if (!condo) {
    throw new Error('Condomínio não encontrado.');
  }

  if (user.role !== 'ADMIN_ADM' && condo.organization_id !== user.organization_id) {
    throw new Error('Acesso negado a este condomínio.');
  }

  // 3. Fetch Request BOQ Items
  const items = await db.query.request_items.findMany({
    where: eq(request_items.request_id, requestId),
    orderBy: (items, { asc }) => [asc(items.order)],
  });

  // 4. Fetch Submitted Proposals for this Request
  const submittedProposals = await db.query.proposals.findMany({
    where: eq(proposals.request_id, requestId),
    orderBy: (props, { asc }) => [asc(props.created_at)],
  });

  const proposalIds = submittedProposals.map((p) => p.id);
  const supplierIds = Array.from(new Set(submittedProposals.map((p) => p.supplier_id)));

  let usersMap = new Map<string, { name: string; phone: string | null }>();
  if (supplierIds.length > 0) {
    const supplierUsers = await db.query.users.findMany({
      where: (u, { inArray }) => inArray(u.id, supplierIds),
    });
    usersMap = new Map(supplierUsers.map((u) => [u.id, { name: u.name, phone: u.phone }]));
  }

  // 5. Fetch Proposal Items for all submitted proposals
  let proposalItemsList: typeof proposal_items.$inferSelect[] = [];
  if (proposalIds.length > 0) {
    proposalItemsList = await db.query.proposal_items.findMany({
      where: (pItems, { inArray }) => inArray(pItems.proposal_id, proposalIds),
    });
  }

  // Build items lookup per proposal: proposalId -> { item_id -> { unit_price, total_price } }
  const proposalsWithItems: ProposalComparisonData[] = submittedProposals.map((prop) => {
    const propItems = proposalItemsList.filter((pi) => pi.proposal_id === prop.id);
    const itemsMap: Record<string, { unit_price: number; total_price: number }> = {};
    const supplierUser = usersMap.get(prop.supplier_id);

    for (const pi of propItems) {
      itemsMap[pi.request_item_id] = {
        unit_price: Number(pi.unit_price) || 0,
        total_price: Number(pi.total_price) || 0,
      };
    }

    return {
      id: prop.id,
      supplier_id: prop.supplier_id,
      supplier_name: prop.supplier_name,
      supplier_cnpj: prop.supplier_cnpj,
      contact_name: supplierUser?.name || prop.supplier_name,
      supplier_phone: supplierUser?.phone || 'Não informado',
      total_amount: Number(prop.total_amount) || 0,
      status: prop.status,
      created_at: prop.created_at,
      itemsMap,
    };
  });

  // 6. ALGORITHM 1: Global Winner (Lowest total_amount)
  let globalWinner: ProposalComparisonData | null = null;
  if (proposalsWithItems.length > 0) {
    globalWinner = proposalsWithItems.reduce((prev, curr) => {
      return curr.total_amount < prev.total_amount ? curr : prev;
    }, proposalsWithItems[0]);
  }

  // 7. ALGORITHM 2: Item-by-Item Lowest Price Calculation
  const lowestPricesByItem: Record<string, ItemLowestPriceData> = {};
  let calculatedFractionatedTotal = 0;

  for (const item of items) {
    const itemQty = Number(item.quantity) || 0;
    let minPrice = Infinity;
    let winners: string[] = [];

    for (const prop of proposalsWithItems) {
      const itemData = prop.itemsMap[item.id];
      if (itemData && itemData.unit_price >= 0) {
        if (itemData.unit_price < minPrice) {
          minPrice = itemData.unit_price;
          winners = [prop.id];
        } else if (itemData.unit_price === minPrice) {
          winners.push(prop.id);
        }
      }
    }

    const effectiveMinPrice = minPrice === Infinity ? 0 : minPrice;
    const minTotalPrice = Number((effectiveMinPrice * itemQty).toFixed(2));
    calculatedFractionatedTotal += minTotalPrice;

    lowestPricesByItem[item.id] = {
      request_item_id: item.id,
      min_unit_price: effectiveMinPrice,
      min_total_price: minTotalPrice,
      winning_proposal_ids: winners,
    };
  }

  // 8. ALGORITHM 3: Fractionated Savings Summary
  const globalWinnerTotal = globalWinner ? globalWinner.total_amount : 0;
  const fractionatedTotal = Number(calculatedFractionatedTotal.toFixed(2));
  const potentialSavings = Math.max(0, Number((globalWinnerTotal - fractionatedTotal).toFixed(2)));
  const savingsPercentage = globalWinnerTotal > 0 ? (potentialSavings / globalWinnerTotal) * 100 : 0;

  return {
    request,
    condo,
    items,
    proposals: proposalsWithItems,
    globalWinner,
    lowestPricesByItem,
    fractionatedSummary: {
      globalWinnerTotal,
      fractionatedTotal,
      potentialSavings,
      savingsPercentage: Number(savingsPercentage.toFixed(1)),
    },
  };
}
