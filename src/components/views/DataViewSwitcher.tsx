import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, LayoutGrid, Calendar, Kanban, ChevronDown } from "lucide-react";
import { TableView } from "./TableView";
import { BoardView } from "./BoardView";
import { CalendarView } from "./CalendarView";
import { GalleryView } from "./GalleryView";

export type ViewType = "table" | "board" | "calendar" | "gallery";

export interface Column {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "status" | "user";
  options?: string[];
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataViewProps<T> {
  data: T[];
  columns: Column[];
  onRowClick?: (item: T) => void;
  onUpdate?: (id: string, updates: Partial<T>) => void;
  onDelete?: (id: string) => void;
  groupBy?: string;
  dateField?: string;
  titleField?: string;
  imageField?: string;
  defaultView?: ViewType;
}

export function DataViewSwitcher<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onUpdate,
  onDelete,
  groupBy,
  dateField,
  titleField = "name",
  imageField,
  defaultView = "table",
}: DataViewProps<T>) {
  const [currentView, setCurrentView] = useState<ViewType>(defaultView);

  const viewIcons = {
    table: <Table className="h-4 w-4" />,
    board: <Kanban className="h-4 w-4" />,
    calendar: <Calendar className="h-4 w-4" />,
    gallery: <LayoutGrid className="h-4 w-4" />,
  };

  const viewLabels = {
    table: "テーブル",
    board: "ボード",
    calendar: "カレンダー",
    gallery: "ギャラリー",
  };

  const renderView = () => {
    switch (currentView) {
      case "table":
        return (
          <TableView
            data={data}
            columns={columns}
            onRowClick={onRowClick}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        );
      case "board":
        return (
          <BoardView
            data={data}
            columns={columns}
            groupBy={groupBy || "status"}
            titleField={titleField}
            onItemClick={onRowClick}
            onUpdate={onUpdate}
          />
        );
      case "calendar":
        return (
          <CalendarView
            data={data}
            dateField={dateField || "date"}
            titleField={titleField}
            onItemClick={onRowClick}
          />
        );
      case "gallery":
        return (
          <GalleryView
            data={data}
            titleField={titleField}
            imageField={imageField}
            onItemClick={onRowClick}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {viewIcons[currentView]}
              <span className="ml-2">{viewLabels[currentView]}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(viewLabels) as ViewType[]).map((view) => (
              <DropdownMenuItem
                key={view}
                onClick={() => setCurrentView(view)}
                className={currentView === view ? "bg-accent" : ""}
              >
                {viewIcons[view]}
                <span className="ml-2">{viewLabels[view]}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {renderView()}
    </div>
  );
}
