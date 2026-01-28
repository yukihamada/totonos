import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
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
import AccountingTax from "./pages/AccountingTax";
import AccountingPayables from "./pages/AccountingPayables";
import AccountingCashFlow from "./pages/AccountingCashFlow";
import AccountingPeriodClose from "./pages/AccountingPeriodClose";
import AccountingTemplates from "./pages/AccountingTemplates";
import AccountingCostCenters from "./pages/AccountingCostCenters";
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
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceEdit from "./pages/InvoiceEdit";
import Estimates from "./pages/Estimates";
import EstimateDetail from "./pages/EstimateDetail";
import EstimateEdit from "./pages/EstimateEdit";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import PurchaseOrderEdit from "./pages/PurchaseOrderEdit";
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
import AutoReorder from "./pages/AutoReorder";
import DeliveryNotes from "./pages/DeliveryNotes";
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
import SlackIntegration from "./pages/SlackIntegration";
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
import { UsageDashboard } from "./pages/UsageDashboard";
// Developer & Settings
import SettingsMenu from "./pages/SettingsMenu";
import DeveloperSettings from "./pages/DeveloperSettings";
import ApiDocs from "./pages/ApiDocs";
import McpSettings from "./pages/McpSettings";
import AISettings from "./pages/AISettings";
import AIAgents from "./pages/AIAgents";
import CompanySettings from "./pages/CompanySettings";
// Legal
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ServiceGuide from "./pages/ServiceGuide";
import ServiceAgreement from "./pages/ServiceAgreement";
// Data Import
import DataImport from "./pages/DataImport";
// Organization
import Onboarding from "./pages/Onboarding";
import OrganizationSettings from "./pages/OrganizationSettings";
import EmployeePortal from "./pages/EmployeePortal";
import Showcase from "./pages/Showcase";
import GettingStarted from "./pages/GettingStarted";
import Invite from "./pages/Invite";
import Messages from "./pages/Messages";
// Industry LP
import Industries from "./pages/Industries";
import IndustryLanding from "./pages/lp/IndustryLanding";
// Chat
import { ChatWidget } from "./components/chat/ChatWidget";
// LINE Integration
import LineSettings from "./pages/LineSettings";
import Integrations from "./pages/Integrations";
import GoogleChatIntegration from "./pages/GoogleChatIntegration";
// Phase 4: Expense Management
import Expenses from "./pages/Expenses";
import ExpenseNew from "./pages/ExpenseNew";
import ExpenseDetail from "./pages/ExpenseDetail";
import AdvancePayment from "./pages/AdvancePayment";
import ExpenseSettings from "./pages/ExpenseSettings";
// Phase 4: Project Management
import Projects from "./pages/Projects";
import ProjectNew from "./pages/ProjectNew";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectKanban from "./pages/ProjectKanban";
import ProjectGantt from "./pages/ProjectGantt";
import ProjectTimelog from "./pages/ProjectTimelog";
// Phase 4: Recruiting (ATS)
import Recruiting from "./pages/Recruiting";
import JobPostings from "./pages/JobPostings";
import JobPostingNew from "./pages/JobPostingNew";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import InterviewSchedule from "./pages/InterviewSchedule";
import RecruitingReports from "./pages/RecruitingReports";
// EMR (Electronic Medical Records)
import EmrDashboard from "./pages/emr/EmrDashboard";
import EmrReception from "./pages/emr/EmrReception";
import EmrPatients from "./pages/emr/EmrPatients";
import EmrRecords from "./pages/emr/EmrRecords";
import EmrHpkiBridge from "./pages/emr/EmrHpkiBridge";
import EmrSalesReport from "./pages/emr/EmrSalesReport";
import EmrAppointments from "./pages/emr/EmrAppointments";
import EmrBilling from "./pages/emr/EmrBilling";
import EmrPharmacy from "./pages/emr/EmrPharmacy";
import EmrInquiry from "./pages/emr/EmrInquiry";
import EmrHomeVisit from "./pages/emr/EmrHomeVisit";
import EmrTelemedicine from "./pages/emr/EmrTelemedicine";
import EmrHealthCheckup from "./pages/emr/EmrHealthCheckup";
// Membership
import MembersDashboard from "./pages/membership/MembersDashboard";
import MembersList from "./pages/membership/MembersList";
import MembershipPlans from "./pages/membership/MembershipPlans";
import ClassSchedules from "./pages/membership/ClassSchedules";
import ClassBookings from "./pages/membership/ClassBookings";
import MemberCheckins from "./pages/membership/MemberCheckins";
import MemberPurchases from "./pages/membership/MemberPurchases";
// Support/CS
import Tickets from "./pages/support-cs/Tickets";
import HelpCenter from "./pages/support-cs/HelpCenter";
import Chatbot from "./pages/support-cs/Chatbot";
import CTI from "./pages/support-cs/CTI";
import CustomerSuccess from "./pages/support-cs/CustomerSuccess";
import SupportCommunity from "./pages/support-cs/Community";
// Marketing
import EmailMarketing from "./pages/marketing/EmailMarketing";
import Campaigns from "./pages/marketing/Campaigns";
import LPBuilder from "./pages/marketing/LPBuilder";
import WebAnalytics from "./pages/marketing/WebAnalytics";
import AdManagement from "./pages/marketing/AdManagement";
import SNSManagement from "./pages/marketing/SNSManagement";
// Retail/EC
import CloudPOS from "./pages/retail-ec/CloudPOS";
import ECSite from "./pages/retail-ec/ECSite";
import OmniInventory from "./pages/retail-ec/OmniInventory";
import StoreShift from "./pages/retail-ec/StoreShift";
import MemberApp from "./pages/retail-ec/MemberApp";
import LoyaltyPoints from "./pages/retail-ec/LoyaltyPoints";
// LMS
import Courses from "./pages/lms/Courses";
import Tests from "./pages/lms/Tests";
import StudyHistory from "./pages/lms/StudyHistory";
import SkillMap from "./pages/lms/SkillMap";
import Certifications from "./pages/lms/Certifications";
// Legal/Governance
import ShareholderMeetings from "./pages/legal-governance/ShareholderMeetings";
import CorporateRegistry from "./pages/legal-governance/CorporateRegistry";
import Whistleblowing from "./pages/legal-governance/Whistleblowing";
import AntisocialCheck from "./pages/legal-governance/AntisocialCheck";
import IPManagement from "./pages/legal-governance/IPManagement";
// Vacation Rental
import VacationDashboard from "./pages/vacation-rental/VacationDashboard";
import VacationProperties from "./pages/vacation-rental/Properties";
import VacationBookings from "./pages/vacation-rental/Bookings";
import VacationBookingCalendar from "./pages/vacation-rental/BookingCalendar";
import VacationGuests from "./pages/vacation-rental/Guests";
import VacationCleaningSchedule from "./pages/vacation-rental/CleaningSchedule";
import VacationOperatingDays from "./pages/vacation-rental/OperatingDays";
// Estate Management
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import EstateTenants from "./pages/EstateTenants";
import OwnerDashboard from "./pages/OwnerDashboard";
import ProrationCalculator from "./pages/ProrationCalculator";
import EstateReconciliation from "./pages/EstateReconciliation";

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Redirect component for /quotes/:id to /estimates/:id
function QuoteRedirect() {
  const { id } = useParams();
  return <Navigate to={`/estimates/${id}`} replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/getting-started" element={<ProtectedRoute><GettingStarted /></ProtectedRoute>} />
      {/* Documents */}
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
      <Route path="/invoices/:id/edit" element={<ProtectedRoute><InvoiceEdit /></ProtectedRoute>} />
      <Route path="/estimates" element={<ProtectedRoute><Estimates /></ProtectedRoute>} />
      <Route path="/estimates/:id" element={<ProtectedRoute><EstimateDetail /></ProtectedRoute>} />
      <Route path="/estimates/:id/edit" element={<ProtectedRoute><EstimateEdit /></ProtectedRoute>} />
      {/* Alias for estimates */}
      <Route path="/quotes" element={<Navigate to="/estimates" replace />} />
      <Route path="/quotes/:id" element={<QuoteRedirect />} />
      <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
      <Route path="/purchase-orders/:id" element={<ProtectedRoute><PurchaseOrderDetail /></ProtectedRoute>} />
      <Route path="/purchase-orders/:id/edit" element={<ProtectedRoute><PurchaseOrderEdit /></ProtectedRoute>} />
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
      <Route path="/accounting/tax" element={<ProtectedRoute><AccountingTax /></ProtectedRoute>} />
      <Route path="/accounting/payables" element={<ProtectedRoute><AccountingPayables /></ProtectedRoute>} />
      <Route path="/accounting/cashflow" element={<ProtectedRoute><AccountingCashFlow /></ProtectedRoute>} />
      <Route path="/accounting/period-close" element={<ProtectedRoute><AccountingPeriodClose /></ProtectedRoute>} />
      <Route path="/accounting/templates" element={<ProtectedRoute><AccountingTemplates /></ProtectedRoute>} />
      <Route path="/accounting/cost-centers" element={<ProtectedRoute><AccountingCostCenters /></ProtectedRoute>} />
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
      <Route path="/dev/pages" element={<ProtectedRoute><PageIndex /></ProtectedRoute>} />
      {/* New Features */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
      <Route path="/bank-connections" element={<ProtectedRoute><BankConnections /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/auto-reorder" element={<ProtectedRoute><AutoReorder /></ProtectedRoute>} />
      <Route path="/delivery-notes" element={<ProtectedRoute><DeliveryNotes /></ProtectedRoute>} />
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
      <Route path="/slack-integration" element={<ProtectedRoute><SlackIntegration /></ProtectedRoute>} />
      <Route path="/google-chat-integration" element={<ProtectedRoute><GoogleChatIntegration /></ProtectedRoute>} />
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
      <Route path="/usage" element={<ProtectedRoute><UsageDashboard /></ProtectedRoute>} />
      {/* Developer & Settings */}
      <Route path="/settings/menu" element={<ProtectedRoute><SettingsMenu /></ProtectedRoute>} />
      <Route path="/settings/ai" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
      <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
      <Route path="/ai-agents" element={<ProtectedRoute><AIAgents /></ProtectedRoute>} />
      <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
      <Route path="/company-settings" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
      <Route path="/settings/line" element={<ProtectedRoute><LineSettings /></ProtectedRoute>} />
      <Route path="/line-settings" element={<ProtectedRoute><LineSettings /></ProtectedRoute>} />
      <Route path="/team-members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/developer" element={<ProtectedRoute><DeveloperSettings /></ProtectedRoute>} />
      <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
      <Route path="/mcp-settings" element={<ProtectedRoute><McpSettings /></ProtectedRoute>} />
      {/* Data Import */}
      <Route path="/data-import" element={<ProtectedRoute><DataImport /></ProtectedRoute>} />
      {/* Legal */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/service-guide" element={<ServiceGuide />} />
      <Route path="/service-agreement" element={<ServiceAgreement />} />
      {/* Organization */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/organization" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
      {/* Employee Portal (public with token) */}
      <Route path="/portal" element={<EmployeePortal />} />
      {/* Showcase (public) */}
      <Route path="/showcase" element={<Showcase />} />
      {/* Invitation */}
      <Route path="/invite" element={<Invite />} />
      {/* Industry Landing Pages */}
      <Route path="/industries" element={<Industries />} />
      <Route path="/lp/:template" element={<IndustryLanding />} />
      {/* Phase 4: Expense Management */}
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/expenses/new" element={<ProtectedRoute><ExpenseNew /></ProtectedRoute>} />
      <Route path="/expenses/settings" element={<ProtectedRoute><ExpenseSettings /></ProtectedRoute>} />
      <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
      <Route path="/advance-payment" element={<ProtectedRoute><AdvancePayment /></ProtectedRoute>} />
      {/* Phase 4: Project Management */}
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><ProjectNew /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/projects/:id/kanban" element={<ProtectedRoute><ProjectKanban /></ProtectedRoute>} />
      <Route path="/projects/:id/gantt" element={<ProtectedRoute><ProjectGantt /></ProtectedRoute>} />
      <Route path="/timelog" element={<ProtectedRoute><ProjectTimelog /></ProtectedRoute>} />
      {/* Phase 4: Recruiting (ATS) */}
      <Route path="/recruiting" element={<ProtectedRoute><Recruiting /></ProtectedRoute>} />
      <Route path="/job-postings" element={<ProtectedRoute><JobPostings /></ProtectedRoute>} />
      <Route path="/job-postings/new" element={<ProtectedRoute><JobPostingNew /></ProtectedRoute>} />
      <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
      <Route path="/candidates/:id" element={<ProtectedRoute><CandidateDetail /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><InterviewSchedule /></ProtectedRoute>} />
      <Route path="/recruiting/reports" element={<ProtectedRoute><RecruitingReports /></ProtectedRoute>} />
      {/* EMR (Electronic Medical Records) */}
      <Route path="/emr" element={<ProtectedRoute><EmrDashboard /></ProtectedRoute>} />
      <Route path="/emr/reception" element={<ProtectedRoute><EmrReception /></ProtectedRoute>} />
      <Route path="/emr/patients" element={<ProtectedRoute><EmrPatients /></ProtectedRoute>} />
      <Route path="/emr/records" element={<ProtectedRoute><EmrRecords /></ProtectedRoute>} />
      <Route path="/emr/sales" element={<ProtectedRoute><EmrSalesReport /></ProtectedRoute>} />
      <Route path="/emr/hpki" element={<ProtectedRoute><EmrHpkiBridge /></ProtectedRoute>} />
      <Route path="/emr/appointments" element={<ProtectedRoute><EmrAppointments /></ProtectedRoute>} />
      <Route path="/emr/billing" element={<ProtectedRoute><EmrBilling /></ProtectedRoute>} />
      <Route path="/emr/pharmacy" element={<ProtectedRoute><EmrPharmacy /></ProtectedRoute>} />
      <Route path="/emr/inquiry" element={<ProtectedRoute><EmrInquiry /></ProtectedRoute>} />
      <Route path="/emr/home-visit" element={<ProtectedRoute><EmrHomeVisit /></ProtectedRoute>} />
      <Route path="/emr/telemedicine" element={<ProtectedRoute><EmrTelemedicine /></ProtectedRoute>} />
      <Route path="/emr/health-checkup" element={<ProtectedRoute><EmrHealthCheckup /></ProtectedRoute>} />
      {/* Membership */}
      <Route path="/membership" element={<ProtectedRoute><MembersDashboard /></ProtectedRoute>} />
      <Route path="/membership/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
      <Route path="/membership/plans" element={<ProtectedRoute><MembershipPlans /></ProtectedRoute>} />
      <Route path="/membership/schedules" element={<ProtectedRoute><ClassSchedules /></ProtectedRoute>} />
      <Route path="/membership/bookings" element={<ProtectedRoute><ClassBookings /></ProtectedRoute>} />
      <Route path="/membership/checkins" element={<ProtectedRoute><MemberCheckins /></ProtectedRoute>} />
      <Route path="/membership/purchases" element={<ProtectedRoute><MemberPurchases /></ProtectedRoute>} />
      {/* Support/CS */}
      <Route path="/support/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/support/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
      <Route path="/support/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
      <Route path="/support/cti" element={<ProtectedRoute><CTI /></ProtectedRoute>} />
      <Route path="/support/customer-success" element={<ProtectedRoute><CustomerSuccess /></ProtectedRoute>} />
      <Route path="/support/community" element={<ProtectedRoute><SupportCommunity /></ProtectedRoute>} />
      {/* Marketing */}
      <Route path="/marketing/email" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
      <Route path="/marketing/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/marketing/lp-builder" element={<ProtectedRoute><LPBuilder /></ProtectedRoute>} />
      <Route path="/marketing/analytics" element={<ProtectedRoute><WebAnalytics /></ProtectedRoute>} />
      <Route path="/marketing/ads" element={<ProtectedRoute><AdManagement /></ProtectedRoute>} />
      <Route path="/marketing/sns" element={<ProtectedRoute><SNSManagement /></ProtectedRoute>} />
      {/* Retail/EC */}
      <Route path="/retail/pos" element={<ProtectedRoute><CloudPOS /></ProtectedRoute>} />
      <Route path="/retail/ec-site" element={<ProtectedRoute><ECSite /></ProtectedRoute>} />
      <Route path="/retail/inventory" element={<ProtectedRoute><OmniInventory /></ProtectedRoute>} />
      <Route path="/retail/shift" element={<ProtectedRoute><StoreShift /></ProtectedRoute>} />
      <Route path="/retail/member-app" element={<ProtectedRoute><MemberApp /></ProtectedRoute>} />
      <Route path="/retail/points" element={<ProtectedRoute><LoyaltyPoints /></ProtectedRoute>} />
      {/* LMS */}
      <Route path="/lms/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/lms/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
      <Route path="/lms/history" element={<ProtectedRoute><StudyHistory /></ProtectedRoute>} />
      <Route path="/lms/skill-map" element={<ProtectedRoute><SkillMap /></ProtectedRoute>} />
      <Route path="/lms/certifications" element={<ProtectedRoute><Certifications /></ProtectedRoute>} />
      {/* Legal/Governance */}
      <Route path="/legal/shareholder-meetings" element={<ProtectedRoute><ShareholderMeetings /></ProtectedRoute>} />
      <Route path="/legal/registry" element={<ProtectedRoute><CorporateRegistry /></ProtectedRoute>} />
      <Route path="/legal/whistleblowing" element={<ProtectedRoute><Whistleblowing /></ProtectedRoute>} />
      <Route path="/legal/antisocial-check" element={<ProtectedRoute><AntisocialCheck /></ProtectedRoute>} />
      <Route path="/legal/ip" element={<ProtectedRoute><IPManagement /></ProtectedRoute>} />
      {/* Vacation Rental */}
      <Route path="/vacation-rental" element={<ProtectedRoute><VacationDashboard /></ProtectedRoute>} />
      <Route path="/vacation-rental/properties" element={<ProtectedRoute><VacationProperties /></ProtectedRoute>} />
      <Route path="/vacation-rental/properties/:id" element={<ProtectedRoute><VacationProperties /></ProtectedRoute>} />
      <Route path="/vacation-rental/bookings" element={<ProtectedRoute><VacationBookings /></ProtectedRoute>} />
      <Route path="/vacation-rental/calendar" element={<ProtectedRoute><VacationBookingCalendar /></ProtectedRoute>} />
      <Route path="/vacation-rental/guests" element={<ProtectedRoute><VacationGuests /></ProtectedRoute>} />
      <Route path="/vacation-rental/cleaning" element={<ProtectedRoute><VacationCleaningSchedule /></ProtectedRoute>} />
      <Route path="/vacation-rental/operating-days" element={<ProtectedRoute><VacationOperatingDays /></ProtectedRoute>} />
      {/* Estate Management */}
      <Route path="/estate/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/estate/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
      <Route path="/estate/properties/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
      <Route path="/estate/properties/:id/edit" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
      <Route path="/estate/tenants" element={<ProtectedRoute><EstateTenants /></ProtectedRoute>} />
      <Route path="/estate/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/estate/proration" element={<ProtectedRoute><ProrationCalculator /></ProtectedRoute>} />
      <Route path="/estate/reconciliation" element={<ProtectedRoute><EstateReconciliation /></ProtectedRoute>} />
      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OrganizationProvider>
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
          </OrganizationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
