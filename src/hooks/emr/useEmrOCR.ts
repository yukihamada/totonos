import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PatientOCRResult {
  name: string | null;
  name_kana: string | null;
  birth_date: string | null;
  gender: "male" | "female" | "other" | null;
  insurance_type: string | null;
  insurance_number: string | null;
  phone: string | null;
  address: string | null;
  allergies: string[];
  notes: string | null;
  confidence: number;
}

export interface MedicalRecordOCRResult {
  record_date: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vital_signs: {
    blood_pressure?: string;
    pulse?: number;
    temperature?: number;
    spo2?: number;
    weight?: number;
    height?: number;
  };
  prescriptions: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    days: number;
  }>;
  confidence: number;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useEmrPatientOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PatientOCRResult | null>(null);

  const processImage = async (file: File): Promise<PatientOCRResult | null> => {
    setIsProcessing(true);
    setProgress(10);
    setResult(null);

    try {
      const base64 = await fileToBase64(file);
      setProgress(30);

      const { data, error } = await supabase.functions.invoke("ocr-emr", {
        body: {
          imageBase64: base64,
          type: "patient",
        },
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message || "OCR処理に失敗しました");
      }

      const ocrResult = data.result as PatientOCRResult;
      setResult(ocrResult);

      toast.success("画像を読み取りました", {
        description: `信頼度: ${Math.round(ocrResult.confidence * 100)}%`,
      });

      return ocrResult;
    } catch (error) {
      console.error("OCR error:", error);
      toast.error("画像の読み取りに失敗しました", {
        description: error instanceof Error ? error.message : "不明なエラー",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    processImage,
    isProcessing,
    progress,
    result,
    reset,
  };
}

export function useEmrRecordOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MedicalRecordOCRResult | null>(null);

  const processImage = async (file: File): Promise<MedicalRecordOCRResult | null> => {
    setIsProcessing(true);
    setProgress(10);
    setResult(null);

    try {
      const base64 = await fileToBase64(file);
      setProgress(30);

      const { data, error } = await supabase.functions.invoke("ocr-emr", {
        body: {
          imageBase64: base64,
          type: "record",
        },
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message || "OCR処理に失敗しました");
      }

      const ocrResult = data.result as MedicalRecordOCRResult;
      setResult(ocrResult);

      toast.success("カルテ画像を読み取りました", {
        description: `信頼度: ${Math.round(ocrResult.confidence * 100)}%`,
      });

      return ocrResult;
    } catch (error) {
      console.error("OCR error:", error);
      toast.error("画像の読み取りに失敗しました", {
        description: error instanceof Error ? error.message : "不明なエラー",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    processImage,
    isProcessing,
    progress,
    result,
    reset,
  };
}
