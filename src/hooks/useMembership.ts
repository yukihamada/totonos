import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCompany";
import { toast } from "sonner";
import type { Json, Database } from "@/integrations/supabase/types";

// Types from Supabase schema
type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type MembershipPlanRow = Database["public"]["Tables"]["membership_plans"]["Row"];
type ClassScheduleRow = Database["public"]["Tables"]["class_schedules"]["Row"];
type ClassBookingRow = Database["public"]["Tables"]["class_bookings"]["Row"];
type MemberCheckinRow = Database["public"]["Tables"]["member_checkins"]["Row"];

// Extended types with relations
export interface Member extends MemberRow {}

export interface MembershipPlan extends MembershipPlanRow {}

export interface ClassSchedule extends ClassScheduleRow {}

export interface ClassBooking extends ClassBookingRow {
  member?: Member;
  class_schedule?: ClassSchedule;
}

export interface MemberCheckin extends MemberCheckinRow {
  member?: Member;
}

// Members Hook
export function useMembers() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["members", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("company_id", currentCompany.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const createMember = useMutation({
    mutationFn: async (input: { name: string; email?: string; phone?: string; gender?: string; birth_date?: string; address?: string; membership_type?: string }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      
      // Generate member number
      const { data: existing } = await supabase
        .from("members")
        .select("member_number")
        .eq("company_id", currentCompany.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      const nextNumber = existing && existing.length > 0 && existing[0].member_number
        ? parseInt(existing[0].member_number.replace("M-", "")) + 1
        : 1;
      const memberNumber = `M-${String(nextNumber).padStart(5, "0")}`;

      const { data, error } = await supabase
        .from("members")
        .insert({
          ...input,
          company_id: currentCompany.id,
          member_number: memberNumber,
          membership_type: input.membership_type || "regular",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("会員を登録しました");
    },
    onError: (error) => {
      toast.error("会員登録に失敗しました: " + error.message);
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MemberRow>) => {
      const { data, error } = await supabase
        .from("members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("会員情報を更新しました");
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("会員を削除しました");
    },
    onError: (error) => {
      toast.error("削除に失敗しました: " + error.message);
    },
  });

  return { members, isLoading, error, createMember, updateMember, deleteMember };
}

// Membership Plans Hook
export function useMembershipPlans() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ["membership-plans", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("company_id", currentCompany.id)
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const createPlan = useMutation({
    mutationFn: async (input: { name: string; plan_type: string; price?: number; description?: string; billing_cycle?: string; included_classes?: number }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      const { data, error } = await supabase
        .from("membership_plans")
        .insert({ ...input, company_id: currentCompany.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
      toast.success("プランを作成しました");
    },
    onError: (error) => {
      toast.error("プラン作成に失敗しました: " + error.message);
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MembershipPlanRow>) => {
      const { data, error } = await supabase
        .from("membership_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
      toast.success("プランを更新しました");
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("membership_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
      toast.success("プランを削除しました");
    },
    onError: (error) => {
      toast.error("削除に失敗しました: " + error.message);
    },
  });

  return { plans, isLoading, error, createPlan, updatePlan, deletePlan };
}

// Class Schedules Hook
export function useClassSchedules() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ["class-schedules", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      const { data, error } = await supabase
        .from("class_schedules")
        .select("*")
        .eq("company_id", currentCompany.id)
        .eq("is_active", true)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const createSchedule = useMutation({
    mutationFn: async (input: { title: string; start_time: string; end_time: string; class_type?: string; day_of_week?: number; instructor_name?: string; capacity?: number; location?: string }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      const { data, error } = await supabase
        .from("class_schedules")
        .insert({ ...input, company_id: currentCompany.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("スケジュールを作成しました");
    },
    onError: (error) => {
      toast.error("作成に失敗しました: " + error.message);
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ClassScheduleRow>) => {
      const { data, error } = await supabase
        .from("class_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("スケジュールを更新しました");
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("class_schedules")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("スケジュールを削除しました");
    },
    onError: (error) => {
      toast.error("削除に失敗しました: " + error.message);
    },
  });

  return { schedules, isLoading, error, createSchedule, updateSchedule, deleteSchedule };
}

// Class Bookings Hook
export function useClassBookings(scheduleId?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["class-bookings", currentCompany?.id, scheduleId],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      let query = supabase
        .from("class_bookings")
        .select("*, member:members(*), class_schedule:class_schedules(*)");
      
      if (scheduleId) {
        query = query.eq("class_schedule_id", scheduleId);
      }
      
      const { data, error } = await query.order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const createBooking = useMutation({
    mutationFn: async (input: { class_schedule_id: string; member_id: string; booking_date: string }) => {
      const { data, error } = await supabase
        .from("class_bookings")
        .insert({
          ...input,
          status: "confirmed",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("予約を登録しました");
    },
    onError: (error) => {
      toast.error("予約に失敗しました: " + error.message);
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("class_bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
      toast.success("予約をキャンセルしました");
    },
    onError: (error) => {
      toast.error("キャンセルに失敗しました: " + error.message);
    },
  });

  const checkIn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("class_bookings")
        .update({ checked_in_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-bookings"] });
      toast.success("チェックインしました");
    },
    onError: (error) => {
      toast.error("チェックインに失敗しました: " + error.message);
    },
  });

  return { bookings, isLoading, error, createBooking, cancelBooking, checkIn };
}

// Member Checkins Hook
export function useMemberCheckins() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: checkins = [], isLoading, error } = useQuery({
    queryKey: ["member-checkins", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("member_checkins")
        .select("*, member:members(*)")
        .eq("company_id", currentCompany.id)
        .gte("checkin_time", today)
        .order("checkin_time", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const checkIn = useMutation({
    mutationFn: async (input: { member_id: string; method?: string }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      const { data, error } = await supabase
        .from("member_checkins")
        .insert({
          member_id: input.member_id,
          company_id: currentCompany.id,
          method: input.method || "manual",
        })
        .select("*, member:members(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["member-checkins"] });
      toast.success(`${data.member?.name || "会員"}さんがチェックインしました`);
    },
    onError: (error) => {
      toast.error("チェックインに失敗しました: " + error.message);
    },
  });

  const checkOut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("member_checkins")
        .update({ checkout_time: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-checkins"] });
      toast.success("チェックアウトしました");
    },
    onError: (error) => {
      toast.error("チェックアウトに失敗しました: " + error.message);
    },
  });

  return { checkins, isLoading, error, checkIn, checkOut };
}

// Stats Hook
export function useMembershipStats() {
  const { data: currentCompany } = useCurrentCompany();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["membership-stats", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return null;

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const todayStr = today.toISOString().split("T")[0];

      const [membersRes, newMembersRes, checkinsRes, bookingsRes] = await Promise.all([
        supabase.from("members").select("id", { count: "exact" }).eq("company_id", currentCompany.id).eq("status", "active"),
        supabase.from("members").select("id", { count: "exact" }).eq("company_id", currentCompany.id).gte("join_date", startOfMonth),
        supabase.from("member_checkins").select("id", { count: "exact" }).eq("company_id", currentCompany.id).gte("checkin_time", todayStr),
        supabase.from("class_bookings").select("id", { count: "exact" }).eq("booking_date", todayStr).eq("status", "confirmed"),
      ]);

      return {
        totalMembers: membersRes.count || 0,
        newMembersThisMonth: newMembersRes.count || 0,
        todayCheckins: checkinsRes.count || 0,
        todayBookings: bookingsRes.count || 0,
      };
    },
    enabled: !!currentCompany?.id,
  });

  return { stats, isLoading };
}
