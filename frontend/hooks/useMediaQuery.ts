import { useState, useEffect } from 'react';

/**
 * 미디어 쿼리 일치 여부를 확인하는 훅
 * 
 * @param query 미디어 쿼리 문자열 (예: '(min-width: 768px)')
 * @returns 쿼리 일치 여부
 */
function useMediaQuery(query: string): boolean {
  // 서버 사이드 렌더링 시 기본값 false
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // window 객체가 있는지 확인 (클라이언트 사이드 렌더링)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // 초기 상태 설정
      setMatches(media.matches);

      // 변경 이벤트 리스너 함수
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // 리스너 등록
      media.addEventListener('change', listener);

      // 클린업 함수
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]);

  return matches;
}

// 일반적인 브레이크포인트에 대한 훅들
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsSmallScreen(): boolean {
  return useMediaQuery('(max-width: 1023px)');
}

export function useIsLargeScreen(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

export default useMediaQuery;