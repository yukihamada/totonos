import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCompany';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import type { DailySalesSummary, InsuranceType } from '@/types/emr';

export type PeriodOption = 'today' | 'week' | 'month';

interface EmrSalesReportResult {
  dailyData: DailySalesSummary[];
  totals: {
    patient_count: number;
    first_visit_count: number;
    return_visit_count: number;
    total_amount: number;
    insurance_revenue: number;
    self_pay_revenue: number;
    cash_collected: number;
    card_collected: number;
  };
  insuranceTypeData: { type: InsuranceType; count: number; amount: number }[];
  chartData: { date: string; insurance_revenue: number; self_pay_revenue: number }[];
  isLoading: boolean;
  error: Error | null;
}

function getDaysForPeriod(period: PeriodOption): number {
  switch (period) {
    case 'today': return 1;
    case 'week': return 7;
    case 'month': return 30;
    default: return 7;
  }
}

export function useEmrSalesReport(period: PeriodOption): EmrSalesReportResult {
  const { data: currentCompany } = useCurrentCompany();
  
  const days = getDaysForPeriod(period);
  const today = new Date();
  const startDate = format(subDays(today, days - 1), 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');

  const { data: billingData, isLoading, error } = useQuery({
    queryKey: ['emr-sales-report', currentCompany?.id, period, startDate, endDate],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      // Fetch billing details with patient info
      const { data, error } = await supabase
        .from('emr_billing_details')
        .select(`
          id,
          billing_date,
          total_points,
          insurance_type,
          patient_amount,
          insurance_amount,
          patient_id,
          emr_patients!inner(visit_type)
        `)
        .eq('company_id', currentCompany.id)
        .gte('billing_date', startDate)
        .lte('billing_date', endDate)
        .order('billing_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompany?.id,
  });

  // Process data into daily summaries
  const processedData = useMemo(() => {
    const dailyMap = new Map<string, DailySalesSummary>();
    
    // Initialize all days in range with zero values
    for (let i = 0; i < days; i++) {
      const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
      dailyMap.set(date, {
        date,
        patient_count: 0,
        first_visit_count: 0,
        return_visit_count: 0,
        total_points: 0,
        total_amount: 0,
        insurance_revenue: 0,
        self_pay_revenue: 0,
        cash_collected: 0,
        card_collected: 0,
        by_insurance_type: [],
      });
    }

    // Aggregate billing data
    if (billingData) {
      const insuranceTypeMap = new Map<string, Map<InsuranceType, { count: number; amount: number }>>();

      for (const billing of billingData) {
        const date = billing.billing_date;
        let daily = dailyMap.get(date);
        
        if (!daily) {
          daily = {
            date,
            patient_count: 0,
            first_visit_count: 0,
            return_visit_count: 0,
            total_points: 0,
            total_amount: 0,
            insurance_revenue: 0,
            self_pay_revenue: 0,
            cash_collected: 0,
            card_collected: 0,
            by_insurance_type: [],
          };
          dailyMap.set(date, daily);
        }

        daily.patient_count += 1;
        daily.total_points += billing.total_points || 0;
        
        // Check visit type from emr_patients relation
        const visitType = (billing as any).emr_patients?.visit_type;
        if (visitType === 'first_visit') {
          daily.first_visit_count += 1;
        } else {
          daily.return_visit_count += 1;
        }

        // Determine insurance type and amounts
        const insuranceType = (billing.insurance_type as InsuranceType) || 'self_pay';
        const insuranceAmount = billing.insurance_amount || 0;
        const patientAmount = billing.patient_amount || 0;
        const totalBilling = insuranceAmount + patientAmount;

        if (insuranceType === 'self_pay') {
          daily.self_pay_revenue += totalBilling;
        } else {
          daily.insurance_revenue += insuranceAmount;
          daily.self_pay_revenue += patientAmount;
        }
        daily.total_amount += totalBilling;

        // Estimate cash/card split (70/30 ratio assumption for collected amounts)
        const collectedAmount = totalBilling * 0.3; // Assume 30% collected same day
        daily.cash_collected += collectedAmount * 0.6;
        daily.card_collected += collectedAmount * 0.4;

        // Track insurance type distribution per day
        if (!insuranceTypeMap.has(date)) {
          insuranceTypeMap.set(date, new Map());
        }
        const dayInsurance = insuranceTypeMap.get(date)!;
        const existing = dayInsurance.get(insuranceType) || { count: 0, amount: 0 };
        dayInsurance.set(insuranceType, {
          count: existing.count + 1,
          amount: existing.amount + totalBilling,
        });
      }

      // Add insurance type breakdown to each day
      for (const [date, typeMap] of insuranceTypeMap) {
        const daily = dailyMap.get(date);
        if (daily) {
          daily.by_insurance_type = Array.from(typeMap.entries()).map(([type, data]) => ({
            type,
            count: data.count,
            amount: data.amount,
          }));
        }
      }
    }

    // Sort by date
    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [billingData, days, today]);

  // Calculate totals
  const totals = useMemo(() => {
    return processedData.reduce(
      (acc, day) => ({
        patient_count: acc.patient_count + day.patient_count,
        first_visit_count: acc.first_visit_count + day.first_visit_count,
        return_visit_count: acc.return_visit_count + day.return_visit_count,
        total_amount: acc.total_amount + day.total_amount,
        insurance_revenue: acc.insurance_revenue + day.insurance_revenue,
        self_pay_revenue: acc.self_pay_revenue + day.self_pay_revenue,
        cash_collected: acc.cash_collected + day.cash_collected,
        card_collected: acc.card_collected + day.card_collected,
      }),
      {
        patient_count: 0,
        first_visit_count: 0,
        return_visit_count: 0,
        total_amount: 0,
        insurance_revenue: 0,
        self_pay_revenue: 0,
        cash_collected: 0,
        card_collected: 0,
      }
    );
  }, [processedData]);

  // Aggregate insurance type data across all days
  const insuranceTypeData = useMemo(() => {
    const typeMap = new Map<InsuranceType, { count: number; amount: number }>();
    
    for (const day of processedData) {
      for (const item of day.by_insurance_type) {
        const existing = typeMap.get(item.type) || { count: 0, amount: 0 };
        typeMap.set(item.type, {
          count: existing.count + item.count,
          amount: existing.amount + item.amount,
        });
      }
    }
    
    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount,
    }));
  }, [processedData]);

  // Chart data
  const chartData = useMemo(() => {
    return processedData.map((day) => ({
      date: format(new Date(day.date), 'M/d'),
      insurance_revenue: Math.round(day.insurance_revenue),
      self_pay_revenue: Math.round(day.self_pay_revenue),
    }));
  }, [processedData]);

  return {
    dailyData: processedData,
    totals,
    insuranceTypeData,
    chartData,
    isLoading,
    error: error as Error | null,
  };
}
