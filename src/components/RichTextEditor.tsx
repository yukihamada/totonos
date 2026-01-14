import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eye,
  Edit,
  CheckSquare,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '内容を入力...',
  className,
  minHeight = '400px',
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Update history
    const newHistory = [...history.slice(0, historyIndex + 1), newText];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }, [value, onChange, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);

  const toolbarItems = [
    { icon: Undo, label: '元に戻す', action: handleUndo, disabled: historyIndex === 0 },
    { icon: Redo, label: 'やり直し', action: handleRedo, disabled: historyIndex === history.length - 1 },
    { type: 'separator' },
    { icon: Heading1, label: '見出し1', action: () => insertMarkdown('# ') },
    { icon: Heading2, label: '見出し2', action: () => insertMarkdown('## ') },
    { icon: Heading3, label: '見出し3', action: () => insertMarkdown('### ') },
    { type: 'separator' },
    { icon: Bold, label: '太字', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: '斜体', action: () => insertMarkdown('*', '*') },
    { icon: Underline, label: '下線', action: () => insertMarkdown('<u>', '</u>') },
    { icon: Strikethrough, label: '取り消し線', action: () => insertMarkdown('~~', '~~') },
    { type: 'separator' },
    { icon: List, label: '箇条書き', action: () => insertMarkdown('- ') },
    { icon: ListOrdered, label: '番号付きリスト', action: () => insertMarkdown('1. ') },
    { icon: CheckSquare, label: 'チェックリスト', action: () => insertMarkdown('- [ ] ') },
    { type: 'separator' },
    { icon: Quote, label: '引用', action: () => insertMarkdown('> ') },
    { icon: Code, label: 'コード', action: () => insertMarkdown('`', '`') },
    { icon: Link, label: 'リンク', action: () => insertMarkdown('[', '](url)') },
    { icon: Image, label: '画像', action: () => insertMarkdown('![alt](', ')') },
    { icon: Table, label: 'テーブル', action: () => insertMarkdown('\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| A | B | C |\n') },
  ];

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (text: string): string => {
    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md my-2 overflow-x-auto"><code>$2</code></pre>')
      // Inline code
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
      // Images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-md my-2" />')
      // Blockquotes
      .replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 my-2 text-muted-foreground">$1</blockquote>')
      // Checkboxes
      .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded" /><span class="line-through text-muted-foreground">$1</span></div>')
      .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded" /><span>$1</span></div>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Tables
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.some(c => /^-+$/.test(c.trim()))) return '';
        const cellHtml = cells.map(c => `<td class="border px-3 py-2">${c.trim()}</td>`).join('');
        return `<tr>${cellHtml}</tr>`;
      })
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/\n/g, '<br />');

    // Wrap tables
    html = html.replace(/(<tr>.*?<\/tr>)+/gs, '<table class="border-collapse border my-4 w-full">$&</table>');

    return `<div class="prose dark:prose-invert max-w-none"><p class="my-2">${html}</p></div>`;
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
        <TooltipProvider>
          {toolbarItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={index} className="w-px h-6 bg-border mx-1" />;
            }
            const Icon = item.icon!;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={item.action}
                    disabled={item.disabled}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>

        <div className="flex-1" />

        <Button
          variant={isPreview ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="gap-2"
        >
          {isPreview ? (
            <>
              <Edit className="h-4 w-4" />
              編集
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              プレビュー
            </>
          )}
        </Button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="p-4 min-h-[400px] overflow-auto"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <Textarea
          id="rich-editor"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // Debounced history update
            const newHistory = [...history.slice(0, historyIndex + 1), e.target.value];
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
          }}
          placeholder={placeholder}
          className="border-0 rounded-none focus-visible:ring-0 resize-none font-mono"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
