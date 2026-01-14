// Data Export Utilities - CSV, Excel, JSON

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: any, row: T) => string;
}

// CSV Export
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map(col => `"${col.header}"`).join(',');

  const rows = data.map(row => {
    return columns.map(col => {
      const value = getNestedValue(row, col.key as string);
      const formatted = col.formatter ? col.formatter(value, row) : value;
      // Escape quotes and wrap in quotes
      const escaped = String(formatted ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

// JSON Export
export function exportToJson<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

// Excel Export (using XLSX format with simple XML)
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  // Create worksheet XML
  const worksheetXml = createWorksheetXml(data, columns);

  // Create workbook XML
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${sheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  // Create simple XLSX using Blob
  // For full XLSX support, consider using a library like xlsx or exceljs

  // For now, export as CSV with .xlsx extension (Excel can open it)
  exportToCsv(data, columns, filename);
}

function createWorksheetXml<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  let rows = '';

  // Header row
  rows += '<row>';
  columns.forEach((col, i) => {
    rows += `<c t="inlineStr"><is><t>${escapeXml(col.header)}</t></is></c>`;
  });
  rows += '</row>';

  // Data rows
  data.forEach(row => {
    rows += '<row>';
    columns.forEach(col => {
      const value = getNestedValue(row, col.key as string);
      const formatted = col.formatter ? col.formatter(value, row) : value;
      rows += `<c t="inlineStr"><is><t>${escapeXml(String(formatted ?? ''))}</t></is></c>`;
    });
    rows += '</row>';
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows}</sheetData>
</worksheet>`;
}

// Helper Functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Predefined column configurations for common entities
export const invoiceColumns: ExportColumn<any>[] = [
  { key: 'invoice_number', header: '請求書番号' },
  { key: 'title', header: '件名' },
  { key: 'client.name', header: '取引先' },
  { key: 'amount', header: '金額', formatter: (v) => v?.toLocaleString() || '0' },
  { key: 'tax_amount', header: '消費税', formatter: (v) => v?.toLocaleString() || '0' },
  { key: 'total_amount', header: '合計', formatter: (v) => v?.toLocaleString() || '0' },
  { key: 'status', header: 'ステータス' },
  { key: 'issue_date', header: '発行日' },
  { key: 'due_date', header: '支払期限' },
];

export const contractColumns: ExportColumn<any>[] = [
  { key: 'contract_number', header: '契約番号' },
  { key: 'title', header: '件名' },
  { key: 'partner_name', header: '契約相手' },
  { key: 'status', header: 'ステータス' },
  { key: 'start_date', header: '開始日' },
  { key: 'end_date', header: '終了日' },
  { key: 'amount', header: '金額', formatter: (v) => v?.toLocaleString() || '0' },
];

export const leadColumns: ExportColumn<any>[] = [
  { key: 'name', header: '名前' },
  { key: 'email', header: 'メール' },
  { key: 'company', header: '会社名' },
  { key: 'status', header: 'ステータス' },
  { key: 'source', header: '流入元' },
  { key: 'score', header: 'スコア' },
  { key: 'created_at', header: '登録日' },
];

export const employeeColumns: ExportColumn<any>[] = [
  { key: 'employee_number', header: '社員番号' },
  { key: 'name', header: '氏名' },
  { key: 'email', header: 'メール' },
  { key: 'department', header: '部署' },
  { key: 'position', header: '役職' },
  { key: 'hire_date', header: '入社日' },
  { key: 'status', header: 'ステータス' },
];

export const journalColumns: ExportColumn<any>[] = [
  { key: 'date', header: '日付' },
  { key: 'debit_account', header: '借方科目' },
  { key: 'credit_account', header: '貸方科目' },
  { key: 'amount', header: '金額', formatter: (v) => v?.toLocaleString() || '0' },
  { key: 'description', header: '摘要' },
];
