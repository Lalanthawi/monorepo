/**
 * LOGIN PAGE - User Authentication
 *
 * DEVELOPMENT HISTORY:
 * v1.0 - Basic login form with email/password
 * v1.1 - Added form validation and error handling
 * v1.2 - Added rate limiting after failed attempts
 * v1.3 - Added input sanitization and security measures
 * v1.4 - Fixed error display issues and improved UX
 * v1.5 - Current: Added persistent error messages (Jan 2025)
 *
 * FEATURES IMPLEMENTED:
 * ✅ Email/password authentication
 * ✅ Role-based redirects after login
 * ✅ Rate limiting (5 attempts = 5min block)
 * ✅ Input validation and sanitization
 * ✅ Error messages with persistence
 * ✅ Responsive design
 *
 * TODO / IMPROVEMENTS NEEDED:
 * - Add "Remember Me" checkbox
 * - Implement "Forgot Password" flow
 * - Add social login options (Google, etc)
 * - Better loading states
 * - Add password strength indicator
 * - Two-factor authentication
 *
 * KNOWN ISSUES:
 * - Password field clears on failed login (security feature)
 * - Error messages might be too technical for end users
 * - Rate limiting is per session, not per IP
 */
import { useState, useEffect } from "react";
import logo from "../../assets/logo.png"; // Update path if needed
import "./Login.css";
import { useNavigate } from "react-router-dom"; // If using React Router
import { authService } from "../../services/auth";

const Login = () => {
  const navigate = useNavigate(); // or use window.location.href
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(null);
  const [errorTimer, setErrorTimer] = useState(null); // timer for error message persistence

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on role
        switch (userData.role) {
          case "Admin":
            navigate("/admin/dashboard", { replace: true });
            break;
          case "Manager":
            navigate("/manager/dashboard", { replace: true });
            break;
          case "Electrician":
            navigate("/electrician/dashboard", { replace: true });
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (blockTimer) {
        clearTimeout(blockTimer);
      }
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [blockTimer, errorTimer]);

  // Form state

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Basic input sanitization
    let sanitizedValue = value;

    if (name === "email") {
      // Remove leading/trailing whitespace and convert to lowercase for email
      sanitizedValue = value.trimStart().toLowerCase();
      // Limit email length
      if (sanitizedValue.length > 255) {
        sanitizedValue = sanitizedValue.substring(0, 255);
      }
    } else if (name === "password") {
      // Limit password length but preserve case and whitespace
      if (value.length > 128) {
        sanitizedValue = value.substring(0, 128);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Clear field-specific errors when user types (but keep general errors for a while)
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // dont clear general error immediately - let it persist for a while after login failure
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.trim().length > 255) {
      newErrors.email = "Email is too long";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 1) {
      newErrors.password = "Password cannot be empty";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password is too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors and any existing error timer
    setErrors({});
    if (errorTimer) {
      clearTimeout(errorTimer);
      setErrorTimer(null);
    }

    // Check if user is temporarily blocked
    if (isBlocked) {
      setErrors({
        general: "Too many failed attempts. Please wait before trying again.",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(
        formData.email.trim(),
        formData.password
      );

      // Reset failed attempts on successful login
      setFailedAttempts(0);
      setIsBlocked(false);
      if (blockTimer) {
        clearTimeout(blockTimer);
        setBlockTimer(null);
      }

      // Redirect based on user role with replace to prevent going back
      switch (response.user.role) {
        case "Admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "Manager":
          navigate("/manager/dashboard", { replace: true });
          break;
        case "Electrician":
          navigate("/electrician/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error types
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.message) {
        const msg = error.message.toLowerCase();

        if (msg.includes("invalid email or password")) {
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (msg.includes("unauthorized")) {
          errorMessage =
            "Your account may be inactive. Please contact your administrator.";
        } else if (msg.includes("server error") || msg.includes("network")) {
          errorMessage =
            "Connection error. Please check your internet connection and try again.";
        } else if (msg.includes("user not found")) {
          errorMessage = "No account found with this email address.";
        } else {
          errorMessage = error.message;
        }
      }

      setErrors({
        general: errorMessage,
      });

      // Set timer to keep error message visible for 10 seconds
      const timer = setTimeout(() => {
        setErrors((prev) => ({
          ...prev,
          general: "",
        }));
        setErrorTimer(null);
      }, 10000); // 10 seconds

      setErrorTimer(timer);

      // Increment failed attempts and implement rate limiting
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      // Block user after 5 failed attempts for 5 minutes
      if (newFailedAttempts >= 5) {
        setIsBlocked(true);

        // Clear any existing error timer since we're setting a blocking message
        if (errorTimer) {
          clearTimeout(errorTimer);
          setErrorTimer(null);
        }

        setErrors({
          general:
            "Too many failed login attempts. Please wait 5 minutes before trying again.",
        });

        // Set timer to unblock user after 5 minutes
        const blockingTimer = setTimeout(() => {
          setIsBlocked(false);
          setFailedAttempts(0);
          setBlockTimer(null);
          // Also clear the error message when unblocking
          setErrors({});
        }, 5 * 60 * 1000); // 5 minutes

        setBlockTimer(blockingTimer);
      }

      // Clear password field on failed login for security
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo */}
        <img src={logo} alt="Logo" className="logo" />

        {/* Title */}
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">Please login to your account</p>

        {/* Error Message */}
        {errors.general && (
          <div className="error-message" role="alert" aria-live="polite">
            {errors.general}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "error" : ""}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              maxLength={255}
              disabled={isLoading}
              required
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? "error" : ""}
              autoComplete="current-password"
              maxLength={128}
              disabled={isLoading}
              required
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || isBlocked}
          >
            {isBlocked
              ? "Account Temporarily Blocked"
              : isLoading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="footer-text">
          Login issues? Please contact <a href="tel:+94812492311"> Admin</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
