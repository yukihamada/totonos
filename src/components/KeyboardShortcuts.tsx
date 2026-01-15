import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ShortcutCategory {
  name: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'ナビゲーション',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'AIアシスタントを開く' },
      { keys: ['/'], description: '検索にフォーカス' },
      { keys: ['G', 'D'], description: 'ダッシュボードへ移動' },
      { keys: ['G', 'I'], description: '請求書一覧へ移動' },
      { keys: ['G', 'C'], description: '取引先一覧へ移動' },
      { keys: ['G', 'E'], description: '従業員一覧へ移動' },
    ],
  },
  {
    name: '操作',
    shortcuts: [
      { keys: ['⌘', 'S'], description: '保存' },
      { keys: ['⌘', 'N'], description: '新規作成' },
      { keys: ['Esc'], description: 'モーダルを閉じる' },
    ],
  },
  {
    name: 'ヘルプ',
    shortcuts: [
      { keys: ['?'], description: 'ショートカット一覧を表示' },
    ],
  },
];

interface KeyboardShortcutsProps {
  onOpenChat?: () => void;
  onOpenSearch?: () => void;
  onSave?: () => void;
  onNew?: () => void;
}

export function KeyboardShortcuts({
  onOpenChat,
  onOpenSearch,
  onSave,
  onNew,
}: KeyboardShortcutsProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;

    // Help dialog - ? key (without modifiers, not in input)
    if (e.key === '?' && !e.metaKey && !e.ctrlKey && !isInput) {
      e.preventDefault();
      setHelpOpen(true);
      return;
    }

    // Escape - close modals (always work)
    if (e.key === 'Escape') {
      setHelpOpen(false);
      setKeySequence([]);
      return;
    }

    // Save - Cmd/Ctrl + S
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
      return;
    }

    // New - Cmd/Ctrl + N
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      onNew?.();
      return;
    }

    // Search focus - / key (not in input)
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !isInput) {
      e.preventDefault();
      onOpenSearch?.();
      return;
    }

    // Handle G + key navigation sequences (not in input)
    if (!isInput && !e.metaKey && !e.ctrlKey) {
      const key = e.key.toLowerCase();
      
      // If starting with 'g', begin sequence
      if (key === 'g' && keySequence.length === 0) {
        setKeySequence(['g']);
        // Clear sequence after 1 second
        setTimeout(() => setKeySequence([]), 1000);
        return;
      }

      // If we have 'g' in sequence, check next key
      if (keySequence[0] === 'g') {
        setKeySequence([]);
        switch (key) {
          case 'd':
            navigate('/dashboard');
            break;
          case 'i':
            navigate('/invoices');
            break;
          case 'c':
            navigate('/clients');
            break;
          case 'e':
            navigate('/employees');
            break;
          case 'l':
            navigate('/leads');
            break;
          case 'p':
            navigate('/projects');
            break;
        }
      }
    }
  }, [keySequence, navigate, onSave, onNew, onOpenSearch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {shortcutCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 text-xs font-mono bg-muted rounded border"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">?</kbd>
          <span className="ml-2">を押すとこのヘルプを表示</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
