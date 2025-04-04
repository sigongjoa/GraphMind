import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

interface UseDataFetchResult<T> extends FetchState<T> {
  refetch: () => Promise<void>;
}

/**
 * 데이터 로딩을 위한 공통 훅
 * 
 * @param fetchFn 데이터를 가져오는 함수
 * @param dependencies 의존성 배열 (fetchFn이 의존하는 값들)
 * @param initialFetch 초기 로딩 여부 (기본값: true)
 * @returns 데이터 상태와 refetch 함수
 */
function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  initialFetch: boolean = true
): UseDataFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: initialFetch,
    error: null,
    isSuccess: false,
  });

  const fetch = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await fetchFn();
      setState({
        data,
        isLoading: false,
        error: null,
        isSuccess: true,
      });
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('데이터를 불러오는 중 오류가 발생했습니다'),
        isSuccess: false,
      });
    }
  }, [fetchFn, ...dependencies]);

  useEffect(() => {
    if (initialFetch) {
      fetch();
    }
  }, [fetch, initialFetch]);

  return {
    ...state,
    refetch: fetch,
  };
}

export default useDataFetch;