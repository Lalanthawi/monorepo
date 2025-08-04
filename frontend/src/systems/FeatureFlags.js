/**
 * FEATURE FLAGS SYSTEM
 * 
 * Dynamic feature flag system for easy feature toggling during presentations.
 * Supports remote configuration, A/B testing, and role-based features.
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { FEATURE_FLAGS } from '../config/app.config.js';
import { authService } from '../services/AuthService.js';

// MODIFICATION POINT: Feature flags context
export const FeatureFlagsContext = createContext(null);

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

export class FeatureFlagsService {
  constructor(initialFlags = FEATURE_FLAGS) {
    this.flags = new Map();
    this.listeners = new Set();
    this.overrides = new Map();
    this.userOverrides = new Map();
    this.initializeFlags(initialFlags);
  }

  initializeFlags(flags) {
    Object.entries(flags).forEach(([key, value]) => {
      this.flags.set(key, value);
    });
  }

  // MODIFICATION POINT: Check if feature is enabled
  isEnabled(flagKey, userId = null) {
    // Check user-specific overrides first
    if (userId && this.userOverrides.has(`${flagKey}_${userId}`)) {
      return this.userOverrides.get(`${flagKey}_${userId}`);
    }

    // Check global overrides
    if (this.overrides.has(flagKey)) {
      return this.overrides.get(flagKey);
    }

    // Check role-based flags
    const user = authService.getUser();
    if (user && this.flags.has(`${flagKey}_${user.role}`)) {
      return this.flags.get(`${flagKey}_${user.role}`);
    }

    // Return default flag value
    return this.flags.get(flagKey) || false;
  }

  // MODIFICATION POINT: Enable/disable features dynamically
  setFlag(flagKey, value) {
    this.flags.set(flagKey, value);
    this.notifyListeners();
  }

  setOverride(flagKey, value) {
    this.overrides.set(flagKey, value);
    this.notifyListeners();
  }

  setUserOverride(flagKey, userId, value) {
    this.userOverrides.set(`${flagKey}_${userId}`, value);
    this.notifyListeners();
  }

  // Remove overrides
  clearOverride(flagKey) {
    this.overrides.delete(flagKey);
    this.notifyListeners();
  }

  clearUserOverride(flagKey, userId) {
    this.userOverrides.delete(`${flagKey}_${userId}`);
    this.notifyListeners();
  }

  clearAllOverrides() {
    this.overrides.clear();
    this.userOverrides.clear();
    this.notifyListeners();
  }

  // MODIFICATION POINT: A/B testing support
  isInVariant(flagKey, variant, userId = null) {
    const user = authService.getUser();
    const id = userId || user?.id;
    
    if (!id) return false;

    // Simple hash-based assignment
    const hash = this.hashString(`${flagKey}_${id}`);
    const variantIndex = hash % 100;
    
    const variants = this.getVariants(flagKey);
    let cumulativeWeight = 0;
    
    for (const v of variants) {
      cumulativeWeight += v.weight;
      if (variantIndex < cumulativeWeight && v.name === variant) {
        return true;
      }
    }
    
    return false;
  }

  getVariants(flagKey) {
    // Default to 50/50 split if no variants defined
    const variants = this.flags.get(`${flagKey}_variants`) || [
      { name: 'control', weight: 50 },
      { name: 'test', weight: 50 }
    ];
    return variants;
  }

  setVariants(flagKey, variants) {
    this.flags.set(`${flagKey}_variants`, variants);
    this.notifyListeners();
  }

  // MODIFICATION POINT: Percentage rollout
  isInRollout(flagKey, percentage, userId = null) {
    const user = authService.getUser();
    const id = userId || user?.id;
    
    if (!id) return false;

    const hash = this.hashString(`${flagKey}_${id}`);
    return (hash % 100) < percentage;
  }

  // MODIFICATION POINT: Time-based flags
  isInTimeWindow(flagKey, startTime, endTime) {
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    return now >= start && now <= end;
  }

  // Utility methods
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Listener management
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // MODIFICATION POINT: Remote configuration
  async fetchRemoteFlags(endpoint) {
    try {
      const response = await fetch(endpoint);
      const remoteFlags = await response.json();
      
      Object.entries(remoteFlags).forEach(([key, value]) => {
        this.flags.set(key, value);
      });
      
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to fetch remote flags:', error);
    }
  }

  // Export/import configuration for presentations
  exportConfiguration() {
    return {
      flags: Object.fromEntries(this.flags),
      overrides: Object.fromEntries(this.overrides),
      userOverrides: Object.fromEntries(this.userOverrides)
    };
  }

  importConfiguration(config) {
    if (config.flags) {
      this.flags = new Map(Object.entries(config.flags));
    }
    if (config.overrides) {
      this.overrides = new Map(Object.entries(config.overrides));
    }
    if (config.userOverrides) {
      this.userOverrides = new Map(Object.entries(config.userOverrides));
    }
    this.notifyListeners();
  }
}

// Singleton instance
export const featureFlagsService = new FeatureFlagsService();

// MODIFICATION POINT: React hook for feature flags
export const useFeatureFlag = (flagKey, defaultValue = false) => {
  const [isEnabled, setIsEnabled] = useState(
    featureFlagsService.isEnabled(flagKey) || defaultValue
  );

  useEffect(() => {
    const updateFlag = () => {
      setIsEnabled(featureFlagsService.isEnabled(flagKey) || defaultValue);
    };

    updateFlag(); // Initial check
    return featureFlagsService.addListener(updateFlag);
  }, [flagKey, defaultValue]);

  return isEnabled;
};

// MODIFICATION POINT: Multiple flags hook
export const useFeatureFlagsHook = () => {
  const [flags, setFlags] = useState({});

  useEffect(() => {
    const updateFlags = () => {
      const currentFlags = {};
      featureFlagsService.flags.forEach((value, key) => {
        currentFlags[key] = featureFlagsService.isEnabled(key);
      });
      setFlags(currentFlags);
    };

    updateFlags();
    return featureFlagsService.addListener(updateFlags);
  }, []);

  return flags;
};

// MODIFICATION POINT: Variant testing hook
export const useVariant = (flagKey, defaultVariant = 'control') => {
  const [variant, setVariant] = useState(defaultVariant);

  useEffect(() => {
    const variants = featureFlagsService.getVariants(flagKey);
    let selectedVariant = defaultVariant;

    for (const v of variants) {
      if (featureFlagsService.isInVariant(flagKey, v.name)) {
        selectedVariant = v.name;
        break;
      }
    }

    setVariant(selectedVariant);
  }, [flagKey, defaultVariant]);

  return variant;
};

// MODIFICATION POINT: Feature gate component
export const FeatureGate = ({ flag, children, fallback = null, variant = null }) => {
  const isEnabled = useFeatureFlag(flag);
  const currentVariant = useVariant(flag);

  if (!isEnabled) {
    return fallback;
  }

  if (variant && currentVariant !== variant) {
    return fallback;
  }

  return children;
};

// MODIFICATION POINT: Admin panel for feature flags
export const FeatureFlagsAdmin = () => {
  const flags = useFeatureFlags();
  const [overrides, setOverrides] = useState({});

  const toggleFlag = useCallback((flagKey) => {
    const currentValue = featureFlagsService.isEnabled(flagKey);
    featureFlagsService.setOverride(flagKey, !currentValue);
    setOverrides(prev => ({ ...prev, [flagKey]: !currentValue }));
  }, []);

  const clearOverride = useCallback((flagKey) => {
    featureFlagsService.clearOverride(flagKey);
    setOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[flagKey];
      return newOverrides;
    });
  }, []);

  const exportConfig = useCallback(() => {
    const config = featureFlagsService.exportConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-flags-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return React.createElement('div', {
    className: 'feature-flags-admin p-6 bg-white rounded-lg shadow'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-xl font-bold mb-4'
    }, 'Feature Flags Admin'),

    React.createElement('div', {
      key: 'actions',
      className: 'mb-6 flex gap-4'
    }, [
      React.createElement('button', {
        key: 'export',
        onClick: exportConfig,
        className: 'btn btn-primary'
      }, 'Export Configuration'),
      
      React.createElement('button', {
        key: 'clear-all',
        onClick: () => featureFlagsService.clearAllOverrides(),
        className: 'btn btn-secondary'
      }, 'Clear All Overrides')
    ]),

    React.createElement('div', {
      key: 'flags-list',
      className: 'space-y-4'
    }, Object.entries(flags).map(([flagKey, isEnabled]) =>
      React.createElement('div', {
        key: flagKey,
        className: 'flex items-center justify-between p-4 border rounded'
      }, [
        React.createElement('div', {
          key: 'info',
          className: 'flex-1'
        }, [
          React.createElement('h3', {
            key: 'name',
            className: 'font-medium'
          }, flagKey),
          
          React.createElement('p', {
            key: 'status',
            className: `text-sm ${isEnabled ? 'text-green-600' : 'text-red-600'}`
          }, `Status: ${isEnabled ? 'Enabled' : 'Disabled'}`)
        ]),

        React.createElement('div', {
          key: 'controls',
          className: 'flex gap-2'
        }, [
          React.createElement('button', {
            key: 'toggle',
            onClick: () => toggleFlag(flagKey),
            className: `btn btn-sm ${isEnabled ? 'btn-error' : 'btn-success'}`
          }, isEnabled ? 'Disable' : 'Enable'),
          
          overrides[flagKey] !== undefined && React.createElement('button', {
            key: 'clear',
            onClick: () => clearOverride(flagKey),
            className: 'btn btn-sm btn-secondary'
          }, 'Clear Override')
        ])
      ])
    ))
  ]);
};

// EXAMPLE USAGE IN COMPONENTS:
/*
// Simple feature gate
<FeatureGate flag="ENABLE_DARK_MODE">
  <DarkModeToggle />
</FeatureGate>

// With fallback
<FeatureGate flag="ENABLE_CHAT" fallback={<div>Chat coming soon!</div>}>
  <ChatWidget />
</FeatureGate>

// A/B testing
const variant = useVariant('new_dashboard_design');
return variant === 'test' ? <NewDashboard /> : <OldDashboard />;

// Hook usage
const isDarkModeEnabled = useFeatureFlag('ENABLE_DARK_MODE');
if (isDarkModeEnabled) {
  // Show dark mode toggle
}
*/