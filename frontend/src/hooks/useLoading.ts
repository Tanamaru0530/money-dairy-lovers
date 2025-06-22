import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingReturn {
  isLoading: (key?: string) => boolean;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  withLoading: <T>(fn: () => Promise<T>, key?: string) => Promise<T>;
  loadingStates: LoadingState;
  isAnyLoading: boolean;
}

/**
 * ローディング状態を管理するカスタムフック
 * 複数のローディング状態を個別に管理できる
 */
export const useLoading = (defaultKeys: string[] = []): UseLoadingReturn => {
  const initialState = defaultKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as LoadingState);

  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  const isLoading = useCallback((key: string = 'default'): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const startLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const withLoading = useCallback(async <T,>(
    fn: () => Promise<T>,
    key: string = 'default'
  ): Promise<T> => {
    startLoading(key);
    try {
      return await fn();
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const isAnyLoading = Object.values(loadingStates).some(state => state);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    loadingStates,
    isAnyLoading
  };
};

/**
 * 初期ローディング状態を管理するカスタムフック
 * 最初のデータ取得時にスケルトンスクリーンを表示するために使用
 */
export const useInitialLoading = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setIsInitialLoading(false);
  }, []);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isInitialLoading,
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};