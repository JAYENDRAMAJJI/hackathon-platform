import { handleMockFallback } from './mockEngine';
import { useAuthStore } from '../store/authStore';

export const API_URL = '/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

class AuthRequiredError extends Error {
  constructor(message = 'Authentication required. Please sign in.') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Access Denied: You do not have permission for this action.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

const formatErrorMessage = (status: number, dataOrText: any): string => {
  if (dataOrText && typeof dataOrText === 'object') {
    if (dataOrText.message) return dataOrText.message;
    if (dataOrText.error) return dataOrText.error;
  }
  if (typeof dataOrText === 'string') {
    const trimmed = dataOrText.trim();
    if (trimmed && !trimmed.startsWith('<!DOCTYPE') && !trimmed.startsWith('<html') && !trimmed.startsWith('<!doctype')) {
      return trimmed.length > 150 ? `${trimmed.substring(0, 150)}...` : trimmed;
    }
  }
  if (status === 404) {
    return 'The requested resource was not found (404).';
  }
  if (status === 403) {
    return 'Access Denied (403): You do not have permission for this action.';
  }
  if (status === 401) {
    return 'Authentication required. Please sign in again.';
  }
  return `Request completed with status ${status}`;
};

const isProtectedEndpoint = (endpoint: string): boolean => {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return (
    clean.startsWith('/admin') ||
    clean.startsWith('/faculty') ||
    clean.startsWith('/student')
  );
};

export const apiClient = {
  async get(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
    const token = localStorage.getItem('auth_token');
    
    // Strict Auth Check: Do not permit unauthenticated access to protected dashboard endpoints
    if (isProtectedEndpoint(endpoint) && !token) {
      useAuthStore.getState().logout();
      throw new AuthRequiredError('Authentication required. Please sign in.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const queryStr = searchParams.toString();
      if (queryStr) {
        url += (url.includes('?') ? '&' : '?') + queryStr;
      }
    }
    
    try {
      const response = await fetch(url, { headers });
      const contentType = response.headers.get("content-type") || '';
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new AuthRequiredError('Authentication required. Please sign in again.');
      }

      if (response.status === 403) {
        throw new ForbiddenError('Access Denied (403): You do not have permission for this action.');
      }

      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          if ((response.status >= 500 || response.status === 404) && !isProtectedEndpoint(endpoint)) {
            return handleMockFallback('GET', endpoint, undefined, params);
          }
          const code = data?.code || data?.error;
          throw new ApiError(formatErrorMessage(response.status, data), response.status, code, data);
        }
        return data;
      } else {
        const text = await response.text();
        if (!response.ok) {
          if (!isProtectedEndpoint(endpoint)) {
            return handleMockFallback('GET', endpoint, undefined, params);
          }
          throw new ApiError(`Request failed with status ${response.status}`, response.status);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      if (error instanceof ApiError || error?.name === 'ApiError' || error instanceof AuthRequiredError || error instanceof ForbiddenError || error?.name === 'AuthRequiredError' || error?.name === 'ForbiddenError') {
        throw error;
      }
      if (isProtectedEndpoint(endpoint)) {
        throw error;
      }
      console.warn(`[apiClient] Using resilient fallback for GET ${endpoint}`, error);
      return handleMockFallback('GET', endpoint, undefined, params);
    }
  },

  async post(endpoint: string, data?: any) {
    const token = localStorage.getItem('auth_token');
    
    // Strict Auth Check for protected post endpoints
    if (isProtectedEndpoint(endpoint) && !token) {
      useAuthStore.getState().logout();
      throw new AuthRequiredError('Authentication required. Please sign in.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new AuthRequiredError('Authentication required. Please sign in again.');
      }

      if (response.status === 403) {
        throw new ForbiddenError('Access Denied (403): You do not have permission for this action.');
      }

      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if ((response.status >= 500 || response.status === 404) && !isProtectedEndpoint(endpoint)) {
            return handleMockFallback('POST', endpoint, data);
          }
          const code = responseData?.code || responseData?.error;
          throw new ApiError(formatErrorMessage(response.status, responseData), response.status, code, responseData);
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          if (!isProtectedEndpoint(endpoint)) {
            return handleMockFallback('POST', endpoint, data);
          }
          throw new ApiError(`Request failed with status ${response.status}`, response.status);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      if (error instanceof ApiError || error?.name === 'ApiError' || error instanceof AuthRequiredError || error instanceof ForbiddenError || error?.name === 'AuthRequiredError' || error?.name === 'ForbiddenError') {
        throw error;
      }
      if (isProtectedEndpoint(endpoint)) {
        throw error;
      }
      console.warn(`[apiClient] Using resilient fallback for POST ${endpoint}`, error);
      return handleMockFallback('POST', endpoint, data);
    }
  },

  async put(endpoint: string, data?: any) {
    const token = localStorage.getItem('auth_token');
    
    if (isProtectedEndpoint(endpoint) && !token) {
      useAuthStore.getState().logout();
      throw new AuthRequiredError('Authentication required. Please sign in.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new AuthRequiredError('Authentication required. Please sign in again.');
      }

      if (response.status === 403) {
        throw new ForbiddenError('Access Denied (403): You do not have permission for this action.');
      }

      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if ((response.status >= 500 || response.status === 404) && !isProtectedEndpoint(endpoint)) {
            return handleMockFallback('PUT', endpoint, data);
          }
          const code = responseData?.code || responseData?.error;
          throw new ApiError(formatErrorMessage(response.status, responseData), response.status, code, responseData);
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          if (!isProtectedEndpoint(endpoint)) {
            return handleMockFallback('PUT', endpoint, data);
          }
          throw new ApiError(`Request failed with status ${response.status}`, response.status);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      if (error instanceof ApiError || error?.name === 'ApiError' || error instanceof AuthRequiredError || error instanceof ForbiddenError || error?.name === 'AuthRequiredError' || error?.name === 'ForbiddenError') {
        throw error;
      }
      if (isProtectedEndpoint(endpoint)) {
        throw error;
      }
      console.warn(`[apiClient] Using resilient fallback for PUT ${endpoint}`, error);
      return handleMockFallback('PUT', endpoint, data);
    }
  },

  async patch(endpoint: string, data?: any) {
    const token = localStorage.getItem('auth_token');
    
    if (isProtectedEndpoint(endpoint) && !token) {
      useAuthStore.getState().logout();
      throw new AuthRequiredError('Authentication required. Please sign in.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
      });
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new AuthRequiredError('Authentication required. Please sign in again.');
      }

      if (response.status === 403) {
        throw new ForbiddenError('Access Denied (403): You do not have permission for this action.');
      }

      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if ((response.status >= 500 || response.status === 404) && !isProtectedEndpoint(endpoint)) {
            return handleMockFallback('PATCH', endpoint, data);
          }
          const code = responseData?.code || responseData?.error;
          throw new ApiError(formatErrorMessage(response.status, responseData), response.status, code, responseData);
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          if (!isProtectedEndpoint(endpoint)) {
            return handleMockFallback('PATCH', endpoint, data);
          }
          throw new ApiError(`Request failed with status ${response.status}`, response.status);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      if (error instanceof ApiError || error?.name === 'ApiError' || error instanceof AuthRequiredError || error instanceof ForbiddenError || error?.name === 'AuthRequiredError' || error?.name === 'ForbiddenError') {
        throw error;
      }
      if (isProtectedEndpoint(endpoint)) {
        throw error;
      }
      console.warn(`[apiClient] Using resilient fallback for PATCH ${endpoint}`, error);
      return handleMockFallback('PATCH', endpoint, data);
    }
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('auth_token');
    
    if (isProtectedEndpoint(endpoint) && !token) {
      useAuthStore.getState().logout();
      throw new AuthRequiredError('Authentication required. Please sign in.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new AuthRequiredError('Authentication required. Please sign in again.');
      }

      if (response.status === 403) {
        throw new ForbiddenError('Access Denied (403): You do not have permission for this action.');
      }

      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if ((response.status >= 500 || response.status === 404) && !isProtectedEndpoint(endpoint)) {
            return handleMockFallback('DELETE', endpoint);
          }
          const code = responseData?.code || responseData?.error;
          throw new ApiError(formatErrorMessage(response.status, responseData), response.status, code, responseData);
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          if (!isProtectedEndpoint(endpoint)) {
            return handleMockFallback('DELETE', endpoint);
          }
          throw new ApiError(`Request failed with status ${response.status}`, response.status);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      if (error instanceof ApiError || error?.name === 'ApiError' || error instanceof AuthRequiredError || error instanceof ForbiddenError || error?.name === 'AuthRequiredError' || error?.name === 'ForbiddenError') {
        throw error;
      }
      if (isProtectedEndpoint(endpoint)) {
        throw error;
      }
      console.warn(`[apiClient] Using resilient fallback for DELETE ${endpoint}`, error);
      return handleMockFallback('DELETE', endpoint);
    }
  }
};

