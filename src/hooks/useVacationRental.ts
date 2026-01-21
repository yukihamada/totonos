import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

// Helper to get current company
function useCurrentCompany() {
  const { currentCompany } = useOrganization();
  return { company: currentCompany };
}

// Types
export interface VacationRental {
  id: string;
  company_id: string;
  user_id: string;
  name: string;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  property_type: string;
  max_guests: number;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  registration_number: string | null;
  registration_date: string | null;
  annual_limit_days: number;
  images: string[];
  description: string | null;
  house_rules: string | null;
  check_in_time: string;
  check_out_time: string;
  base_price: number;
  cleaning_fee: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VacationBooking {
  id: string;
  property_id: string;
  guest_id: string | null;
  company_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  total_price: number;
  cleaning_fee: number;
  source: string;
  external_booking_id: string | null;
  status: string;
  special_requests: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property?: VacationRental;
}

export interface VacationGuest {
  id: string;
  company_id: string;
  name: string;
  name_kana: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  passport_number: string | null;
  address: string | null;
  previous_stays: number;
  notes: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface CleaningTask {
  id: string;
  property_id: string;
  booking_id: string | null;
  company_id: string;
  scheduled_date: string;
  scheduled_time: string;
  assigned_to: string | null;
  checklist: ChecklistItem[];
  status: string;
  photos: string[];
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  property?: VacationRental;
  booking?: VacationBooking;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

// === Properties Hooks ===
export function useVacationProperties() {
  const { company } = useCurrentCompany();

  return useQuery({
    queryKey: ['vacation-rentals', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from('vacation_rentals')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as VacationRental[];
    },
    enabled: !!company?.id,
  });
}

export function useVacationProperty(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['vacation-rental', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from('vacation_rentals')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      return data as VacationRental;
    },
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { company } = useCurrentCompany();

  return useMutation({
    mutationFn: async (data: Partial<VacationRental>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('vacation_rentals')
        .insert({
          ...data,
          company_id: company.id,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-rentals'] });
      toast.success('物件を登録しました');
    },
    onError: (error) => {
      toast.error('物件の登録に失敗しました: ' + error.message);
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<VacationRental> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('vacation_rentals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vacation-rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vacation-rental', variables.id] });
      toast.success('物件情報を更新しました');
    },
    onError: (error) => {
      toast.error('物件の更新に失敗しました: ' + error.message);
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vacation_rentals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-rentals'] });
      toast.success('物件を削除しました');
    },
    onError: (error) => {
      toast.error('物件の削除に失敗しました: ' + error.message);
    },
  });
}

// === Bookings Hooks ===
export function useVacationBookings(propertyId?: string) {
  const { company } = useCurrentCompany();

  return useQuery({
    queryKey: ['vacation-bookings', company?.id, propertyId],
    queryFn: async () => {
      if (!company?.id) return [];

      let query = supabase
        .from('vacation_bookings')
        .select('*, property:vacation_rentals(*)')
        .eq('company_id', company.id)
        .order('check_in_date', { ascending: true });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as VacationBooking[];
    },
    enabled: !!company?.id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { company } = useCurrentCompany();

  return useMutation({
    mutationFn: async (data: Partial<VacationBooking>) => {
      if (!company?.id) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('vacation_bookings')
        .insert({
          ...data,
          company_id: company.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-bookings'] });
      toast.success('予約を登録しました');
    },
    onError: (error) => {
      toast.error('予約の登録に失敗しました: ' + error.message);
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<VacationBooking> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('vacation_bookings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-bookings'] });
      toast.success('予約を更新しました');
    },
    onError: (error) => {
      toast.error('予約の更新に失敗しました: ' + error.message);
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vacation_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-bookings'] });
      toast.success('予約を削除しました');
    },
    onError: (error) => {
      toast.error('予約の削除に失敗しました: ' + error.message);
    },
  });
}

// === Guests Hooks ===
export function useVacationGuests() {
  const { company } = useCurrentCompany();

  return useQuery({
    queryKey: ['vacation-guests', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from('vacation_guests')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as VacationGuest[];
    },
    enabled: !!company?.id,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  const { company } = useCurrentCompany();

  return useMutation({
    mutationFn: async (data: Partial<VacationGuest>) => {
      if (!company?.id) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('vacation_guests')
        .insert({
          ...data,
          company_id: company.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-guests'] });
      toast.success('ゲストを登録しました');
    },
    onError: (error) => {
      toast.error('ゲストの登録に失敗しました: ' + error.message);
    },
  });
}

// === Cleaning Tasks Hooks ===
export function useCleaningTasks(propertyId?: string) {
  const { company } = useCurrentCompany();

  return useQuery({
    queryKey: ['cleaning-tasks', company?.id, propertyId],
    queryFn: async () => {
      if (!company?.id) return [];

      let query = supabase
        .from('cleaning_tasks')
        .select('*, property:vacation_rentals(*), booking:vacation_bookings(*)')
        .eq('company_id', company.id)
        .order('scheduled_date', { ascending: true });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CleaningTask[];
    },
    enabled: !!company?.id,
  });
}

export function useCreateCleaningTask() {
  const queryClient = useQueryClient();
  const { company } = useCurrentCompany();

  return useMutation({
    mutationFn: async (data: Partial<CleaningTask>) => {
      if (!company?.id) throw new Error('No company selected');

      const { data: result, error } = await supabase
        .from('cleaning_tasks')
        .insert({
          ...data,
          company_id: company.id,
          checklist: data.checklist || [],
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      toast.success('清掃タスクを登録しました');
    },
    onError: (error) => {
      toast.error('清掃タスクの登録に失敗しました: ' + error.message);
    },
  });
}

export function useUpdateCleaningTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CleaningTask> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('cleaning_tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      toast.success('清掃タスクを更新しました');
    },
    onError: (error) => {
      toast.error('清掃タスクの更新に失敗しました: ' + error.message);
    },
  });
}

export function useCompleteCleaningTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('cleaning_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      toast.success('清掃を完了しました');
    },
    onError: (error) => {
      toast.error('完了処理に失敗しました: ' + error.message);
    },
  });
}

// === Operating Days Hook ===
export function useOperatingDays(propertyId: string | undefined, year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['operating-days', propertyId, currentYear],
    queryFn: async () => {
      if (!propertyId) return { days: 0, limit: 180 };

      const { data: property, error: propError } = await supabase
        .from('vacation_rentals')
        .select('annual_limit_days')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;

      const { data: bookings, error: bookError } = await supabase
        .from('vacation_bookings')
        .select('check_in_date, check_out_date')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'completed'])
        .gte('check_in_date', `${currentYear}-01-01`)
        .lte('check_in_date', `${currentYear}-12-31`);

      if (bookError) throw bookError;

      const days = (bookings || []).reduce((total, booking) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return total + nights;
      }, 0);

      return {
        days,
        limit: property?.annual_limit_days || 180,
      };
    },
    enabled: !!propertyId,
  });
}

// === Dashboard Stats ===
export function useVacationDashboardStats() {
  const { company } = useCurrentCompany();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['vacation-dashboard-stats', company?.id, today],
    queryFn: async () => {
      if (!company?.id) return null;

      // Today's check-ins
      const { data: checkIns } = await supabase
        .from('vacation_bookings')
        .select('*, property:vacation_rentals(name)')
        .eq('company_id', company.id)
        .eq('check_in_date', today)
        .eq('status', 'confirmed');

      // Today's check-outs
      const { data: checkOuts } = await supabase
        .from('vacation_bookings')
        .select('*, property:vacation_rentals(name)')
        .eq('company_id', company.id)
        .eq('check_out_date', today)
        .eq('status', 'confirmed');

      // Pending cleaning tasks
      const { data: pendingCleaning } = await supabase
        .from('cleaning_tasks')
        .select('*, property:vacation_rentals(name)')
        .eq('company_id', company.id)
        .eq('status', 'pending')
        .lte('scheduled_date', today);

      // Property count
      const { count: propertyCount } = await supabase
        .from('vacation_rentals')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'active');

      // This month's revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data: monthlyBookings } = await supabase
        .from('vacation_bookings')
        .select('total_price, cleaning_fee')
        .eq('company_id', company.id)
        .gte('check_in_date', startOfMonth.toISOString().split('T')[0])
        .in('status', ['confirmed', 'completed']);

      const monthlyRevenue = (monthlyBookings || []).reduce(
        (sum, b) => sum + Number(b.total_price) + Number(b.cleaning_fee),
        0
      );

      return {
        checkIns: checkIns || [],
        checkOuts: checkOuts || [],
        pendingCleaning: pendingCleaning || [],
        propertyCount: propertyCount || 0,
        monthlyRevenue,
      };
    },
    enabled: !!company?.id,
  });
}
