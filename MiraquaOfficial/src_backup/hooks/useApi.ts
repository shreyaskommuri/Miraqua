import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { ApiError } from '@/services/apiService';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: { [key: string]: string };
  body?: any;
}

export const useApi = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(
    async (options: RequestOptions = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiService.request<T>(endpoint, options);
        setData(result);
        return result;
      } catch (err: any) {
        setError(err instanceof ApiError ? err : new ApiError('An unexpected error occurred'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint]
  );

  const mutate = useCallback(
    async (payload: any, options: RequestOptions = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiService.request<T>(endpoint, {
          ...options,
          method: options.method || 'POST',
          body: payload,
        });
        setData(result);
        return result;
      } catch (err: any) {
        setError(err instanceof ApiError ? err : new ApiError('An unexpected error occurred'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint]
  );

  return { data, isLoading, error, fetchData, mutate };
};
