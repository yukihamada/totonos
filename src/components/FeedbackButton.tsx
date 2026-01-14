import { useState } from "react";
import { MessageSquarePlus, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FeedbackDialog } from "./FeedbackDialog";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Feedback Button - Fixed bottom LEFT to avoid overlap with chat */}
      <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 flex flex-col gap-1 items-start">
        <Badge variant="secondary" className="bg-amber-500/90 text-amber-950 hover:bg-amber-500 border-0 font-semibold px-2 py-0.5 text-[10px] leading-tight">
          🚧 ベータ版
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shadow-lg px-4 gap-2 border-2"
              onClick={() => setOpen(true)}
            >
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">バグ報告</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>バグ報告・ご意見・ご要望</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
