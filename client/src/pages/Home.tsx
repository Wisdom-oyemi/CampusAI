import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SuggestedQuery from "@/components/SuggestedQuery";
import TypingIndicator from "@/components/TypingIndicator";
import EventCard, { type EventCardProps } from "@/components/EventCard";
import DeadlineCard, { type DeadlineCardProps } from "@/components/DeadlineCard";
import TutoringSession, { type TutoringSessionProps } from "@/components/TutoringSession";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const suggestedQueries = [
  "Today's events",
  "Tutoring hours",
  "Upcoming deadlines",
  "Career fair schedule"
];

interface ServerMessage {
  id: string;
  message: string;
  isAI: string;
  timestamp: Date;
}

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

export default function Home() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory } = useQuery<ServerMessage[]>({
    queryKey: ['/api/chat/history'],
  });

  useEffect(() => {
    if (chatHistory && !historyLoaded) {
      if (chatHistory.length === 0) {
        setMessages([
          {
            id: "welcome",
            text: "Hello! I'm your campus AI assistant powered by NVIDIA Nemotron. I can help you find tutoring sessions, events, deadlines, and class information. What would you like to know?",
            isAI: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(chatHistory.map(msg => ({
          id: msg.id,
          text: msg.message,
          isAI: msg.isAI === "true",
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
      setHistoryLoaded(true);
    }
  }, [chatHistory, historyLoaded]);

  const { data: events = [] } = useQuery<EventCardProps[]>({
    queryKey: ['/api/events'],
  });

  const { data: deadlines = [] } = useQuery<DeadlineCardProps[]>({
    queryKey: ['/api/deadlines'],
  });

  const { data: tutoringSessions = [] } = useQuery<TutoringSessionProps[]>({
    queryKey: ['/api/tutoring'],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendChatMessage = async (message: string) => {
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: data.aiMessage.id,
        text: data.aiMessage.message,
        isAI: true,
        timestamp: new Date(data.aiMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error: any) {
      setIsTyping(false);
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      text,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? {
              id: data.userMessage.id,
              text: data.userMessage.message,
              isAI: false,
              timestamp: new Date(data.userMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          : msg
      ));
      
      sendChatMessage(text);
    } catch (error: any) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuggestedQuery = (query: string) => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="py-6 space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isAI={message.isAI}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && <TypingIndicator />}
              
              {messages.length === 1 && (
                <div className="mt-8">
                  <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQueries.map((query) => (
                      <SuggestedQuery
                        key={query}
                        query={query}
                        onClick={handleSuggestedQuery}
                      />
                    ))}
                  </div>

                  <div className="mt-12 space-y-8">
                    {events.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                          {events.slice(0, 2).map((event) => (
                            <EventCard key={event.id} {...event} />
                          ))}
                        </div>
                      </div>
                    )}

                    {deadlines.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-4">Your Deadlines</h2>
                        <div className="space-y-3">
                          {deadlines.map((deadline) => (
                            <DeadlineCard key={deadline.id} {...deadline} />
                          ))}
                        </div>
                      </div>
                    )}

                    {tutoringSessions.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-4">Available Tutoring</h2>
                        <div className="space-y-3">
                          {tutoringSessions.map((session) => (
                            <TutoringSession key={session.id} {...session} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}
