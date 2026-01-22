import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { format } from "date-fns";

export interface AppointmentDashboardStats {
  todayAppointmentsCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  nextAppointment: {
    time: string;
    patientName: string;
    doctorName: string;
  } | null;
  hourlyBreakdown: Array<{
    hour: string;
    count: number;
  }>;
}

export function useAppointmentDashboardStats() {
  const { data: currentCompany } = useCurrentCompany();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = format(new Date(), 'HH:mm');

  return useQuery({
    queryKey: ['appointment-dashboard-stats', currentCompany?.id, today],
    queryFn: async (): Promise<AppointmentDashboardStats> => {
      if (!currentCompany?.id) {
        return {
          todayAppointmentsCount: 0,
          confirmedCount: 0,
          pendingCount: 0,
          cancelledCount: 0,
          nextAppointment: null,
          hourlyBreakdown: [],
        };
      }

      // Fetch today's appointments
      const { data: appointments, error } = await supabase
        .from('emr_appointments')
        .select(`
          id,
          appointment_time,
          status,
          doctor_name,
          patient:emr_patients (
            name
          )
        `)
        .eq('company_id', currentCompany.id)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
      }

      const appts = appointments || [];
      
      // Calculate status counts
      const confirmed = appts.filter(a => a.status === 'confirmed').length;
      const pending = appts.filter(a => a.status === 'scheduled').length;
      const cancelled = appts.filter(a => a.status === 'cancelled').length;

      // Find next appointment (upcoming and not cancelled)
      const upcoming = appts.find(a => 
        a.appointment_time >= now && 
        a.status !== 'cancelled' &&
        a.status !== 'completed'
      );

      const nextAppointment = upcoming ? {
        time: upcoming.appointment_time,
        patientName: (upcoming.patient as { name?: string } | null)?.name || '患者情報なし',
        doctorName: upcoming.doctor_name || '担当医未定',
      } : null;

      // Calculate hourly breakdown (9:00-18:00)
      const hours = ['09', '10', '11', '12', '13', '14', '15', '16', '17'];
      const hourlyBreakdown = hours.map(hour => ({
        hour: `${hour}:00`,
        count: appts.filter(a => 
          a.appointment_time?.startsWith(hour) &&
          a.status !== 'cancelled'
        ).length,
      }));

      return {
        todayAppointmentsCount: appts.filter(a => a.status !== 'cancelled').length,
        confirmedCount: confirmed,
        pendingCount: pending,
        cancelledCount: cancelled,
        nextAppointment,
        hourlyBreakdown,
      };
    },
    enabled: !!currentCompany?.id,
    staleTime: 30000,
  });
}
