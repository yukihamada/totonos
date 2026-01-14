import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Column } from "./DataViewSwitcher";

interface BoardViewProps<T> {
  data: T[];
  columns: Column[];
  groupBy: string;
  titleField: string;
  onItemClick?: (item: T) => void;
  onUpdate?: (id: string, updates: Partial<T>) => void;
}

export function BoardView<T extends { id: string }>({
  data,
  columns,
  groupBy,
  titleField,
  onItemClick,
  onUpdate,
}: BoardViewProps<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);

  // Get unique values for groupBy column
  const groupColumn = columns.find((c) => c.key === groupBy);
  const groups = groupColumn?.options || [...new Set(data.map((item) => (item as any)[groupBy]))];

  // Group data
  const groupedData = groups.reduce((acc, group) => {
    acc[group] = data.filter((item) => (item as any)[groupBy] === group);
    return acc;
  }, {} as Record<string, T[]>);

  const handleDragStart = (item: T) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetGroup: string) => {
    if (draggedItem && onUpdate) {
      onUpdate(draggedItem.id, { [groupBy]: targetGroup } as Partial<T>);
    }
    setDraggedItem(null);
  };

  const getGroupColor = (group: string): string => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-purple-500",
      proposal: "bg-orange-500",
      negotiation: "bg-pink-500",
      closed_won: "bg-green-500",
      closed_lost: "bg-red-500",
      active: "bg-green-500",
      inactive: "bg-gray-500",
      pending: "bg-yellow-500",
      completed: "bg-blue-500",
      draft: "bg-gray-500",
      sent: "bg-blue-500",
      paid: "bg-green-500",
      overdue: "bg-red-500",
    };
    return colors[group.toLowerCase()] || "bg-gray-500";
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {groups.map((group) => (
          <div
            key={group}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(group)}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getGroupColor(group)}`} />
                    <CardTitle className="text-sm font-medium">{group}</CardTitle>
                  </div>
                  <Badge variant="secondary">{groupedData[group]?.length || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedData[group]?.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      draggedItem?.id === item.id ? "opacity-50" : ""
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onClick={() => onItemClick?.(item)}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">
                        {(item as any)[titleField]}
                      </p>
                      {/* Additional fields preview */}
                      <div className="mt-2 space-y-1">
                        {columns
                          .filter((c) => c.key !== groupBy && c.key !== titleField)
                          .slice(0, 2)
                          .map((col) => (
                            <p
                              key={col.key}
                              className="text-xs text-muted-foreground truncate"
                            >
                              {col.label}: {(item as any)[col.key] || "-"}
                            </p>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!groupedData[group] || groupedData[group].length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    アイテムなし
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
