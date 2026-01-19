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

## CRUD Flow Screenshots

These screenshots capture the complete flow of creating data and seeing it reflected in lists.

### Invoice Flow

| Step | Screenshot |
|------|------------|
| 1. List (Before) | ![Invoice List Before](../screenshots/flows/invoice-01-list-before.png) |
| 2. Create Form | ![Invoice Create Form](../screenshots/flows/invoice-02-create-form.png) |
| 3. Form Filled | ![Invoice Form Filled](../screenshots/flows/invoice-03-form-filled.png) |
| 4. Item Added | ![Invoice Item Added](../screenshots/flows/invoice-04-item-added.png) |
| 5. After Create | ![Invoice After Create](../screenshots/flows/invoice-05-after-create.png) |
| 6. List (After) | ![Invoice List After](../screenshots/flows/invoice-06-list-after.png) |

### Expense Flow

| Step | Screenshot |
|------|------------|
| 1. List (Before) | ![Expense List Before](../screenshots/flows/expense-01-list-before.png) |
| 2. Create Form | ![Expense Create Form](../screenshots/flows/expense-02-create-form.png) |
| 3. Form Filled | ![Expense Form Filled](../screenshots/flows/expense-03-form-filled.png) |
| 4. After Create | ![Expense After Create](../screenshots/flows/expense-04-after-create.png) |
| 5. List (After) | ![Expense List After](../screenshots/flows/expense-05-list-after.png) |

### Lead Flow

| Step | Screenshot |
|------|------------|
| 1. List (Before) | ![Lead List Before](../screenshots/flows/lead-01-list-before.png) |
| 2. Create Form | ![Lead Create Form](../screenshots/flows/lead-02-create-form.png) |
| 3. Form Filled | ![Lead Form Filled](../screenshots/flows/lead-03-form-filled.png) |
| 4. List (After) | ![Lead List After](../screenshots/flows/lead-04-list-after.png) |

### Project Flow

| Step | Screenshot |
|------|------------|
| 1. List (Before) | ![Project List Before](../screenshots/flows/project-01-list-before.png) |
| 2. Create Form | ![Project Create Form](../screenshots/flows/project-02-create-form.png) |
| 3. Form Filled | ![Project Form Filled](../screenshots/flows/project-03-form-filled.png) |
| 4. After Create | ![Project After Create](../screenshots/flows/project-04-after-create.png) |
| 5. List (After) | ![Project List After](../screenshots/flows/project-05-list-after.png) |

### Pipeline & Deals Flow

| Step | Screenshot |
|------|------------|
| 1. Pipeline View | ![Pipeline View](../screenshots/flows/pipeline-01-view.png) |
| 2. Deals List | ![Deals List](../screenshots/flows/pipeline-02-deals-list.png) |
| 3. Create Deal | ![Create Deal](../screenshots/flows/pipeline-03-create-deal.png) |

### Employee List

| Step | Screenshot |
|------|------------|
| 1. Employee List | ![Employee List](../screenshots/flows/employee-01-list.png) |
| 2. Add Form | ![Employee Add Form](../screenshots/flows/employee-02-add-form.png) |

### Contract Flow

| Step | Screenshot |
|------|------------|
| 1. Contract List | ![Contract List](../screenshots/flows/contract-01-list.png) |
| 2. Create Form | ![Contract Create Form](../screenshots/flows/contract-02-create-form.png) |

---

## Regenerating Screenshots

To regenerate all screenshots, run:

```bash
# Page screenshots
npm run test:e2e -- e2e/screenshots.authenticated.spec.ts

# CRUD flow screenshots
npm run test:e2e -- e2e/crud-flows.authenticated.spec.ts
```

Screenshots are saved to:
- `screenshots/` - Page screenshots
- `screenshots/flows/` - CRUD flow screenshots
