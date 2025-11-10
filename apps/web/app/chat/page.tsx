"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

// Define the shape of a chat message
interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // --- AI LOGIC IS SKIPPED ---
    // In a real app, this is where you would fetch('/api/chat-with-data')
    // For now, we'll just return a placeholder message.
    setTimeout(() => {
      const botMessage: ChatMessage = {
        type: 'bot',
        content: `You asked: "${input}". The AI service is not connected.`,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 flex flex-col h-screen">
        <Header />
        
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.type === 'user' ? (
                <UserMessage content={msg.content} />
              ) : (
                <BotMessage content={msg.content} />
              )}
            </div>
          ))}
          {isLoading && <LoadingMessage />}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            className="bg-gray-900 border-gray-800"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>
    </div>
  );
}

// --- Helper components for displaying messages ---

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-lg">
        {content}
      </div>
    </div>
  );
}

function BotMessage({ content }: { content: string }) {
  return (
    <div className="flex">
      <div className="bg-gray-800 rounded-lg px-4 py-2 max-w-full w-full">
        <p>{content}</p>
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex">
      <div className="bg-gray-800 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}