/**
 * CACHE SERVICE
 * 
 * Centralized caching system for API responses and application data.
 * Easy to configure cache duration and strategies for presentations.
 */

import { STORAGE_CONFIG } from '../../config/app.config.js';

export class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = STORAGE_CONFIG.EXPIRY_TIMES.CACHE;
  }

  // MODIFICATION POINT: Different cache strategies
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // MODIFICATION POINT: Add cache invalidation patterns
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  // Cache with fallback to API
  async getOrFetch(key, fetchFn, ttl) {
    const cached = this.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

export const cacheService = new CacheService();