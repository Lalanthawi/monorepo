/**
 * DEBUG HELPERS - Development Utilities
 * 
 * These are helper functions I use during development
 * TODO: Remove or disable these before final submission
 * 
 * USAGE:
 * import { debugLog, performanceTimer } from '../utils/debugHelpers';
 */

// feature flag to enable/disable debug output
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

// enhanced console.log with timestamps and emojis
export const debugLog = (message, type = 'info', data = null) => {
  if (!DEBUG_ENABLED) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const emojis = {
    info: '📝',
    error: '❌', 
    warning: '⚠️',
    success: '✅',
    api: '🔗',
    user: '👤',
    data: '📊'
  };
  
  const emoji = emojis[type] || '📝';
  console.log(`${emoji} [${timestamp}] ${message}`, data || '');
};

// performance timing helper
export const performanceTimer = (label) => {
  if (!DEBUG_ENABLED) return { end: () => {} };
  
  const start = performance.now();
  console.time(`⏱️ ${label}`);
  
  return {
    end: () => {
      const end = performance.now();
      console.timeEnd(`⏱️ ${label}`);
      debugLog(`Performance: ${label} took ${(end - start).toFixed(2)}ms`, 'data');
    }
  };
};

// component render tracker (probably overkill but useful for debugging)
export const useRenderTracker = (componentName) => {
  const renderCount = React.useRef(0);
  const lastProps = React.useRef();
  
  React.useEffect(() => {
    renderCount.current += 1;
    debugLog(`${componentName} rendered ${renderCount.current} times`, 'info');
  });
  
  React.useEffect(() => {
    if (lastProps.current) {
      debugLog(`${componentName} props changed`, 'data', { 
        previous: lastProps.current,
        current: arguments[0] 
      });
    }
    lastProps.current = arguments[0];
  });
};

// api call logger
export const logApiCall = (endpoint, method, data = null) => {
  debugLog(`API ${method.toUpperCase()} ${endpoint}`, 'api', data);
};

// user action tracker
export const logUserAction = (action, details = null) => {
  debugLog(`User action: ${action}`, 'user', details);
};

// error boundary logger
export const logError = (error, componentStack = null) => {
  debugLog(`Error caught: ${error.message}`, 'error', {
    error: error,
    stack: error.stack,
    componentStack: componentStack
  });
  
  // TODO: send errors to logging service in production
  // sendErrorToService(error, componentStack);
};

// state change logger (for debugging state issues)
export const logStateChange = (stateName, oldValue, newValue) => {
  debugLog(`State change: ${stateName}`, 'data', {
    from: oldValue,
    to: newValue
  });
};

// network status checker (for debugging connectivity issues)
export const checkNetworkStatus = () => {
  if (!navigator.onLine) {
    debugLog('Network status: OFFLINE', 'warning');
    return false;
  }
  debugLog('Network status: ONLINE', 'success');
  return true;
};

// memory usage checker (probably unnecessary but interesting)
export const logMemoryUsage = () => {
  if (!DEBUG_ENABLED || !performance.memory) return;
  
  const memory = performance.memory;
  debugLog('Memory usage', 'data', {
    used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
    total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
    limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
  });
};

// local storage helper with logging
export const debugLocalStorage = {
  set: (key, value) => {
    debugLog(`LocalStorage SET: ${key}`, 'data', value);
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  get: (key) => {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    debugLog(`LocalStorage GET: ${key}`, 'data', value);
    return value;
  },
  
  remove: (key) => {
    debugLog(`LocalStorage REMOVE: ${key}`, 'data');
    localStorage.removeItem(key);
  },
  
  clear: () => {
    debugLog('LocalStorage CLEAR ALL', 'warning');
    localStorage.clear();
  }
};

// form validation logger (helps debug form issues)
export const logFormValidation = (formName, errors, data) => {
  if (Object.keys(errors).length > 0) {
    debugLog(`Form validation failed: ${formName}`, 'error', { errors, data });
  } else {
    debugLog(`Form validation passed: ${formName}`, 'success', data);
  }
};

// TODO: add more debugging utilities as needed
// - database query logger
// - component lifecycle logger  
// - route change logger
// - authentication state logger