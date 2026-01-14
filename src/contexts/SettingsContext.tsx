import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings, AppSettings, MenuGroupConfig, MenuItemConfig } from '@/hooks/useSettings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateMenuGroup: (groupId: string, updates: Partial<MenuGroupConfig>) => void;
  updateMenuItem: (groupId: string, itemId: string, updates: Partial<MenuItemConfig>) => void;
  resetToDefaults: () => void;
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
