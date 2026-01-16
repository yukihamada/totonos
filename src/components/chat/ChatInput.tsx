import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, X, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";

interface AttachedFile {
  file: File;
  type: 'image' | 'pdf' | 'csv' | 'excel' | 'other';
  preview?: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: AttachedFile[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  pdf: ['application/pdf'],
  csv: ['text/csv', 'text/plain'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

function getFileType(file: File): AttachedFile['type'] {
  const mimeType = file.type;
  const ext = file.name.toLowerCase().split('.').pop();
  
  if (ACCEPTED_FILE_TYPES.image.includes(mimeType)) return 'image';
  if (ACCEPTED_FILE_TYPES.pdf.includes(mimeType)) return 'pdf';
  if (ACCEPTED_FILE_TYPES.csv.includes(mimeType) || ext === 'csv') return 'csv';
  if (ACCEPTED_FILE_TYPES.excel.includes(mimeType) || ext === 'xlsx' || ext === 'xls') return 'excel';
  return 'other';
}

function isAcceptedFile(file: File): boolean {
  const type = getFileType(file);
  return type !== 'other';
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((trimmed || attachedFiles.length > 0) && !isLoading && !disabled) {
      onSend(trimmed, attachedFiles.length > 0 ? attachedFiles : undefined);
      setInput("");
      setAttachedFiles([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME入力中（日本語変換中など）はEnterで送信しない
    // nativeEvent.isComposingをチェックしてブラウザ間の互換性を確保
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setInput(nextValue);

    // Auto-resize textarea (grow-only to avoid "縮んだり広がったり" のちらつき)
    const textarea = e.target;
    const currentHeight = textarea.style.height
      ? parseInt(textarea.style.height.replace("px", ""), 10)
      : textarea.offsetHeight;

    if (!nextValue) {
      textarea.style.height = "auto";
      return;
    }

    const nextHeight = Math.min(textarea.scrollHeight, 120);
    if (nextHeight > currentHeight) {
      textarea.style.height = `${nextHeight}px`;
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    Array.from(files).forEach(file => {
      if (!isAcceptedFile(file)) {
        return; // Skip unsupported files
      }

      const type = getFileType(file);
      const attachedFile: AttachedFile = { file, type };

      // Create preview for images
      if (type === 'image') {
        attachedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(attachedFile);
    });

    if (newFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      // Revoke URL for images
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'csv':
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="border-t p-3 overflow-hidden">
      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="relative flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-xs"
            >
              {file.type === 'image' && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="h-6 w-6 object-cover rounded"
                />
              ) : (
                getFileIcon(file.type)
              )}
              <span className="max-w-[100px] truncate">{file.file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="hover:bg-destructive/10 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end w-full">
        {/* File upload button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.csv,.xlsx,.xls"
          multiple
          onChange={handleFileSelect}
        />

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Shift+Enterで改行)"
          disabled={isLoading || disabled}
          className="flex-1 min-w-0 min-h-[40px] max-h-[120px] resize-none text-sm"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || disabled}
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 text-center">
        AIは間違える可能性があります。CSV・Excel・画像・PDFに対応。
      </p>
    </div>
  );
}

export type { AttachedFile };
