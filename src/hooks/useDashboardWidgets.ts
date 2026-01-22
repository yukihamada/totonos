import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCompany";
import { 
  DashboardWidgetConfig, 
  getDefaultWidgetsForIndustry,
  WIDGET_DEFINITIONS,
} from "@/config/dashboard-widgets";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export function useDashboardWidgets() {
  const { user } = useAuth();
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  // Fetch user's custom dashboard config
  const { data: userConfig, isLoading: isLoadingUserConfig } = useQuery({
    queryKey: ["dashboard-config", user?.id, currentCompany?.id],
    queryFn: async () => {
      if (!user) return null;

      const query = supabase
        .from("user_dashboard_config")
        .select("*")
        .eq("user_id", user.id);

      if (currentCompany) {
        query.eq("company_id", currentCompany.id);
      } else {
        query.is("company_id", null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching dashboard config:", error);
        return null;
      }

      if (!data) return null;

      return {
        ...data,
        widgets: (data.widgets as unknown as DashboardWidgetConfig[]) || [],
      };
    },
    enabled: !!user,
  });

  // Fetch industry template config from company
  const { data: industryConfig, isLoading: isLoadingIndustry } = useQuery({
    queryKey: ["industry-dashboard-config", currentCompany?.template_id],
    queryFn: async () => {
      if (!currentCompany?.template_id) return null;

      // Get template key from company's template
      const { data: template } = await supabase
        .from("industry_templates")
        .select("template_key, category")
        .eq("id", currentCompany.template_id)
        .single();

      if (!template) return null;

      // Get menu config with dashboard widgets
      const { data: menuConfig } = await supabase
        .from("template_menu_config")
        .select("dashboard_widgets")
        .eq("template_id", currentCompany.template_id)
        .single();

      return {
        templateKey: template.template_key,
        category: template.category,
        dashboardWidgets: menuConfig?.dashboard_widgets as unknown as DashboardWidgetConfig[] | null,
      };
    },
    enabled: !!currentCompany?.template_id,
  });

  // Determine which widgets to use
  const widgets: DashboardWidgetConfig[] = (() => {
    // Priority 1: User's custom config
    if (userConfig?.widgets && Array.isArray(userConfig.widgets) && userConfig.widgets.length > 0) {
      return userConfig.widgets;
    }

    // Priority 2: Industry template config from DB
    if (industryConfig?.dashboardWidgets && Array.isArray(industryConfig.dashboardWidgets)) {
      return industryConfig.dashboardWidgets;
    }

    // Priority 3: Hardcoded industry defaults
    const industryKey = industryConfig?.category || industryConfig?.templateKey;
    return getDefaultWidgetsForIndustry(industryKey);
  })();

  // Save dashboard config
  const saveMutation = useMutation({
    mutationFn: async (newWidgets: DashboardWidgetConfig[]) => {
      if (!user) throw new Error("Not authenticated");

      const widgetsJson = newWidgets as unknown as Json;

      if (userConfig?.id) {
        // Update existing
        const { error } = await supabase
          .from("user_dashboard_config")
          .update({ widgets: widgetsJson, updated_at: new Date().toISOString() })
          .eq("id", userConfig.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("user_dashboard_config")
          .insert({
            user_id: user.id,
            company_id: currentCompany?.id || null,
            widgets: widgetsJson,
            layout_type: "custom",
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-config"] });
      toast.success("ダッシュボード設定を保存しました");
    },
    onError: (error) => {
      console.error("Error saving dashboard config:", error);
      toast.error("設定の保存に失敗しました");
    },
  });

  // Reset to industry default
  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      if (userConfig?.id) {
        // Delete user's custom config to fall back to industry default
        const { error } = await supabase
          .from("user_dashboard_config")
          .delete()
          .eq("id", userConfig.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-config"] });
      toast.success("業種デフォルトに戻しました");
    },
    onError: (error) => {
      console.error("Error resetting dashboard config:", error);
      toast.error("リセットに失敗しました");
    },
  });

  // Check if user has custom config
  const hasCustomConfig = !!userConfig?.widgets && userConfig.widgets.length > 0;

  // Get current industry key
  const industryKey = industryConfig?.category || industryConfig?.templateKey || "default";

  return {
    widgets: widgets.filter((w) => w.visible).sort((a, b) => a.position - b.position),
    allWidgets: widgets.sort((a, b) => a.position - b.position),
    availableWidgetTypes: WIDGET_DEFINITIONS,
    isLoading: isLoadingUserConfig || isLoadingIndustry,
    hasCustomConfig,
    industryKey,
    saveWidgets: saveMutation.mutateAsync,
    resetToDefault: resetMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isResetting: resetMutation.isPending,
  };
}
