/**
 * FEATURE TOGGLE SYSTEM
 * 
 * Easy way to turn features on/off without changing code
 * Perfect for demos and presentations!
 * 
 * Just change true/false and refresh browser
 */

// main features - these work and are ready to demo
export const FEATURES = {
  // UI features
  DARK_MODE: true,          // ✅ dark mode toggle in header
  USER_PROFILES: true,      // ✅ user profile pages
  MOBILE_RESPONSIVE: true,  // ✅ works on phones/tablets
  
  // functional features  
  NOTIFICATIONS: true,      // ✅ toast notifications
  REPORTS: true,           // ✅ PDF report generation
  TASK_FILTERING: true,    // ✅ filter tasks by status/date
  SEARCH_FUNCTIONALITY: true, // ✅ search users and tasks
  
  // advanced features (might have bugs)
  TASK_COMMENTS: false,    // 🚧 comments on tasks (still buggy)
  FILE_UPLOADS: false,     // 🚧 file attachments (testing needed)
  EMAIL_NOTIFICATIONS: false, // 🚧 email alerts (not finished)
  REAL_TIME_UPDATES: false,   // 🚧 websocket updates (experimental)
  
  // future features (not implemented yet)
  CALENDAR_VIEW: false,    // 💭 calendar for task scheduling
  MOBILE_APP: false,       // 💭 react native version
  ANALYTICS_DASHBOARD: false, // 💭 charts and graphs
  INTEGRATION_API: false,  // 💭 third-party integrations
  
  // debugging features (for development)
  SHOW_DEBUG_INFO: false,  // 🔧 shows debug panels
  CONSOLE_LOGGING: true,   // 🔧 detailed console logs
  MOCK_DATA: false,        // 🔧 use fake data instead of API
};

// feature descriptions for documentation
export const FEATURE_DESCRIPTIONS = {
  DARK_MODE: "Toggle between light and dark themes",
  USER_PROFILES: "View and edit user profile information", 
  NOTIFICATIONS: "Toast notifications for actions and errors",
  REPORTS: "Generate PDF reports for tasks and users",
  TASK_COMMENTS: "Add comments and notes to tasks",
  FILE_UPLOADS: "Attach files and images to tasks",
  EMAIL_NOTIFICATIONS: "Send email alerts for task updates",
  REAL_TIME_UPDATES: "Live updates without page refresh",
  CALENDAR_VIEW: "Calendar interface for task scheduling",
  MOBILE_APP: "Native mobile application",
  ANALYTICS_DASHBOARD: "Charts and analytics for managers",
  INTEGRATION_API: "REST API for third-party integrations"
};

// demo presets for presentations
export const DEMO_PRESETS = {
  // basic demo - just core functionality
  BASIC: {
    DARK_MODE: false,
    USER_PROFILES: true,
    NOTIFICATIONS: true,
    REPORTS: false,
    TASK_COMMENTS: false,
    FILE_UPLOADS: false,
    EMAIL_NOTIFICATIONS: false,
    REAL_TIME_UPDATES: false,
    SHOW_DEBUG_INFO: false,
    CONSOLE_LOGGING: false
  },
  
  // full demo - all working features
  FULL: {
    DARK_MODE: true,
    USER_PROFILES: true, 
    NOTIFICATIONS: true,
    REPORTS: true,
    TASK_FILTERING: true,
    SEARCH_FUNCTIONALITY: true,
    TASK_COMMENTS: false, // still has bugs
    FILE_UPLOADS: false,  // not fully tested
    EMAIL_NOTIFICATIONS: false,
    REAL_TIME_UPDATES: false,
    SHOW_DEBUG_INFO: false,
    CONSOLE_LOGGING: true
  },
  
  // development - all features including experimental
  DEVELOPMENT: {
    DARK_MODE: true,
    USER_PROFILES: true,
    NOTIFICATIONS: true, 
    REPORTS: true,
    TASK_FILTERING: true,
    SEARCH_FUNCTIONALITY: true,
    TASK_COMMENTS: true,  // might be buggy
    FILE_UPLOADS: true,   // experimental
    EMAIL_NOTIFICATIONS: true, // experimental
    REAL_TIME_UPDATES: true,   // very experimental
    SHOW_DEBUG_INFO: true,
    CONSOLE_LOGGING: true,
    MOCK_DATA: false
  }
};

// helper function to apply preset
export const applyPreset = (presetName) => {
  const preset = DEMO_PRESETS[presetName];
  if (preset) {
    Object.assign(FEATURES, preset);
    console.log(`🎯 Applied ${presetName} preset:`, preset);
  }
};

// helper function to check if feature is enabled
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] === true;
};

// helper to get all enabled features
export const getEnabledFeatures = () => {
  return Object.keys(FEATURES).filter(key => FEATURES[key] === true);
};

// helper to get disabled features  
export const getDisabledFeatures = () => {
  return Object.keys(FEATURES).filter(key => FEATURES[key] === false);
};

// usage examples:
/*
// in components:
import { isFeatureEnabled } from '../config/features';

if (isFeatureEnabled('DARK_MODE')) {
  // show dark mode toggle
}

// for demo setup:
import { applyPreset } from '../config/features';
applyPreset('FULL'); // apply full demo preset
*/