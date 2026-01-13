import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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
// CRM
import Leads from "./pages/Leads";
import Deals from "./pages/Deals";
// HR
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import YearEnd from "./pages/YearEnd";
// Info
import Wiki from "./pages/Wiki";
import ITAssets from "./pages/ITAssets";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
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
      {/* Contracts */}
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
      {/* CRM */}
      <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
      {/* HR */}
      <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
      <Route path="/year-end" element={<ProtectedRoute><YearEnd /></ProtectedRoute>} />
      {/* Info */}
      {/* Info */}
      <Route path="/wiki" element={<ProtectedRoute><Wiki /></ProtectedRoute>} />
      <Route path="/it-assets" element={<ProtectedRoute><ITAssets /></ProtectedRoute>} />
      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
