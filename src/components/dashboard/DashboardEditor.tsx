import { useState } from "react";
import { DashboardWidgetConfig, WIDGET_DEFINITIONS, getAvailableWidgetsForIndustry } from "@/config/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, RotateCcw, Save, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardEditorProps {
  widgets: DashboardWidgetConfig[];
  industryKey: string;
  onSave: (widgets: DashboardWidgetConfig[]) => Promise<void>;
  onReset: () => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
  isResetting: boolean;
}

export function DashboardEditor({
  widgets: initialWidgets,
  industryKey,
  onSave,
  onReset,
  onClose,
  isSaving,
  isResetting,
}: DashboardEditorProps) {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(initialWidgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const availableWidgets = getAvailableWidgetsForIndustry(industryKey);
  const usedTypes = widgets.map((w) => w.type);
  const unusedWidgets = availableWidgets.filter((w) => !usedTypes.includes(w.type));

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newWidgets = [...widgets];
    const draggedWidget = newWidgets[draggedIndex];
    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, draggedWidget);

    // Update positions
    newWidgets.forEach((w, i) => {
      w.position = i + 1;
    });

    setWidgets(newWidgets);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleVisibility = (index: number) => {
    const newWidgets = [...widgets];
    newWidgets[index].visible = !newWidgets[index].visible;
    setWidgets(newWidgets);
  };

  const changeSize = (index: number, size: "small" | "medium" | "large") => {
    const newWidgets = [...widgets];
    newWidgets[index].size = size;
    setWidgets(newWidgets);
  };

  const removeWidget = (index: number) => {
    const newWidgets = widgets.filter((_, i) => i !== index);
    newWidgets.forEach((w, i) => {
      w.position = i + 1;
    });
    setWidgets(newWidgets);
  };

  const addWidget = (type: string) => {
    const definition = WIDGET_DEFINITIONS.find((w) => w.type === type);
    if (!definition) return;

    const newWidget: DashboardWidgetConfig = {
      id: `w-${Date.now()}`,
      type: definition.type,
      title: definition.title,
      position: widgets.length + 1,
      size: definition.defaultSize,
      visible: true,
    };

    setWidgets([...widgets, newWidget]);
  };

  const handleSave = async () => {
    await onSave(widgets);
    onClose();
  };

  const handleReset = async () => {
    await onReset();
    onClose();
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case "small":
        return "S";
      case "medium":
        return "M";
      case "large":
        return "L";
      default:
        return size;
    }
  };

  return (
    <Card className="border-primary/20 bg-card/95 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">ダッシュボードのカスタマイズ</CardTitle>
            <CardDescription>ウィジェットの表示・非表示、並び順、サイズを変更できます</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current widgets */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">表示中のウィジェット</h4>
          <div className="space-y-2">
            {widgets.map((widget, index) => {
              const definition = WIDGET_DEFINITIONS.find((w) => w.type === widget.type);
              return (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border bg-background transition-all",
                    draggedIndex === index && "opacity-50 border-primary",
                    !widget.visible && "opacity-60"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  
                  <div className="flex-1 flex items-center gap-2">
                    {definition?.icon}
                    <span className="text-sm font-medium">{widget.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {definition?.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={widget.size}
                      onValueChange={(value) => changeSize(index, value as "small" | "medium" | "large")}
                    >
                      <SelectTrigger className="w-16 h-7 text-xs">
                        <SelectValue>{getSizeLabel(widget.size)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">S (小)</SelectItem>
                        <SelectItem value="medium">M (中)</SelectItem>
                        <SelectItem value="large">L (大)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleVisibility(index)}
                    >
                      {widget.visible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeWidget(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available widgets to add */}
        {unusedWidgets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">追加可能なウィジェット</h4>
            <div className="flex flex-wrap gap-2">
              {unusedWidgets.map((widget) => (
                <Button
                  key={widget.type}
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => addWidget(widget.type)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {widget.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            業種デフォルトに戻す
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
