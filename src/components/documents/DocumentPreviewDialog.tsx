import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface DocumentItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface DocumentData {
  type: 'invoice' | 'estimate' | 'contract';
  number: string;
  title: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  clientName?: string;
  clientAddress?: string;
  clientEmail?: string;
  items?: DocumentItem[];
  amount: number;
  taxAmount: number;
  totalAmount: number;
  description?: string;
  content?: string;
}

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentData;
  onDownloadPDF: () => void;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
  onDownloadPDF,
}: DocumentPreviewDialogProps) {
  const typeLabels = {
    invoice: { title: '請求書', dateLabel: '支払期限' },
    estimate: { title: '見積書', dateLabel: '有効期限' },
    contract: { title: '契約書', dateLabel: '有効期限' },
  };
  
  const { title: docTypeTitle, dateLabel } = typeLabels[document.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{docTypeTitle}プレビュー</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={onDownloadPDF} size="sm">
                <Download className="mr-2 h-4 w-4" />
                PDFダウンロード
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* Document Preview */}
        <div className="bg-white text-black p-8 rounded-lg shadow-inner border">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{docTypeTitle}</h1>
            <p className="text-gray-600 font-mono">{document.number}</p>
          </div>

          {/* Document Info */}
          <div className="flex justify-between mb-8">
            <div>
              <p className="font-medium text-lg">{document.clientName || '—'} 御中</p>
              {document.clientAddress && (
                <p className="text-gray-600 text-sm mt-1">{document.clientAddress}</p>
              )}
            </div>
            <div className="text-right text-sm">
              <p>発行日: {format(new Date(document.issueDate), 'yyyy年M月d日', { locale: ja })}</p>
              {(document.dueDate || document.validUntil) && (
                <p>{dateLabel}: {format(new Date(document.dueDate || document.validUntil!), 'yyyy年M月d日', { locale: ja })}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2">{document.title}</h2>
          </div>

          {/* Total Amount */}
          <div className="bg-gray-100 p-4 rounded mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">ご請求金額（税込）</span>
              <span className="text-2xl font-bold">¥{document.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Items Table */}
          {document.items && document.items.length > 0 && (
            <div className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2 text-left">品目</th>
                    <th className="border border-gray-300 px-4 py-2 text-right w-20">数量</th>
                    <th className="border border-gray-300 px-4 py-2 text-right w-28">単価</th>
                    <th className="border border-gray-300 px-4 py-2 text-right w-28">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">¥{item.unit_price.toLocaleString()}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">¥{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Contract Content */}
          {document.type === 'contract' && document.content && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">契約内容</h3>
              <p className="whitespace-pre-wrap text-gray-700">{document.content}</p>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">小計</span>
                <span>¥{document.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">消費税（10%）</span>
                <span>¥{document.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>合計</span>
                <span>¥{document.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {document.description && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">備考</h3>
              <p className="whitespace-pre-wrap text-gray-600 text-sm">{document.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
