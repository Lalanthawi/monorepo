/**
 * AUTHENTICATION HOOKS
 * 
 * Custom hooks for authentication state management and authorization checks.
 * Easy to extend with new auth patterns during presentations.
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { authService } from '../services/AuthService.js';
import { ROLES_CONFIG, DEFAULT_REDIRECTS } from '../config/routes.config.js';

// MODIFICATION POINT: Auth context for dependency injection
export const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// MODIFICATION POINT: Main authentication hook
export const useAuth = (authServiceInstance = authService) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authServiceInstance.getUser();
        const token = authServiceInstance.getToken();
        
        if (currentUser && token) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authServiceInstance]);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authServiceInstance.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [authServiceInstance]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authServiceInstance.register(userData);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [authServiceInstance]);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authServiceInstance.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, [authServiceInstance]);

  const refreshToken = useCallback(async () => {
    try {
      await authServiceInstance.refreshToken();
      return true;
    } catch (err) {
      // Token refresh failed, logout user
      await logout();
      return false;
    }
  }, [authServiceInstance, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError
  };
};

// MODIFICATION POINT: Role-based authorization hook
export const usePermissions = (authServiceInstance = authService) => {
  const hasRole = useCallback((role) => {
    return authServiceInstance.hasRole(role);
  }, [authServiceInstance]);

  const hasPermission = useCallback((permission) => {
    return authServiceInstance.hasPermission(permission);
  }, [authServiceInstance]);

  const hasAnyRole = useCallback((roles) => {
    return roles.some(role => authServiceInstance.hasRole(role));
  }, [authServiceInstance]);

  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => authServiceInstance.hasPermission(permission));
  }, [authServiceInstance]);

  const canAccessRoute = useCallback((route) => {
    return authServiceInstance.canAccessRoute(route);
  }, [authServiceInstance]);

  const getCurrentUserRole = useCallback(() => {
    return authServiceInstance.getCurrentUserRole();
  }, [authServiceInstance]);

  // MODIFICATION POINT: Add new authorization methods
  const isAdmin = useCallback(() => {
    return hasRole(ROLES_CONFIG.ADMIN);
  }, [hasRole]);

  const isManager = useCallback(() => {
    return hasRole(ROLES_CONFIG.MANAGER);
  }, [hasRole]);

  const isElectrician = useCallback(() => {
    return hasRole(ROLES_CONFIG.ELECTRICIAN);
  }, [hasRole]);

  const canManageUsers = useCallback(() => {
    return hasPermission('MANAGE_USERS');
  }, [hasPermission]);

  const canViewReports = useCallback(() => {
    return hasPermission('VIEW_REPORTS');
  }, [hasPermission]);

  return {
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllPermissions,
    canAccessRoute,
    getCurrentUserRole,
    isAdmin,
    isManager,
    isElectrician,
    canManageUsers,
    canViewReports
  };
};

// MODIFICATION POINT: Session management hook
export const useSession = (authServiceInstance = authService) => {
  const [sessionStatus, setSessionStatus] = useState('checking');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setWarningShown(false);
  }, []);

  const checkSession = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;

    if (timeSinceActivity >= SESSION_TIMEOUT) {
      setSessionStatus('expired');
      return 'expired';
    } else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME && !warningShown) {
      setSessionStatus('warning');
      setWarningShown(true);
      return 'warning';
    } else {
      setSessionStatus('active');
      return 'active';
    }
  }, [lastActivity, warningShown]);

  const extendSession = useCallback(async () => {
    try {
      await authServiceInstance.refreshToken();
      updateActivity();
      setSessionStatus('active');
      return true;
    } catch (err) {
      setSessionStatus('expired');
      return false;
    }
  }, [authServiceInstance, updateActivity]);

  // Check session status periodically
  useEffect(() => {
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkSession]);

  // Listen for user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  return {
    sessionStatus,
    lastActivity,
    updateActivity,
    extendSession,
    checkSession
  };
};

// MODIFICATION POINT: Route protection hook
export const useRouteProtection = () => {
  const { isAuthenticated, user } = useAuthContext();
  const { hasRole, canAccessRoute } = usePermissions();

  const getRedirectPath = useCallback(() => {
    if (!isAuthenticated) {
      return '/login';
    }

    if (user?.role) {
      return DEFAULT_REDIRECTS[user.role] || '/dashboard';
    }

    return '/dashboard';
  }, [isAuthenticated, user]);

  const shouldRedirect = useCallback((requiredRoles = []) => {
    if (!isAuthenticated) {
      return { redirect: true, path: '/login' };
    }

    if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
      return { redirect: true, path: '/unauthorized' };
    }

    return { redirect: false, path: null };
  }, [isAuthenticated, hasRole]);

  const canAccessCurrentRoute = useCallback((route, requiredRoles = []) => {
    if (!isAuthenticated) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some(role => hasRole(role));
  }, [isAuthenticated, hasRole]);

  return {
    getRedirectPath,
    shouldRedirect,
    canAccessCurrentRoute
  };
};