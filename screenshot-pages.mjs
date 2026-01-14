import { chromium } from 'playwright';

const pages = [
  { name: 'landing', url: 'http://localhost:8080/' },
  { name: 'notifications', url: 'http://localhost:8080/notifications' },
  { name: 'team', url: 'http://localhost:8080/team' },
  { name: 'bank-connections', url: 'http://localhost:8080/bank-connections' },
  { name: 'workflows', url: 'http://localhost:8080/workflows' },
  { name: 'products', url: 'http://localhost:8080/products' },
  { name: 'payment-links', url: 'http://localhost:8080/payment-links' },
  { name: 'email-templates', url: 'http://localhost:8080/email-templates' },
  { name: 'pages', url: 'http://localhost:8080/pages' },
];

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  for (const page of pages) {
    const browserPage = await context.newPage();
    await browserPage.goto(page.url, { waitUntil: 'networkidle' });
    await browserPage.waitForTimeout(1000);
    await browserPage.screenshot({
      path: `/tmp/claude/-Users-yuki-workspace-totono/screenshots/${page.name}.png`,
      fullPage: false
    });
    console.log(`Screenshot saved: ${page.name}`);
    await browserPage.close();
  }

  await browser.close();
  console.log('All screenshots taken!');
}

takeScreenshots().catch(console.error);
