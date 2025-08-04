/**
 * app config stuff
 * 
 * basically just moved all the magic numbers and strings here so i dont have to 
 * hunt them down later. prof said this was "good practice" or watever
 * TODO: maybe organize this better? its getting messy
 * FIXME: some of these constants might be wrong, need to double check
 */

// api stuff - dont change the base url unless ur testing localy!
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  TIMEOUT: 10000, // 10 seconds should be enough right? might need to increase later
  RETRY_ATTEMPTS: 3, // retry 3 times if it fails (network issues happen alot)
  
  // add new endpoints here when u need em (dont forget to update backend too!)
  ENDPOINTS: {
    AUTH: "/auth", // login stuff
    USERS: "/users", // user managment 
    TASKS: "/tasks", // task crud
    DASHBOARD: "/dashboard", // dashboard stats
    ISSUES: "/issues", // bug reports
    HEALTH: "/health" // health check
    // TODO: add reports endpoint when we get to that part
    // TODO: maybe need websocket endpoint for real-time updates?
  }
};

// roles - these match what the backend expects so dont mess with the strings!
export const ROLES_CONFIG = {
  ADMIN: "Admin",
  MANAGER: "Manager", 
  ELECTRICIAN: "Electrician",
  
  // add new roles here if needed (remember to update permissions too!)
  
  // what each role can do - this was confusing at first
  PERMISSIONS: {
    Admin: ["READ", "WRITE", "DELETE", "MANAGE_USERS", "VIEW_REPORTS"], // admin can do everything
    Manager: ["READ", "WRITE", "MANAGE_TASKS", "VIEW_REPORTS"], // manager stuff
    Electrician: ["READ", "UPDATE_TASKS", "VIEW_PROFILE"] // basic user permissions
    // TODO: add supervisor role? not sure if we need it yet
  }
};

// dashboard config - what shows up when users login
export const DASHBOARD_CONFIG = {
  // where each role goes first (landing page basically)
  DEFAULT_VIEWS: {
    Admin: "overview", // admins see everything first
    Manager: "tasks", // managers go straight to task management
    Electrician: "today-tasks" // electricians just see todays work
  },
  
  // all the different sections we have (add more here as needed)
  SECTIONS: {
    OVERVIEW: "overview",
    USER_MANAGEMENT: "user-management", 
    TASKS: "tasks",
    REPORTS: "reports",
    PROFILE: "profile",
    SETTINGS: "settings"
    // TODO: maybe add analytics section later?
  },
  
  // how often stuff refreshes automatically (in milliseconds)
  REFRESH_INTERVALS: {
    STATS: 30000, // stats every 30 seconds
    TASKS: 10000, // tasks every 10 seconds (needs to be frequent)
    NOTIFICATIONS: 5000 // notifications every 5 seconds
  }
};

// ui config - colors and layout stuff
export const UI_CONFIG = {
  // main colors for the app (hex codes)
  COLORS: {
    PRIMARY: "#3B82F6", // blue - looks good
    SECONDARY: "#10B981", // green 
    SUCCESS: "#22C55E", // success green
    WARNING: "#F59E0B", // orange for warnings
    ERROR: "#EF4444", // red for errors (obvs)
    NEUTRAL: "#6B7280" // gray for neutral stuff
  },
  
  // pagination settings for tables
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10, // 10 items per page seems reasonable
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50] // let users choose
  },
  
  // modal window sizes (tailwind classes)
  MODAL_SIZES: {
    SMALL: "max-w-md",
    MEDIUM: "max-w-lg", 
    LARGE: "max-w-2xl",
    EXTRA_LARGE: "max-w-4xl" // for really big forms
  }
};

// form stuff - field types and validation
export const FORM_CONFIG = {
  // all the input types we support (add more as needed)
  FIELD_TYPES: {
    TEXT: "text",
    EMAIL: "email",
    PASSWORD: "password", 
    SELECT: "select", // dropdown
    TEXTAREA: "textarea", // big text box
    CHECKBOX: "checkbox",
    RADIO: "radio", // radio buttons
    DATE: "date",
    FILE: "file" // file uploads
    // TODO: rich text editor would be nice
  },
  
  // validation rules (dont make these too strict!)
  VALIDATION: {
    USERNAME_MIN_LENGTH: 3, // minimum 3 chars for username
    PASSWORD_MIN_LENGTH: 6, // 6 chars min for password (could be longer?)
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // basic email validation regex
  }
};

// task status stuff - keep this in sync with backend!
export const TASK_CONFIG = {
  // possible task statuses (dont change these strings without updating backend)
  STATUSES: {
    PENDING: "Pending", // waiting to start
    IN_PROGRESS: "In Progress", // someone's working on it
    COMPLETED: "Completed", // done!
    CANCELLED: "Cancelled" // cancelled for whatever reason
    // might need "On Hold" status later
  },
  
  // colors for each status (tailwind classes)
  STATUS_COLORS: {
    Pending: "text-yellow-600 bg-yellow-100", // yellow
    "In Progress": "text-blue-600 bg-blue-100", // blue
    Completed: "text-green-600 bg-green-100", // green obvs
    Cancelled: "text-red-600 bg-red-100" // red
  },
  
  // priority levels (managers can set these)
  PRIORITIES: {
    LOW: "Low", // whenever
    MEDIUM: "Medium", // normal priority 
    HIGH: "High", // important
    URGENT: "Urgent" // drop everything else
  }
};

// reports config - what kinds of reports we can generate
export const REPORT_CONFIG = {
  // report types we support
  TYPES: {
    DAILY_TASKS: "daily-tasks", // daily task summary
    USER_ACTIVITY: "user-activity", // who did what
    SYSTEM_HEALTH: "system-health" // system status report
    // TODO: performance metrics report would be useful
  },
  
  // what formats we can export to
  EXPORT_FORMATS: {
    PDF: "pdf", // pdf files
    CSV: "csv", // comma separated 
    EXCEL: "xlsx" // excel files
  }
};

// feature flags - turn stuff on/off without deploying
export const FEATURE_FLAGS = {
  // features that are ready to go
  ENABLE_DARK_MODE: true, // dark mode toggle
  ENABLE_NOTIFICATIONS: true, // notification system
  ENABLE_REPORTS: true, // report generation
  ENABLE_USER_PROFILES: true, // user profile pages
  ENABLE_TASK_COMMENTS: false, // not ready yet
  ENABLE_FILE_UPLOADS: false // still working on this
  // TODO: chat feature when we get time
};

// local storage keys and expiry times
export const STORAGE_CONFIG = {
  // keys for localStorage
  KEYS: {
    TOKEN: "token", // auth token
    USER: "user", // user data 
    THEME: "theme", // theme preference
    PREFERENCES: "preferences" // user preferences
  },
  
  // how long stuff stays cached (milliseconds)
  EXPIRY_TIMES: {
    TOKEN: 24 * 60 * 60 * 1000, // tokens expire after 24 hours
    CACHE: 5 * 60 * 1000 // cache for 5 minutes
  }
};