import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { 
  ImportJob, 
  ImportTemplate, 
  MappingConfig, 
  SourceService, 
  TargetModule 
} from '@/types/import';

export function useDataImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['import-jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ImportJob[];
    },
    enabled: !!user,
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['import-templates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ImportTemplate[];
    },
    enabled: !!user,
  });

  const createJob = useMutation({
    mutationFn: async (params: {
      sourceService: SourceService;
      targetModule: TargetModule;
      fileName?: string;
      mappingConfig?: MappingConfig;
    }) => {
      if (!user) throw new Error('ログインが必要です');
      const { data, error } = await supabase
        .from('import_jobs')
        .insert([{
          user_id: user.id,
          source_service: params.sourceService,
          target_module: params.targetModule,
          file_name: params.fileName,
          mapping_config: params.mappingConfig as unknown as Record<string, unknown>,
          status: 'pending',
        }])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ImportJob;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['import-jobs'] }),
  });

  const updateJobStatus = useMutation({
    mutationFn: async (params: {
      jobId: string;
      status: ImportJob['status'];
      processedRows?: number;
      errorRows?: number;
      errorSummary?: Record<string, unknown>;
    }) => {
      const updateData: Record<string, unknown> = { status: params.status };
      if (params.processedRows !== undefined) updateData.processed_rows = params.processedRows;
      if (params.errorRows !== undefined) updateData.error_rows = params.errorRows;
      if (params.errorSummary) updateData.error_summary = params.errorSummary;
      if (params.status === 'processing') updateData.started_at = new Date().toISOString();
      if (params.status === 'completed' || params.status === 'failed') updateData.completed_at = new Date().toISOString();
      const { error } = await supabase.from('import_jobs').update(updateData).eq('id', params.jobId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['import-jobs'] }),
  });

  const saveTemplate = useMutation({
    mutationFn: async (params: {
      templateName: string;
      sourceService: SourceService;
      targetModule: TargetModule;
      mapping: MappingConfig;
      isDefault?: boolean;
    }) => {
      if (!user) throw new Error('ログインが必要です');
      const { data, error } = await supabase
        .from('import_templates')
        .insert([{
          user_id: user.id,
          template_name: params.templateName,
          source_service: params.sourceService,
          target_module: params.targetModule,
          mapping: params.mapping as unknown as Record<string, unknown>,
          is_default: params.isDefault || false,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ImportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] });
      toast({ title: 'テンプレートを保存しました' });
    },
  });

  const parseCSV = useCallback((file: File): Promise<{ headers: string[]; rows: string[][] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim());
          if (lines.length === 0) { reject(new Error('ファイルが空です')); return; }
          const headers = parseCSVLine(lines[0]);
          const rows = lines.slice(1).map(line => parseCSVLine(line));
          resolve({ headers, rows });
        } catch (error) { reject(error); }
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsText(file, 'UTF-8');
    });
  }, []);

  const processImport = useCallback(async (
    jobId: string,
    targetModule: TargetModule,
    rows: string[][],
    mappingConfig: MappingConfig
  ) => {
    const batchSize = 100;
    let processedCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; message: string }> = [];

    await updateJobStatus.mutateAsync({ jobId, status: 'processing' });

    try {
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const mappedRows = batch.map((row, idx) => {
          try { return mapRowToTarget(row, mappingConfig, user?.id || ''); }
          catch (error) {
            errors.push({ row: i + idx + (mappingConfig.skipFirstRow ? 2 : 1), message: error instanceof Error ? error.message : 'マッピングエラー' });
            errorCount++;
            return null;
          }
        }).filter(Boolean);

        if (mappedRows.length > 0) {
          const { error } = await supabase.from(targetModule).insert(mappedRows as Record<string, unknown>[]);
          if (error) { errorCount += mappedRows.length; errors.push({ row: i + 1, message: `バッチエラー: ${error.message}` }); }
          else { processedCount += mappedRows.length; }
        }
        setUploadProgress(Math.round(((i + batch.length) / rows.length) * 100));
        await updateJobStatus.mutateAsync({ jobId, status: 'processing', processedRows: processedCount, errorRows: errorCount });
      }
      await updateJobStatus.mutateAsync({ jobId, status: errorCount === rows.length ? 'failed' : 'completed', processedRows: processedCount, errorRows: errorCount, errorSummary: { totalErrors: errorCount, sampleErrors: errors.slice(0, 10).map(e => `行${e.row}: ${e.message}`) } });
      toast({ title: 'インポートが完了しました', description: `${processedCount}件成功、${errorCount}件エラー` });
    } catch (error) {
      await updateJobStatus.mutateAsync({ jobId, status: 'failed', errorSummary: { totalErrors: 1, sampleErrors: [error instanceof Error ? error.message : '不明なエラー'] } });
      toast({ title: 'インポートに失敗しました', description: error instanceof Error ? error.message : '不明なエラー', variant: 'destructive' });
    }
  }, [updateJobStatus, toast, user]);

  return { jobs, templates, jobsLoading, templatesLoading, uploadProgress, createJob: createJob.mutateAsync, saveTemplate: saveTemplate.mutateAsync, parseCSV, processImport, isCreating: createJob.isPending };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

function mapRowToTarget(row: string[], config: MappingConfig, userId: string): Record<string, unknown> {
  const result: Record<string, unknown> = { user_id: userId };
  for (const mapping of config.fieldMappings) {
    const sourceIndex = parseInt(mapping.sourceField, 10);
    let value: unknown = row[sourceIndex] || mapping.defaultValue || null;
    if (value && mapping.transform) {
      switch (mapping.transform) {
        case 'date': value = parseDate(value as string); break;
        case 'number': value = parseFloat((value as string).replace(/[,¥$]/g, '')) || 0; break;
        case 'boolean': value = ['true', '1', 'yes', 'はい', 'o', '○'].includes((value as string).toLowerCase()); break;
        case 'trim': value = (value as string).trim(); break;
      }
    }
    if (mapping.targetField) result[mapping.targetField] = value;
  }
  return result;
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const cleanValue = value.replace(/[年月]/g, '/').replace(/日/g, '');
  const date = new Date(cleanValue);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}
        }).filter(Boolean);

        if (mappedRows.length > 0) {
          const { error } = await supabase
            .from(targetModule)
            .insert(mappedRows as Record<string, unknown>[]);

          if (error) {
            // Handle batch errors
            errorCount += mappedRows.length;
            errors.push({
              row: i + 1,
              message: `バッチエラー: ${error.message}`,
            });
          } else {
            processedCount += mappedRows.length;
          }
        }

        // Update progress
        setUploadProgress(Math.round(((i + batch.length) / rows.length) * 100));
        
        await updateJobStatus.mutateAsync({
          jobId,
          status: 'processing',
          processedRows: processedCount,
          errorRows: errorCount,
        });
      }

      // Complete
      await updateJobStatus.mutateAsync({
        jobId,
        status: errorCount === rows.length ? 'failed' : 'completed',
        processedRows: processedCount,
        errorRows: errorCount,
        errorSummary: {
          totalErrors: errorCount,
          sampleErrors: errors.slice(0, 10).map(e => `行${e.row}: ${e.message}`),
        },
      });

      toast({
        title: 'インポートが完了しました',
        description: `${processedCount}件成功、${errorCount}件エラー`,
      });

    } catch (error) {
      await updateJobStatus.mutateAsync({
        jobId,
        status: 'failed',
        errorSummary: {
          totalErrors: 1,
          sampleErrors: [error instanceof Error ? error.message : '不明なエラー'],
        },
      });

      toast({
        title: 'インポートに失敗しました',
        description: error instanceof Error ? error.message : '不明なエラー',
        variant: 'destructive',
      });
    }
  }, [updateJobStatus, toast]);

  return {
    jobs,
    templates,
    jobsLoading,
    templatesLoading,
    uploadProgress,
    createJob: createJob.mutateAsync,
    saveTemplate: saveTemplate.mutateAsync,
    parseCSV,
    processImport,
    isCreating: createJob.isPending,
  };
}

// Helper function to parse CSV line
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Helper function to map row to target format
function mapRowToTarget(
  row: string[],
  config: MappingConfig
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const mapping of config.fieldMappings) {
    const sourceIndex = parseInt(mapping.sourceField, 10);
    let value: unknown = row[sourceIndex] || mapping.defaultValue || null;

    if (value && mapping.transform) {
      switch (mapping.transform) {
        case 'date':
          value = parseDate(value as string, config.dateFormat);
          break;
        case 'number':
          value = parseFloat((value as string).replace(/[,¥$]/g, '')) || 0;
          break;
        case 'boolean':
          value = ['true', '1', 'yes', 'はい', 'o', '○'].includes(
            (value as string).toLowerCase()
          );
          break;
        case 'trim':
          value = (value as string).trim();
          break;
      }
    }

    if (mapping.targetField) {
      result[mapping.targetField] = value;
    }
  }

  return result;
}

// Helper function to parse date
function parseDate(value: string, format?: string): string | null {
  if (!value) return null;
  
  // Try common formats
  const cleanValue = value.replace(/[年月]/g, '/').replace(/日/g, '');
  const date = new Date(cleanValue);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString().split('T')[0];
}
