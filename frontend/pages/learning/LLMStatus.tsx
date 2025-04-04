import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMInteractionProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLlmOffline?: boolean;
}

const LLMInteraction: React.FC<LLMInteractionProps> = ({ 
  messages, 
  onSendMessage,
  isLlmOffline = false
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

  // 예시 질문 목록
  const exampleQuestions = [
    '이 개념의 정의는 무엇인가요?',
    '이 개념의 핵심 특징을 알려주세요',
    '이 개념이 중요한 이유는 무엇인가요?',
    '이 개념의 실제 응용 사례는 무엇인가요?',
    '이 개념과 관련된 다른 개념은 무엇이 있나요?'
  ];

  // 랜덤 예시 질문 가져오기
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * exampleQuestions.length);
    return exampleQuestions[randomIndex];
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
              {message.role === 'system' && (
                <div className="text-xs opacity-70 mb-1">시스템</div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        {isLlmOffline && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-2 mb-3 text-sm rounded">
            <p>현재 LLM 서비스가 오프라인 상태입니다. 질문을 입력할 수 있지만, 상세한 응답을 받지 못할 수 있습니다.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLlmOffline ? "LLM 서비스가 오프라인 상태입니다" : "질문을 입력하세요..."}
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
        
        {/* 예시 질문 제안 */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">질문 예시:</p>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <button
                key={i}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                onClick={() => setInput(getRandomQuestion())}
                disabled={isLoading}
              >
                {getRandomQuestion()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMInteraction;