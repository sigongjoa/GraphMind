import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ErrorContextType {
  error: Error | null;
  setError: (error: Error | null) => void;
  showError: (message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError(): ErrorContextType {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps): JSX.Element {
  const [error, setErrorState] = useState<Error | null>(null);

  const setError = (error: Error | null) => {
    setErrorState(error);
  };

  const showError = (message: string) => {
    setErrorState(new Error(message));
  };

  const clearError = () => {
    setErrorState(null);
  };

  return (
    <ErrorContext.Provider value={{ error, setError, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export default ErrorContext;