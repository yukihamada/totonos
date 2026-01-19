import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Scan } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface BarcodeScanButtonProps {
  onScan: (code: string) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function BarcodeScanButton({ 
  onScan, 
  variant = 'outline',
  size = 'icon',
  className,
  children,
}: BarcodeScanButtonProps) {
  const [open, setOpen] = useState(false);

  const handleScan = (code: string) => {
    onScan(code);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        {children ?? <Scan className="h-4 w-4" />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>バーコードをスキャン</DialogTitle>
            <DialogDescription>
              カメラにバーコードを向けるか、手動で入力してください
            </DialogDescription>
          </DialogHeader>
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
