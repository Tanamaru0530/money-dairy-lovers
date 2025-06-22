import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const result = await asyncFunction();
      setState({ data: result, isLoading: false, error: null });

      if (options?.successMessage) {
        console.log('Success:', options.successMessage);
      }

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      setState({ data: null, isLoading: false, error: errorObj });

      if (options?.errorMessage) {
        console.error('Error:', options.errorMessage);
      } else {
        console.error('Error:', errorObj.message || 'エラーが発生しました');
      }

      if (options?.onError) {
        options.onError(errorObj);
      }

      throw errorObj;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}