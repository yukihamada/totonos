import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useSendMessage } from "@/hooks/useMessages";
import { useConversation } from "@/hooks/useConversations";
import { useCompanyMembers } from "@/hooks/useCompany";
import { useMessengerAI, shouldTriggerAI } from "@/hooks/useMessengerAI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MentionPopup, MentionCandidate, createMentionCandidates } from "./MentionPopup";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sendMessage = useSendMessage();
  const { data: conversation } = useConversation(conversationId);
  const { data: members } = useCompanyMembers();
  const { triggerAIResponse, isLoading: isAILoading } = useMessengerAI();

  // Create mention candidates from members + AI
  const mentionCandidates = createMentionCandidates(members || []);
  
  // Filter candidates based on query
  const filteredCandidates = mentionCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Reset selected index when candidates change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCandidates.length]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Detect @ for mention popup
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show popup if there's no space after @
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setShowMentionPopup(true);
        return;
      }
    }
    setShowMentionPopup(false);
  };

  const handleSelectMention = (candidate: MentionCandidate) => {
    const cursorPosition = textareaRef.current?.selectionStart || content.length;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterCursor = content.slice(cursorPosition);
      const newContent = content.slice(0, lastAtIndex) + '@' + candidate.name + ' ' + textAfterCursor;
      setContent(newContent);
    }
    
    setShowMentionPopup(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: trimmed
      });
      
      // Trigger AI response if needed
      const includesAI = conversation?.includes_ai ?? false;
      if (shouldTriggerAI(trimmed, includesAI)) {
        triggerAIResponse(conversationId, trimmed, includesAI);
      }
      
      setContent("");
    } catch (error) {
      toast.error("メッセージの送信に失敗しました");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionPopup && filteredCandidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCandidates.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCandidates.length - 1
        );
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSelectMention(filteredCandidates[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowMentionPopup(false);
        return;
      }
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border relative">
      <MentionPopup
        isOpen={showMentionPopup}
        candidates={filteredCandidates}
        selectedIndex={selectedIndex}
        onSelect={handleSelectMention}
        onClose={() => setShowMentionPopup(false)}
      />
      
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (@でメンション, Shift+Enterで改行)"
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || sendMessage.isPending || isAILoading}
          size="icon"
          className="shrink-0"
        >
          {isAILoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
