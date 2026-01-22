import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

interface TestTimerProps {
  timeLimitMinutes: number;
  onTimeUp: () => void;
}

export function TestTimer({ timeLimitMinutes, onTimeUp }: TestTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isLowTime = remainingSeconds <= 60; // Last minute warning
  const isCritical = remainingSeconds <= 30; // Last 30 seconds

  return (
    <Badge
      variant={isCritical ? "destructive" : isLowTime ? "secondary" : "outline"}
      className={`gap-2 text-sm px-3 py-1 ${isCritical ? "animate-pulse" : ""}`}
    >
      {isLowTime ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      残り {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </Badge>
  );
}
