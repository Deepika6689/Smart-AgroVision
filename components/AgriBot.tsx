
import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { createChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { FiSend, FiLoader, FiX } from 'react-icons/fi';
import { Chat } from '@google/genai';

interface AgriBotProps {
  diseaseContext: string;
  onClose: () => void;
}

const AgriBot: React.FC<AgriBotProps> = ({ diseaseContext, onClose }) => {
  const { t, language } = useLocalization();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a new chat session when context or language changes
    chatRef.current = createChat(language, diseaseContext);
    setMessages([]);
  }, [diseaseContext, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: input });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = modelResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Gemini chat error:', error);
      const errorMessage: ChatMessage = { role: 'model', text: t('msgs.botError') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-full max-w-md h-[70vh] max-h-[600px] bg-white/5 dark:bg-gray-800/50 backdrop-blur-xl border border-white/10 dark:border-gray-700/50 rounded-2xl shadow-2xl z-50 flex flex-col animate-slide-up">
      <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/50 flex-shrink-0">
        <h3 className="text-lg font-bold text-green-400">{t('agriBotTitle')}</h3>
        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/50">
          <FiX size={20} />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
             <div className="flex justify-start">
                <div className="max-w-lg px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">
                    <FiLoader className="animate-spin" />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex items-center border border-gray-300/30 dark:border-gray-600/50 rounded-lg p-1 bg-white/5 dark:bg-gray-900/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('askMe')}
            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 ml-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgriBot;
