/**
 * THEME CONFIGURATION
 * 
 * Dynamic theme system for easy color and styling modifications
 * during VIVA presentations. Switch themes instantly.
 */

// MODIFICATION POINT: Add new themes here
export const THEMES = {
  LIGHT: {
    name: "light",
    displayName: "Light Theme",
    colors: {
      primary: "#3B82F6",
      secondary: "#10B981",
      success: "#22C55E", 
      warning: "#F59E0B",
      error: "#EF4444",
      background: "#FFFFFF",
      surface: "#F9FAFB",
      text: {
        primary: "#111827",
        secondary: "#6B7280",
        muted: "#9CA3AF"
      },
      border: "#E5E7EB"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  },
  
  DARK: {
    name: "dark", 
    displayName: "Dark Theme",
    colors: {
      primary: "#60A5FA",
      secondary: "#34D399",
      success: "#4ADE80",
      warning: "#FBBF24", 
      error: "#F87171",
      background: "#111827",
      surface: "#1F2937",
      text: {
        primary: "#F9FAFB",
        secondary: "#D1D5DB", 
        muted: "#9CA3AF"
      },
      border: "#374151"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.3)"
    }
  },
  
  // Example: Add new theme for presentations
  BLUE: {
    name: "blue",
    displayName: "Professional Blue", 
    colors: {
      primary: "#1E40AF",
      secondary: "#0891B2",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626", 
      background: "#FFFFFF",
      surface: "#EFF6FF",
      text: {
        primary: "#1E3A8A",
        secondary: "#1E40AF",
        muted: "#64748B"
      },
      border: "#DBEAFE"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(30 64 175 / 0.05)",
      md: "0 4px 6px -1px rgb(30 64 175 / 0.1)", 
      lg: "0 10px 15px -3px rgb(30 64 175 / 0.1)"
    }
  }
};

// Component styling configurations
export const COMPONENT_STYLES = {
  // MODIFICATION POINT: Customize component appearances
  button: {
    base: "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
    variants: {
      primary: "text-white focus:ring-primary-500",
      secondary: "text-white focus:ring-secondary-500", 
      outline: "border-2 bg-transparent focus:ring-primary-500"
    },
    sizes: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base", 
      lg: "px-6 py-3 text-lg"
    }
  },
  
  card: {
    base: "rounded-lg border shadow-sm",
    variants: {
      default: "bg-surface border-border",
      elevated: "shadow-lg"
    }
  },
  
  input: {
    base: "block w-full rounded-md border px-3 py-2 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
    sizes: {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-lg"
    }
  }
};

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
};

// Animation configurations
export const ANIMATIONS = {
  // MODIFICATION POINT: Customize animations
  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms"
  },
  
  easings: {
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)", 
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
  }
};