import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings, AppSettings, MenuGroupConfig, MenuItemConfig } from '@/hooks/useSettings';
import { MobileNavItemConfig } from '@/types/menu-templates';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateMenuGroup: (groupId: string, updates: Partial<MenuGroupConfig>) => void;
  updateMenuItem: (groupId: string, itemId: string, updates: Partial<MenuItemConfig>) => void;
  resetToDefaults: () => void;
  updateMobileNavItems: (items: MobileNavItemConfig[]) => void;
  reorderGroups: (sourceId: string, targetId: string) => void;
  reorderItems: (groupId: string, sourceId: string, targetId: string) => void;
  applyTemplate: (templateId: string) => void;
  applyTemplateByDbKey: (dbTemplateKey: string) => boolean;
  isProtectedItem: (itemId: string) => boolean;
  isProtectedGroup: (groupId: string) => boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsHook = useSettings();

  return (
    <SettingsContext.Provider value={settingsHook}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within a SettingsProvider');
  }
  return context;
}
