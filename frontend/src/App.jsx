/**
 * APP.JSX - Main Application Component
 * 
 * DEVELOPMENT HISTORY:
 * v1.0 (Sep 2024) - Basic routing setup with login
 * v1.1 (Oct 2024) - Added role-based routing 
 * v1.2 (Nov 2024) - Added protected routes and auth redirect
 * v1.3 (Dec 2024) - Improved error handling and navigation
 * v1.4 (Jan 2025) - Current version with all features
 * 
 * TODO for next version:
 * - Add loading states between route changes
 * - Implement route-based code splitting
 * - Add breadcrumb navigation
 * - Better error boundaries
 */

// main app component - this is where everything starts
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../src/pages/login/Loginpage";
import AdminDashboard from "../src/pages/admin/admindashboard";
import ManagerDashboard from "../src/pages/manager/managerdashboard";
import ElectricianDashboard from "../src/pages/electrician/electriciandashboard";
import { getToken, getUser } from "../src/services/api";

// protects routes that need auth
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const user = getUser();

  // no token or user? go to login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // check if user has the right role for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// redirects logged in users to their dashboard
const AuthRedirect = () => {
  const token = getToken();
  const user = getUser();

  // if already logged in, send them to the right dashboard
  if (token && user) {
    switch (user.role) {
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "Manager":
        return <Navigate to="/manager/dashboard" replace />;
      case "Electrician":
        return <Navigate to="/electrician/dashboard" replace />;
      default:
        // unknown role? back to login
        return <Navigate to="/login" />;
    }
  }

  // not logged in, go to login page
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* public route - anyone can access */}
        <Route path="/login" element={<Login />} />

        {/* admin only route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* manager only route */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* electrician only route */}
        <Route
          path="/electrician/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Electrician"]}>
              <ElectricianDashboard />
            </ProtectedRoute>
          }
        />

        {/* default route - redirects based on auth */}
        <Route path="/" element={<AuthRedirect />} />
        {/* shown when user tries to access unauthorized route */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </Router>
  );
}

export default App;
