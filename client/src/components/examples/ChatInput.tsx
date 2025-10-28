import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="bg-background">
      <ChatInput onSend={(msg) => console.log('Sent:', msg)} />
    </div>
  );
}
