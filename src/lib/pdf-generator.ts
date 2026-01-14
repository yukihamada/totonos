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

// Register Japanese font support (simplified - using built-in fonts)
const addJapaneseSupport = (doc: jsPDF) => {
  // Note: For production, you would embed actual Japanese fonts
  // For now, we'll use a workaround with Unicode support
  doc.setFont('helvetica');
};

export const generateInvoicePDF = (
  invoice: InvoiceData,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  addJapaneseSupport(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, y, { align: 'center' });
  doc.text('請求書', pageWidth / 2, y + 8, { align: 'center' });
  y += 20;

  // Invoice details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rightCol = pageWidth - margin;
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  doc.text(`Issue Date: ${invoice.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  doc.text(`Due Date: ${invoice.dueDate}`, rightCol, y, { align: 'right' });
  y += 10;

  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(company.name, margin, y);
  y += 5;
  if (company.address) {
    doc.text(company.address, margin, y);
    y += 5;
  }
  doc.text(`TEL: ${company.phone}`, margin, y);
  y += 5;
  doc.text(`Email: ${company.email}`, margin, y);
  y += 5;
  if (company.taxNumber) {
    doc.text(`Registration: ${company.taxNumber}`, margin, y);
    y += 5;
  }
  y += 5;

  // Client info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.clientName, margin, y);
  y += 5;
  if (invoice.clientAddress) {
    doc.text(invoice.clientAddress, margin, y);
    y += 5;
  }
  y += 10;

  // Items table header
  const colWidths = [80, 25, 30, 35];
  const tableX = margin;

  doc.setFillColor(240, 240, 240);
  doc.rect(tableX, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', tableX + 2, y + 5.5);
  doc.text('Qty', tableX + colWidths[0] + 2, y + 5.5);
  doc.text('Unit Price', tableX + colWidths[0] + colWidths[1] + 2, y + 5.5);
  doc.text('Amount', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5.5);
  y += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    doc.text(item.name.substring(0, 40), tableX + 2, y + 5);
    doc.text(item.quantity.toString(), tableX + colWidths[0] + 2, y + 5);
    doc.text(`¥${item.unitPrice.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + 2, y + 5);
    doc.text(`¥${amount.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);

    // Draw line
    doc.setDrawColor(220, 220, 220);
    doc.line(tableX, y + 8, tableX + colWidths.reduce((a, b) => a + b, 0), y + 8);
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = tableX + colWidths[0] + colWidths[1];
  doc.text('Subtotal:', totalsX + 2, y + 5);
  doc.text(`¥${invoice.subtotal.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.text('Tax (10%):', totalsX + 2, y + 5);
  doc.text(`¥${invoice.tax.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX + 2, y + 5);
  doc.text(`¥${invoice.total.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 15;

  // Bank info
  if (company.bankName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${company.bankName} ${company.bankBranch}`, margin, y);
    y += 5;
    doc.text(`Account: ${company.accountType} ${company.accountNumber}`, margin, y);
    y += 5;
    doc.text(`Name: ${company.accountName}`, margin, y);
    y += 10;
  }

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, y);
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
  addJapaneseSupport(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATE', pageWidth / 2, y, { align: 'center' });
  doc.text('見積書', pageWidth / 2, y + 8, { align: 'center' });
  y += 20;

  // Estimate details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rightCol = pageWidth - margin;
  doc.text(`Estimate No: ${estimate.estimateNumber}`, rightCol, y, { align: 'right' });
  y += 5;
  doc.text(`Issue Date: ${estimate.issueDate}`, rightCol, y, { align: 'right' });
  y += 5;
  doc.text(`Valid Until: ${estimate.validUntil}`, rightCol, y, { align: 'right' });
  y += 10;

  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(company.name, margin, y);
  y += 5;
  if (company.address) {
    doc.text(company.address, margin, y);
    y += 5;
  }
  doc.text(`TEL: ${company.phone}`, margin, y);
  y += 5;
  doc.text(`Email: ${company.email}`, margin, y);
  y += 10;

  // Client info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('To:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(estimate.clientName, margin, y);
  y += 5;
  if (estimate.clientAddress) {
    doc.text(estimate.clientAddress, margin, y);
    y += 5;
  }
  y += 10;

  // Items table header
  const colWidths = [80, 25, 30, 35];
  const tableX = margin;

  doc.setFillColor(240, 240, 240);
  doc.rect(tableX, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', tableX + 2, y + 5.5);
  doc.text('Qty', tableX + colWidths[0] + 2, y + 5.5);
  doc.text('Unit Price', tableX + colWidths[0] + colWidths[1] + 2, y + 5.5);
  doc.text('Amount', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5.5);
  y += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  estimate.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    doc.text(item.name.substring(0, 40), tableX + 2, y + 5);
    doc.text(item.quantity.toString(), tableX + colWidths[0] + 2, y + 5);
    doc.text(`¥${item.unitPrice.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + 2, y + 5);
    doc.text(`¥${amount.toLocaleString()}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);

    doc.setDrawColor(220, 220, 220);
    doc.line(tableX, y + 8, tableX + colWidths.reduce((a, b) => a + b, 0), y + 8);
    y += 10;
  });

  y += 5;

  // Totals
  const totalsX = tableX + colWidths[0] + colWidths[1];
  doc.text('Subtotal:', totalsX + 2, y + 5);
  doc.text(`¥${estimate.subtotal.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.text('Tax (10%):', totalsX + 2, y + 5);
  doc.text(`¥${estimate.tax.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX + 2, y + 5);
  doc.text(`¥${estimate.total.toLocaleString()}`, totalsX + colWidths[2] + 2, y + 5);
  y += 15;

  // Notes
  if (estimate.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(estimate.notes, pageWidth - margin * 2);
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

export type { CompanyInfo, InvoiceData, EstimateData, InvoiceItem };
