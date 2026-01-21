import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface InquiryQuestion {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';
  question: string;
  options?: string[];
  required: boolean;
}

export interface EmrInquiryTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  questions: InquiryQuestion[];
  is_active: boolean;
  created_at: string;
}

export interface EmrInquiryResponse {
  id: string;
  company_id: string;
  template_id: string | null;
  patient_id: string | null;
  reception_id: string | null;
  responses: Record<string, unknown>;
  submitted_at: string;
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
  };
  template?: {
    id: string;
    name: string;
  };
}

export function useEmrInquiryTemplates() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['emr-inquiry-templates', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_inquiry_templates')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        questions: Array.isArray(d.questions) ? d.questions as unknown as InquiryQuestion[] : []
      })) as EmrInquiryTemplate[];
    },
    enabled: !!currentCompany?.id,
  });

  const createTemplate = useMutation({
    mutationFn: async (data: Omit<EmrInquiryTemplate, 'id' | 'company_id' | 'created_at'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const insertData = {
        ...data,
        questions: data.questions as unknown as Json,
        company_id: currentCompany.id,
      };

      const { data: result, error } = await supabase
        .from('emr_inquiry_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-inquiry-templates'] });
      toast.success('問診テンプレートを作成しました');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrInquiryTemplate> & { id: string }) => {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      if (data.questions) {
        updateData.questions = data.questions as unknown as Json;
      }

      const { error } = await supabase
        .from('emr_inquiry_templates')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-inquiry-templates'] });
      toast.success('テンプレートを更新しました');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('emr_inquiry_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-inquiry-templates'] });
      toast.success('テンプレートを削除しました');
    },
  });

  return { templates: templates || [], isLoading, createTemplate, updateTemplate, deleteTemplate };
}

export function useEmrInquiryResponses() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: responses, isLoading } = useQuery({
    queryKey: ['emr-inquiry-responses', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_inquiry_responses')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number),
          template:emr_inquiry_templates(id, name)
        `)
        .eq('company_id', currentCompany.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as EmrInquiryResponse[];
    },
    enabled: !!currentCompany?.id,
  });

  const createResponse = useMutation({
    mutationFn: async (data: Omit<EmrInquiryResponse, 'id' | 'created_at' | 'patient' | 'template'>) => {
      const insertData = {
        ...data,
        responses: data.responses as unknown as Json,
      };

      const { data: result, error } = await supabase
        .from('emr_inquiry_responses')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-inquiry-responses'] });
      toast.success('問診を送信しました');
    },
  });

  return { responses: responses || [], isLoading, createResponse };
}
