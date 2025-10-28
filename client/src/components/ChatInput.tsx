import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            data-testid="input-chat-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about events, tutoring, deadlines..."
            className="min-h-[52px] max-h-32 resize-none pr-12"
            disabled={disabled}
          />
          <Button
            data-testid="button-voice-input"
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2"
            onClick={() => console.log('Voice input clicked')}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        <Button
          data-testid="button-send-message"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="min-h-[52px]"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
