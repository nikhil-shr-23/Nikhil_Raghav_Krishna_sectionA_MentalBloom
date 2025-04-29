'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sentiment?: {
    sentiment: string;
    scores: {
      positive: number;
      negative: number;
      neutral: number;
    };
    compound: number;
  };
  intent?: {
    primary_intent: string;
    confidence: number;
    is_emergency: boolean;
  };
  sources?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [currentSources, setCurrentSources] = useState<Array<{
    title?: string;
    url?: string;
    content?: string;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Save conversation ID for future messages
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message || data.response || "I'm here to help. What's on your mind?",
        timestamp: data.timestamp || new Date().toISOString(),
        sentiment: data.sentiment,
        intent: data.intent,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Store sources for the info panel
      if (data.sources && data.sources.length > 0) {
        setCurrentSources(data.sources);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Sorry, there was an error processing your message. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'bg-gray-100';
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-[#A0E7E5]';
      case 'negative':
        return 'bg-[#FEEA8C]';
      default:
        return 'bg-gray-100';
    }
  };

  const getIntentLabel = (intent?: string) => {
    if (!intent) return '';
    switch (intent.toLowerCase()) {
      case 'seeking_advice':
        return 'Seeking Advice';
      case 'venting':
        return 'Venting';
      case 'greeting':
        return 'Greeting';
      case 'farewell':
        return 'Farewell';
      case 'gratitude':
        return 'Gratitude';
      case 'emergency':
        return 'Emergency';
      default:
        return intent;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-semibold text-slate-800">MentalBloom Chat</h1>
            <p className="text-sm text-slate-500">Chat with our AI assistant about how you&apos;re feeling</p>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F4F9F4]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to MentalBloom Chat</h2>
                <p className="text-slate-500 max-w-md">
                  Share how you&apos;re feeling, ask questions, or seek guidance. Our AI is here to support your mental wellbeing.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-[#4D96FF] text-white'
                        : 'bg-white text-slate-800'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>

                    {message.role === 'assistant' && message.sentiment && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(
                            message.sentiment.sentiment
                          )}`}
                        >
                          {message.sentiment.sentiment}
                        </span>

                        {message.intent && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                            {getIntentLabel(message.intent.primary_intent)}
                          </span>
                        )}

                        {message.sources && message.sources.length > 0 && (
                          <button
                            onClick={() => setShowSources(!showSources)}
                            className="text-xs px-2 py-1 rounded-full bg-[#6BCB77] text-white"
                          >
                            {message.sources.length} {message.sources.length === 1 ? 'Source' : 'Sources'}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-1 text-xs text-right opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#6BCB77] text-white p-3 rounded-r-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#6BCB77] focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block animate-pulse">...</span>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sources panel (only visible when sources are available and panel is toggled) */}
        {showSources && currentSources.length > 0 && (
          <div className="hidden md:block w-80 bg-white border-l overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-slate-800">Sources</h3>
              <button
                onClick={() => setShowSources(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {currentSources.map((source, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm">{source.title}</h4>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4D96FF] hover:underline block truncate"
                    >
                      {source.url}
                    </a>
                  )}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
