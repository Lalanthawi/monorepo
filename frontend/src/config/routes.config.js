/**
 * ROUTES CONFIGURATION
 * 
 * Centralized routing configuration for easy modification during presentations.
 * Add new routes by simply extending the configuration objects.
 */

import { ROLES_CONFIG } from './app.config.js';

// MODIFICATION POINT: Add new routes here
export const ROUTES_CONFIG = {
  // Public routes
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    UNAUTHORIZED: "/unauthorized"
    // Example: ABOUT: "/about"
  },
  
  // Protected routes by role
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USER_MANAGEMENT: "/admin/users",
    SYSTEM_SETTINGS: "/admin/settings",
    REPORTS: "/admin/reports"
    // Example: ANALYTICS: "/admin/analytics"
  },
  
  MANAGER: {
    DASHBOARD: "/manager/dashboard", 
    TASK_MANAGEMENT: "/manager/tasks",
    TEAM_VIEW: "/manager/team",
    REPORTS: "/manager/reports"
    // Example: SCHEDULING: "/manager/schedule"
  },
  
  ELECTRICIAN: {
    DASHBOARD: "/electrician/dashboard",
    MY_TASKS: "/electrician/tasks", 
    PROFILE: "/electrician/profile",
    HISTORY: "/electrician/history"
    // Example: CERTIFICATIONS: "/electrician/certifications"
  }
};

// Route permissions mapping
export const ROUTE_PERMISSIONS = {
  [ROUTES_CONFIG.ADMIN.DASHBOARD]: [ROLES_CONFIG.ADMIN],
  [ROUTES_CONFIG.ADMIN.USER_MANAGEMENT]: [ROLES_CONFIG.ADMIN],
  [ROUTES_CONFIG.MANAGER.DASHBOARD]: [ROLES_CONFIG.MANAGER],
  [ROUTES_CONFIG.MANAGER.TASK_MANAGEMENT]: [ROLES_CONFIG.MANAGER],
  [ROUTES_CONFIG.ELECTRICIAN.DASHBOARD]: [ROLES_CONFIG.ELECTRICIAN]
  // Add more route permissions as needed
};

// Default redirects after login by role
export const DEFAULT_REDIRECTS = {
  [ROLES_CONFIG.ADMIN]: ROUTES_CONFIG.ADMIN.DASHBOARD,
  [ROLES_CONFIG.MANAGER]: ROUTES_CONFIG.MANAGER.DASHBOARD, 
  [ROLES_CONFIG.ELECTRICIAN]: ROUTES_CONFIG.ELECTRICIAN.DASHBOARD
  // Example: [ROLES_CONFIG.SUPERVISOR]: ROUTES_CONFIG.SUPERVISOR.DASHBOARD
};