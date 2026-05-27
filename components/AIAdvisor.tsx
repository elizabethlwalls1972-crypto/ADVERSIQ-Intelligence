import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Cpu, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';
import { sendMessageStream } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const AIAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "NEXUS_OS_v4.1 ONLINE. \n\nEngine Status: STANDBY. \n\nAwaiting mission parameters. How may I calculate value for you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await sendMessageStream(userMessage.text);
      
      const botMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'model',
        text: '',
        isStreaming: true
      }]);

      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: fullText }
            : msg
        ));
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "ERR: CONNECTION_INTERRUPTED. Rerouting to backup node..."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-40 bg-bw-gold text-bw-navy p-4 rounded-full shadow-2xl hover:bg-white transition-colors duration-300 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-[95vw] sm:w-[400px] h-[600px] bg-bw-navy rounded-t-lg sm:rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-700 font-mono"
          >
            {/* Header */}
            <div className="bg-black/40 p-3 flex justify-between items-center text-white border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="text-green-400">
                    <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs tracking-wider text-bw-gold">NEXUS_OS_v4.1</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bw-navy text-sm scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 ${
                      msg.role === 'user'
                        ? 'bg-gray-800 text-gray-200 border border-gray-600 rounded-sm'
                        : 'bg-transparent text-green-400 pl-0'
                    }`}
                  >
                   {msg.role === 'model' && <span className="mr-2 select-none text-bw-gold">{`>`}</span>}
                   {msg.role === 'model' ? (
                        <div className="prose prose-sm prose-invert max-w-none inline-block align-top">
                             <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                   ) : (
                       msg.text
                   )}
                  </div>
                </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                     <div className="text-green-400 pl-0 p-3">
                         <span className="mr-2 text-bw-gold">{`>`}</span>
                         <span className="animate-pulse">CALCULATING...</span>
                     </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/40 border-t border-gray-700">
              <div className="flex items-center space-x-2 bg-gray-900 rounded-sm px-4 py-2 border border-gray-700 focus-within:border-bw-gold transition-all">
                <span className="text-bw-gold">{`$`}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter command..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-200 placeholder-gray-600 font-mono"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="text-gray-400 hover:text-bw-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
