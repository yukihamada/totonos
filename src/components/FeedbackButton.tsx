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
      {/* Beta Badge - Fixed top right */}
      <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50">
        <Badge variant="secondary" className="bg-amber-500/90 text-amber-950 hover:bg-amber-500 border-0 font-semibold px-3 py-1">
          🚧 ベータ版
        </Badge>
      </div>

      {/* Feedback Button - Fixed bottom right */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col gap-2 items-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="rounded-full shadow-lg px-4 gap-2"
              onClick={() => setOpen(true)}
            >
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">バグ報告・ご意見</span>
              <MessageSquarePlus className="h-4 w-4 sm:hidden" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>バグ報告・ご意見・ご要望をお寄せください</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
