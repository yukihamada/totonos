import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  CameraOff, 
  FlipHorizontal, 
  AlertCircle,
  Keyboard,
  Loader2,
  Check,
} from 'lucide-react';
import { useBarcodeScanner, type ScanResult } from '@/hooks/useBarcodeScanner';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  autoStart?: boolean;
}

export function BarcodeScanner({ onScan, onClose, autoStart = true }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = useCallback((result: ScanResult) => {
    setLastScanned(result.code);
    setScanError(null);
  }, []);

  const handleError = useCallback((error: string) => {
    setScanError(error);
  }, []);

  const {
    isScanning,
    startScanning,
    stopScanning,
    cameras,
    selectedCamera,
    switchCamera,
    hasPermission,
    error,
    elementId,
    validateJanCode,
  } = useBarcodeScanner({
    onScan: handleScan,
    onError: handleError,
  });

  // Auto-start scanning
  useEffect(() => {
    if (autoStart && hasPermission && !isScanning) {
      const timer = setTimeout(() => {
        startScanning(elementId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasPermission, isScanning, startScanning, elementId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleConfirm = () => {
    if (lastScanned) {
      onScan(lastScanned);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput) return;
    
    if (!validateJanCode(manualInput)) {
      setScanError('無効なJANコードです');
      return;
    }
    
    onScan(manualInput);
  };

  const handleCameraSwitch = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    switchCamera(cameras[nextIndex].id);
  };

  return (
    <div className="space-y-4">
      {/* Camera Permission Error */}
      {hasPermission === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可してください。
          </AlertDescription>
        </Alert>
      )}

      {/* Scanner Error */}
      {(error || scanError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || scanError}</AlertDescription>
        </Alert>
      )}

      {/* Camera Preview */}
      {!showManualInput && (
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <div 
            id={elementId} 
            className="w-full aspect-[4/3]"
            style={{ minHeight: '300px' }}
          />
          
          {!isScanning && hasPermission !== false && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Camera Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {cameras.length > 1 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCameraSwitch}
                className="bg-background/80 backdrop-blur"
              >
                <FlipHorizontal className="h-4 w-4 mr-1" />
                切替
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => isScanning ? stopScanning() : startScanning(elementId)}
              className="bg-background/80 backdrop-blur"
            >
              {isScanning ? (
                <>
                  <CameraOff className="h-4 w-4 mr-1" />
                  停止
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-1" />
                  開始
                </>
              )}
            </Button>
          </div>

          {/* Scan Frame Guide */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-24 border-2 border-primary rounded-lg">
                <div className="absolute -top-6 left-0 right-0 text-center text-xs text-primary bg-background/80 py-1 rounded">
                  バーコードを枠内に合わせてください
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Selection */}
      {cameras.length > 1 && !showManualInput && (
        <div className="space-y-2">
          <Label>カメラを選択</Label>
          <Select value={selectedCamera || ''} onValueChange={switchCamera}>
            <SelectTrigger>
              <SelectValue placeholder="カメラを選択" />
            </SelectTrigger>
            <SelectContent>
              {cameras.map((camera) => (
                <SelectItem key={camera.id} value={camera.id}>
                  {camera.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Scan Result */}
      {lastScanned && (
        <Alert className="border-primary bg-primary/10">
          <Check className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-mono text-lg">{lastScanned}</span>
            <Button size="sm" onClick={handleConfirm}>
              この値を使用
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Manual Input Toggle */}
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManualInput(!showManualInput)}
        >
          <Keyboard className="h-4 w-4 mr-1" />
          {showManualInput ? 'カメラで読み取る' : '手動で入力する'}
        </Button>
      </div>

      {/* Manual Input Form */}
      {showManualInput && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-jan">JANコードを入力</Label>
            <Input
              id="manual-jan"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="4901234567890"
              maxLength={13}
              className="font-mono text-lg text-center tracking-wider"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              8桁または13桁の数字を入力してください
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowManualInput(false)}
            >
              戻る
            </Button>
            <Button
              className="flex-1"
              onClick={handleManualSubmit}
              disabled={!manualInput || manualInput.length < 8}
            >
              確定
            </Button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {!showManualInput && (
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            キャンセル
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleConfirm}
            disabled={!lastScanned}
          >
            確定
          </Button>
        </div>
      )}
    </div>
  );
}
