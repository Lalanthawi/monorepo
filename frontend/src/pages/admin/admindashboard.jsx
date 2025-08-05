// admin dashboard - main page for admins
import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboard";
import { usersService } from "../../services/users";
import { authService } from "../../services/auth";
import "./AdminDashboard.css"; // styles for this component

// all the child components (maybe too many?)
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./components/Overview";
import UserManagement from "./components/UserManagement";
import Reports from "./components/Reports";
import UserModal from "./components/UserModal";
import PasswordResetModal from "./components/PasswordResetModal";
import ReportModal from "./components/ReportModal";

const AdminDashboard = () => {
  // which section of the dashboard is currently active
  const [activeSection, setActiveSection] = useState("overview"); // start with overview
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    electricians: 0,
    managers: 0,
    admins: 0,
    activeJobs: 0,
    completedToday: 0,
    pendingJobs: 0,
    systemHealth: 98.5,
  });

  // Users data
  const [users, setUsers] = useState([]);

  // Recent activities
  const [activities, setActivities] = useState([]);

  // Current user data
  const [currentUser, setCurrentUser] = useState(null);

  // Form state for user modal
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "Electrician",
    employee_code: "",
    skills: [],
    certifications: "",
  });

  // Password reset form
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: null,
    newPassword: "",
    confirmPassword: "",
  });

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load dashboard stats
      const statsResponse = await dashboardService.getStats();
      if (statsResponse.success) {
        setStats({
          ...statsResponse.data,
          systemHealth: 98.5,
        });
      }

      // Load users
      const usersResponse = await usersService.getAll();
      if (usersResponse.success) {
        setUsers(
          usersResponse.data.filter((user) => user.status !== "Deleted")
        );
      }

      // Load current user profile
      const profileResponse = await usersService.getProfile();
      if (profileResponse.success) {
        setCurrentUser(profileResponse.data);
      }

      // Load recent activities
      const activitiesResponse = await dashboardService.getActivities();
      if (activitiesResponse.success) {
        const formattedActivities = activitiesResponse.data
          .slice(0, 10)
          .map((activity) => ({
            id: activity.id,
            type: getActivityType(activity.action),
            user: activity.user_name || "System",
            action: activity.description || activity.action,
            time: formatTimeAgo(new Date(activity.created_at)),
            icon: getActivityIcon(activity.action),
          }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format time
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Helper function to get activity type
  const getActivityType = (action) => {
    if (action.toLowerCase().includes("login")) return "user_login";
    if (action.toLowerCase().includes("task")) return "task";
    if (action.toLowerCase().includes("user")) return "user_added";
    return "report_generated";
  };

  // Helper function to get activity icon
  const getActivityIcon = (action) => {
    if (action.toLowerCase().includes("login")) return "🔐";
    if (action.toLowerCase().includes("task")) return "📋";
    if (action.toLowerCase().includes("user")) return "👤";
    if (action.toLowerCase().includes("report")) return "📊";
    if (action.toLowerCase().includes("password")) return "🔑";
    return "📌";
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      authService.logout();
    }
  };

  // Props to pass to child components
  const commonProps = {
    stats,
    users,
    activities,
    formData,
    setFormData,
    resetPasswordData,
    setResetPasswordData,
    reportData,
    setReportData,
    showModal,
    setShowModal,
    modalType,
    setModalType,
    selectedItem,
    setSelectedItem,
    showReportModal,
    setShowReportModal,
    loadDashboardData,
    setActiveSection,
  };

  // Render main content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Overview {...commonProps} />;
      case "users":
        return <UserManagement {...commonProps} />;
      case "reports":
        return <Reports {...commonProps} />;
      default:
        return <Overview {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading dashboard: {error}</p>
        <button onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <main className="main-content">
        <Header activeSection={activeSection} />

        <div className="content-wrapper">{renderContent()}</div>
      </main>

      {/* Modals */}
      {showModal && modalType !== "resetPassword" && (
        <UserModal {...commonProps} />
      )}

      {showModal && modalType === "resetPassword" && (
        <PasswordResetModal {...commonProps} />
      )}

      {showReportModal && <ReportModal {...commonProps} />}
    </div>
  );
};

export default AdminDashboard;
