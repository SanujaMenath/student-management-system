'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPrompts = [
  'What are the admission requirements?',
  'What programs do you offer?',
  'How much are the fees?',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! How can I help you today? Ask me about admissions, programs or fees.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Sorry, I had trouble retrieving information. Please reach out to our administration office.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to assistant. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] h-[490px] bg-white rounded-3xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.18)] border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#0C4A35] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E5A93C] text-slate-900 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 fill-slate-900 text-slate-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight text-white leading-none">
                  Handahamy Assistant
                </h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-200/90 font-medium leading-none">
                    Online now
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-emerald-100/70 hover:text-white hover:bg-emerald-900/40 transition"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFDFC]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0C4A35] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Quick Prompts List (visible initially) */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 hover:text-[#0C4A35] hover:border-[#0C4A35]/30 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <span className="w-1.5 h-1.5 bg-[#0C4A35] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-[#0C4A35] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-[#0C4A35] rounded-full animate-bounce" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white disabled:opacity-40 transition shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer"
      >
        {isOpen ? (
          <>
            <X className="w-3.5 h-3.5" />
            <span>Chat with us</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>Chat with us</span>
          </>
        )}
      </button>
    </div>
  );
}