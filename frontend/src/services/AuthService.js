/**
 * AUTHENTICATION SERVICE
 * 
 * Modular authentication service with dependency injection.
 * Easy to extend with new authentication methods.
 */

import { apiService } from './core/ApiService.js';
import { cacheService } from './core/CacheService.js';
import { API_CONFIG, STORAGE_CONFIG, ROLES_CONFIG } from '../config/app.config.js';

export class AuthService {
  constructor(apiClient = apiService, cache = cacheService) {
    this.api = apiClient;
    this.cache = cache;
    this.endpoints = API_CONFIG.ENDPOINTS;
  }

  // MODIFICATION POINT: Add new authentication methods
  async login(credentials) {
    try {
      const response = await this.api.post(`${this.endpoints.AUTH}/login`, credentials);
      
      if (response.success) {
        this.setAuthData(response.token, response.user);
        this.cache.set('user-session', response.user);
        return { success: true, user: response.user };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post(`${this.endpoints.AUTH}/register`, userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // MODIFICATION POINT: Add OAuth, SSO methods here
  async loginWithOAuth(provider, token) {
    // Implementation for OAuth login
    return this.api.post(`${this.endpoints.AUTH}/oauth/${provider}`, { token });
  }

  async logout() {
    try {
      await this.api.post(`${this.endpoints.AUTH}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
      this.cache.clear();
    }
  }

  async refreshToken() {
    try {
      const response = await this.api.post(`${this.endpoints.AUTH}/refresh`);
      if (response.token) {
        this.setToken(response.token);
        return response.token;
      }
      throw new Error('No token received');
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  // Token management
  setToken(token) {
    localStorage.setItem(STORAGE_CONFIG.KEYS.TOKEN, token);
  }

  getToken() {
    return localStorage.getItem(STORAGE_CONFIG.KEYS.TOKEN);
  }

  setUser(user) {
    localStorage.setItem(STORAGE_CONFIG.KEYS.USER, JSON.stringify(user));
  }

  getUser() {
    const userStr = localStorage.getItem(STORAGE_CONFIG.KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuthData(token, user) {
    this.setToken(token);
    this.setUser(user);
  }

  clearAuthData() {
    localStorage.removeItem(STORAGE_CONFIG.KEYS.TOKEN);
    localStorage.removeItem(STORAGE_CONFIG.KEYS.USER);
  }

  // Authorization checks
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  }

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  hasPermission(permission) {
    const user = this.getUser();
    if (!user) return false;
    
    const rolePermissions = ROLES_CONFIG.PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  // MODIFICATION POINT: Add new authorization methods
  canAccessRoute(route) {
    // Implementation for route-based authorization
    const user = this.getUser();
    return user && this.isAuthenticated();
  }

  getCurrentUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
}

export const authService = new AuthService();