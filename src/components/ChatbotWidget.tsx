'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Scissors,
  Bot,
  User,
  RotateCcw,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste & Welcome to Lumière Salon! ✨\nI am Lumi, your salon AI assistant. You can ask me anything about our services, real-time prices, timings, or bookings in English, Hindi, Hinglish, or Marathi!\n\n(Note: Hum sirf salon visit services provide karte hain, home delivery nahi.)',
      timestamp: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    'Haircut price & time?',
    'Hair spa kitne ka hai?',
    'Facial che charges kay ahet?',
    'What are your timings?',
    'Do you provide home delivery?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const json = await res.json();

      if (json.success && json.reply) {
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: json.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: json.source,
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error(json.error || 'No response');
      }
    } catch (err) {
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf kijiye, temporary network issue aala ahe. Humare salon me Haircut ₹200, Beard Trim ₹100, Hair Spa ₹800, Facial ₹500, Bridal Makeup ₹5000 ahet. Timings: 9 AM - 8 PM.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you today? You can ask in Hinglish, Hindi, Marathi, or English!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div id="chatbot-widget" className="fixed bottom-6 right-6 z-50">
      {/* Launcher Button */}
      {!isOpen && (
        <button
          id="btn-open-chatbot"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#1A1412] text-white font-bold text-xs uppercase tracking-wider shadow-2xl hover:bg-[#2E2522] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-[#E892A2]/60"
        >
          <div className="w-7 h-7 rounded-full bg-[#E892A2] flex items-center justify-center text-[#1A1412] shadow">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-wide">Ask Lumi AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#E892A2] border border-white absolute -top-1 -right-1 animate-ping"></span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[580px] max-h-[85vh] flex flex-col rounded-3xl bg-white border border-[#E8DDD4] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-[#1A1412] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E892A2] text-[#1A1412] flex items-center justify-center font-black shadow-md">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-sm">Lumi — Salon AI</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E892A2]/20 text-[#E892A2] font-bold border border-[#E892A2]/30">
                    Live DB
                  </span>
                </div>
                <p className="text-[11px] text-white/70">Hinglish • Marathi • Hindi • English</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearHistory}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="btn-close-chatbot"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-[#F8F3ED] border-b border-[#E8DDD4] overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-[#F3EBE3] text-[#5A4E49] hover:text-[#1A1412] whitespace-nowrap transition-colors border border-[#E8DDD4] cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF6F2]">
            {messages.map((m) => {
              const isBot = m.sender === 'assistant';

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-[#F3E5E8] text-[#D4708A] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isBot
                        ? 'bg-white border border-[#E8DDD4] text-[#1A1412]'
                        : 'bg-[#1A1412] text-white font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right ${
                        isBot ? 'text-[#8C7A73]' : 'text-white/70'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-full bg-[#E892A2] text-[#1A1412] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-[#8C7A73] text-xs pl-9">
                <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl border border-[#E8DDD4] shadow-xs">
                  <span className="w-1.5 h-1.5 bg-[#E892A2] rounded-full animate-bounce"></span>
                  <span
                    className="w-1.5 h-1.5 bg-[#E892A2] rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-[#E892A2] rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </div>
                <span className="text-[10px]">Lumi is typing...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#E8DDD4] flex items-center gap-2"
          >
            <input
              id="input-chatbot-message"
              type="text"
              placeholder="Ask in Hindi, Marathi, Hinglish, English..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] placeholder-[#A0938D] text-xs focus:outline-none focus:border-[#E892A2] focus:bg-white transition-colors"
            />
            <button
              id="btn-chatbot-send"
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-full bg-[#1A1412] hover:bg-[#2E2522] disabled:bg-gray-200 text-white disabled:text-gray-400 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
