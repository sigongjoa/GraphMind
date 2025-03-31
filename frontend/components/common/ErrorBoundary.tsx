import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // 여기에 에러 로깅 서비스에 에러를 보내는 코드를 추가할 수 있습니다.
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-sm text-red-700 mb-4">
            컴포넌트 렌더링 중 문제가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.
          </p>
          <details className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <summary>오류 상세 정보</summary>
            <p className="mt-2 whitespace-pre-wrap">{this.state.error?.toString()}</p>
            <p className="mt-2 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
