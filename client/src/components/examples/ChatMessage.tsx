import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="space-y-4 p-4 bg-background">
      <ChatMessage 
        message="Hello! I'm your campus AI assistant. I can help you find tutoring sessions, events, deadlines, and class information. What would you like to know?"
        isAI={true}
        timestamp="10:30 AM"
      />
      <ChatMessage 
        message="When is the next math tutoring session?"
        isAI={false}
        timestamp="10:31 AM"
      />
      <ChatMessage 
        message="The next Math tutoring session is today at 2:00 PM in Building A, Room 305. Dr. Sarah Johnson will be available for Calculus I and II help. Would you like me to show you more upcoming sessions?"
        isAI={true}
        timestamp="10:31 AM"
      />
    </div>
  );
}
