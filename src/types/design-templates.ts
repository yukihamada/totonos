export type UIStyleType = 
  | 'default' 
  | 'piston' 
  | 'minimal' 
  | 'glass' 
  | 'neo-brutalist'
  | 'corporate'
  | 'startup'
  | 'healthcare'
  | 'creative'
  | 'retro'
  | 'elegant'
  | 'playful'
  | 'dark-pro'
  | 'nature'
  | 'tech';

export type BorderRadiusType = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview?: string;
  styles: {
    uiStyle: UIStyleType;
    borderRadius: BorderRadiusType;
    accentHue?: number;
  };
}

export const designTemplates: DesignTemplate[] = [
  {
    id: 'default',
    name: 'スタンダード',
    description: 'シンプルで使いやすい標準デザイン',
    icon: 'Layout',
    styles: {
      uiStyle: 'default',
      borderRadius: 'md',
    },
  },
  {
    id: 'piston',
    name: 'ピストン',
    description: '力強くメカニカルな工業デザイン',
    icon: 'Cog',
    styles: {
      uiStyle: 'piston',
      borderRadius: 'none',
      accentHue: 25,
    },
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    description: '余白を活かしたシンプルなデザイン',
    icon: 'Minus',
    styles: {
      uiStyle: 'minimal',
      borderRadius: 'lg',
      accentHue: 220,
    },
  },
  {
    id: 'glass',
    name: 'グラス',
    description: '透明感のあるモダンなデザイン',
    icon: 'Sparkles',
    styles: {
      uiStyle: 'glass',
      borderRadius: 'lg',
      accentHue: 210,
    },
  },
  {
    id: 'neo-brutalist',
    name: 'ネオブルータリスト',
    description: '太い線と鮮やかな色のインパクトあるデザイン',
    icon: 'Square',
    styles: {
      uiStyle: 'neo-brutalist',
      borderRadius: 'none',
      accentHue: 45,
    },
  },
  {
    id: 'corporate',
    name: 'コーポレート',
    description: 'フォーマルな企業向けデザイン',
    icon: 'Building2',
    styles: {
      uiStyle: 'corporate',
      borderRadius: 'md',
      accentHue: 215,
    },
  },
  {
    id: 'startup',
    name: 'スタートアップ',
    description: 'モダンでアジャイルなデザイン',
    icon: 'Rocket',
    styles: {
      uiStyle: 'startup',
      borderRadius: 'lg',
      accentHue: 280,
    },
  },
  {
    id: 'healthcare',
    name: 'ヘルスケア',
    description: '清潔感と安心感のあるデザイン',
    icon: 'Heart',
    styles: {
      uiStyle: 'healthcare',
      borderRadius: 'md',
      accentHue: 170,
    },
  },
  {
    id: 'creative',
    name: 'クリエイティブ',
    description: '個性的でアーティスティックなデザイン',
    icon: 'Palette',
    styles: {
      uiStyle: 'creative',
      borderRadius: 'full',
      accentHue: 330,
    },
  },
  {
    id: 'retro',
    name: 'レトロ',
    description: '懐かしさのある温かみのデザイン',
    icon: 'Radio',
    styles: {
      uiStyle: 'retro',
      borderRadius: 'sm',
      accentHue: 35,
    },
  },
  {
    id: 'elegant',
    name: 'エレガント',
    description: '高級感のある洗練されたデザイン',
    icon: 'Crown',
    styles: {
      uiStyle: 'elegant',
      borderRadius: 'lg',
      accentHue: 260,
    },
  },
  {
    id: 'playful',
    name: 'ポップ',
    description: '明るく親しみやすいデザイン',
    icon: 'Smile',
    styles: {
      uiStyle: 'playful',
      borderRadius: 'full',
      accentHue: 45,
    },
  },
  {
    id: 'dark-pro',
    name: 'ダークプロ',
    description: 'プロ向け高コントラストデザイン',
    icon: 'Moon',
    styles: {
      uiStyle: 'dark-pro',
      borderRadius: 'none',
      accentHue: 200,
    },
  },
  {
    id: 'nature',
    name: 'ナチュラル',
    description: '自然をモチーフにしたデザイン',
    icon: 'Leaf',
    styles: {
      uiStyle: 'nature',
      borderRadius: 'lg',
      accentHue: 140,
    },
  },
  {
    id: 'tech',
    name: 'テック',
    description: 'ハイテク感のあるサイバーデザイン',
    icon: 'Cpu',
    styles: {
      uiStyle: 'tech',
      borderRadius: 'none',
      accentHue: 180,
    },
  },
];

// Map border radius to CSS value
export const borderRadiusMap: Record<BorderRadiusType, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
};

// Font options
export interface FontOption {
  id: string;
  name: string;
  value: string;
  category: 'sans' | 'serif' | 'rounded';
}

export const bodyFonts: FontOption[] = [
  { id: 'noto-sans-jp', name: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif", category: 'sans' },
  { id: 'm-plus-1p', name: 'M PLUS 1p', value: "'M PLUS 1p', sans-serif", category: 'sans' },
  { id: 'source-han-sans', name: '源ノ角ゴシック', value: "'Source Han Sans JP', sans-serif", category: 'sans' },
  { id: 'biz-ud-gothic', name: 'BIZ UDゴシック', value: "'BIZ UDGothic', sans-serif", category: 'sans' },
  { id: 'system', name: 'システムデフォルト', value: "system-ui, sans-serif", category: 'sans' },
];

export const headingFonts: FontOption[] = [
  { id: 'same', name: '本文と同じ', value: 'inherit', category: 'sans' },
  { id: 'noto-serif-jp', name: 'Noto Serif JP', value: "'Noto Serif JP', serif", category: 'serif' },
  { id: 'm-plus-rounded', name: 'M PLUS Rounded 1c', value: "'M PLUS Rounded 1c', sans-serif", category: 'rounded' },
  { id: 'zen-maru-gothic', name: 'Zen Maru Gothic', value: "'Zen Maru Gothic', sans-serif", category: 'rounded' },
];

export type LetterSpacingType = 'tight' | 'normal' | 'wide';

export const letterSpacingMap: Record<LetterSpacingType, string> = {
  tight: '-0.025em',
  normal: '0em',
  wide: '0.05em',
};

// Preset accent colors
export const accentColorPresets = [
  { name: 'レッド', hue: 0 },
  { name: 'オレンジ', hue: 25 },
  { name: 'イエロー', hue: 45 },
  { name: 'ライム', hue: 80 },
  { name: 'グリーン', hue: 140 },
  { name: 'エメラルド', hue: 160 },
  { name: 'シアン', hue: 180 },
  { name: 'ブルー', hue: 210 },
  { name: 'インディゴ', hue: 240 },
  { name: 'パープル', hue: 280 },
  { name: 'ピンク', hue: 330 },
  { name: 'ローズ', hue: 350 },
];

// Branding settings interface
export interface BrandingSettings {
  logoUrl?: string;
  designTemplateId: string;
  accentHue: number;
  fontBody: string;
  fontHeading: string;
  letterSpacing: LetterSpacingType;
  showLogoSidebar: boolean;
  showLogoLogin: boolean;
  showLogoDocuments: boolean;
}

export const defaultBrandingSettings: BrandingSettings = {
  designTemplateId: 'default',
  accentHue: 210,
  fontBody: "'Noto Sans JP', sans-serif",
  fontHeading: 'inherit',
  letterSpacing: 'normal',
  showLogoSidebar: true,
  showLogoLogin: true,
  showLogoDocuments: true,
};
