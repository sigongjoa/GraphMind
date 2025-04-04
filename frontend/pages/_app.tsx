import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Layout from '@/components/common/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import GlobalErrorDisplay from '@/components/common/GlobalErrorDisplay';

function MyApp({ Component, pageProps }: AppProps) {
  // 다크 모드 설정 (localStorage 기반)
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const htmlEl = document.documentElement;
      
      if (savedDarkMode) {
        htmlEl.classList.add('dark');
      } else {
        htmlEl.classList.remove('dark');
      }
    }
  }, []);

  return (
    <ErrorProvider>
      <AppProvider>
        <ErrorBoundary>
          <Layout>
            <GlobalErrorDisplay timeout={5000} />
            <Component {...pageProps} />
          </Layout>
        </ErrorBoundary>
      </AppProvider>
    </ErrorProvider>
  );
}

export default MyApp;