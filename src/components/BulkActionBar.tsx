import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  itemLabel?: string;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
  itemLabel = '件',
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {selectedCount}{itemLabel}を選択中
        </span>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
