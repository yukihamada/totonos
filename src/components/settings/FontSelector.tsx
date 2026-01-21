import { bodyFonts, headingFonts, letterSpacingMap, LetterSpacingType } from "@/types/design-templates";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FontSelectorProps {
  fontBody: string;
  fontHeading: string;
  letterSpacing: LetterSpacingType;
  onFontBodyChange: (value: string) => void;
  onFontHeadingChange: (value: string) => void;
  onLetterSpacingChange: (value: LetterSpacingType) => void;
}

export function FontSelector({
  fontBody,
  fontHeading,
  letterSpacing,
  onFontBodyChange,
  onFontHeadingChange,
  onLetterSpacingChange,
}: FontSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">フォント設定</h3>
        <p className="text-sm text-muted-foreground">日本語フォントとテキストスタイルを設定</p>
      </div>

      {/* Body font */}
      <div className="space-y-2">
        <Label>本文フォント</Label>
        <Select value={fontBody} onValueChange={onFontBodyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bodyFonts.map((font) => (
              <SelectItem key={font.id} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          アプリケーション全体の本文に使用されるフォント
        </p>
      </div>

      {/* Heading font */}
      <div className="space-y-2">
        <Label>見出しフォント</Label>
        <Select value={fontHeading} onValueChange={onFontHeadingChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {headingFonts.map((font) => (
              <SelectItem key={font.id} value={font.value}>
                <span style={{ fontFamily: font.value === 'inherit' ? fontBody : font.value }}>
                  {font.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          見出しやタイトルに使用されるフォント
        </p>
      </div>

      {/* Letter spacing */}
      <div className="space-y-3">
        <Label>文字間隔</Label>
        <RadioGroup
          value={letterSpacing}
          onValueChange={(v) => onLetterSpacingChange(v as LetterSpacingType)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tight" id="spacing-tight" />
            <Label htmlFor="spacing-tight" className="font-normal cursor-pointer">
              詰め
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="spacing-normal" />
            <Label htmlFor="spacing-normal" className="font-normal cursor-pointer">
              標準
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wide" id="spacing-wide" />
            <Label htmlFor="spacing-wide" className="font-normal cursor-pointer">
              ゆったり
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Preview */}
      <div className="p-4 border rounded-lg space-y-4">
        <Label className="text-sm text-muted-foreground">プレビュー</Label>
        <div 
          style={{ 
            fontFamily: fontBody,
            letterSpacing: letterSpacingMap[letterSpacing]
          }}
        >
          <h2 
            className="text-xl font-bold mb-2"
            style={{ fontFamily: fontHeading === 'inherit' ? fontBody : fontHeading }}
          >
            見出しテキストのサンプル
          </h2>
          <p className="text-sm">
            本文テキストのサンプルです。日本語フォントの表示をご確認ください。
            ABCDEFGあいうえお漢字混在1234567890
          </p>
        </div>
      </div>
    </div>
  );
}
