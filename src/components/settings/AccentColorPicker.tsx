import { useState } from "react";
import { Check } from "lucide-react";
import { accentColorPresets } from "@/types/design-templates";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface AccentColorPickerProps {
  value: number;
  onChange: (hue: number) => void;
}

export function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  const [isCustom, setIsCustom] = useState(
    !accentColorPresets.some(preset => preset.hue === value)
  );

  const handlePresetClick = (hue: number) => {
    setIsCustom(false);
    onChange(hue);
  };

  const handleSliderChange = (values: number[]) => {
    setIsCustom(true);
    onChange(values[0]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">アクセントカラー</h3>
        <p className="text-sm text-muted-foreground">ボタンやリンクなどの強調色を設定</p>
      </div>

      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {accentColorPresets.map((preset) => (
          <button
            key={preset.hue}
            onClick={() => handlePresetClick(preset.hue)}
            className={cn(
              "relative h-10 w-10 rounded-full border-2 transition-transform hover:scale-110",
              value === preset.hue && !isCustom
                ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                : "border-transparent"
            )}
            style={{ backgroundColor: `hsl(${preset.hue}, 70%, 50%)` }}
            title={preset.name}
          >
            {value === preset.hue && !isCustom && (
              <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>

      {/* Custom color slider */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm">カスタムカラー</Label>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-full border-2 flex-shrink-0",
              isCustom ? "border-foreground ring-2 ring-offset-2 ring-foreground" : "border-border"
            )}
            style={{ backgroundColor: `hsl(${value}, 70%, 50%)` }}
          />
          <div className="flex-1 relative">
            <Slider
              value={[value]}
              onValueChange={handleSliderChange}
              max={360}
              step={1}
              className="w-full"
            />
            {/* Hue gradient background */}
            <div
              className="absolute inset-0 -z-10 h-2 top-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: "linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))"
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground w-12 text-right">{value}°</span>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 border rounded-lg space-y-2">
        <Label className="text-sm text-muted-foreground">プレビュー</Label>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: `hsl(${value}, 70%, 50%)` }}
          >
            プライマリボタン
          </button>
          <button
            className="px-4 py-2 rounded-md font-medium border-2"
            style={{ 
              borderColor: `hsl(${value}, 70%, 50%)`,
              color: `hsl(${value}, 70%, 40%)`
            }}
          >
            セカンダリボタン
          </button>
        </div>
        <p className="text-sm">
          これは
          <a 
            href="#" 
            className="underline"
            style={{ color: `hsl(${value}, 70%, 40%)` }}
            onClick={(e) => e.preventDefault()}
          >
            アクセントカラー
          </a>
          のプレビューです。
        </p>
      </div>
    </div>
  );
}
