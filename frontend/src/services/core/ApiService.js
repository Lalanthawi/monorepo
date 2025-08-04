/**
 * CORE API SERVICE
 * 
 * Centralized API service with dependency injection and configuration support.
 * Easy to extend with new endpoints and modify for presentations.
 */

import { API_CONFIG, STORAGE_CONFIG } from '../../config/app.config.js';

export class ApiService {
  constructor(config = API_CONFIG) {
    this.config = config;
    this.baseURL = config.BASE_URL;
    this.timeout = config.TIMEOUT;
    this.retryAttempts = config.RETRY_ATTEMPTS;
  }

  // MODIFICATION POINT: Easy to add new authentication methods
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_CONFIG.KEYS.TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Core request method with retry logic
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    let lastError;
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < this.retryAttempts) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // MODIFICATION POINT: Add new upload methods
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getAuthHeaders(),
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // MODIFICATION POINT: Add custom interceptors
  addInterceptor(type, interceptor) {
    // Implementation for request/response interceptors
    // This allows easy modification of all requests/responses
  }
}

// Singleton instance
export const apiService = new ApiService();