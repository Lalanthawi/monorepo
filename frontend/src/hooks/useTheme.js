/**
 * THEME HOOKS
 * 
 * Custom hooks for theme management and dynamic styling.
 * Easy to add new themes and styling patterns during presentations.
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { THEMES, COMPONENT_STYLES, ANIMATIONS } from '../config/theme.config.js';
import { STORAGE_CONFIG } from '../config/app.config.js';

// MODIFICATION POINT: Theme context for dependency injection
export const ThemeContext = createContext(null);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// MODIFICATION POINT: Main theme hook
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(THEMES.LIGHT);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customColors, setCustomColors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from storage
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem(STORAGE_CONFIG.KEYS.THEME);
        if (savedTheme) {
          const theme = Object.values(THEMES).find(t => t.name === savedTheme);
          if (theme) {
            setCurrentTheme(theme);
            setIsDarkMode(theme.name === 'dark');
          }
        }

        // Check system preference if no saved theme
        if (!savedTheme) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            setCurrentTheme(THEMES.DARK);
            setIsDarkMode(true);
          }
        }
      } catch (err) {
        console.error('Theme initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--color-${key}-${subKey}`, subValue);
        });
      } else {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Apply shadows
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply custom colors
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-custom-${key}`, value);
    });

    // Update document class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentTheme.name}`);

  }, [currentTheme, customColors, isLoading]);

  const changeTheme = useCallback((themeName) => {
    const theme = Object.values(THEMES).find(t => t.name === themeName);
    if (theme) {
      setCurrentTheme(theme);
      setIsDarkMode(theme.name === 'dark');
      localStorage.setItem(STORAGE_CONFIG.KEYS.THEME, themeName);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newTheme = isDarkMode ? THEMES.LIGHT : THEMES.DARK;
    setCurrentTheme(newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem(STORAGE_CONFIG.KEYS.THEME, newTheme.name);
  }, [isDarkMode]);

  const setCustomColor = useCallback((key, value) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetCustomColors = useCallback(() => {
    setCustomColors({});
  }, []);

  // MODIFICATION POINT: Add preset theme variations
  const applyPreset = useCallback((presetName) => {
    const presets = {
      professional: {
        primary: '#1E40AF',
        secondary: '#0891B2',
        background: '#FFFFFF'
      },
      creative: {
        primary: '#7C3AED',
        secondary: '#EC4899',
        background: '#FAFBFC'
      },
      nature: {
        primary: '#059669',
        secondary: '#0891B2',
        background: '#F0FDF4'
      }
    };

    const preset = presets[presetName];
    if (preset) {
      setCustomColors(preset);
    }
  }, []);

  return {
    currentTheme,
    isDarkMode,
    customColors,
    isLoading,
    availableThemes: Object.values(THEMES),
    changeTheme,
    toggleDarkMode,
    setCustomColor,
    resetCustomColors,
    applyPreset
  };
};

// MODIFICATION POINT: Component styling hook
export const useComponentStyles = (component, variant = 'default', size = 'md') => {
  const { currentTheme, customColors } = useThemeContext();

  const getStyles = useCallback(() => {
    const componentConfig = COMPONENT_STYLES[component];
    if (!componentConfig) return '';

    let styles = componentConfig.base || '';

    // Add variant styles
    if (componentConfig.variants && componentConfig.variants[variant]) {
      styles += ` ${componentConfig.variants[variant]}`;
    }

    // Add size styles
    if (componentConfig.sizes && componentConfig.sizes[size]) {
      styles += ` ${componentConfig.sizes[size]}`;
    }

    return styles;
  }, [component, variant, size]);

  const getThemeColor = useCallback((colorKey) => {
    const keys = colorKey.split('.');
    let color = currentTheme.colors;
    
    for (const key of keys) {
      color = color[key];
      if (!color) break;
    }

    return color || customColors[colorKey] || colorKey;
  }, [currentTheme, customColors]);

  const getCustomStyle = useCallback((properties) => {
    const style = {};
    
    Object.entries(properties).forEach(([prop, value]) => {
      if (typeof value === 'string' && value.startsWith('$')) {
        // Replace theme variables
        const colorKey = value.substring(1);
        style[prop] = getThemeColor(colorKey);
      } else {
        style[prop] = value;
      }
    });

    return style;
  }, [getThemeColor]);

  return {
    getStyles,
    getThemeColor,
    getCustomStyle,
    className: getStyles()
  };
};

// MODIFICATION POINT: Animation hook
export const useAnimation = () => {
  const [animations, setAnimations] = useState({});

  const createAnimation = useCallback((name, config) => {
    const {
      duration = ANIMATIONS.durations.normal,
      easing = ANIMATIONS.easings.easeInOut,
      delay = '0ms',
      fillMode = 'forwards'
    } = config;

    const animation = {
      animationName: name,
      animationDuration: duration,
      animationTimingFunction: easing,
      animationDelay: delay,
      animationFillMode: fillMode
    };

    setAnimations(prev => ({ ...prev, [name]: animation }));
    return animation;
  }, []);

  const fadeIn = useCallback((duration = ANIMATIONS.durations.normal) => {
    return createAnimation('fadeIn', { duration });
  }, [createAnimation]);

  const slideIn = useCallback((direction = 'right', duration = ANIMATIONS.durations.normal) => {
    return createAnimation(`slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)}`, { duration });
  }, [createAnimation]);

  const bounce = useCallback((duration = ANIMATIONS.durations.slow) => {
    return createAnimation('bounce', { duration });
  }, [createAnimation]);

  const pulse = useCallback((duration = ANIMATIONS.durations.normal) => {
    return createAnimation('pulse', { duration });
  }, [createAnimation]);

  // MODIFICATION POINT: Add custom animation presets
  const shake = useCallback((intensity = 'normal') => {
    const intensities = {
      light: ANIMATIONS.durations.fast,
      normal: ANIMATIONS.durations.normal,
      strong: ANIMATIONS.durations.slow
    };
    
    return createAnimation('shake', { 
      duration: intensities[intensity] || ANIMATIONS.durations.normal 
    });
  }, [createAnimation]);

  return {
    animations,
    createAnimation,
    fadeIn,
    slideIn,
    bounce,
    pulse,
    shake
  };
};

// MODIFICATION POINT: Responsive design hook
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setBreakpoint('sm');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 768) {
        setBreakpoint('md');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < 1024) {
        setBreakpoint('lg');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setBreakpoint('xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const getResponsiveValue = useCallback((values) => {
    return values[breakpoint] || values.default || values[Object.keys(values)[0]];
  }, [breakpoint]);

  const isBreakpoint = useCallback((bp) => {
    return breakpoint === bp;
  }, [breakpoint]);

  const isAtLeast = useCallback((bp) => {
    const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpoints.indexOf(breakpoint);
    const targetIndex = breakpoints.indexOf(bp);
    return currentIndex >= targetIndex;
  }, [breakpoint]);

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveValue,
    isBreakpoint,
    isAtLeast
  };
};