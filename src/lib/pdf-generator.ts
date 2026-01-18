import jsPDF from 'jspdf';

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

// Helper to convert Japanese text to safe ASCII representation
// This is a workaround since jsPDF doesn't natively support Japanese fonts without embedding
const toSafeText = (text: string): string => {
  // Return as-is - the text will be rendered even if it appears as boxes in some PDF viewers
  // For proper Japanese support, use a CSS-based PDF generation or server-side solution
  return text;
};

// Helper to draw text with fallback for Japanese
const drawText = (doc: jsPDF, text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
  doc.text(toSafeText(text), x, y, options);
};

export const generateInvoicePDF = (
  invoice: InvoiceData,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.setFont('helvetica');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'INVOICE', pageWidth / 2, y, { align: 'center' });
  y += 12;
  doc.setFontSize(14);
  drawText(doc, '[ Invoice / Seikyusho ]', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Invoice details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rightCol = pageWidth - margin;
  drawText(doc, `Invoice No: ${invoice.invoiceNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `Issue Date: ${invoice.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `Due Date: ${invoice.dueDate}`, rightCol, y, { align: 'right' });
  y += 10;

  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'From:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
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
    drawText(doc, `Registration: ${company.taxNumber}`, margin, y);
    y += 5;
  }
  y += 5;

  // Client info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'Bill To:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'Description', tableX + 2, y + 5.5);
  drawText(doc, 'Qty', tableX + colWidths[0] + 2, y + 5.5);
  drawText(doc, 'Unit Price', tableX + colWidths[0] + colWidths[1] + 2, y + 5.5);
  drawText(doc, 'Amount', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5.5);
  y += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    drawText(doc, item.name.substring(0, 40), tableX + 2, y + 5);
    drawText(doc, item.quantity.toString(), tableX + colWidths[0] + 2, y + 5);
    drawText(doc, `JPY ${item.unitPrice.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + 2, y + 5);
    drawText(doc, `JPY ${amount.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);

    // Draw line
    doc.setDrawColor(220, 220, 220);
    doc.line(tableX, y + 8, tableX + colWidths.reduce((a, b) => a + b, 0), y + 8);
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = tableX + colWidths[0] + colWidths[1];
  drawText(doc, 'Subtotal:', totalsX + 2, y + 5);
  drawText(doc, `JPY ${invoice.subtotal.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  drawText(doc, 'Tax (10%):', totalsX + 2, y + 5);
  drawText(doc, `JPY ${invoice.tax.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  drawText(doc, 'Total:', totalsX + 2, y + 5);
  drawText(doc, `JPY ${invoice.total.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 15;

  // Bank info
  if (company.bankName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    drawText(doc, 'Payment Details:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    drawText(doc, `Bank: ${company.bankName} ${company.bankBranch}`, margin, y);
    y += 5;
    drawText(doc, `Account: ${company.accountType} ${company.accountNumber}`, margin, y);
    y += 5;
    drawText(doc, `Name: ${company.accountName}`, margin, y);
    y += 10;
  }

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    drawText(doc, 'Notes:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  return doc;
};

export const generateEstimatePDF = (
  estimate: EstimateData,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.setFont('helvetica');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'ESTIMATE', pageWidth / 2, y, { align: 'center' });
  y += 12;
  doc.setFontSize(14);
  drawText(doc, '[ Quotation / Mitsumorisho ]', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Estimate details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rightCol = pageWidth - margin;
  drawText(doc, `Estimate No: ${estimate.estimateNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `Issue Date: ${estimate.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `Valid Until: ${estimate.validUntil}`, rightCol, y, { align: 'right' });
  y += 10;

  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'From:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'To:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'Description', tableX + 2, y + 5.5);
  drawText(doc, 'Qty', tableX + colWidths[0] + 2, y + 5.5);
  drawText(doc, 'Unit Price', tableX + colWidths[0] + colWidths[1] + 2, y + 5.5);
  drawText(doc, 'Amount', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5.5);
  y += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  estimate.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    drawText(doc, item.name.substring(0, 40), tableX + 2, y + 5);
    drawText(doc, item.quantity.toString(), tableX + colWidths[0] + 2, y + 5);
    drawText(doc, `JPY ${item.unitPrice.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + 2, y + 5);
    drawText(doc, `JPY ${amount.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);

    doc.setDrawColor(220, 220, 220);
    doc.line(tableX, y + 8, tableX + colWidths.reduce((a, b) => a + b, 0), y + 8);
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = tableX + colWidths[0] + colWidths[1];
  drawText(doc, 'Subtotal:', totalsX + 2, y + 5);
  drawText(doc, `JPY ${estimate.subtotal.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  drawText(doc, 'Tax (10%):', totalsX + 2, y + 5);
  drawText(doc, `JPY ${estimate.tax.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  drawText(doc, 'Total:', totalsX + 2, y + 5);
  drawText(doc, `JPY ${estimate.total.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 15;

  // Notes
  if (estimate.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    drawText(doc, 'Notes:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(estimate.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  return doc;
};

export const generateContractPDF = (
  contract: ContractData,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  doc.setFont('helvetica');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'CONTRACT', pageWidth / 2, y, { align: 'center' });
  y += 12;
  doc.setFontSize(14);
  drawText(doc, '[ Agreement / Keiyakusho ]', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Contract details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rightCol = pageWidth - margin;
  drawText(doc, `Contract No: ${contract.contractNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  drawText(doc, `Issue Date: ${contract.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  if (contract.validUntil) {
    drawText(doc, `Valid Until: ${contract.validUntil}`, rightCol, y, { align: 'right' });
    y += 5;
  }
  y += 5;

  // Contract Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  drawText(doc, contract.title, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Parties
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'Party A (Provider):', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  drawText(doc, 'Party B (Client):', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    drawText(doc, 'Terms and Conditions:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'normal');
  drawText(doc, `Subtotal: JPY ${contract.amount.toLocaleString()}`, margin + 5, y);
  y += 7;
  drawText(doc, `Tax (10%): JPY ${contract.taxAmount.toLocaleString()}`, margin + 5, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  drawText(doc, `Total Amount: JPY ${contract.totalAmount.toLocaleString()}`, margin + 5, y);
  y += 15;

  // Signature area
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  drawText(doc, 'Signatures:', margin, y);
  y += 10;

  // Party A signature
  drawText(doc, 'Party A:', margin, y);
  doc.line(margin + 20, y, margin + 70, y);
  drawText(doc, 'Date:', margin + 80, y);
  doc.line(margin + 95, y, margin + 130, y);
  y += 15;

  // Party B signature  
  drawText(doc, 'Party B:', margin, y);
  doc.line(margin + 20, y, margin + 70, y);
  drawText(doc, 'Date:', margin + 80, y);
  doc.line(margin + 95, y, margin + 130, y);

  // Notes
  if (contract.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    drawText(doc, 'Notes:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
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
