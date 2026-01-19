/**
 * Screenshot Capture Test
 *
 * Captures screenshots of all major pages for documentation and visual regression testing.
 * Optimized for speed with smart data loading detection.
 */

import { test } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';
import { captureScreenshot, navigateAndWait } from './e2e-utils';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'screenshots';

// Ensure screenshot directory exists
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// Page definitions for screenshot capture
const pages = [
  // Main Pages
  { path: '/dashboard', name: '01-dashboard', description: 'ダッシュボード' },
  { path: '/getting-started', name: '02-getting-started', description: 'はじめに' },
  { path: '/notifications', name: '03-notifications', description: '通知' },
  { path: '/profile', name: '04-profile', description: 'プロフィール' },

  // CRM
  { path: '/leads', name: '10-leads', description: 'リード管理' },
  { path: '/deals', name: '11-deals', description: '商談管理' },
  { path: '/pipeline', name: '12-pipeline', description: 'パイプライン' },
  { path: '/clients', name: '13-clients', description: '顧客管理' },
  { path: '/activities', name: '14-activities', description: '活動履歴' },

  // Invoicing
  { path: '/invoices', name: '20-invoices', description: '請求書一覧' },
  { path: '/estimates', name: '21-estimates', description: '見積書' },
  { path: '/purchase-orders', name: '22-purchase-orders', description: '発注書' },
  { path: '/products', name: '23-products', description: '商品管理' },

  // Expenses
  { path: '/expenses', name: '30-expenses', description: '経費一覧' },
  { path: '/receipt-capture', name: '31-receipt-capture', description: 'レシート取込' },

  // Accounting
  { path: '/accounting', name: '40-accounting', description: '会計トップ' },
  { path: '/accounting/journal', name: '41-journal', description: '仕訳帳' },
  { path: '/accounting/ledger', name: '42-ledger', description: '総勘定元帳' },
  { path: '/accounting/statements', name: '43-statements', description: '財務諸表' },
  { path: '/accounting/tax', name: '44-tax', description: '税金計算' },

  // HR
  { path: '/employees', name: '50-employees', description: '従業員一覧' },
  { path: '/attendance', name: '51-attendance', description: '勤怠管理' },
  { path: '/payroll', name: '52-payroll', description: '給与計算' },
  { path: '/leave-requests', name: '53-leave-requests', description: '休暇申請' },

  // Recruiting
  { path: '/job-postings', name: '60-job-postings', description: '求人管理' },
  { path: '/candidates', name: '61-candidates', description: '候補者管理' },

  // Contracts
  { path: '/contracts', name: '70-contracts', description: '契約管理' },

  // Projects
  { path: '/projects', name: '80-projects', description: 'プロジェクト' },

  // Wiki
  { path: '/wiki', name: '90-wiki', description: 'Wiki' },

  // Settings
  { path: '/settings', name: '100-settings', description: '設定' },
  { path: '/company-settings', name: '101-company-settings', description: '会社設定' },
  { path: '/team-members', name: '102-team-members', description: 'チームメンバー' },
  { path: '/integrations', name: '103-integrations', description: '連携設定' },

  // Reports
  { path: '/reports', name: '110-reports', description: 'レポート' },
  { path: '/trust-passport', name: '111-trust-passport', description: 'トラストパスポート' },
];

test.describe('Screenshot Capture', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);

  // Optimized timeout
  test.setTimeout(30000);

  for (const page of pages) {
    test(`capture ${page.description} (${page.path})`, async ({ page: playwrightPage }) => {
      // Navigate with smart waiting
      await navigateAndWait(playwrightPage, page.path, { timeout: 15000 });

      // Capture screenshot with data wait
      await captureScreenshot(
        playwrightPage,
        path.join(SCREENSHOT_DIR, `${page.name}.png`),
        { fullPage: true, minWait: 500 }
      );
    });
  }
});

test.describe('Mobile Screenshots', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);

  // Optimized timeout
  test.setTimeout(30000);

  test.use({
    viewport: { width: 375, height: 812 }, // iPhone X size
  });

  const mobilePages = [
    { path: '/dashboard', name: 'mobile-01-dashboard', description: 'ダッシュボード(モバイル)' },
    { path: '/invoices', name: 'mobile-02-invoices', description: '請求書(モバイル)' },
    { path: '/expenses', name: 'mobile-03-expenses', description: '経費(モバイル)' },
    { path: '/employees', name: 'mobile-04-employees', description: '従業員(モバイル)' },
  ];

  for (const page of mobilePages) {
    test(`capture ${page.description}`, async ({ page: playwrightPage }) => {
      // Navigate with smart waiting
      await navigateAndWait(playwrightPage, page.path, { timeout: 15000 });

      // Capture screenshot with data wait
      await captureScreenshot(
        playwrightPage,
        path.join(SCREENSHOT_DIR, `${page.name}.png`),
        { fullPage: true, minWait: 500 }
      );
    });
  }
});
