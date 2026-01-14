import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { DemoProvider, useDemo } from "@/contexts/DemoContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import ContractNew from "./pages/ContractNew";
import ContractDetail from "./pages/ContractDetail";
import ContractEdit from "./pages/ContractEdit";
import ContractSign from "./pages/ContractSign";
import NotFound from "./pages/NotFound";
// Accounting
import Accounting from "./pages/Accounting";
import AccountingJournal from "./pages/AccountingJournal";
import AccountingJournalNew from "./pages/AccountingJournalNew";
import AccountingLedger from "./pages/AccountingLedger";
import AccountingStatements from "./pages/AccountingStatements";
import AccountingAssets from "./pages/AccountingAssets";
import AccountingExpenses from "./pages/AccountingExpenses";
import AccountingSettings from "./pages/AccountingSettings";
import AccountingBudget from "./pages/AccountingBudget";
import AccountingReceivables from "./pages/AccountingReceivables";
// CRM
import Leads from "./pages/Leads";
import Deals from "./pages/Deals";
import Activities from "./pages/Activities";
import Pipeline from "./pages/Pipeline";
// HR
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import YearEnd from "./pages/YearEnd";
import Shifts from "./pages/Shifts";
import LeaveRequests from "./pages/LeaveRequests";
// Info
import Wiki from "./pages/Wiki";
import ITAssets from "./pages/ITAssets";
// Invoices & Documents
import Invoices from "./pages/Invoices";
import Estimates from "./pages/Estimates";
import PurchaseOrders from "./pages/PurchaseOrders";
// Finance
import Clients from "./pages/Clients";
import Reconciliation from "./pages/Reconciliation";
import Boost from "./pages/Boost";
import TrustPassport from "./pages/TrustPassport";
// Reports & Settings
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import PageIndex from "./pages/PageIndex";
// New Features
import Notifications from "./pages/Notifications";
import TeamMembers from "./pages/TeamMembers";
import BankConnections from "./pages/BankConnections";
import Workflows from "./pages/Workflows";
import Products from "./pages/Products";
import PaymentLinks from "./pages/PaymentLinks";
import EmailTemplates from "./pages/EmailTemplates";
import PaymentSuccess from "./pages/PaymentSuccess";
// Phase 1 Features (Competitive)
import ContractAlerts from "./pages/ContractAlerts";
import AuditLog from "./pages/AuditLog";
import Payslips from "./pages/Payslips";
import ReceiptCapture from "./pages/ReceiptCapture";
import LeadScoring from "./pages/LeadScoring";
import EBookkeeping from "./pages/EBookkeeping";
import MyNumberManagement from "./pages/MyNumberManagement";
import EmailIntegration from "./pages/EmailIntegration";
// Phase 2 Features (Differentiation)
import WikiHierarchy from "./pages/WikiHierarchy";
import SalesForecast from "./pages/SalesForecast";
import DatabaseViews from "./pages/DatabaseViews";
import SocialInsurance from "./pages/SocialInsurance";
import ApprovalWorkflow from "./pages/ApprovalWorkflow";
import SSOSettings from "./pages/SSOSettings";
// Credit System
import Credits from "./pages/Credits";
import CreditLogs from "./pages/CreditLogs";
import Pricing from "./pages/Pricing";
import Referrals from "./pages/Referrals";
// Developer & Settings
import SettingsMenu from "./pages/SettingsMenu";
import DeveloperSettings from "./pages/DeveloperSettings";
import ApiDocs from "./pages/ApiDocs";
import McpSettings from "./pages/McpSettings";
import AISettings from "./pages/AISettings";
import CompanySettings from "./pages/CompanySettings";
// Legal
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
// Data Import
import DataImport from "./pages/DataImport";
// Chat
import { ChatWidget } from "./components/chat/ChatWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  
  // In demo mode, skip authentication
  if (isDemoMode) {
    return <>{children}</>;
  }
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* Documents */}
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/estimates" element={<ProtectedRoute><Estimates /></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
      <Route path="/contracts/new" element={<ProtectedRoute><ContractNew /></ProtectedRoute>} />
      <Route path="/contracts/:id" element={<ProtectedRoute><ContractDetail /></ProtectedRoute>} />
      <Route path="/contracts/:id/edit" element={<ProtectedRoute><ContractEdit /></ProtectedRoute>} />
      <Route path="/sign/:token" element={<ContractSign />} />
      {/* Accounting */}
      <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
      <Route path="/accounting/journal" element={<ProtectedRoute><AccountingJournal /></ProtectedRoute>} />
      <Route path="/accounting/journal/new" element={<ProtectedRoute><AccountingJournalNew /></ProtectedRoute>} />
      <Route path="/accounting/ledger" element={<ProtectedRoute><AccountingLedger /></ProtectedRoute>} />
      <Route path="/accounting/statements" element={<ProtectedRoute><AccountingStatements /></ProtectedRoute>} />
      <Route path="/accounting/assets" element={<ProtectedRoute><AccountingAssets /></ProtectedRoute>} />
      <Route path="/accounting/expenses" element={<ProtectedRoute><AccountingExpenses /></ProtectedRoute>} />
      <Route path="/accounting/settings" element={<ProtectedRoute><AccountingSettings /></ProtectedRoute>} />
      <Route path="/accounting/budget" element={<ProtectedRoute><AccountingBudget /></ProtectedRoute>} />
      <Route path="/accounting/receivables" element={<ProtectedRoute><AccountingReceivables /></ProtectedRoute>} />
      {/* CRM */}
      <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
      <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
      <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
      {/* HR */}
      <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
      <Route path="/year-end" element={<ProtectedRoute><YearEnd /></ProtectedRoute>} />
      <Route path="/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
      <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequests /></ProtectedRoute>} />
      {/* Info */}
      <Route path="/wiki" element={<ProtectedRoute><Wiki /></ProtectedRoute>} />
      <Route path="/it-assets" element={<ProtectedRoute><ITAssets /></ProtectedRoute>} />
      {/* Finance */}
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/reconciliation" element={<ProtectedRoute><Reconciliation /></ProtectedRoute>} />
      <Route path="/boost" element={<ProtectedRoute><Boost /></ProtectedRoute>} />
      <Route path="/trust-passport" element={<ProtectedRoute><TrustPassport /></ProtectedRoute>} />
      {/* Reports & Settings */}
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/pages" element={<ProtectedRoute><PageIndex /></ProtectedRoute>} />
      {/* New Features */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
      <Route path="/bank-connections" element={<ProtectedRoute><BankConnections /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/payment-links" element={<ProtectedRoute><PaymentLinks /></ProtectedRoute>} />
      <Route path="/email-templates" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
      {/* Payment */}
      <Route path="/payment-success" element={<PaymentSuccess />} />
      {/* Phase 1 Features (Competitive) */}
      <Route path="/contract-alerts" element={<ProtectedRoute><ContractAlerts /></ProtectedRoute>} />
      <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      <Route path="/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
      <Route path="/receipt-capture" element={<ProtectedRoute><ReceiptCapture /></ProtectedRoute>} />
      <Route path="/lead-scoring" element={<ProtectedRoute><LeadScoring /></ProtectedRoute>} />
      <Route path="/e-bookkeeping" element={<ProtectedRoute><EBookkeeping /></ProtectedRoute>} />
      <Route path="/my-number" element={<ProtectedRoute><MyNumberManagement /></ProtectedRoute>} />
      <Route path="/email-integration" element={<ProtectedRoute><EmailIntegration /></ProtectedRoute>} />
      {/* Phase 2 Features (Differentiation) */}
      <Route path="/wiki-hierarchy" element={<ProtectedRoute><WikiHierarchy /></ProtectedRoute>} />
      <Route path="/sales-forecast" element={<ProtectedRoute><SalesForecast /></ProtectedRoute>} />
      <Route path="/database-views" element={<ProtectedRoute><DatabaseViews /></ProtectedRoute>} />
      <Route path="/social-insurance" element={<ProtectedRoute><SocialInsurance /></ProtectedRoute>} />
      <Route path="/approval-workflow" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
      <Route path="/sso-settings" element={<ProtectedRoute><SSOSettings /></ProtectedRoute>} />
      {/* Credit System */}
      <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
      <Route path="/credit-logs" element={<ProtectedRoute><CreditLogs /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
      {/* Developer & Settings */}
      <Route path="/settings/menu" element={<ProtectedRoute><SettingsMenu /></ProtectedRoute>} />
      <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
      <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
      <Route path="/developer" element={<ProtectedRoute><DeveloperSettings /></ProtectedRoute>} />
      <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
      <Route path="/mcp-settings" element={<ProtectedRoute><McpSettings /></ProtectedRoute>} />
      {/* Data Import */}
      <Route path="/data-import" element={<ProtectedRoute><DataImport /></ProtectedRoute>} />
      {/* Legal */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
              <ChatWidget />
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </DemoProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
