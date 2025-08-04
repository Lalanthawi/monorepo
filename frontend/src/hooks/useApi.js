/**
 * API HOOKS
 * 
 * Custom hooks for API interactions with loading states, error handling, and caching.
 * Easy to extend with new API patterns during presentations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/core/ApiService.js';
import { cacheService } from '../services/core/CacheService.js';

// MODIFICATION POINT: Generic API hook with caching
export const useApi = (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    dependencies = [],
    immediate = true,
    cacheKey = null,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (overrideBody = body) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Check cache first for GET requests
      if (method === 'GET' && cacheKey) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          onSuccess?.(cachedData);
          return { data: cachedData, error: null };
        }
      }

      let result;
      switch (method.toLowerCase()) {
        case 'get':
          result = await apiService.get(endpoint);
          break;
        case 'post':
          result = await apiService.post(endpoint, overrideBody);
          break;
        case 'put':
          result = await apiService.put(endpoint, overrideBody);
          break;
        case 'patch':
          result = await apiService.patch(endpoint, overrideBody);
          break;
        case 'delete':
          result = await apiService.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Cache GET requests
      if (method === 'GET' && cacheKey) {
        cacheService.set(cacheKey, result, cacheTTL);
      }

      setData(result);
      onSuccess?.(result);
      return { data: result, error: null };
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        onError?.(err);
        return { data: null, error: err.message };
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, body, cacheKey, cacheTTL, onSuccess, onError]);

  useEffect(() => {
    if (immediate && method === 'GET') {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, immediate, method, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute()
  };
};

// MODIFICATION POINT: Pagination hook
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    reset
  };
};

// MODIFICATION POINT: Infinite scroll hook
export const useInfiniteScroll = (fetchMore, hasMore = true) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || !hasMore) return;
      setIsFetching(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!isFetching) return;
    fetchMore().then(() => {
      setIsFetching(false);
    });
  }, [isFetching, fetchMore]);

  return [isFetching, setIsFetching];
};

// MODIFICATION POINT: Form submission hook
export const useApiForm = (endpoint, options = {}) => {
  const {
    method = 'POST',
    onSuccess,
    onError,
    resetOnSuccess = false
  } = options;

  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const updateField = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setSubmitError(null);
  }, []);

  const submit = useCallback(async (overrideData = null) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const dataToSubmit = overrideData || formData;
      
      let result;
      switch (method.toLowerCase()) {
        case 'post':
          result = await apiService.post(endpoint, dataToSubmit);
          break;
        case 'put':
          result = await apiService.put(endpoint, dataToSubmit);
          break;
        case 'patch':
          result = await apiService.patch(endpoint, dataToSubmit);
          break;
        default:
          throw new Error(`Unsupported method for form: ${method}`);
      }

      onSuccess?.(result);
      
      if (resetOnSuccess) {
        setFormData({});
      }

      return { data: result, error: null };
    } catch (err) {
      setSubmitError(err.message);
      onError?.(err);
      return { data: null, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [endpoint, method, formData, onSuccess, onError, resetOnSuccess]);

  const reset = useCallback(() => {
    setFormData({});
    setErrors({});
    setSubmitError(null);
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    errors,
    setFieldError,
    submitError,
    isSubmitting,
    submit,
    reset,
    clearErrors
  };
};

// MODIFICATION POINT: Real-time data hook
export const useRealTimeData = (endpoint, interval = 5000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let intervalId;
    let isActive = true;

    const fetchData = async () => {
      try {
        if (!isActive) return;
        
        const result = await apiService.get(endpoint);
        if (isActive) {
          setData(result);
          setError(null);
          setIsConnected(true);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message);
          setIsConnected(false);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    intervalId = setInterval(fetchData, interval);

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [endpoint, interval]);

  return {
    data,
    loading,
    error,
    isConnected,
    refetch: () => {
      setLoading(true);
      // Trigger immediate fetch by clearing and resetting interval
    }
  };
};

// MODIFICATION POINT: Optimistic updates hook
export const useOptimisticUpdate = (endpoint, cacheKey) => {
  const [optimisticData, setOptimisticData] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

  const performOptimisticUpdate = useCallback(async (updateFn, apiCall) => {
    // Store original data for potential rollback
    const originalData = cacheService.get(cacheKey);
    
    // Apply optimistic update
    const optimisticResult = updateFn(originalData);
    setOptimisticData(optimisticResult);
    cacheService.set(cacheKey, optimisticResult);

    try {
      // Perform actual API call
      const result = await apiCall();
      
      // Update with real data
      setOptimisticData(null);
      cacheService.set(cacheKey, result);
      
      return { success: true, data: result };
    } catch (error) {
      // Rollback on error
      setIsReverting(true);
      setOptimisticData(null);
      cacheService.set(cacheKey, originalData);
      
      setTimeout(() => setIsReverting(false), 1000); // Reset reverting state
      
      return { success: false, error };
    }
  }, [endpoint, cacheKey]);

  return {
    optimisticData,
    isReverting,
    performOptimisticUpdate
  };
};