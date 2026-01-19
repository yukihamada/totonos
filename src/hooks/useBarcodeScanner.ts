import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export interface ScanResult {
  code: string;
  format: string;
}

export interface BarcodeScannerOptions {
  onScan: (result: ScanResult) => void;
  onError?: (error: string) => void;
  formats?: Html5QrcodeSupportedFormats[];
}

interface CameraDevice {
  id: string;
  label: string;
}

export function useBarcodeScanner(options: BarcodeScannerOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementIdRef = useRef<string>('barcode-scanner-' + Date.now());

  // Supported barcode formats (EAN-8, EAN-13, UPC-A, CODE-128)
  const supportedFormats = options.formats ?? [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.CODE_128,
  ];

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      const formattedDevices = devices.map((device) => ({
        id: device.id,
        label: device.label || `カメラ ${device.id}`,
      }));
      setCameras(formattedDevices);
      
      // Prefer back camera
      const backCamera = formattedDevices.find(
        (d) => d.label.toLowerCase().includes('back') || 
               d.label.toLowerCase().includes('rear') ||
               d.label.includes('背面')
      );
      setSelectedCamera(backCamera?.id || formattedDevices[0]?.id || null);
      setHasPermission(true);
      return formattedDevices;
    } catch (err) {
      console.error('Failed to get cameras:', err);
      setHasPermission(false);
      setError('カメラへのアクセス許可が必要です');
      return [];
    }
  }, []);

  // Validate JAN code check digit
  const validateJanCode = (code: string): boolean => {
    if (!/^\d{8}$|^\d{13}$/.test(code)) {
      return false;
    }
    
    const digits = code.split('').map(Number);
    const checkDigit = digits.pop()!;
    const sum = digits.reduce((acc, digit, index) => {
      const weight = code.length === 13 
        ? (index % 2 === 0 ? 1 : 3)
        : (index % 2 === 0 ? 3 : 1);
      return acc + digit * weight;
    }, 0);
    const calculatedCheck = (10 - (sum % 10)) % 10;
    
    return calculatedCheck === checkDigit;
  };

  // Start scanning
  const startScanning = useCallback(async (elementId?: string) => {
    const targetId = elementId || elementIdRef.current;
    
    if (!selectedCamera) {
      const cams = await getCameras();
      if (cams.length === 0) {
        setError('カメラが見つかりません');
        return;
      }
    }

    try {
      // Clean up existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore stop errors
        }
        scannerRef.current.clear();
      }

      const scanner = new Html5Qrcode(targetId);
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera || { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText, decodedResult) => {
          // Validate the barcode
          const format = decodedResult.result.format?.formatName || 'UNKNOWN';
          
          // For EAN codes, validate check digit
          if ((format === 'EAN_13' || format === 'EAN_8') && !validateJanCode(decodedText)) {
            options.onError?.('無効なバーコードです（チェックディジットエラー）');
            return;
          }

          // Success - provide haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }

          options.onScan({
            code: decodedText,
            format,
          });
        },
        undefined // Ignore scan failures (normal when no barcode in frame)
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setError('スキャナーの起動に失敗しました');
      options.onError?.('スキャナーの起動に失敗しました');
    }
  }, [selectedCamera, getCameras, options, supportedFormats]);

  // Stop scanning
  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Switch camera
  const switchCamera = useCallback(async (cameraId: string) => {
    setSelectedCamera(cameraId);
    if (isScanning) {
      await stopScanning();
      // Small delay to ensure cleanup
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  }, [isScanning, stopScanning, startScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  // Initialize cameras on mount
  useEffect(() => {
    getCameras();
  }, [getCameras]);

  return {
    isScanning,
    startScanning,
    stopScanning,
    cameras,
    selectedCamera,
    switchCamera,
    hasPermission,
    error,
    elementId: elementIdRef.current,
    validateJanCode,
  };
}
