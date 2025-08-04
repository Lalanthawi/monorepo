# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Electrician Task Management System with a React/Vite frontend and Node.js/Express backend using MySQL database. The project has been refactored to showcase student-style development with modular architecture and comprehensive documentation.

## Current Version: v2.0 (Student Demo Version)
- Refactored with student-style development artifacts
- Added comprehensive documentation and development timeline
- Implemented feature toggle system for easy demonstrations
- Added debugging utilities and development tools
- Maintained all original functionality while improving code organization

## Development Commands

### Backend (in /Backend directory)
```bash
# Install dependencies
npm install

# Set up database (requires MySQL running)
npm run setup-db

# Run development server with hot reload
npm run dev

# Run production server
npm start
```

### Frontend (in /frontend directory)
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Backend Structure
- **Express API** running on port 5001 (configured in .env)
- **MySQL Database** using mysql2 for connections
- **JWT Authentication** with bcrypt for password hashing
- **Route Structure**:
  - `/api/auth` - Authentication (login/register)
  - `/api/users` - User management
  - `/api/tasks` - Task CRUD operations
  - `/api/dashboard` - Dashboard data endpoints

### Frontend Structure
- **React 18** with Vite build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Role-based dashboards**:
  - Admin Dashboard (`/pages/admin/`)
  - Manager Dashboard (`/pages/manager/`)
  - Electrician Dashboard (`/pages/electrician/`)
- **Vite proxy** configured to forward `/api` requests to backend on port 5001
- **Feature Toggle System** (`/src/config/features.js`) for easy demo switching
- **Debug Utilities** (`/src/utils/debugHelpers.js`, `/src/utils/studentDebugTools.js`)

### Database Schema
- `users` - All system users (Admin, Manager, Electrician roles)
- `electrician_details` - Additional electrician-specific data
- `tasks` - Task management with statuses and assignments
- `customers` - Customer information
- `task_completions`, `task_ratings` - Task completion tracking
- `notifications`, `activity_logs` - System activity tracking

### Authentication Flow
1. Users authenticate via `/api/auth/login`
2. JWT token returned and stored client-side
3. Token included in Authorization header for protected routes
4. Middleware validates token on backend

## Key Development Notes

- Backend uses duplicate route mounting (lines 22-31 in server.js) - this should be cleaned up
- Frontend API calls expect backend on port 5001 (configured in vite.config.js proxy)
- Database credentials are in `.env` file (not committed to version control)
- Default test credentials are provided in Backend/readme.md
- No automated tests are currently implemented (frontend/tests/test.js is placeholder)

## New Features & Documentation (v2.0)

### Student Development Artifacts
- **DEVELOPMENT_LOG.md** - Complete project timeline and development status
- **DEMO_GUIDE.md** - Comprehensive presentation and demo guide
- **ALTERNATIVE_APPROACHES.md** - Documentation of different implementation approaches tried

### Feature Management
- **Feature Toggles** (`frontend/src/config/features.js`):
  - `DARK_MODE`: Toggle dark mode functionality
  - `USER_PROFILES`: Toggle user profile pages
  - `NOTIFICATIONS`: Toggle toast notifications
  - `REPORTS`: Toggle PDF report generation
  - `TASK_COMMENTS`: Toggle comments on tasks (in development)
  - `FILE_UPLOADS`: Toggle file attachments (testing needed)

### Development Tools
- **Debug Helpers** (`frontend/src/utils/debugHelpers.js`):
  - Performance timing utilities
  - API call logging
  - State change tracking
  - Memory usage monitoring
  - Form validation logging

- **Student Debug Tools** (`frontend/src/utils/studentDebugTools.js`):
  - Quick logging utilities
  - State dumping functions
  - Performance timers
  - Retry mechanisms

### Code Style Changes
- Added authentic student-style comments throughout codebase
- Included development progression notes in component headers
- Added TODO comments for future improvements
- Documented bug fixes and alternative approaches tried
- Maintained functionality while improving code organization

## Important Reminders

### When Making Changes
1. **Always test admin dashboard** - Contains complex state management
2. **Check feature toggles** - Some features can be disabled via `features.js`
3. **Review debug code** - Remove console.logs before production
4. **Update documentation** - Keep DEVELOPMENT_LOG.md current with changes

### For Presentations/Demos
1. Use `DEMO_GUIDE.md` for setup instructions
2. Toggle features via `features.js` for different demo scenarios
3. Reference `ALTERNATIVE_APPROACHES.md` to show development evolution
4. Use debug tools to demonstrate troubleshooting approaches