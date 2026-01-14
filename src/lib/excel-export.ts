import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T) => string | number | boolean | null | undefined);
  width?: number;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
}

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  // Create worksheet data
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      if (typeof col.key === 'function') {
        return col.key(item);
      }
      return item[col.key];
    })
  );

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const colWidths = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length + 2, 15),
  }));
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    options.sheetName || 'Sheet1'
  );

  // Generate and download file
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

/**
 * Export multiple sheets to a single Excel file
 */
export function exportMultipleSheetsToExcel(
  sheets: Array<{
    name: string;
    data: Record<string, unknown>[];
    columns: ExportColumn<Record<string, unknown>>[];
  }>,
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, data, columns }) => {
    const headers = columns.map((col) => col.header);
    const rows = data.map((item) =>
      columns.map((col) => {
        if (typeof col.key === 'function') {
          return col.key(item);
        }
        return item[col.key as keyof typeof item];
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const colWidths = columns.map((col) => ({
      wch: col.width || Math.max(col.header.length + 2, 15),
    }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Pre-configured export functions for common data types

export function exportLeadsToExcel(
  leads: Array<{
    company_name: string;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    source: string;
    status: string;
    score?: number | null;
    created_at: string;
  }>
): void {
  const columns: ExportColumn<(typeof leads)[0]>[] = [
    { header: '会社名', key: 'company_name', width: 25 },
    { header: '担当者名', key: 'contact_name', width: 15 },
    { header: 'メール', key: 'email', width: 25 },
    { header: '電話番号', key: 'phone', width: 15 },
    { header: '流入元', key: 'source', width: 12 },
    { header: 'ステータス', key: 'status', width: 12 },
    { header: 'スコア', key: 'score', width: 8 },
    {
      header: '登録日',
      key: (item) => new Date(item.created_at).toLocaleDateString('ja-JP'),
      width: 12,
    },
  ];

  exportToExcel(leads, columns, {
    filename: `リード一覧_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'リード',
  });
}

export function exportClientsToExcel(
  clients: Array<{
    company_name: string;
    contact_person?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    industry?: string | null;
    created_at: string;
  }>
): void {
  const columns: ExportColumn<(typeof clients)[0]>[] = [
    { header: '会社名', key: 'company_name', width: 25 },
    { header: '担当者', key: 'contact_person', width: 15 },
    { header: 'メール', key: 'email', width: 25 },
    { header: '電話番号', key: 'phone', width: 15 },
    { header: '住所', key: 'address', width: 30 },
    { header: '業種', key: 'industry', width: 12 },
    {
      header: '登録日',
      key: (item) => new Date(item.created_at).toLocaleDateString('ja-JP'),
      width: 12,
    },
  ];

  exportToExcel(clients, columns, {
    filename: `取引先一覧_${new Date().toISOString().split('T')[0]}`,
    sheetName: '取引先',
  });
}

export function exportEmployeesToExcel(
  employees: Array<{
    employee_number?: string | null;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    department?: string | null;
    position?: string | null;
    hire_date?: string | null;
    employment_type?: string | null;
  }>
): void {
  const columns: ExportColumn<(typeof employees)[0]>[] = [
    { header: '社員番号', key: 'employee_number', width: 12 },
    { header: '姓', key: 'last_name', width: 12 },
    { header: '名', key: 'first_name', width: 12 },
    { header: 'メール', key: 'email', width: 25 },
    { header: '電話番号', key: 'phone', width: 15 },
    { header: '部署', key: 'department', width: 15 },
    { header: '役職', key: 'position', width: 15 },
    {
      header: '入社日',
      key: (item) =>
        item.hire_date
          ? new Date(item.hire_date).toLocaleDateString('ja-JP')
          : '',
      width: 12,
    },
    { header: '雇用形態', key: 'employment_type', width: 12 },
  ];

  exportToExcel(employees, columns, {
    filename: `従業員一覧_${new Date().toISOString().split('T')[0]}`,
    sheetName: '従業員',
  });
}

export function exportInvoicesToExcel(
  invoices: Array<{
    invoice_number: string;
    client_name?: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    status: string;
    paid_date?: string | null;
  }>
): void {
  const columns: ExportColumn<(typeof invoices)[0]>[] = [
    { header: '請求書番号', key: 'invoice_number', width: 15 },
    { header: '取引先', key: 'client_name', width: 25 },
    {
      header: '発行日',
      key: (item) => new Date(item.issue_date).toLocaleDateString('ja-JP'),
      width: 12,
    },
    {
      header: '支払期限',
      key: (item) => new Date(item.due_date).toLocaleDateString('ja-JP'),
      width: 12,
    },
    {
      header: '金額',
      key: (item) => `¥${item.total_amount.toLocaleString()}`,
      width: 15,
    },
    { header: 'ステータス', key: 'status', width: 12 },
    {
      header: '入金日',
      key: (item) =>
        item.paid_date
          ? new Date(item.paid_date).toLocaleDateString('ja-JP')
          : '',
      width: 12,
    },
  ];

  exportToExcel(invoices, columns, {
    filename: `請求書一覧_${new Date().toISOString().split('T')[0]}`,
    sheetName: '請求書',
  });
}

export function exportAttendanceToExcel(
  records: Array<{
    employee_name: string;
    date: string;
    clock_in?: string | null;
    clock_out?: string | null;
    break_minutes?: number | null;
    work_hours?: number | null;
    overtime_hours?: number | null;
    status: string;
  }>
): void {
  const columns: ExportColumn<(typeof records)[0]>[] = [
    { header: '従業員名', key: 'employee_name', width: 15 },
    {
      header: '日付',
      key: (item) => new Date(item.date).toLocaleDateString('ja-JP'),
      width: 12,
    },
    { header: '出勤時刻', key: 'clock_in', width: 10 },
    { header: '退勤時刻', key: 'clock_out', width: 10 },
    {
      header: '休憩(分)',
      key: (item) => item.break_minutes ?? '',
      width: 10,
    },
    {
      header: '勤務時間',
      key: (item) => (item.work_hours ? `${item.work_hours}h` : ''),
      width: 10,
    },
    {
      header: '残業時間',
      key: (item) => (item.overtime_hours ? `${item.overtime_hours}h` : ''),
      width: 10,
    },
    { header: 'ステータス', key: 'status', width: 12 },
  ];

  exportToExcel(records, columns, {
    filename: `勤怠記録_${new Date().toISOString().split('T')[0]}`,
    sheetName: '勤怠',
  });
}

export function exportJournalEntriesToExcel(
  entries: Array<{
    entry_number?: string;
    date: string;
    description: string;
    debit_account: string;
    credit_account: string;
    amount: number;
  }>
): void {
  const columns: ExportColumn<(typeof entries)[0]>[] = [
    { header: '伝票番号', key: 'entry_number', width: 12 },
    {
      header: '日付',
      key: (item) => new Date(item.date).toLocaleDateString('ja-JP'),
      width: 12,
    },
    { header: '摘要', key: 'description', width: 30 },
    { header: '借方科目', key: 'debit_account', width: 15 },
    { header: '貸方科目', key: 'credit_account', width: 15 },
    {
      header: '金額',
      key: (item) => `¥${item.amount.toLocaleString()}`,
      width: 15,
    },
  ];

  exportToExcel(entries, columns, {
    filename: `仕訳帳_${new Date().toISOString().split('T')[0]}`,
    sheetName: '仕訳',
  });
}
