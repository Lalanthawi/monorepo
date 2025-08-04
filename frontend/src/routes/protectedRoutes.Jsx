// ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      // No token or user data
      if (!token || !userStr) {
        console.log("No authentication credentials found");
        setIsAuthenticated(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);

        // Check if user has required role
        if (requiredRole && user.role !== requiredRole) {
          console.log(
            `User role ${user.role} doesn't match required role ${requiredRole}`
          );
          setAuthError(
            `Access denied. This page requires ${requiredRole} role.`
          );
          setIsAuthenticated(false);
          return;
        }

        // Validate token with API
        const response = await fetch(
          "http://localhost:5001/api/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          console.log("Authentication validated successfully");
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          console.log("Token expired or invalid");
          setAuthError("Your session has expired. Please login again.");
          // Clear invalid credentials
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        } else {
          console.log(
            "Authentication check failed with status:",
            response.status
          );
          setIsAuthenticated(true); // Assume valid if not 401 (might be network issue)
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        // Don't automatically logout on network errors
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [requiredRole]);

  // Handle navigation after auth check
  useEffect(() => {
    if (isAuthenticated === false) {
      // Store the attempted URL to redirect back after login
      const redirectPath = location.pathname !== "/" ? location.pathname : null;
      if (redirectPath) {
        localStorage.setItem("redirectAfterLogin", redirectPath);
      }

      // Add a small delay to show any error messages
      const timer = setTimeout(
        () => {
          navigate("/", { replace: true });
        },
        authError ? 2000 : 100
      );

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, location.pathname, authError]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Checking authentication...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error message before redirect
  if (isAuthenticated === false && authError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          background: "#f8f9fa",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <h3 style={{ color: "#e74c3c", marginBottom: "1rem" }}>
            Authentication Error
          </h3>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>{authError}</p>
          <p style={{ color: "#999", fontSize: "0.9rem" }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
