/**
 * STUDENT DEBUG TOOLS - Quick & Dirty Debugging Utilities
 * 
 * These are some utility functions I made during development
 * to help debug issues. Probably should clean these up later...
 * 
 * USAGE:
 * import { quickLog, dumpState, timeIt } from '../utils/studentDebugTools';
 */

// quick console.log with timestamp (saves typing)
export const quickLog = (msg, data = null) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${msg}`, data || '');
};

// dump component state for debugging (probably overkill)
export const dumpState = (componentName, state) => {
  console.group(`🔍 ${componentName} State Dump`);
  Object.keys(state).forEach(key => {
    console.log(`${key}:`, state[key]);
  });
  console.groupEnd();
};

// simple performance timer (because i was curious about load times)
export const timeIt = (label, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`⏱️ ${label} took ${(end - start).toFixed(2)}ms`);
  return result;
};

// check if object is empty (used this a lot)
export const isEmpty = (obj) => {
  return obj && Object.keys(obj).length === 0;
};

// format bytes to human readable (for checking bundle sizes)
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// simple retry function (for flaky api calls)
export const retryFetch = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * i)); // exponential backoff kinda
    }
  }
};

// validate email format (quick check)
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// generate random id (for testing)
export const randomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// deep clone object (because i always forget about JSON.stringify limitations)
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// TODO: add more utilities as needed
// - api response validator
// - form data serializer
// - localStorage helpers with error handling
// - component prop validator