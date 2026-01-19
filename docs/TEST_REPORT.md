# Test Report

> Generated: 2026-01-19 (Updated)

## Summary

| Metric | Value |
|--------|-------|
| Test Files | 40+ |
| Unit Tests | ~550 |
| Integration Tests | 49 |
| E2E Tests | 58 |
| **Total** | **~657** |

## Test Coverage by Category

### Unit Tests

| Category | File | Tests |
|----------|------|-------|
| **Types** | `database.test.ts` | 11 |
| | `contract.test.ts` | 14 |
| | `chat.test.ts` | 12 |
| | `crm.test.ts` | 24 |
| | `hr.test.ts` | 38 |
| | `accounting.test.ts` | 95 |
| | `project.test.ts` | 48 |
| **Hooks** | `useCredits.test.ts` | 16 |
| | `useInvoices.test.tsx` | 20 |
| | `useExpenses.test.tsx` | 18 |
| | `useInboundEmails.test.ts` | 11 |
| | `useCRM.test.tsx` | 13 |
| | `useProjects.test.tsx` | 15 |
| | `useContracts.test.tsx` | 12 |
| | `useWiki.test.tsx` | 20 |
| **Components** | `StatsCard.test.tsx` | 6 |
| | `RecentActivity.test.tsx` | 6 |
| | `ChatButton.test.tsx` | 6 |
| | `ChatInput.test.tsx` | 12 |
| | `ChatMessage.test.tsx` | 20 |
| | `LoadingWithTips.test.tsx` | 35 |
| | `ThemeToggle.test.tsx` | 5 |
| | `ErrorBoundary.test.tsx` | 15 |
| **Pages** | `Dashboard.test.tsx` | 5 |
| | `Invoices.test.tsx` | 8 |
| | `Expenses.test.tsx` | 8 |
| | `Projects.test.tsx` | 8 |
| | `Contracts.test.tsx` | 10 |
| **Lib** | `inbound-email-parser.test.ts` | 37 |

### Integration Tests

| File | Tests | Description |
|------|-------|-------------|
| `ExpenseForm.test.tsx` | 14 | Expense form input/validation |
| `InvoiceForm.test.tsx` | 11 | Invoice item management, calculations |
| `EmployeeForm.test.tsx` | 12 | Employee data entry, salary calc |
| `LeadDealForm.test.tsx` | 12 | Lead scoring, deal pipeline |

### E2E Tests

| File | Tests | Description |
|------|-------|-------------|
| `auth.spec.ts` | 3 | Authentication flow |
| `landing.spec.ts` | 5 | Landing page validation |
| `dashboard.authenticated.spec.ts` | 4 | Dashboard functionality |
| `invoices.authenticated.spec.ts` | 4 | Invoice page tests |
| `screenshots.authenticated.spec.ts` | 39 | Screenshot capture |
| `crud-flows.authenticated.spec.ts` | 8 | CRUD input→list reflection tests |

## Test Pyramid

```
        /\
       /E2\     10% E2E (58 tests)
      /====\
     / Int  \   20% Integration (49 tests)
    /========\
   /   Unit   \ 70% Unit (~450 tests)
  /============\
```

## Running Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- src/test/types/hr.test.ts

# Run integration tests
npm test -- src/test/integration/

# Run E2E tests
npm run test:e2e

# Run E2E tests with screenshots
npm run test:e2e -- e2e/screenshots.authenticated.spec.ts
```

## Test Files Location

```
src/
├── test/
│   ├── integration/          # Integration tests
│   │   ├── ExpenseForm.test.tsx
│   │   ├── InvoiceForm.test.tsx
│   │   ├── EmployeeForm.test.tsx
│   │   └── LeadDealForm.test.tsx
│   ├── components/           # Component tests
│   ├── hooks/                # Hook tests
│   ├── pages/                # Page tests
│   └── types/                # Type/utility tests
├── hooks/                    # Hook tests (co-located)
└── lib/                      # Lib tests (co-located)

e2e/
├── auth.spec.ts
├── landing.spec.ts
├── dashboard.authenticated.spec.ts
├── invoices.authenticated.spec.ts
└── screenshots.authenticated.spec.ts
```
