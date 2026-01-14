import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
import type { Column } from "./DataViewSwitcher";

interface TableViewProps<T> {
  data: T[];
  columns: Column[];
  onRowClick?: (item: T) => void;
  onUpdate?: (id: string, updates: Partial<T>) => void;
  onDelete?: (id: string) => void;
}

export function TableView<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onUpdate,
  onDelete,
}: TableViewProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const filteredData = data.filter((item) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matches = columns.some((col) => {
        const value = (item as any)[col.key];
        return value && String(value).toLowerCase().includes(searchLower);
      });
      if (!matches) return false;
    }

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && (item as any)[key] !== value) {
        return false;
      }
    }

    return true;
  });

  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredData;

  const renderCellValue = (item: T, column: Column) => {
    const value = (item as any)[column.key];

    switch (column.type) {
      case "status":
        const statusColors: Record<string, string> = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800",
          pending: "bg-yellow-100 text-yellow-800",
          completed: "bg-blue-100 text-blue-800",
          draft: "bg-gray-100 text-gray-800",
          sent: "bg-blue-100 text-blue-800",
          paid: "bg-green-100 text-green-800",
          overdue: "bg-red-100 text-red-800",
        };
        return (
          <Badge className={statusColors[value?.toLowerCase()] || "bg-gray-100"}>
            {value}
          </Badge>
        );

      case "date":
        return value ? new Date(value).toLocaleDateString("ja-JP") : "-";

      case "number":
        return typeof value === "number" ? value.toLocaleString() : value;

      default:
        return value || "-";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable !== false ? "cursor-pointer" : ""}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable !== false && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
              {(onUpdate || onDelete) && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onUpdate || onDelete ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow
                  key={item.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCellValue(item, column)}
                    </TableCell>
                  ))}
                  {(onUpdate || onDelete) && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onUpdate && (
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDelete(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredData.length}件中 {sortedData.length}件を表示
      </div>
    </div>
  );
}
