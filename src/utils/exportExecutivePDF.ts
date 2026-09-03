import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProposalComparisonData, ItemLowestPriceData } from '@/services/comparison.service';

interface BOQItem {
  id: string;
  category_title: string;
  subcategory_title: string | null;
  item_description: string;
  unit: string;
  quantity: string;
  order: number | null;
}

export interface ExportExecutivePDFParams {
  request: {
    id: string;
    title: string;
    status: string;
    created_at: Date | null;
  };
  condo: {
    id: string;
    name: string;
    address: string;
  };
  items: BOQItem[];
  proposals: ProposalComparisonData[];
  globalWinner: ProposalComparisonData | null;
  lowestPricesByItem: Record<string, ItemLowestPriceData>;
  fractionatedSummary: {
    globalWinnerTotal: number;
    fractionatedTotal: number;
    potentialSavings: number;
    savingsPercentage: number;
  };
}

export function exportExecutivePDF({
  request,
  condo,
  items,
  proposals,
  globalWinner,
  lowestPricesByItem,
  fractionatedSummary,
}: ExportExecutivePDFParams) {
  // Initialize A4 Landscape jsPDF (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297
  const marginX = 12;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  // 1. Top Corporate Navy Header Banner
  doc.setFillColor(14, 75, 120); // #0E4B78
  doc.rect(0, 0, pageWidth, 22, 'F');

  // App Logo & Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SÍNDICO', marginX, 12);

  doc.setTextColor(249, 115, 22); // Orange #F97316
  doc.text('EXPERT', marginX + 27, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 242, 254); // Light blue
  doc.text('RELATÓRIO COMPARATIVO DE MERCADO — MAPA EXECUTIVO DE PREÇOS', marginX, 17);

  // Document Metadata (Right aligned)
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const dateStr = `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`;
  const propsCountStr = `Propostas Analisadas: ${proposals.length}`;
  doc.text(dateStr, pageWidth - marginX, 11, { align: 'right' });
  doc.text(propsCountStr, pageWidth - marginX, 16, { align: 'right' });

  // 2. Condominium & Request Details Box (Y = 26)
  const infoBoxY = 26;
  const infoBoxHeight = 14;
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.roundedRect(marginX, infoBoxY, pageWidth - marginX * 2, infoBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text(`Solicitação: ${request.title}`, marginX + 4, infoBoxY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text(`Condomínio: ${condo.name}  |  Endereço: ${condo.address}`, marginX + 4, infoBoxY + 10.5);

  // 3. Analytics Highlights Cards (Y = 43)
  const cardsY = 43;
  const cardWidth = (pageWidth - marginX * 2 - 6) / 2;
  const cardHeight = 25;

  // Card 1: Proposta Vencedora Global (Left Card)
  doc.setFillColor(254, 243, 199); // Light Amber #FEF3C7
  doc.setDrawColor(245, 158, 11); // Amber #F59E0B
  doc.roundedRect(marginX, cardsY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // #92400E
  doc.text('PROPOSTA VENCEDORA GLOBAL (Menor Valor Total)', marginX + 4, cardsY + 5.5);

  if (globalWinner) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(globalWinner.supplier_name, marginX + 4, cardsY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`CNPJ: ${globalWinner.supplier_cnpj}`, marginX + 4, cardsY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(180, 83, 9); // Dark Amber
    doc.text(formatCurrency(globalWinner.total_amount), marginX + cardWidth - 4, cardsY + 16, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Nenhuma proposta enviada', marginX + 4, cardsY + 14);
  }

  // Card 2: Resumo de Economia Fracionada (Right Card)
  const card2X = marginX + cardWidth + 6;
  doc.setFillColor(236, 253, 245); // Light Emerald #ECFDF5
  doc.setDrawColor(16, 185, 129); // Emerald #10B981
  doc.roundedRect(card2X, cardsY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70); // #065F46
  doc.text('RESUMO DE ECONOMIA FRACIONADA (Contratação por Item)', card2X + 4, cardsY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Global Única: ${formatCurrency(fractionatedSummary.globalWinnerTotal)}`, card2X + 4, cardsY + 11.5);
  doc.text(`Menor Item a Item: ${formatCurrency(fractionatedSummary.fractionatedTotal)}`, card2X + 4, cardsY + 16.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87); // Emerald Dark
  const savingsText = `Economia: ${formatCurrency(fractionatedSummary.potentialSavings)} (${fractionatedSummary.savingsPercentage}%)`;
  doc.text(savingsText, card2X + cardWidth - 4, cardsY + 16, { align: 'right' });

  // 4. Comparative Matrix Table (Y = 72)
  const tableStartY = 72;

  // Build Table Headers
  const tableHead = [
    [
      { content: '#', styles: { halign: 'center' as const, cellWidth: 8 } },
      { content: 'Especificação do Item', styles: { halign: 'left' as const, cellWidth: 55 } },
      { content: 'Qtd', styles: { halign: 'center' as const, cellWidth: 12 } },
      { content: 'Unid.', styles: { halign: 'center' as const, cellWidth: 12 } },
      ...proposals.map((prop, idx) => {
        const isWinner = globalWinner?.id === prop.id;
        const winnerBadge = isWinner ? '\n[VENCEDOR GLOBAL]' : '';
        return {
          content: `Proposta #${idx + 1}\n${prop.supplier_name}\nCNPJ: ${prop.supplier_cnpj}${winnerBadge}`,
          styles: { halign: 'center' as const },
        };
      }),
    ],
  ];

  // Build Table Data Rows
  const tableBody = items.map((item, index) => {
    const row = [
      (index + 1).toString(),
      `${item.category_title}${item.subcategory_title ? ' / ' + item.subcategory_title : ''}\n${item.item_description}`,
      item.quantity.toString(),
      item.unit.toUpperCase(),
    ];

    proposals.forEach((prop) => {
      const itemData = prop.itemsMap[item.id];
      const unitPrice = itemData ? itemData.unit_price : 0;
      const totalPrice = itemData ? itemData.total_price : 0;

      row.push(`${formatCurrency(unitPrice)} / ${item.unit}\nTotal: ${formatCurrency(totalPrice)}`);
    });

    return row;
  });

  // Build Table Footers (Total amount per supplier)
  const tableFoot = [
    [
      { content: 'VALOR TOTAL GLOBAL:', colSpan: 4, styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
      ...proposals.map((prop) => {
        const isWinner = globalWinner?.id === prop.id;
        return {
          content: `${formatCurrency(prop.total_amount)}${isWinner ? '\n★ Vencedor' : ''}`,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const },
        };
      }),
    ],
  ];

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX, bottom: 14 },
    head: tableHead,
    body: tableBody,
    foot: tableFoot,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59], // #1E293B
      lineColor: [226, 232, 240], // #E2E8F0
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [14, 75, 120], // #0E4B78
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    footStyles: {
      fillColor: [241, 245, 249], // #F1F5F9
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    didParseCell: (data) => {
      // Highlight winning unit price in data rows
      if (data.section === 'body' && data.column.index >= 4) {
        const item = items[data.row.index];
        const proposalIndex = data.column.index - 4;
        const prop = proposals[proposalIndex];
        const lowestInfo = lowestPricesByItem[item.id];

        if (
          prop &&
          lowestInfo &&
          lowestInfo.winning_proposal_ids.includes(prop.id) &&
          lowestInfo.min_unit_price > 0
        ) {
          data.cell.styles.fillColor = [209, 250, 229]; // Light Emerald #D1FAE5
          data.cell.styles.textColor = [6, 95, 70]; // Dark Emerald #065F46
          data.cell.styles.fontStyle = 'bold';
        }
      }

      // Highlight Global Winner in Footer
      if (data.section === 'foot' && data.column.index >= 1) {
        const proposalIndex = data.column.index - 1;
        const prop = proposals[proposalIndex];
        if (prop && globalWinner?.id === prop.id) {
          data.cell.styles.fillColor = [254, 243, 199]; // Light Amber #FEF3C7
          data.cell.styles.textColor = [146, 64, 14]; // Dark Amber
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: (data) => {
      // Add Page Number Footer on every page
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      doc.text(
        'Síndico Expert — Sistema de Cotações para Condomínios  |  Relatório Comparativo de Mercado Executivo',
        marginX,
        doc.internal.pageSize.getHeight() - 6
      );

      doc.text(
        `Página ${currentPage} de ${pageCount}`,
        pageWidth - marginX,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'right' }
      );
    },
  });

  // Sanitize filename
  const cleanCondoName = condo.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Relatorio_Comparativo_Mercado_${cleanCondoName}.pdf`;

  // Trigger browser download
  doc.save(filename);
}
