# Screenshots Gallery

> All screenshots captured via automated E2E tests

## Desktop Views

### Main Pages

| Page | Screenshot |
|------|------------|
| Dashboard | ![Dashboard](../screenshots/01-dashboard.png) |
| Getting Started | ![Getting Started](../screenshots/02-getting-started.png) |
| Notifications | ![Notifications](../screenshots/03-notifications.png) |
| Profile | ![Profile](../screenshots/04-profile.png) |

### CRM

| Page | Screenshot |
|------|------------|
| Leads | ![Leads](../screenshots/10-leads.png) |
| Deals | ![Deals](../screenshots/11-deals.png) |
| Pipeline | ![Pipeline](../screenshots/12-pipeline.png) |
| Clients | ![Clients](../screenshots/13-clients.png) |
| Activities | ![Activities](../screenshots/14-activities.png) |

### Invoicing

| Page | Screenshot |
|------|------------|
| Invoices | ![Invoices](../screenshots/20-invoices.png) |
| Estimates | ![Estimates](../screenshots/21-estimates.png) |
| Purchase Orders | ![Purchase Orders](../screenshots/22-purchase-orders.png) |
| Products | ![Products](../screenshots/23-products.png) |

### Expenses

| Page | Screenshot |
|------|------------|
| Expenses | ![Expenses](../screenshots/30-expenses.png) |
| Receipt Capture | ![Receipt Capture](../screenshots/31-receipt-capture.png) |

### Accounting

| Page | Screenshot |
|------|------------|
| Accounting | ![Accounting](../screenshots/40-accounting.png) |
| Journal | ![Journal](../screenshots/41-journal.png) |
| Ledger | ![Ledger](../screenshots/42-ledger.png) |
| Statements | ![Statements](../screenshots/43-statements.png) |
| Tax | ![Tax](../screenshots/44-tax.png) |

### HR

| Page | Screenshot |
|------|------------|
| Employees | ![Employees](../screenshots/50-employees.png) |
| Attendance | ![Attendance](../screenshots/51-attendance.png) |
| Payroll | ![Payroll](../screenshots/52-payroll.png) |
| Leave Requests | ![Leave Requests](../screenshots/53-leave-requests.png) |

### Recruiting

| Page | Screenshot |
|------|------------|
| Job Postings | ![Job Postings](../screenshots/60-job-postings.png) |
| Candidates | ![Candidates](../screenshots/61-candidates.png) |

### Contracts

| Page | Screenshot |
|------|------------|
| Contracts | ![Contracts](../screenshots/70-contracts.png) |

### Projects

| Page | Screenshot |
|------|------------|
| Projects | ![Projects](../screenshots/80-projects.png) |

### Wiki

| Page | Screenshot |
|------|------------|
| Wiki | ![Wiki](../screenshots/90-wiki.png) |

### Settings

| Page | Screenshot |
|------|------------|
| Settings | ![Settings](../screenshots/100-settings.png) |
| Company Settings | ![Company Settings](../screenshots/101-company-settings.png) |
| Team Members | ![Team Members](../screenshots/102-team-members.png) |
| Integrations | ![Integrations](../screenshots/103-integrations.png) |

### Reports

| Page | Screenshot |
|------|------------|
| Reports | ![Reports](../screenshots/110-reports.png) |
| Trust Passport | ![Trust Passport](../screenshots/111-trust-passport.png) |

---

## Mobile Views (375x812)

| Page | Screenshot |
|------|------------|
| Dashboard | ![Mobile Dashboard](../screenshots/mobile-01-dashboard.png) |
| Invoices | ![Mobile Invoices](../screenshots/mobile-02-invoices.png) |
| Expenses | ![Mobile Expenses](../screenshots/mobile-03-expenses.png) |
| Employees | ![Mobile Employees](../screenshots/mobile-04-employees.png) |

---

## Regenerating Screenshots

To regenerate all screenshots, run:

```bash
npm run test:e2e -- e2e/screenshots.authenticated.spec.ts
```

Screenshots are saved to the `screenshots/` directory.
