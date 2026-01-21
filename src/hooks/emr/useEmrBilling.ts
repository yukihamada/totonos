import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface BillingItem {
  code: string;
  name: string;
  category: string;
  points: number;
  quantity: number;
}

export interface EmrBillingDetail {
  id: string;
  company_id: string;
  reception_id: string | null;
  patient_id: string | null;
  billing_date: string;
  items: BillingItem[];
  total_points: number;
  insurance_type: string | null;
  copay_ratio: number;
  patient_amount: number;
  insurance_amount: number;
  payment_status: 'unpaid' | 'paid' | 'partial';
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
  };
}

export interface EmrBillingMaster {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category: string | null;
  points: number;
  is_active: boolean;
}

export interface EmrReceipt {
  id: string;
  company_id: string;
  billing_month: string;
  patient_id: string | null;
  receipt_data: Record<string, unknown>;
  total_points: number;
  status: 'draft' | 'submitted' | 'returned' | 'approved';
  submitted_at: string | null;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
  };
}

export function useEmrBilling(date?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: billings, isLoading, error } = useQuery({
    queryKey: ['emr-billing', currentCompany?.id, date],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_billing_details')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number)
        `)
        .eq('company_id', currentCompany.id)
        .order('billing_date', { ascending: false });

      if (date) {
        query = query.eq('billing_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        items: Array.isArray(d.items) ? d.items as unknown as BillingItem[] : []
      })) as EmrBillingDetail[];
    },
    enabled: !!currentCompany?.id,
  });

  const createBilling = useMutation({
    mutationFn: async (data: Omit<EmrBillingDetail, 'id' | 'created_at' | 'patient' | 'company_id'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');

      const totalAmount = data.total_points * 10;
      const patientAmount = Math.floor(totalAmount * (data.copay_ratio / 100));
      const insuranceAmount = totalAmount - patientAmount;

      const insertData = {
        ...data,
        items: data.items as unknown as Json,
        company_id: currentCompany.id,
        patient_amount: patientAmount,
        insurance_amount: insuranceAmount,
      };

      const { data: result, error } = await supabase
        .from('emr_billing_details')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-billing'] });
      toast.success('会計を登録しました');
    },
    onError: (error) => {
      toast.error('会計の登録に失敗しました');
      console.error(error);
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, payment_status, payment_method }: { 
      id: string; 
      payment_status: EmrBillingDetail['payment_status'];
      payment_method?: string;
    }) => {
      const { error } = await supabase
        .from('emr_billing_details')
        .update({ 
          payment_status, 
          payment_method,
          paid_at: payment_status === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-billing'] });
      toast.success('入金状況を更新しました');
    },
  });

  return { billings: billings || [], isLoading, error, createBilling, updatePayment };
}

export function useEmrBillingMasters() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: masters, isLoading } = useQuery({
    queryKey: ['emr-billing-masters', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_billing_masters')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('category')
        .order('code');

      if (error) throw error;
      return data as EmrBillingMaster[];
    },
    enabled: !!currentCompany?.id,
  });

  const createMaster = useMutation({
    mutationFn: async (data: Omit<EmrBillingMaster, 'id' | 'company_id' | 'is_active'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_billing_masters')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-billing-masters'] });
      toast.success('診療報酬マスタを追加しました');
    },
  });

  return { masters: masters || [], isLoading, createMaster };
}

export function useEmrReceipts(month?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['emr-receipts', currentCompany?.id, month],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_receipts')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number)
        `)
        .eq('company_id', currentCompany.id)
        .order('billing_month', { ascending: false });

      if (month) {
        query = query.eq('billing_month', month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmrReceipt[];
    },
    enabled: !!currentCompany?.id,
  });

  const createReceipt = useMutation({
    mutationFn: async (data: Omit<EmrReceipt, 'id' | 'company_id' | 'patient'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const insertData = {
        ...data,
        receipt_data: data.receipt_data as unknown as Json,
        company_id: currentCompany.id,
      };

      const { data: result, error } = await supabase
        .from('emr_receipts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-receipts'] });
      toast.success('レセプトを作成しました');
    },
  });

  const updateReceiptStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmrReceipt['status'] }) => {
      const { error } = await supabase
        .from('emr_receipts')
        .update({ 
          status,
          submitted_at: status === 'submitted' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-receipts'] });
      toast.success('レセプトステータスを更新しました');
    },
  });

  return { receipts: receipts || [], isLoading, createReceipt, updateReceiptStatus };
}
