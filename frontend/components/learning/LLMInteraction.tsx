import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMInteractionProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const LLMInteraction: React.FC<LLMInteractionProps> = ({ 
  messages, 
  onSendMessage 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    await onSendMessage(input);
    setInput('');
    setIsLoading(false);
  };

  const getMessageStyle = (role: string) => {
    switch (role) {
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'user':
        return 'bg-primary text-white ml-auto';
      case 'assistant':
        return 'bg-secondary text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`max-w-[80%] rounded-lg p-3 ${getMessageStyle(message.role)}`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={!input.trim() || isLoading}
          >
            전송
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LLMInteraction;
