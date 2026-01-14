import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Estimate = Tables<'estimates'>;
type EstimateItem = Tables<'estimate_items'>;

export function useEstimates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['estimates', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useEstimate(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['estimate', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          client:clients(id, name, email, address, phone),
          items:estimate_items(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

interface CreateEstimateInput {
  title: string;
  client_id?: string | null;
  description?: string | null;
  valid_until: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

function generateEstimateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EST-${year}${month}-${random}`;
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateEstimateInput) => {
      if (!user) throw new Error('ログインが必要です');

      // Calculate totals
      const amount = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const taxAmount = Math.floor(amount * 0.1); // 10% tax
      const totalAmount = amount + taxAmount;

      // Create estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          user_id: user.id,
          estimate_number: generateEstimateNumber(),
          title: input.title,
          client_id: input.client_id,
          description: input.description,
          valid_until: input.valid_until,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'draft',
        })
        .select()
        .single();

      if (estimateError) throw estimateError;

      // Create estimate items
      if (input.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('estimate_items')
          .insert(
            input.items.map(item => ({
              estimate_id: estimate.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.quantity * item.unit_price,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return estimate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('見積書を作成しました');
    },
    onError: (error) => {
      toast.error('見積書の作成に失敗しました: ' + error.message);
    },
  });
}

export function useUpdateEstimateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Estimate['status'] }) => {
      const updateData: Partial<Estimate> = { status };

      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('estimates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['estimate', data.id] });
      toast.success('見積書のステータスを更新しました');
    },
    onError: (error) => {
      toast.error('ステータスの更新に失敗しました: ' + error.message);
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete items first
      await supabase.from('estimate_items').delete().eq('estimate_id', id);

      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('見積書を削除しました');
    },
    onError: (error) => {
      toast.error('見積書の削除に失敗しました: ' + error.message);
    },
  });
}

// Convert estimate to invoice
export function useConvertEstimateToInvoice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (estimateId: string) => {
      if (!user) throw new Error('ログインが必要です');

      // Get estimate with items
      const { data: estimate, error: fetchError } = await supabase
        .from('estimates')
        .select(`
          *,
          items:estimate_items(*)
        `)
        .eq('id', estimateId)
        .single();

      if (fetchError) throw fetchError;
      if (!estimate) throw new Error('見積書が見つかりません');

      // Generate invoice number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const invoiceNumber = `INV-${year}${month}-${random}`;

      // Calculate due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          title: estimate.title,
          client_id: estimate.client_id,
          description: `見積書 ${estimate.estimate_number} から作成`,
          due_date: dueDate.toISOString().split('T')[0],
          amount: estimate.amount,
          tax_amount: estimate.tax_amount,
          total_amount: estimate.total_amount,
          status: 'draft',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (estimate.items && estimate.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            estimate.items.map((item: EstimateItem) => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Update estimate status to accepted
      await supabase
        .from('estimates')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', estimateId);

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('見積書から請求書を作成しました');
    },
    onError: (error) => {
      toast.error('請求書の作成に失敗しました: ' + error.message);
    },
  });
}
