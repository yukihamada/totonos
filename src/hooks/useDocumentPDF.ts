import { useCallback } from 'react';
import { generateInvoicePDF, generateEstimatePDF, generateContractPDF, downloadPDF } from '@/lib/pdf-generator';
import type { InvoiceData, EstimateData, ContractData } from '@/lib/pdf-generator';

export function useDocumentPDF() {
  const downloadInvoicePDF = useCallback(async (invoice: {
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

    const doc = await generateInvoicePDF(invoiceData);
    downloadPDF(doc, `請求書_${invoice.invoice_number}.pdf`);
  }, []);

  const downloadEstimatePDF = useCallback(async (estimate: {
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

    const doc = await generateEstimatePDF(estimateData);
    downloadPDF(doc, `見積書_${estimate.estimate_number}.pdf`);
  }, []);

  const downloadContractPDF = useCallback(async (contract: {
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
    const contractData: ContractData = {
      contractNumber: contract.contract_number,
      title: contract.title,
      issueDate: contract.issue_date,
      validUntil: contract.valid_until || undefined,
      clientName: contract.client?.name || '—',
      clientAddress: contract.client?.address || undefined,
      content: contract.content || undefined,
      amount: contract.amount,
      taxAmount: contract.tax_amount || 0,
      totalAmount: contract.total_amount,
    };

    const doc = await generateContractPDF(contractData);
    downloadPDF(doc, `契約書_${contract.contract_number}.pdf`);
  }, []);

  return {
    downloadInvoicePDF,
    downloadEstimatePDF,
    downloadContractPDF,
  };
}
