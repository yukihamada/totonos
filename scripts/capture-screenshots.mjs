#!/usr/bin/env node

/**
 * Totonos Screenshot Capture Script
 * Captures screenshots of all 97 pages using Playwright
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../public/screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// All routes to capture
const routes = [
  // Public
  { path: '/', name: 'landing', category: 'public', title: 'ランディングページ' },
  { path: '/auth', name: 'auth', category: 'public', title: '認証' },
  { path: '/terms', name: 'terms', category: 'public', title: '利用規約' },
  { path: '/privacy', name: 'privacy', category: 'public', title: 'プライバシーポリシー' },

  // Dashboard
  { path: '/dashboard', name: 'dashboard', category: 'dashboard', title: 'ダッシュボード', auth: true },
  { path: '/notifications', name: 'notifications', category: 'dashboard', title: '通知', auth: true },
  { path: '/profile', name: 'profile', category: 'dashboard', title: 'プロフィール', auth: true },

  // Documents
  { path: '/invoices', name: 'invoices', category: 'documents', title: '請求書', auth: true },
  { path: '/estimates', name: 'estimates', category: 'documents', title: '見積書', auth: true },
  { path: '/purchase-orders', name: 'purchase-orders', category: 'documents', title: '発注書', auth: true },
  { path: '/contracts', name: 'contracts', category: 'documents', title: '契約書', auth: true },
  { path: '/contracts/new', name: 'contracts-new', category: 'documents', title: '契約書作成', auth: true },
  { path: '/contract-alerts', name: 'contract-alerts', category: 'documents', title: '契約アラート', auth: true },

  // Accounting
  { path: '/accounting', name: 'accounting', category: 'accounting', title: '会計ダッシュボード', auth: true },
  { path: '/accounting/journal', name: 'accounting-journal', category: 'accounting', title: '仕訳帳', auth: true },
  { path: '/accounting/journal/new', name: 'accounting-journal-new', category: 'accounting', title: '仕訳入力', auth: true },
  { path: '/accounting/ledger', name: 'accounting-ledger', category: 'accounting', title: '総勘定元帳', auth: true },
  { path: '/accounting/statements', name: 'accounting-statements', category: 'accounting', title: '財務諸表', auth: true },
  { path: '/accounting/assets', name: 'accounting-assets', category: 'accounting', title: '固定資産', auth: true },
  { path: '/accounting/expenses', name: 'accounting-expenses', category: 'accounting', title: '経費管理', auth: true },
  { path: '/accounting/settings', name: 'accounting-settings', category: 'accounting', title: '会計設定', auth: true },
  { path: '/accounting/budget', name: 'accounting-budget', category: 'accounting', title: '予算管理', auth: true },
  { path: '/accounting/receivables', name: 'accounting-receivables', category: 'accounting', title: '売掛金', auth: true },

  // CRM
  { path: '/leads', name: 'leads', category: 'crm', title: 'リード', auth: true },
  { path: '/deals', name: 'deals', category: 'crm', title: '商談', auth: true },
  { path: '/activities', name: 'activities', category: 'crm', title: '活動', auth: true },
  { path: '/pipeline', name: 'pipeline', category: 'crm', title: 'パイプライン', auth: true },
  { path: '/clients', name: 'clients', category: 'crm', title: '取引先', auth: true },
  { path: '/lead-scoring', name: 'lead-scoring', category: 'crm', title: 'リードスコアリング', auth: true },

  // HR
  { path: '/employees', name: 'employees', category: 'hr', title: '従業員', auth: true },
  { path: '/attendance', name: 'attendance', category: 'hr', title: '勤怠', auth: true },
  { path: '/payroll', name: 'payroll', category: 'hr', title: '給与', auth: true },
  { path: '/payslips', name: 'payslips', category: 'hr', title: '給与明細', auth: true },
  { path: '/year-end', name: 'year-end', category: 'hr', title: '年末調整', auth: true },
  { path: '/shifts', name: 'shifts', category: 'hr', title: 'シフト', auth: true },
  { path: '/leave-requests', name: 'leave-requests', category: 'hr', title: '休暇申請', auth: true },
  { path: '/social-insurance', name: 'social-insurance', category: 'hr', title: '社会保険', auth: true },
  { path: '/my-number', name: 'my-number', category: 'hr', title: 'マイナンバー', auth: true },

  // Finance
  { path: '/reconciliation', name: 'reconciliation', category: 'finance', title: '銀行照合', auth: true },
  { path: '/boost', name: 'boost', category: 'finance', title: 'ブースト', auth: true },
  { path: '/trust-passport', name: 'trust-passport', category: 'finance', title: 'トラストパスポート', auth: true },
  { path: '/bank-connections', name: 'bank-connections', category: 'finance', title: '銀行連携', auth: true },
  { path: '/receipt-capture', name: 'receipt-capture', category: 'finance', title: 'レシート読取', auth: true },
  { path: '/e-bookkeeping', name: 'e-bookkeeping', category: 'finance', title: '電子帳簿', auth: true },

  // Info
  { path: '/wiki', name: 'wiki', category: 'info', title: 'Wiki', auth: true },
  { path: '/wiki-hierarchy', name: 'wiki-hierarchy', category: 'info', title: 'Wiki階層', auth: true },
  { path: '/it-assets', name: 'it-assets', category: 'info', title: 'IT資産', auth: true },

  // Automation
  { path: '/workflows', name: 'workflows', category: 'automation', title: 'ワークフロー', auth: true },
  { path: '/email-templates', name: 'email-templates', category: 'automation', title: 'メールテンプレート', auth: true },
  { path: '/email-integration', name: 'email-integration', category: 'automation', title: 'メール連携', auth: true },
  { path: '/approval-workflow', name: 'approval-workflow', category: 'automation', title: '承認フロー', auth: true },

  // Products
  { path: '/products', name: 'products', category: 'products', title: '商品', auth: true },
  { path: '/payment-links', name: 'payment-links', category: 'products', title: '決済リンク', auth: true },
  { path: '/pricing', name: 'pricing', category: 'products', title: '料金プラン', auth: true },
  { path: '/credits', name: 'credits', category: 'products', title: 'クレジット', auth: true },
  { path: '/credit-logs', name: 'credit-logs', category: 'products', title: 'クレジット履歴', auth: true },
  { path: '/referrals', name: 'referrals', category: 'products', title: '紹介プログラム', auth: true },

  // Settings
  { path: '/settings', name: 'settings', category: 'settings', title: '設定', auth: true },
  { path: '/settings/menu', name: 'settings-menu', category: 'settings', title: '設定メニュー', auth: true },
  { path: '/organization', name: 'organization', category: 'settings', title: '組織設定', auth: true },
  { path: '/team', name: 'team', category: 'settings', title: 'チーム', auth: true },
  { path: '/onboarding', name: 'onboarding', category: 'settings', title: 'オンボーディング', auth: true },
  { path: '/sso-settings', name: 'sso-settings', category: 'settings', title: 'SSO設定', auth: true },
  { path: '/audit-log', name: 'audit-log', category: 'settings', title: '監査ログ', auth: true },

  // Developer
  { path: '/developer', name: 'developer', category: 'developer', title: '開発者設定', auth: true },
  { path: '/api-docs', name: 'api-docs', category: 'developer', title: 'APIドキュメント', auth: true },
  { path: '/mcp-settings', name: 'mcp-settings', category: 'developer', title: 'MCP設定', auth: true },

  // Views
  { path: '/database-views', name: 'database-views', category: 'views', title: 'データベースビュー', auth: true },
  { path: '/sales-forecast', name: 'sales-forecast', category: 'views', title: '売上予測', auth: true },
  { path: '/reports', name: 'reports', category: 'views', title: 'レポート', auth: true },
  { path: '/pages', name: 'pages', category: 'views', title: 'ページ一覧', auth: true },

  // Phase 4: Expense Management
  { path: '/expenses', name: 'expenses', category: 'expense', title: '経費一覧', auth: true },
  { path: '/expenses/new', name: 'expenses-new', category: 'expense', title: '経費申請', auth: true },
  { path: '/expenses/settings', name: 'expenses-settings', category: 'expense', title: '経費設定', auth: true },
  { path: '/advance-payment', name: 'advance-payment', category: 'expense', title: '仮払い', auth: true },

  // Phase 4: Project Management
  { path: '/projects', name: 'projects', category: 'project', title: 'プロジェクト一覧', auth: true },
  { path: '/projects/new', name: 'projects-new', category: 'project', title: 'プロジェクト作成', auth: true },
  { path: '/timelog', name: 'timelog', category: 'project', title: '工数記録', auth: true },

  // Phase 4: Recruiting (ATS)
  { path: '/recruiting', name: 'recruiting', category: 'recruiting', title: '採用ダッシュボード', auth: true },
  { path: '/job-postings', name: 'job-postings', category: 'recruiting', title: '求人管理', auth: true },
  { path: '/job-postings/new', name: 'job-postings-new', category: 'recruiting', title: '求人作成', auth: true },
  { path: '/candidates', name: 'candidates', category: 'recruiting', title: '候補者管理', auth: true },
  { path: '/interviews', name: 'interviews', category: 'recruiting', title: '面接スケジュール', auth: true },
  { path: '/recruiting/reports', name: 'recruiting-reports', category: 'recruiting', title: '採用レポート', auth: true },

  // Showcase (public)
  { path: '/showcase', name: 'showcase', category: 'public', title: 'ショーケース' },
];

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📸 Total routes: ${routes.length}`);

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // Retina-quality screenshots
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: routes.length,
    screenshots: [],
  };

  let successCount = 0;
  let failCount = 0;

  for (const route of routes) {
    const page = await context.newPage();
    const filename = `${route.name}.png`;
    const filepath = join(OUTPUT_DIR, filename);

    try {
      console.log(`📸 Capturing: ${route.path} -> ${filename}`);

      // Navigate to the page
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for content to render
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: filepath,
        fullPage: false, // Viewport only
      });

      manifest.screenshots.push({
        name: route.name,
        path: route.path,
        category: route.category,
        title: route.title,
        filename: filename,
        requiresAuth: route.auth || false,
        capturedAt: new Date().toISOString(),
      });

      successCount++;
      console.log(`✅ Captured: ${route.title}`);
    } catch (error) {
      console.error(`❌ Failed: ${route.path} - ${error.message}`);
      failCount++;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Save manifest
  const manifestPath = join(OUTPUT_DIR, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📝 Manifest saved: ${manifestPath}`);

  console.log('\n📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Total: ${routes.length}`);

  return manifest;
}

// Run
captureScreenshots()
  .then(() => {
    console.log('\n🎉 Screenshot capture complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
