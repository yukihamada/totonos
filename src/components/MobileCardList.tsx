import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MobileCardListProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  renderTable: () => ReactNode;
  className?: string;
  cardClassName?: string;
}

/**
 * A responsive component that shows a table on desktop and cards on mobile.
 * Usage:
 * ```tsx
 * <MobileCardList
 *   items={data}
 *   renderCard={(item) => (
 *     <div>
 *       <h3>{item.name}</h3>
 *       <p>{item.description}</p>
 *     </div>
 *   )}
 *   renderTable={() => (
 *     <Table>...</Table>
 *   )}
 * />
 * ```
 */
export function MobileCardList<T>({
  items,
  renderCard,
  renderTable,
  className,
  cardClassName,
}: MobileCardListProps<T>) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) {
    return <div className={className}>{renderTable()}</div>;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <Card key={index} className={cardClassName}>
          <CardContent className="p-4">{renderCard(item, index)}</CardContent>
        </Card>
      ))}
    </div>
  );
}

// Hook for using media queries
// Re-exported from here for convenience
export { useMediaQuery };

/**
 * A simple mobile-aware wrapper that conditionally renders content.
 */
interface ResponsiveWrapperProps {
  mobileContent: ReactNode;
  desktopContent: ReactNode;
}

export function ResponsiveWrapper({
  mobileContent,
  desktopContent,
}: ResponsiveWrapperProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return <>{isMobile ? mobileContent : desktopContent}</>;
}

/**
 * A component that hides content on mobile screens.
 */
export function HideOnMobile({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  if (isMobile) return null;
  return <>{children}</>;
}

/**
 * A component that shows content only on mobile screens.
 */
export function ShowOnMobile({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  if (!isMobile) return null;
  return <>{children}</>;
}
