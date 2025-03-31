// 학습 모드 컴포넌트: LLMInteraction.tsx
import React from 'react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMInteractionProps {
  messages: Message[];
}

const LLMInteraction: React.FC<LLMInteractionProps> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.filter(msg => msg.role !== 'system').map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-3/4 rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center mr-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="font-medium">AI 튜터</span>
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LLMInteraction;
