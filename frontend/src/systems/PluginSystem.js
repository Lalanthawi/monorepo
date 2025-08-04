/**
 * PLUGIN SYSTEM
 * 
 * Extensible plugin architecture for easy feature additions during presentations.
 * Supports hooks, event system, and dynamic plugin loading.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// MODIFICATION POINT: Plugin context
export const PluginContext = createContext(null);

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

export class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.eventListeners = new Map();
    this.middleware = [];
    this.initialized = false;
  }

  // MODIFICATION POINT: Register new plugins
  registerPlugin(plugin) {
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have name and version');
    }

    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`);
      return false;
    }

    // Validate plugin dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.name} requires ${dep} to be registered first`);
        }
      }
    }

    this.plugins.set(plugin.name, plugin);

    // Initialize plugin if system is already initialized
    if (this.initialized) {
      this.initializePlugin(plugin);
    }

    return true;
  }

  unregisterPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return false;

    // Check if other plugins depend on this one
    for (const [name, p] of this.plugins) {
      if (p.dependencies && p.dependencies.includes(pluginName)) {
        throw new Error(`Cannot unregister ${pluginName}: ${name} depends on it`);
      }
    }

    // Cleanup plugin
    if (plugin.cleanup) {
      plugin.cleanup();
    }

    this.plugins.delete(pluginName);
    return true;
  }

  // Initialize all plugins
  async initialize() {
    const sortedPlugins = this.topologicalSort();
    
    for (const plugin of sortedPlugins) {
      await this.initializePlugin(plugin);
    }

    this.initialized = true;
  }

  async initializePlugin(plugin) {
    try {
      if (plugin.initialize) {
        await plugin.initialize({
          registerHook: this.registerHook.bind(this),
          addEventListener: this.addEventListener.bind(this),
          addMiddleware: this.addMiddleware.bind(this),
          emit: this.emit.bind(this),
          applyHook: this.applyHook.bind(this)
        });
      }
    } catch (error) {
      console.error(`Failed to initialize plugin ${plugin.name}:`, error);
    }
  }

  // Topological sort for dependency resolution
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (pluginName) => {
      if (visiting.has(pluginName)) {
        throw new Error(`Circular dependency detected involving ${pluginName}`);
      }
      if (visited.has(pluginName)) return;

      const plugin = this.plugins.get(pluginName);
      visiting.add(pluginName);

      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(pluginName);
      visited.add(pluginName);
      sorted.push(plugin);
    };

    for (const pluginName of this.plugins.keys()) {
      visit(pluginName);
    }

    return sorted;
  }

  // MODIFICATION POINT: Hook system for extensibility
  registerHook(hookName, callback, priority = 10) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    this.hooks.get(hookName).push({ callback, priority });
    
    // Sort by priority (lower numbers = higher priority)
    this.hooks.get(hookName).sort((a, b) => a.priority - b.priority);
  }

  applyHook(hookName, value, ...args) {
    const hooks = this.hooks.get(hookName) || [];
    
    return hooks.reduce((currentValue, hook) => {
      try {
        return hook.callback(currentValue, ...args);
      } catch (error) {
        console.error(`Error in hook ${hookName}:`, error);
        return currentValue;
      }
    }, value);
  }

  // MODIFICATION POINT: Event system
  addEventListener(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    this.eventListeners.get(eventName).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventName) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  emit(eventName, data) {
    const listeners = this.eventListeners.get(eventName) || [];
    
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  // MODIFICATION POINT: Middleware system
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  async executeMiddleware(context) {
    let result = context;

    for (const middleware of this.middleware) {
      try {
        result = await middleware(result);
      } catch (error) {
        console.error('Middleware error:', error);
        break;
      }
    }

    return result;
  }

  // Plugin management
  getPlugin(name) {
    return this.plugins.get(name);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  isPluginEnabled(name) {
    const plugin = this.plugins.get(name);
    return plugin && plugin.enabled !== false;
  }

  enablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = true;
      if (plugin.onEnable) {
        plugin.onEnable();
      }
    }
  }

  disablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = false;
      if (plugin.onDisable) {
        plugin.onDisable();
      }
    }
  }
}

// Singleton instance
export const pluginSystem = new PluginSystem();

// MODIFICATION POINT: React hooks for plugin system
export const usePlugin = (pluginName) => {
  const [plugin, setPlugin] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const p = pluginSystem.getPlugin(pluginName);
    setPlugin(p);
    setIsEnabled(pluginSystem.isPluginEnabled(pluginName));
  }, [pluginName]);

  return { plugin, isEnabled };
};

export const useHook = (hookName, initialValue, dependencies = []) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const result = pluginSystem.applyHook(hookName, initialValue);
    setValue(result);
  }, [hookName, initialValue, ...dependencies]);

  return value;
};

export const usePluginEvent = (eventName, callback, dependencies = []) => {
  useEffect(() => {
    return pluginSystem.addEventListener(eventName, callback);
  }, [eventName, ...dependencies]);
};

// MODIFICATION POINT: Plugin component wrapper
export const PluginWrapper = ({ pluginName, children, fallback = null }) => {
  const { isEnabled } = usePlugin(pluginName);

  if (!isEnabled) {
    return fallback;
  }

  return children;
};

// MODIFICATION POINT: Example plugin interfaces
export class BasePlugin {
  constructor(name, version, options = {}) {
    this.name = name;
    this.version = version;
    this.enabled = options.enabled !== false;
    this.dependencies = options.dependencies || [];
    this.description = options.description || '';
    this.author = options.author || '';
  }

  async initialize(api) {
    // Override in subclasses
  }

  cleanup() {
    // Override in subclasses
  }

  onEnable() {
    // Override in subclasses
  }

  onDisable() {
    // Override in subclasses
  }
}

// MODIFICATION POINT: Built-in plugin types
export class UIPlugin extends BasePlugin {
  constructor(name, version, options = {}) {
    super(name, version, options);
    this.components = new Map();
    this.routes = [];
    this.menuItems = [];
  }

  registerComponent(name, component) {
    this.components.set(name, component);
  }

  addRoute(route) {
    this.routes.push(route);
  }

  addMenuItem(item) {
    this.menuItems.push(item);
  }

  getComponent(name) {
    return this.components.get(name);
  }
}

export class ServicePlugin extends BasePlugin {
  constructor(name, version, options = {}) {
    super(name, version, options);
    this.services = new Map();
  }

  registerService(name, service) {
    this.services.set(name, service);
  }

  getService(name) {
    return this.services.get(name);
  }
}

// MODIFICATION POINT: Plugin factory
export const createPlugin = (type, config) => {
  const plugins = {
    ui: UIPlugin,
    service: ServicePlugin,
    base: BasePlugin
  };

  const PluginClass = plugins[type] || BasePlugin;
  return new PluginClass(config.name, config.version, config);
};

// MODIFICATION POINT: Plugin manager for presentations
export const PluginManager = () => {
  const [plugins, setPlugins] = useState([]);

  useEffect(() => {
    setPlugins(pluginSystem.getAllPlugins());
  }, []);

  const togglePlugin = useCallback((pluginName) => {
    const plugin = pluginSystem.getPlugin(pluginName);
    if (plugin.enabled) {
      pluginSystem.disablePlugin(pluginName);
    } else {
      pluginSystem.enablePlugin(pluginName);
    }
    setPlugins([...pluginSystem.getAllPlugins()]);
  }, []);

  return React.createElement('div', {
    className: 'plugin-manager p-6 bg-white rounded-lg shadow'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-xl font-bold mb-4'
    }, 'Plugin Manager'),

    React.createElement('div', {
      key: 'plugin-list',
      className: 'grid gap-4'
    }, plugins.map(plugin =>
      React.createElement('div', {
        key: plugin.name,
        className: 'border rounded-lg p-4'
      }, [
        React.createElement('div', {
          key: 'header',
          className: 'flex items-center justify-between mb-2'
        }, [
          React.createElement('h3', {
            key: 'name',
            className: 'font-semibold'
          }, plugin.name),
          
          React.createElement('button', {
            key: 'toggle',
            onClick: () => togglePlugin(plugin.name),
            className: `btn btn-sm ${plugin.enabled ? 'btn-success' : 'btn-secondary'}`
          }, plugin.enabled ? 'Enabled' : 'Disabled')
        ]),

        React.createElement('p', {
          key: 'description',
          className: 'text-sm text-gray-600 mb-2'
        }, plugin.description || 'No description available'),

        React.createElement('div', {
          key: 'meta',
          className: 'text-xs text-gray-500 flex gap-4'
        }, [
          React.createElement('span', {
            key: 'version'
          }, `v${plugin.version}`),
          
          plugin.author && React.createElement('span', {
            key: 'author'
          }, `by ${plugin.author}`),
          
          plugin.dependencies.length > 0 && React.createElement('span', {
            key: 'deps'
          }, `Requires: ${plugin.dependencies.join(', ')}`)
        ])
      ])
    ))
  ]);
};

// EXAMPLE PLUGIN IMPLEMENTATIONS:
/*
// Chat Plugin Example
class ChatPlugin extends UIPlugin {
  constructor() {
    super('chat', '1.0.0', {
      description: 'Real-time chat functionality',
      author: 'Dev Team'
    });
  }

  async initialize(api) {
    // Register chat component
    this.registerComponent('ChatWidget', ChatWidget);
    
    // Add to menu
    this.addMenuItem({
      label: 'Chat',
      icon: 'message',
      path: '/chat'
    });

    // Register hooks
    api.registerHook('navbar.items', (items) => {
      return [...items, { label: 'Chat', component: 'ChatWidget' }];
    });

    // Listen to events
    api.addEventListener('user.login', (user) => {
      console.log(`Chat: User ${user.name} logged in`);
    });
  }
}

// Analytics Plugin Example  
class AnalyticsPlugin extends ServicePlugin {
  constructor() {
    super('analytics', '1.0.0', {
      description: 'User analytics and tracking',
      dependencies: ['auth']
    });
  }

  async initialize(api) {
    const analyticsService = new AnalyticsService();
    this.registerService('analytics', analyticsService);

    // Track page views
    api.registerHook('router.navigate', (route) => {
      analyticsService.trackPageView(route);
      return route;
    });
  }
}

// Register plugins
pluginSystem.registerPlugin(new ChatPlugin());
pluginSystem.registerPlugin(new AnalyticsPlugin());
await pluginSystem.initialize();
*/