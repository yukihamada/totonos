export type UIStyleType = 'default' | 'piston' | 'minimal' | 'glass' | 'neo-brutalist';
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
    accentHue?: number; // HSL hue value for accent color
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
      accentHue: 25, // Orange
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
      accentHue: 220, // Slate blue
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
      accentHue: 210, // Blue
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
      accentHue: 45, // Yellow
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
