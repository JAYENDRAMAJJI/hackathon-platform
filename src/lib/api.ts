import { handleMockFallback } from './mockEngine';

export const API_URL = '/api';

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

export const apiClient = {
  async get(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
    const token = localStorage.getItem('auth_token');
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
      
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          if (response.status >= 500 || response.status === 404) {
            return handleMockFallback('GET', endpoint, undefined, params);
          }
          throw new Error(formatErrorMessage(response.status, data));
        }
        return data;
      } else {
        const text = await response.text();
        if (!response.ok) {
          return handleMockFallback('GET', endpoint, undefined, params);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      console.warn(`[apiClient] Using resilient fallback for GET ${endpoint}`, error);
      return handleMockFallback('GET', endpoint, undefined, params);
    }
  },

  async post(endpoint: string, data?: any) {
    const token = localStorage.getItem('auth_token');
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
      
      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if (response.status >= 500 || response.status === 404) {
            return handleMockFallback('POST', endpoint, data);
          }
          throw new Error(formatErrorMessage(response.status, responseData));
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          return handleMockFallback('POST', endpoint, data);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      console.warn(`[apiClient] Using resilient fallback for POST ${endpoint}`, error);
      return handleMockFallback('POST', endpoint, data);
    }
  },

  async put(endpoint: string, data?: any) {
    const token = localStorage.getItem('auth_token');
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
      
      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if (response.status >= 500 || response.status === 404) {
            return handleMockFallback('PUT', endpoint, data);
          }
          throw new Error(formatErrorMessage(response.status, responseData));
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          return handleMockFallback('PUT', endpoint, data);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      console.warn(`[apiClient] Using resilient fallback for PUT ${endpoint}`, error);
      return handleMockFallback('PUT', endpoint, data);
    }
  },

  async patch(endpoint: string, data?: any) {
    const token = localStorage.getItem('auth_token');
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
      
      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if (response.status >= 500 || response.status === 404) {
            return handleMockFallback('PATCH', endpoint, data);
          }
          throw new Error(formatErrorMessage(response.status, responseData));
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          return handleMockFallback('PATCH', endpoint, data);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      console.warn(`[apiClient] Using resilient fallback for PATCH ${endpoint}`, error);
      return handleMockFallback('PATCH', endpoint, data);
    }
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('auth_token');
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
      
      const contentType = response.headers.get("content-type") || '';
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          if (response.status >= 500 || response.status === 404) {
            return handleMockFallback('DELETE', endpoint);
          }
          throw new Error(formatErrorMessage(response.status, responseData));
        }
        return responseData;
      } else {
        const text = await response.text();
        if (!response.ok) {
          return handleMockFallback('DELETE', endpoint);
        }
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error: any) {
      console.warn(`[apiClient] Using resilient fallback for DELETE ${endpoint}`, error);
      return handleMockFallback('DELETE', endpoint);
    }
  }
};

