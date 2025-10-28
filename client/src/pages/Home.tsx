import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SuggestedQuery from "@/components/SuggestedQuery";
import TypingIndicator from "@/components/TypingIndicator";
import EventCard, { type EventCardProps } from "@/components/EventCard";
import DeadlineCard, { type DeadlineCardProps } from "@/components/DeadlineCard";
import TutoringSession, { type TutoringSessionProps } from "@/components/TutoringSession";
import { ScrollArea } from "@/components/ui/scroll-area";

// TODO: Remove mock data - this is sample data for the prototype
const mockEvents: EventCardProps[] = [
  {
    id: "1",
    title: "AI Workshop: Building Campus Apps",
    date: "Oct 30, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Engineering Building, Room 205",
    category: "Academic",
    description: "Learn how to build AI-powered applications for campus use."
  },
  {
    id: "2",
    title: "Career Fair 2025",
    date: "Nov 5, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Student Center, Main Hall",
    category: "Career",
    description: "Meet with top employers and explore internship opportunities."
  },
  {
    id: "3",
    title: "Fall Concert Series",
    date: "Nov 8, 2025",
    time: "7:00 PM - 9:00 PM",
    location: "Performing Arts Center",
    category: "Arts",
  }
];

const mockDeadlines: DeadlineCardProps[] = [
  {
    id: "1",
    title: "Project Proposal Submission",
    dueDate: "Oct 28, 2025 11:59 PM",
    course: "CS 401: Senior Capstone",
    urgency: "today",
    description: "Submit your final project proposal."
  },
  {
    id: "2",
    title: "Midterm Exam",
    dueDate: "Nov 2, 2025 2:00 PM",
    course: "MATH 301: Linear Algebra",
    urgency: "thisWeek",
  }
];

const mockTutoring: TutoringSessionProps[] = [
  {
    id: "1",
    tutor: "Dr. Sarah Johnson",
    subject: "Calculus I & II",
    time: "Today, 2:00 PM - 4:00 PM",
    location: "Building A, Room 305",
    availability: "Available"
  },
  {
    id: "2",
    tutor: "Prof. Michael Chen",
    subject: "Computer Science",
    time: "Tomorrow, 3:00 PM - 5:00 PM",
    location: "CS Lab, Room 120",
    availability: "Limited"
  }
];

const suggestedQueries = [
  "Today's events",
  "Tutoring hours",
  "Upcoming deadlines",
  "Career fair schedule"
];

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your campus AI assistant powered by NVIDIA Nemotron. I can help you find tutoring sessions, events, deadlines, and class information. What would you like to know?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // TODO: Remove mock functionality - replace with actual NVIDIA Nemotron API call
  const simulateAIResponse = (query: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("event") || lowerQuery.includes("today")) {
        response = `Here are today's upcoming events:\n\n${mockEvents.map(e => 
          `• ${e.title}\n  ${e.time} at ${e.location}`
        ).join('\n\n')}\n\nWould you like more details about any of these events?`;
      } else if (lowerQuery.includes("tutor")) {
        response = `Here are the available tutoring sessions:\n\n${mockTutoring.map(t => 
          `• ${t.subject} with ${t.tutor}\n  ${t.time} at ${t.location}\n  Status: ${t.availability}`
        ).join('\n\n')}\n\nWould you like to book a session?`;
      } else if (lowerQuery.includes("deadline")) {
        response = `Here are your upcoming deadlines:\n\n${mockDeadlines.map(d => 
          `• ${d.title}\n  ${d.course}\n  Due: ${d.dueDate}`
        ).join('\n\n')}\n\nNeed help managing your deadlines?`;
      } else if (lowerQuery.includes("career")) {
        response = "The Career Fair 2025 is scheduled for November 5th from 10:00 AM to 4:00 PM at the Student Center Main Hall. Over 50 employers will be attending, including tech companies, consulting firms, and research institutions. Would you like tips on how to prepare?";
      } else {
        response = "I can help you with information about campus events, tutoring sessions, academic deadlines, and class schedules. Try asking about today's events, available tutoring, or upcoming deadlines!";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: response,
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(text);
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

                  {/* TODO: Remove sample content display */}
                  <div className="mt-12 space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {mockEvents.slice(0, 2).map((event) => (
                          <EventCard key={event.id} {...event} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Your Deadlines</h2>
                      <div className="space-y-3">
                        {mockDeadlines.map((deadline) => (
                          <DeadlineCard key={deadline.id} {...deadline} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Available Tutoring</h2>
                      <div className="space-y-3">
                        {mockTutoring.map((session) => (
                          <TutoringSession key={session.id} {...session} />
                        ))}
                      </div>
                    </div>
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
