import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp?: string;
}

export default function ChatMessage({ message, isAI, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 w-full", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      <div className={cn("flex flex-col", isAI ? "items-start" : "items-end", "max-w-3xl")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3",
            isAI
              ? "bg-card border border-card-border"
              : "bg-primary text-primary-foreground"
          )}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 font-mono">{timestamp}</span>
        )}
      </div>
      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
