import { useCallback } from 'react';
import { generateInvoicePDF, generateEstimatePDF, downloadPDF } from '@/lib/pdf-generator';
import type { InvoiceData, EstimateData } from '@/lib/pdf-generator';

export function useDocumentPDF() {
  const downloadInvoicePDF = useCallback((invoice: {
    invoice_number: string;
    issue_date: string;
    due_date: string;
    title: string;
    client?: { name: string; address?: string | null } | null;
    items?: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
    amount: number;
    tax_amount?: number | null;
    total_amount: number;
    description?: string | null;
  }) => {
    const invoiceData: InvoiceData = {
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      clientName: invoice.client?.name || '—',
      clientAddress: invoice.client?.address || undefined,
      items: invoice.items?.map(item => ({
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        taxRate: 0.1,
      })) || [],
      subtotal: invoice.amount,
      tax: invoice.tax_amount || 0,
      total: invoice.total_amount,
      notes: invoice.description || undefined,
    };

    const doc = generateInvoicePDF(invoiceData);
    downloadPDF(doc, `請求書_${invoice.invoice_number}.pdf`);
  }, []);

  const downloadEstimatePDF = useCallback((estimate: {
    estimate_number: string;
    issue_date: string;
    valid_until: string;
    title: string;
    client?: { name: string; address?: string | null } | null;
    items?: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
    amount: number;
    tax_amount?: number | null;
    total_amount: number;
    description?: string | null;
  }) => {
    const estimateData: EstimateData = {
      estimateNumber: estimate.estimate_number,
      issueDate: estimate.issue_date,
      validUntil: estimate.valid_until,
      clientName: estimate.client?.name || '—',
      clientAddress: estimate.client?.address || undefined,
      items: estimate.items?.map(item => ({
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        taxRate: 0.1,
      })) || [],
      subtotal: estimate.amount,
      tax: estimate.tax_amount || 0,
      total: estimate.total_amount,
      notes: estimate.description || undefined,
    };

    const doc = generateEstimatePDF(estimateData);
    downloadPDF(doc, `見積書_${estimate.estimate_number}.pdf`);
  }, []);

  const downloadContractPDF = useCallback((contract: {
    contract_number: string;
    issue_date: string;
    valid_until?: string | null;
    title: string;
    client?: { name: string; address?: string | null } | null;
    amount: number;
    tax_amount?: number | null;
    total_amount: number;
    content?: string | null;
  }) => {
    // Contracts use a simplified format - reuse estimate PDF with adjusted content
    const contractData: EstimateData = {
      estimateNumber: contract.contract_number,
      issueDate: contract.issue_date,
      validUntil: contract.valid_until || contract.issue_date,
      clientName: contract.client?.name || '—',
      clientAddress: contract.client?.address || undefined,
      items: [{
        name: contract.title,
        quantity: 1,
        unitPrice: contract.amount,
        taxRate: 0.1,
      }],
      subtotal: contract.amount,
      tax: contract.tax_amount || 0,
      total: contract.total_amount,
      notes: contract.content || undefined,
    };

    const doc = generateEstimatePDF(contractData);
    // Update the title on the PDF
    downloadPDF(doc, `契約書_${contract.contract_number}.pdf`);
  }, []);

  return {
    downloadInvoicePDF,
    downloadEstimatePDF,
    downloadContractPDF,
  };
}
