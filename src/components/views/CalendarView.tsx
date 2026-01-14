import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps<T> {
  data: T[];
  dateField: string;
  titleField: string;
  onItemClick?: (item: T) => void;
}

export function CalendarView<T extends { id: string }>({
  data,
  dateField,
  titleField,
  onItemClick,
}: CalendarViewProps<T>) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, T[]> = {};
    data.forEach((item) => {
      const date = (item as any)[dateField];
      if (date) {
        const dateKey = new Date(date).toISOString().split("T")[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
      }
    });
    return grouped;
  }, [data, dateField]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  // Generate calendar grid
  const calendarDays = [];
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startingDayOfWeek + 1;
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const date = isCurrentMonth ? new Date(year, month, dayNumber) : null;
    const dateKey = date?.toISOString().split("T")[0];
    const items = dateKey ? itemsByDate[dateKey] || [] : [];
    const isToday = date?.toDateString() === new Date().toDateString();
    const isWeekend = i % 7 === 0 || i % 7 === 6;

    calendarDays.push({
      dayNumber: isCurrentMonth ? dayNumber : null,
      date,
      dateKey,
      items,
      isToday,
      isWeekend,
      isCurrentMonth,
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            今日
          </Button>
        </div>
        <h2 className="text-xl font-bold">
          {year}年 {month + 1}月
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day names header */}
        <div className="grid grid-cols-7 border-b bg-muted">
          {dayNames.map((day, i) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-medium ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-24 p-1 border-b border-r ${
                !day.isCurrentMonth ? "bg-muted/50" : ""
              } ${day.isWeekend ? "bg-muted/30" : ""}`}
            >
              {day.dayNumber && (
                <>
                  <div
                    className={`text-sm mb-1 ${
                      day.isToday
                        ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        : ""
                    } ${
                      day.isWeekend && !day.isToday
                        ? index % 7 === 0
                          ? "text-red-500"
                          : "text-blue-500"
                        : ""
                    }`}
                  >
                    {day.dayNumber}
                  </div>
                  <div className="space-y-1">
                    {day.items.slice(0, 3).map((item) => (
                      <Card
                        key={item.id}
                        className="p-1 text-xs cursor-pointer hover:bg-accent truncate"
                        onClick={() => onItemClick?.(item)}
                      >
                        {(item as any)[titleField]}
                      </Card>
                    ))}
                    {day.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{day.items.length - 3}件
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
