import { ChatInterface } from "../../../components/ai/chat-interface";

export default function MessagesPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h2 className="font-heading text-3xl font-bold">Health Copilot</h2>
        <p className="text-text/60 mt-1">Your personal AI health assistant</p>
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  );
}
