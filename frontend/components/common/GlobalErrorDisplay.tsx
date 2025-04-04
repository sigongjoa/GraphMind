import React, { useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import Button from './Button';

interface GlobalErrorDisplayProps {
  timeout?: number; // 자동으로 사라지는 시간 (ms), 0이면 자동으로 사라지지 않음
}

const GlobalErrorDisplay: React.FC<GlobalErrorDisplayProps> = ({ timeout = 0 }) => {
  const { error, clearError } = useError();

  // 타임아웃 설정
  useEffect(() => {
    if (error && timeout > 0) {
      const timer = setTimeout(() => {
        clearError();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [error, timeout, clearError]);

  if (!error) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
      <div className="bg-red-50 border border-red-200 rounded-md p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={clearError}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span className="sr-only">닫기</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            페이지 새로고침
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorDisplay;