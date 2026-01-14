import { useState, useCallback, useMemo } from 'react';

export interface UseBulkSelectionOptions<T> {
  items: T[];
  getItemId: (item: T) => string;
}

export interface UseBulkSelectionResult<T> {
  selectedIds: Set<string>;
  isSelected: (item: T) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  selectedCount: number;
  toggle: (item: T) => void;
  toggleAll: () => void;
  select: (item: T) => void;
  deselect: (item: T) => void;
  selectAll: () => void;
  deselectAll: () => void;
  getSelectedItems: () => T[];
}

export function useBulkSelection<T>({
  items,
  getItemId,
}: UseBulkSelectionOptions<T>): UseBulkSelectionResult<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (item: T) => selectedIds.has(getItemId(item)),
    [selectedIds, getItemId]
  );

  const isAllSelected = useMemo(
    () => items.length > 0 && items.every((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );

  const isSomeSelected = useMemo(
    () => items.some((item) => selectedIds.has(getItemId(item))) && !isAllSelected,
    [items, selectedIds, getItemId, isAllSelected]
  );

  const selectedCount = useMemo(
    () => items.filter((item) => selectedIds.has(getItemId(item))).length,
    [items, selectedIds, getItemId]
  );

  const toggle = useCallback(
    (item: T) => {
      const id = getItemId(item);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [getItemId]
  );

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(getItemId)));
    }
  }, [items, isAllSelected, getItemId]);

  const select = useCallback(
    (item: T) => {
      const id = getItemId(item);
      setSelectedIds((prev) => new Set(prev).add(id));
    },
    [getItemId]
  );

  const deselect = useCallback(
    (item: T) => {
      const id = getItemId(item);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [getItemId]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getItemId)));
  }, [items, getItemId]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedItems = useCallback(
    () => items.filter((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    toggle,
    toggleAll,
    select,
    deselect,
    selectAll,
    deselectAll,
    getSelectedItems,
  };
}
