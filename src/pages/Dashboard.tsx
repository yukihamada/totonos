import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { OnboardingGuide } from "@/components/dashboard/OnboardingGuide";
import { IndustryTemplateAppliedDialog } from "@/components/IndustryTemplateAppliedDialog";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

export default function Dashboard() {
  const [editMode, setEditMode] = useState(false);
  const { data: stats, isLoading: statsLoading, error } = useDashboardStats();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const {
    widgets,
    allWidgets,
    isLoading: widgetsLoading,
    industryKey,
    saveWidgets,
    resetToDefault,
    isSaving,
    isResetting,
  } = useDashboardWidgets();

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-8 text-destructive">
          データの読み込みに失敗しました
        </div>
      </AppLayout>
    );
  }

  // Function to open chat - will be passed to ChatWidget via global event
  const handleChatOpen = () => {
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  const isLoading = statsLoading || widgetsLoading;

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header with customize button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">ダッシュボード</h1>
          <Button
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {editMode ? "編集中" : "カスタマイズ"}
          </Button>
        </div>

        {/* Onboarding Guide - shows until all steps are completed */}
        <OnboardingGuide onChatOpen={handleChatOpen} />

        {/* Dashboard Editor (when in edit mode) */}
        {editMode && (
          <DashboardEditor
            widgets={allWidgets}
            industryKey={industryKey}
            onSave={saveWidgets}
            onReset={resetToDefault}
            onClose={() => setEditMode(false)}
            isSaving={isSaving}
            isResetting={isResetting}
          />
        )}

        {/* Dynamic Dashboard Grid */}
        <DashboardGrid
          widgets={widgets}
          stats={stats ? {
            monthlyInvoiced: stats.monthlyInvoiced,
            totalInvoiced: stats.totalInvoiced,
            unpaidAmount: stats.unpaidAmount,
            unpaidCount: stats.unpaidCount,
            overdueAmount: stats.overdueAmount,
            overdueCount: stats.overdueCount,
            pipelineValue: stats.pipelineValue,
            dealsCount: stats.dealsCount,
            wonDealsValue: stats.wonDealsValue,
            monthlyRevenue: stats.monthlyRevenue,
            pipelineByStage: stats.pipelineByStage,
          } : undefined}
          clientsCount={clients?.length}
          isLoading={isLoading}
        />
      </div>

      {/* Industry template applied notification */}
      <IndustryTemplateAppliedDialog />
    </AppLayout>
  );
}
