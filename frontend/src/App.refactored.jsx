/**
 * REFACTORED APP COMPONENT
 * 
 * Modular application using dependency injection, theme system, feature flags,
 * and plugin architecture. Easy to modify during presentations.
 */

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Configuration imports
import { ROUTES_CONFIG, DEFAULT_REDIRECTS } from './config/routes.config.js';
import { FEATURE_FLAGS } from './config/app.config.js';

// System imports
import { AuthContext, useAuth } from './hooks/useAuth.js';
import { ThemeContext, useTheme } from './hooks/useTheme.js';
import { FeatureFlagsContext, featureFlagsService, FeatureGate } from './systems/FeatureFlags.js';
import { PluginContext, pluginSystem } from './systems/PluginSystem.js';

// Service imports
import { authService } from './services/AuthService.js';
import { ModalContainer } from './components/core/Modal.jsx';

// Page imports - using dynamic imports for code splitting
const Login = React.lazy(() => import('./pages/login/Loginpage.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/admin/admindashboard.jsx'));
const ManagerDashboard = React.lazy(() => import('./pages/manager/managerdashboard.jsx'));
const ElectricianDashboard = React.lazy(() => import('./pages/electrician/electriciandashboard.jsx'));

// MODIFICATION POINT: Theme Provider Component
const ThemeProvider = ({ children }) => {
  const themeState = useTheme();

  return React.createElement(ThemeContext.Provider, {
    value: themeState
  }, children);
};

// MODIFICATION POINT: Auth Provider Component  
const AuthProvider = ({ children, authServiceInstance = authService }) => {
  const authState = useAuth(authServiceInstance);

  return React.createElement(AuthContext.Provider, {
    value: authState
  }, children);
};

// MODIFICATION POINT: Feature Flags Provider
const FeatureFlagsProvider = ({ children }) => {
  const [flags, setFlags] = React.useState(FEATURE_FLAGS);

  React.useEffect(() => {
    // Initialize feature flags service
    featureFlagsService.initializeFlags(flags);
    
    // Listen for flag changes
    return featureFlagsService.addListener(() => {
      setFlags({ ...featureFlagsService.flags });
    });
  }, [flags]);

  return React.createElement(FeatureFlagsContext.Provider, {
    value: { flags, service: featureFlagsService }
  }, children);
};

// MODIFICATION POINT: Plugin Provider
const PluginProvider = ({ children }) => {
  const [plugins, setPlugins] = React.useState([]);

  React.useEffect(() => {
    // Initialize plugin system
    const initializePlugins = async () => {
      // Register built-in plugins here
      // await pluginSystem.registerPlugin(new SamplePlugin());
      await pluginSystem.initialize();
      setPlugins(pluginSystem.getAllPlugins());
    };

    initializePlugins();
  }, []);

  return React.createElement(PluginContext.Provider, {
    value: { plugins, system: pluginSystem }
  }, children);
};

// MODIFICATION POINT: Protected Route Component with dependency injection
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [],
  authContext = AuthContext,
  fallbackPath = ROUTES_CONFIG.PUBLIC.LOGIN
}) => {
  const { isAuthenticated, user, isLoading } = React.useContext(authContext);

  if (isLoading) {
    return React.createElement('div', {
      className: 'flex items-center justify-center min-h-screen'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'
      }),
      React.createElement('span', {
        key: 'text',
        className: 'ml-3 text-gray-600'
      }, 'Loading...')
    ]);
  }

  if (!isAuthenticated || !user) {
    return React.createElement(Navigate, { to: fallbackPath });
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return React.createElement(Navigate, { to: ROUTES_CONFIG.PUBLIC.UNAUTHORIZED });
  }

  return children;
};

// MODIFICATION POINT: Auth Redirect Component with configuration
const AuthRedirect = ({ 
  authContext = AuthContext,
  redirectConfig = DEFAULT_REDIRECTS,
  fallbackPath = ROUTES_CONFIG.PUBLIC.LOGIN
}) => {
  const { isAuthenticated, user } = React.useContext(authContext);

  if (isAuthenticated && user) {
    const redirectPath = redirectConfig[user.role];
    if (redirectPath) {
      return React.createElement(Navigate, { to: redirectPath, replace: true });
    }
  }

  return React.createElement(Navigate, { to: fallbackPath });
};

// MODIFICATION POINT: Loading Suspense Component
const LoadingFallback = () => {
  return React.createElement('div', {
    className: 'flex items-center justify-center min-h-screen bg-gray-50'
  }, [
    React.createElement('div', {
      key: 'spinner',
      className: 'animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'
    }),
    React.createElement('div', {
      key: 'text',
      className: 'ml-4 text-xl text-gray-600'
    }, 'Loading application...')
  ]);
};

// MODIFICATION POINT: Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
    
    // Could send to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', {
        className: 'flex items-center justify-center min-h-screen bg-gray-50'
      }, [
        React.createElement('div', {
          key: 'content',
          className: 'text-center'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-2xl font-bold text-red-600 mb-4'
          }, 'Something went wrong'),
          
          React.createElement('p', {
            key: 'message',
            className: 'text-gray-600 mb-4'
          }, 'We\'re sorry, but something unexpected happened.'),
          
          React.createElement('button', {
            key: 'retry',
            onClick: () => window.location.reload(),
            className: 'btn btn-primary'
          }, 'Reload Page')
        ])
      ]);
    }

    return this.props.children;
  }
}

// MODIFICATION POINT: Route Configuration Component
const AppRoutes = () => {
  return React.createElement(Routes, null, [
    // Public routes
    React.createElement(Route, {
      key: 'login',
      path: ROUTES_CONFIG.PUBLIC.LOGIN,
      element: React.createElement(React.Suspense, {
        fallback: React.createElement(LoadingFallback)
      }, React.createElement(Login))
    }),

    // Protected Admin routes
    React.createElement(Route, {
      key: 'admin-dashboard',
      path: ROUTES_CONFIG.ADMIN.DASHBOARD,
      element: React.createElement(ProtectedRoute, {
        allowedRoles: ['Admin']
      }, React.createElement(React.Suspense, {
        fallback: React.createElement(LoadingFallback)
      }, React.createElement(AdminDashboard)))
    }),

    // Protected Manager routes  
    React.createElement(Route, {
      key: 'manager-dashboard',
      path: ROUTES_CONFIG.MANAGER.DASHBOARD,
      element: React.createElement(ProtectedRoute, {
        allowedRoles: ['Manager']
      }, React.createElement(React.Suspense, {
        fallback: React.createElement(LoadingFallback)
      }, React.createElement(ManagerDashboard)))
    }),

    // Protected Electrician routes
    React.createElement(Route, {
      key: 'electrician-dashboard', 
      path: ROUTES_CONFIG.ELECTRICIAN.DASHBOARD,
      element: React.createElement(ProtectedRoute, {
        allowedRoles: ['Electrician']
      }, React.createElement(React.Suspense, {
        fallback: React.createElement(LoadingFallback)
      }, React.createElement(ElectricianDashboard)))
    }),

    // Default route
    React.createElement(Route, {
      key: 'root',
      path: '/',
      element: React.createElement(AuthRedirect)
    }),

    // Unauthorized route
    React.createElement(Route, {
      key: 'unauthorized',
      path: ROUTES_CONFIG.PUBLIC.UNAUTHORIZED,
      element: React.createElement('div', {
        className: 'flex items-center justify-center min-h-screen'
      }, [
        React.createElement('div', {
          key: 'content',
          className: 'text-center'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-2xl font-bold text-red-600 mb-4'
          }, 'Unauthorized Access'),
          
          React.createElement('p', {
            key: 'message',
            className: 'text-gray-600'
          }, 'You don\'t have permission to access this page.')
        ])
      ])
    })
  ]);
};

// MODIFICATION POINT: Global Components
const GlobalComponents = () => {
  return React.createElement(React.Fragment, null, [
    // Modal container for programmatic modals
    React.createElement(ModalContainer, { key: 'modals' }),
    
    // Feature-gated components
    React.createElement(FeatureGate, {
      key: 'notifications',
      flag: 'ENABLE_NOTIFICATIONS'
    }, React.createElement('div', {
      id: 'notification-container',
      className: 'fixed top-4 right-4 z-50'
    })),

    // Plugin-rendered components
    React.createElement(FeatureGate, {
      key: 'plugin-overlay',
      flag: 'ENABLE_PLUGINS'
    }, React.createElement('div', {
      id: 'plugin-overlay'
    }))
  ]);
};

// MODIFICATION POINT: Main App Component
function App({ 
  // Dependency injection props for testing
  authServiceInstance = authService,
  onError = null 
}) {
  return React.createElement(ErrorBoundary, {
    onError
  }, 
    React.createElement(ThemeProvider, null,
      React.createElement(FeatureFlagsProvider, null,
        React.createElement(PluginProvider, null,
          React.createElement(AuthProvider, {
            authServiceInstance
          },
            React.createElement(Router, null, [
              React.createElement(AppRoutes, { key: 'routes' }),
              React.createElement(GlobalComponents, { key: 'global' })
            ])
          )
        )
      )
    )
  );
}

export default App;

// MODIFICATION POINT: Example of how to customize the app for presentations
/*
// Custom theme for presentation
const presentationTheme = {
  name: 'presentation',
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#FFFFFF'
  }
};

// Custom feature flags for demo
const presentationFlags = {
  ...FEATURE_FLAGS,
  ENABLE_DARK_MODE: true,
  ENABLE_CHAT: true,
  ENABLE_ANALYTICS: false
};

// Custom auth service for demo
class DemoAuthService extends AuthService {
  async login(credentials) {
    // Always succeed for demo
    return { success: true, user: { role: 'Admin', name: 'Demo User' } };
  }
}

// Render app with custom configuration
<App 
  authServiceInstance={new DemoAuthService()}
  onError={(error) => console.log('Demo error:', error)}
/>
*/