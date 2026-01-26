import jsPDF from 'jspdf';
import { loadNotoSansJP } from './fonts/noto-sans-jp';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxNumber?: string;
  bankName?: string;
  bankBranch?: string;
  accountType?: string;
  accountNumber?: string;
  accountName?: string;
}

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface EstimateData {
  estimateNumber: string;
  issueDate: string;
  validUntil: string;
  clientName: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface ContractData {
  contractNumber: string;
  title: string;
  issueDate: string;
  validUntil?: string;
  clientName: string;
  clientAddress?: string;
  content?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
}

const defaultCompanyInfo: CompanyInfo = {
  name: '株式会社サンプル',
  address: '東京都渋谷区...',
  phone: '03-1234-5678',
  email: 'info@example.com',
  taxNumber: 'T1234567890123',
  bankName: '〇〇銀行',
  bankBranch: '渋谷支店',
  accountType: '普通',
  accountNumber: '1234567',
  accountName: 'カ）サンプル',
};

// Cache for loaded font data
let fontCache: string | null = null;

// Initialize Japanese font for jsPDF - must be called for each new document instance
const initializeJapaneseFont = async (doc: jsPDF): Promise<void> => {
  try {
    // Load font data once and cache it
    if (!fontCache) {
      fontCache = await loadNotoSansJP();
    }
    
    // Register font with this specific document instance
    doc.addFileToVFS('NotoSansJP-Regular.ttf', fontCache);
    doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
    doc.setFont('NotoSansJP');
  } catch (error) {
    console.error('Failed to initialize Japanese font:', error);
    // Fallback to helvetica if font loading fails
    doc.setFont('helvetica');
  }
};

// Helper to draw text
const drawText = (doc: jsPDF, text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
  doc.text(text, x, y, options);
};

export const generateInvoicePDF = async (
  invoice: InvoiceData,
  company: CompanyInfo = defaultCompanyInfo
): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  await initializeJapaneseFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  drawText(doc, '請求書', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Invoice details (right side)
  doc.setFontSize(10);
  const rightCol = pageWidth - margin;
  drawText(doc, `請求書番号: ${invoice.invoiceNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `発行日: ${invoice.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `支払期限: ${invoice.dueDate}`, rightCol, y, { align: 'right' });
  y += 10;

  // Company info (left side)
  doc.setFontSize(12);
  drawText(doc, '発行者:', margin, y);
  y += 6;
  doc.setFontSize(10);
  drawText(doc, company.name, margin, y);
  y += 5;
  if (company.address) {
    drawText(doc, company.address, margin, y);
    y += 5;
  }
  drawText(doc, `TEL: ${company.phone}`, margin, y);
  y += 5;
  drawText(doc, `Email: ${company.email}`, margin, y);
  y += 5;
  if (company.taxNumber) {
    drawText(doc, `登録番号: ${company.taxNumber}`, margin, y);
    y += 5;
  }
  y += 5;

  // Client info
  doc.setFontSize(12);
  drawText(doc, '請求先:', margin, y);
  y += 6;
  doc.setFontSize(10);
  drawText(doc, invoice.clientName, margin, y);
  y += 5;
  if (invoice.clientAddress) {
    drawText(doc, invoice.clientAddress, margin, y);
    y += 5;
  }
  y += 10;

  // Items table header
  const colWidths = [80, 25, 30, 35];
  const tableX = margin;

  doc.setFillColor(240, 240, 240);
  doc.rect(tableX, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
  drawText(doc, '品目', tableX + 2, y + 5.5);
  drawText(doc, '数量', tableX + colWidths[0] + 2, y + 5.5);
  drawText(doc, '単価', tableX + colWidths[0] + colWidths[1] + 2, y + 5.5);
  drawText(doc, '金額', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5.5);
  y += 10;

  // Items
  invoice.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    drawText(doc, item.name.substring(0, 40), tableX + 2, y + 5);
    drawText(doc, item.quantity.toString(), tableX + colWidths[0] + 2, y + 5);
    drawText(doc, `¥${item.unitPrice.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + 2, y + 5);
    drawText(doc, `¥${amount.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);

    // Draw line
    doc.setDrawColor(220, 220, 220);
    doc.line(tableX, y + 8, tableX + colWidths.reduce((a, b) => a + b, 0), y + 8);
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = tableX + colWidths[0] + colWidths[1];
  drawText(doc, '小計:', totalsX + 2, y + 5);
  drawText(doc, `¥${invoice.subtotal.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  drawText(doc, '消費税 (10%):', totalsX + 2, y + 5);
  drawText(doc, `¥${invoice.tax.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.setFontSize(12);
  drawText(doc, '合計:', totalsX + 2, y + 5);
  drawText(doc, `¥${invoice.total.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 15;

  // Bank info
  if (company.bankName) {
    doc.setFontSize(10);
    drawText(doc, '振込先:', margin, y);
    y += 6;
    drawText(doc, `${company.bankName} ${company.bankBranch}`, margin, y);
    y += 5;
    drawText(doc, `${company.accountType} ${company.accountNumber}`, margin, y);
    y += 5;
    drawText(doc, `口座名義: ${company.accountName}`, margin, y);
    y += 10;
  }

  // Notes
  if (invoice.notes) {
    drawText(doc, '備考:', margin, y);
    y += 6;
    const lines = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  return doc;
};

export const generateEstimatePDF = async (
  estimate: EstimateData,
  company: CompanyInfo = defaultCompanyInfo
): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  await initializeJapaneseFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  drawText(doc, '見積書', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Estimate details (right side)
  doc.setFontSize(10);
  const rightCol = pageWidth - margin;
  drawText(doc, `見積書番号: ${estimate.estimateNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `発行日: ${estimate.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `有効期限: ${estimate.validUntil}`, rightCol, y, { align: 'right' });
  y += 10;

  // Company info (left side)
  doc.setFontSize(12);
  drawText(doc, '発行者:', margin, y);
  y += 6;
  doc.setFontSize(10);
  drawText(doc, company.name, margin, y);
  y += 5;
  if (company.address) {
    drawText(doc, company.address, margin, y);
    y += 5;
  }
  drawText(doc, `TEL: ${company.phone}`, margin, y);
  y += 5;
  drawText(doc, `Email: ${company.email}`, margin, y);
  y += 10;

  // Client info
  doc.setFontSize(12);
  drawText(doc, '宛先:', margin, y);
  y += 6;
  doc.setFontSize(10);
  drawText(doc, estimate.clientName, margin, y);
  y += 5;
  if (estimate.clientAddress) {
    drawText(doc, estimate.clientAddress, margin, y);
    y += 5;
  }
  y += 10;

  // Items table header
  const colWidths = [80, 25, 30, 35];
  const tableX = margin;

  doc.setFillColor(240, 240, 240);
  doc.rect(tableX, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
  drawText(doc, '品目', tableX + 2, y + 5.5);
  drawText(doc, '数量', tableX + colWidths[0] + 2, y + 5.5);
  drawText(doc, '単価', tableX + colWidths[0] + colWidths[1] + 2, y + 5.5);
  drawText(doc, '金額', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5.5);
  y += 10;

  // Items
  estimate.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    drawText(doc, item.name.substring(0, 40), tableX + 2, y + 5);
    drawText(doc, item.quantity.toString(), tableX + colWidths[0] + 2, y + 5);
    drawText(doc, `¥${item.unitPrice.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + 2, y + 5);
    drawText(doc, `¥${amount.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);

    doc.setDrawColor(220, 220, 220);
    doc.line(tableX, y + 8, tableX + colWidths.reduce((a, b) => a + b, 0), y + 8);
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = tableX + colWidths[0] + colWidths[1];
  drawText(doc, '小計:', totalsX + 2, y + 5);
  drawText(doc, `¥${estimate.subtotal.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  drawText(doc, '消費税 (10%):', totalsX + 2, y + 5);
  drawText(doc, `¥${estimate.tax.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.setFontSize(12);
  drawText(doc, '合計:', totalsX + 2, y + 5);
  drawText(doc, `¥${estimate.total.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 15;

  // Notes
  if (estimate.notes) {
    doc.setFontSize(10);
    drawText(doc, '備考:', margin, y);
    y += 6;
    const lines = doc.splitTextToSize(estimate.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  return doc;
};

export const generateContractPDF = async (
  contract: ContractData,
  company: CompanyInfo = defaultCompanyInfo
): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  await initializeJapaneseFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  drawText(doc, '契約書', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Contract details (right side)
  doc.setFontSize(10);
  const rightCol = pageWidth - margin;
  drawText(doc, `契約書番号: ${contract.contractNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `発行日: ${contract.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  if (contract.validUntil) {
    drawText(doc, `有効期限: ${contract.validUntil}`, rightCol, y, { align: 'right' });
    y += 5;
  }
  y += 5;

  // Contract Title
  doc.setFontSize(14);
  drawText(doc, contract.title, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Parties
  doc.setFontSize(12);
  drawText(doc, '甲（提供者）:', margin, y);
  y += 6;
  doc.setFontSize(10);
  drawText(doc, company.name, margin, y);
  y += 5;
  if (company.address) {
    drawText(doc, company.address, margin, y);
    y += 5;
  }
  drawText(doc, `TEL: ${company.phone}`, margin, y);
  y += 5;
  drawText(doc, `Email: ${company.email}`, margin, y);
  y += 10;

  doc.setFontSize(12);
  drawText(doc, '乙（依頼者）:', margin, y);
  y += 6;
  doc.setFontSize(10);
  drawText(doc, contract.clientName, margin, y);
  y += 5;
  if (contract.clientAddress) {
    drawText(doc, contract.clientAddress, margin, y);
    y += 5;
  }
  y += 10;

  // Contract Content
  if (contract.content) {
    doc.setFontSize(12);
    drawText(doc, '契約条件:', margin, y);
    y += 6;
    doc.setFontSize(10);
    const contentLines = doc.splitTextToSize(contract.content, pageWidth - margin * 2);
    doc.text(contentLines, margin, y);
    y += contentLines.length * 5 + 10;
  }

  // Amount
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, pageWidth - margin * 2, 30, 'F');
  y += 8;
  
  doc.setFontSize(10);
  drawText(doc, `小計: ¥${contract.amount.toLocaleString()}`, margin + 5, y);
  y += 7;
  drawText(doc, `消費税 (10%): ¥${contract.taxAmount.toLocaleString()}`, margin + 5, y);
  y += 7;
  doc.setFontSize(12);
  drawText(doc, `合計金額: ¥${contract.totalAmount.toLocaleString()}`, margin + 5, y);
  y += 15;

  // Signature area
  y += 10;
  doc.setFontSize(10);
  drawText(doc, '署名:', margin, y);
  y += 10;

  // Party A signature
  drawText(doc, '甲:', margin, y);
  doc.line(margin + 20, y, margin + 70, y);
  drawText(doc, '日付:', margin + 80, y);
  doc.line(margin + 95, y, margin + 130, y);
  y += 15;

  // Party B signature  
  drawText(doc, '乙:', margin, y);
  doc.line(margin + 20, y, margin + 70, y);
  drawText(doc, '日付:', margin + 80, y);
  doc.line(margin + 95, y, margin + 130, y);

  // Notes
  if (contract.notes) {
    y += 15;
    drawText(doc, '備考:', margin, y);
    y += 6;
    const lines = doc.splitTextToSize(contract.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

export const getPDFDataUrl = (doc: jsPDF): string => {
  return doc.output('dataurlstring');
};

export type { CompanyInfo, InvoiceData, EstimateData, InvoiceItem, ContractData };
