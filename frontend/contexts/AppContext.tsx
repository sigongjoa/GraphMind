import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// 앱 상태 타입 정의
interface AppState {
  // 사용자 관련 상태
  user: {
    isLoggedIn: boolean;
    preferences: {
      darkMode: boolean;
    };
  };
  
  // 개념 그래프 관련 상태
  conceptGraph: {
    selectedConceptId: number | null;
    viewMode: 'graph' | 'list';
    filter: string;
  };
  
  // 학습 관련 상태
  learning: {
    currentConceptId: number | null;
    sessionActive: boolean;
  };
  
  // LLM 관련 상태
  llm: {
    status: 'online' | 'offline' | 'error' | 'unknown';
    lastChecked: string | null;
  };
}

// 초기 상태
const initialState: AppState = {
  user: {
    isLoggedIn: false,
    preferences: {
      darkMode: false,
    },
  },
  conceptGraph: {
    selectedConceptId: null,
    viewMode: 'graph',
    filter: 'all',
  },
  learning: {
    currentConceptId: null,
    sessionActive: false,
  },
  llm: {
    status: 'unknown',
    lastChecked: null,
  },
};

// 액션 타입 정의
type ActionType =
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SELECT_CONCEPT'; payload: number | null }
  | { type: 'SET_VIEW_MODE'; payload: 'graph' | 'list' }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'START_LEARNING_SESSION'; payload: number }
  | { type: 'END_LEARNING_SESSION' }
  | { type: 'SET_LLM_STATUS'; payload: { status: 'online' | 'offline' | 'error' | 'unknown' } };

// 리듀서 함수
function appReducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case 'SET_DARK_MODE':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            darkMode: action.payload,
          },
        },
      };
      
    case 'SELECT_CONCEPT':
      return {
        ...state,
        conceptGraph: {
          ...state.conceptGraph,
          selectedConceptId: action.payload,
        },
      };
      
    case 'SET_VIEW_MODE':
      return {
        ...state,
        conceptGraph: {
          ...state.conceptGraph,
          viewMode: action.payload,
        },
      };
      
    case 'SET_FILTER':
      return {
        ...state,
        conceptGraph: {
          ...state.conceptGraph,
          filter: action.payload,
        },
      };
      
    case 'START_LEARNING_SESSION':
      return {
        ...state,
        learning: {
          currentConceptId: action.payload,
          sessionActive: true,
        },
      };
      
    case 'END_LEARNING_SESSION':
      return {
        ...state,
        learning: {
          currentConceptId: null,
          sessionActive: false,
        },
      };
      
    case 'SET_LLM_STATUS':
      return {
        ...state,
        llm: {
          status: action.payload.status,
          lastChecked: new Date().toISOString(),
        },
      };
      
    default:
      return state;
  }
}

// 컨텍스트 타입 정의
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
  // 자주 사용되는 액션들을 위한 유틸리티 함수들
  selectConcept: (conceptId: number | null) => void;
  startLearningSession: (conceptId: number) => void;
  endLearningSession: () => void;
  setLlmStatus: (status: 'online' | 'offline' | 'error' | 'unknown') => void;
  toggleDarkMode: () => void;
}

// 컨텍스트 생성
const AppContext = createContext<AppContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 유틸리티 함수들
  const selectConcept = useCallback((conceptId: number | null) => {
    dispatch({ type: 'SELECT_CONCEPT', payload: conceptId });
  }, []);

  const startLearningSession = useCallback((conceptId: number) => {
    dispatch({ type: 'START_LEARNING_SESSION', payload: conceptId });
  }, []);

  const endLearningSession = useCallback(() => {
    dispatch({ type: 'END_LEARNING_SESSION' });
  }, []);

  const setLlmStatus = useCallback((status: 'online' | 'offline' | 'error' | 'unknown') => {
    dispatch({ type: 'SET_LLM_STATUS', payload: { status } });
  }, []);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'SET_DARK_MODE', payload: !state.user.preferences.darkMode });
  }, [state.user.preferences.darkMode]);

  const value = {
    state,
    dispatch,
    selectConcept,
    startLearningSession,
    endLearningSession,
    setLlmStatus,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 커스텀 훅
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;