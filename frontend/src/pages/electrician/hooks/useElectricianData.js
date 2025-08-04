// hooks/useElectricianData.js
import { useState, useEffect } from "react";
import electricianService from "../services/electricianService";

export const useElectricianData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedToday: 0,
    inProgress: 0,
    pendingToday: 0,
    totalCompleted: 0,
    thisMonth: 0,
    completedThisMonth: 0,
    avgRating: 0,
    onTimeRate: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await electricianService.getDashboardStats();
      if (response.success) {
        setStats({
          todayTasks: response.data.todayTasks || 0,
          completedToday: response.data.todayCompleted || response.data.completedToday || 0,
          inProgress: response.data.inProgressTasks || response.data.inProgress || 0,
          pendingToday: response.data.assignedTasks || response.data.pendingToday || 0,
          totalCompleted: response.data.completedTasks || response.data.totalCompleted || 0,
          thisMonth: response.data.thisMonth || 0,
          completedThisMonth: response.data.completedThisMonth || 0,
          avgRating: response.data.avgRating || 0,
          onTimeRate: response.data.onTimeRate || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Failed to load dashboard statistics");
    }
  };

  // Fetch today's tasks
  const fetchTodayTasks = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await electricianService.getTodayTasks(today);

      if (response.success) {
        const transformedTasks = electricianService.transformTasks(
          response.data
        );
        setTodayTasks(transformedTasks);

        // Update stats based on actual tasks
        const pendingCount = transformedTasks.filter(
          (t) => t.status === "Pending" || t.status === "Assigned"
        ).length;
        const inProgressCount = transformedTasks.filter(
          (t) => t.status === "In Progress"
        ).length;
        const completedCount = transformedTasks.filter(
          (t) => t.status === "Completed"
        ).length;

        setStats((prevStats) => ({
          ...prevStats,
          todayTasks: transformedTasks.length,
          pendingToday: pendingCount,
          inProgress: inProgressCount,
          completedToday: completedCount,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch task history
  const fetchTaskHistory = async () => {
    try {
      const response = await electricianService.getAllTasks();
      if (response.success) {
        const history = electricianService.transformTaskHistory(response.data);
        setTaskHistory(history);
      }
    } catch (err) {
      console.error("Failed to fetch task history:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await electricianService.getNotifications();
      if (response.success) {
        const transformedNotifications =
          electricianService.transformNotifications(response.data);
        setNotifications(transformedNotifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await electricianService.getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus, additionalData = {}) => {
    try {
      const response = await electricianService.updateTaskStatus(
        taskId,
        newStatus
      );

      if (newStatus === "Completed" && additionalData.completionNotes) {
        await electricianService.completeTask(taskId, additionalData);
      }

      // Immediately update local state for instant feedback
      setTodayTasks(prevTasks => 
        prevTasks.map(task => 
          task.taskId === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Update stats immediately
      if (newStatus === "Completed") {
        setStats(prevStats => ({
          ...prevStats,
          completedToday: prevStats.completedToday + 1,
          inProgress: Math.max(0, prevStats.inProgress - 1),
          pendingToday: prevStats.pendingToday
        }));
      } else if (newStatus === "In Progress") {
        setStats(prevStats => ({
          ...prevStats,
          inProgress: prevStats.inProgress + 1,
          pendingToday: Math.max(0, prevStats.pendingToday - 1)
        }));
      }

      // Then refresh from server in background
      fetchTodayTasks();
      fetchDashboardStats();

      return {
        success: true,
        message: newStatus === "Completed" 
          ? "✅ Task completed successfully!" 
          : newStatus === "In Progress"
          ? "🚀 Task started successfully!"
          : "Task updated successfully!",
      };
    } catch (err) {
      console.error("Failed to update task:", err);
      throw new Error("Failed to update task status: " + err.message);
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId) => {
    try {
      await electricianService.markNotificationRead(notificationId);
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchTodayTasks(),
        fetchNotifications(),
        fetchUserProfile(),
      ]);
    };

    loadData();

    // Refresh notifications every 60 seconds (less frequent)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    error,
    stats,
    todayTasks,
    taskHistory,
    notifications,
    userInfo,
    userProfile,
    fetchDashboardStats,
    fetchTodayTasks,
    fetchTaskHistory,
    fetchNotifications,
    fetchUserProfile,
    updateTaskStatus,
    markNotificationRead,
    setError,
  };
};
