import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceSelector } from "@/components/import/ServiceSelector";
import { ModuleSelector } from "@/components/import/ModuleSelector";
import { FileUploader } from "@/components/import/FileUploader";
import { FieldMapper } from "@/components/import/FieldMapper";
import { ImportProgress } from "@/components/import/ImportProgress";
import { useDataImport } from "@/hooks/useDataImport";
import { useAuth } from "@/hooks/useAuth";
import type { SourceService, TargetModule, MappingConfig, ImportJob } from "@/types/import";
import { ArrowLeft, ArrowRight, Upload, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Step = 'service' | 'module' | 'upload' | 'mapping' | 'progress';

export default function DataImport() {
  const { user } = useAuth();
  const { 
    jobs, 
    parseCSV, 
    createJob, 
    processImport, 
    uploadProgress,
    isCreating 
  } = useDataImport();

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<SourceService | null>(null);
  const [selectedModule, setSelectedModule] = useState<TargetModule | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [mappingConfig, setMappingConfig] = useState<MappingConfig | null>(null);
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleServiceSelect = (service: SourceService) => {
    setSelectedService(service);
  };

  const handleModuleSelect = (module: TargetModule) => {
    setSelectedModule(module);
  };

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const data = await parseCSV(selectedFile);
      setParsedData(data);
    } catch (error) {
      console.error('Failed to parse file:', error);
    }
  }, [parseCSV]);

  const handleMappingChange = useCallback((config: MappingConfig) => {
    setMappingConfig(config);
  }, []);

  const handleStartImport = async () => {
    if (!selectedService || !selectedModule || !parsedData || !mappingConfig || !user) {
      return;
    }

    try {
      const job = await createJob({
        sourceService: selectedService,
        targetModule: selectedModule,
        fileName: file?.name,
        mappingConfig,
      });

      // Update job with total rows
      const jobWithTotal = { 
        ...job, 
        total_rows: parsedData.rows.length 
      };
      setCurrentJob(jobWithTotal);
      setStep('progress');

      // Start processing
      await processImport(
        job.id,
        selectedModule,
        parsedData.rows,
        mappingConfig
      );

    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleClose = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedModule(null);
    setFile(null);
    setParsedData(null);
    setMappingConfig(null);
    setCurrentJob(null);
  };

  const canProceed = () => {
    switch (step) {
      case 'service':
        return !!selectedService;
      case 'module':
        return !!selectedModule;
      case 'upload':
        return !!parsedData;
      case 'mapping':
        return !!mappingConfig && mappingConfig.fieldMappings.some(m => m.sourceField);
      default:
        return false;
    }
  };

  const goNext = () => {
    switch (step) {
      case 'service':
        setStep('module');
        break;
      case 'module':
        setStep('upload');
        break;
      case 'upload':
        setStep('mapping');
        break;
      case 'mapping':
        handleStartImport();
        break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'module':
        setStep('service');
        break;
      case 'upload':
        setStep('module');
        break;
      case 'mapping':
        setStep('upload');
        break;
    }
  };

  const getStepNumber = () => {
    const steps: Step[] = ['service', 'module', 'upload', 'mapping', 'progress'];
    return steps.indexOf(step) + 1;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline',
      cancelled: 'outline',
    };
    const labels: Record<string, string> = {
      completed: '完了',
      processing: '処理中',
      failed: '失敗',
      pending: '待機中',
      cancelled: 'キャンセル',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">データインポート</h1>
            <p className="text-muted-foreground">
              他サービスからデータを移行
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4 mr-2" />
            インポート履歴
          </Button>
        </div>

        {showHistory ? (
          <Card>
            <CardHeader>
              <CardTitle>インポート履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  インポート履歴がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {job.source_service} → {job.target_module}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {job.file_name || 'ファイル名なし'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(job.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(job.status)}
                        <p className="text-sm mt-1">
                          {job.processed_rows}/{job.total_rows} 件
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : step === 'progress' ? (
          <ImportProgress
            job={currentJob}
            progress={uploadProgress}
            onClose={handleClose}
          />
        ) : (
          <>
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {['サービス', 'モジュール', 'アップロード', 'マッピング'].map((label, i) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      i + 1 <= getStepNumber()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="ml-2 text-sm hidden sm:inline">{label}</span>
                  {i < 3 && (
                    <div className="w-8 h-0.5 bg-muted mx-2" />
                  )}
                </div>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6">
                {step === 'service' && (
                  <ServiceSelector
                    selected={selectedService}
                    onSelect={handleServiceSelect}
                  />
                )}

                {step === 'module' && selectedService && (
                  <ModuleSelector
                    sourceService={selectedService}
                    selected={selectedModule}
                    onSelect={handleModuleSelect}
                  />
                )}

                {step === 'upload' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">ファイルをアップロード</h3>
                      <p className="text-sm text-muted-foreground">
                        インポートするCSVまたはExcelファイルを選択してください
                      </p>
                    </div>
                    <FileUploader onFileSelect={handleFileSelect} />
                    {parsedData && (
                      <p className="text-sm text-muted-foreground">
                        {parsedData.rows.length}件のデータを検出しました
                      </p>
                    )}
                  </div>
                )}

                {step === 'mapping' && selectedModule && parsedData && (
                  <FieldMapper
                    targetModule={selectedModule}
                    sourceHeaders={parsedData.headers}
                    previewRows={parsedData.rows}
                    onMappingChange={handleMappingChange}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={step === 'service'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              <Button
                onClick={goNext}
                disabled={!canProceed() || isCreating}
              >
                {step === 'mapping' ? (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    インポート開始
                  </>
                ) : (
                  <>
                    次へ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
