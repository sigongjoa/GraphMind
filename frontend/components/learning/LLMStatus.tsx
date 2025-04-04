import React from 'react';
import Button from '../common/Button';

interface LLMStatusProps {
  status: {
    status: string;
    message?: string;
  };
  isChecking: boolean;
  onRetry: () => void;
  className?: string;
}

const LLMStatus: React.FC<LLMStatusProps> = ({
  status,
  isChecking,
  onRetry,
  className = ''
}) => {
  const getStatusInfo = () => {
    switch (status.status) {
      case 'online':
        return {
          color: 'bg-green-100 border-green-200 text-green-700',
          icon: '✓',
          text: 'LLM 서비스가 온라인 상태입니다'
        };
      case 'offline':
        return {
          color: 'bg-red-100 border-red-200 text-red-700',
          icon: '✗',
          text: 'LLM 서비스가 오프라인 상태입니다'
        };
      case 'error':
        return {
          color: 'bg-yellow-100 border-yellow-200 text-yellow-700',
          icon: '⚠',
          text: 'LLM 서비스 연결 중 오류가 발생했습니다'
        };
      default:
        return {
          color: 'bg-gray-100 border-gray-200 text-gray-700',
          icon: '?',
          text: 'LLM 서비스 상태를 확인 중입니다'
        };
    }
  };

  const { color, icon, text } = getStatusInfo();

  return (
    <div className={`border rounded-md p-3 flex items-center justify-between ${color} ${className}`}>
      <div className="flex items-center">
        <span className="font-bold mr-2">{icon}</span>
        <span>{text}</span>
        {status.message && <span className="ml-2 text-sm opacity-75">({status.message})</span>}
      </div>
      {status.status !== 'online' && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          isLoading={isChecking}
          className="ml-2"
        >
          {isChecking ? '확인 중...' : '재연결'}
        </Button>
      )}
    </div>
  );
};

export default LLMStatus;