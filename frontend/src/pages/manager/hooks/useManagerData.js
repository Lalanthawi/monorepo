// hooks/useManagerData.js
import { useState, useEffect } from "react";
import managerService from "../services/managerService";

export const useManagerData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    assigned: 0,
    activeElectricians: 0,
    openIssues: 0,
    urgentIssues: 0,
    emergencyIssues: 0,
  });

  // Data states
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [electricians, setElectricians] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const [dashboardResponse, issueStatsResponse] = await Promise.all([
        managerService.getDashboardStats(),
        managerService.getIssueStats().catch(err => {
          console.error("Failed to fetch issue stats:", err);
          return null;
        })
      ]);
      
      if (dashboardResponse.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalTasks: dashboardResponse.data.totalTasks || 0,
          inProgress: dashboardResponse.data.inProgressTasks || 0,
          completed: dashboardResponse.data.completedTasks || 0,
          pending: dashboardResponse.data.pendingTasks || 0,
          assigned: dashboardResponse.data.assignedTasks || 0,
          activeElectricians: dashboardResponse.data.availableElectricians || 0,
        }));
      }
      
      if (issueStatsResponse?.success && issueStatsResponse?.stats) {
        setStats(prevStats => ({
          ...prevStats,
          openIssues: issueStatsResponse.stats.open_issues || 0,
          urgentIssues: issueStatsResponse.stats.urgent_issues || 0,
          emergencyIssues: issueStatsResponse.stats.emergency_issues || 0,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Failed to load dashboard statistics");
    }
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await managerService.getAllTasks();
      if (response.success) {
        const transformedTasks = managerService.transformTasks(response.data);
        setTasks(transformedTasks);
        filterTasks("all", transformedTasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by status
  const filterTasks = (filter, taskList = tasks) => {
    setActiveFilter(filter);

    if (filter === "all") {
      setFilteredTasks(taskList);
    } else {
      const filtered = taskList.filter(
        (task) => task.status.toLowerCase() === filter.toLowerCase()
      );
      setFilteredTasks(filtered);
    }
  };

  // Fetch electricians
  const fetchElectricians = async () => {
    try {
      const response = await managerService.getElectricians();
      if (response.success) {
        const transformedElectricians = managerService.transformElectricians(
          response.data
        );
        setElectricians(transformedElectricians);
      }
    } catch (err) {
      console.error("Failed to fetch electricians:", err);
    }
  };

  // Fetch recent activities
  const fetchActivities = async () => {
    try {
      const response = await managerService.getRecentActivities();
      if (response.success) {
        setActivities(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  // Create new task
  const createTask = async (taskData) => {
    try {
      const response = await managerService.createTask(taskData);
      if (response.success) {
        await fetchTasks();
        await fetchDashboardStats();
        return { success: true, message: "Task created successfully!" };
      }
    } catch (err) {
      throw new Error("Failed to create task: " + err.message);
    }
  };

  // Assign task to electrician
  const assignTask = async (taskId, electricianId) => {
    try {
      const response = await managerService.assignTask(taskId, electricianId);
      if (response.success) {
        await fetchTasks();
        await fetchDashboardStats();
        await fetchElectricians();
        return { success: true, message: "Task assigned successfully!" };
      }
    } catch (err) {
      throw new Error("Failed to assign task: " + err.message);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await managerService.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        await fetchTasks();
        await fetchDashboardStats();
        return { success: true, message: "Task status updated successfully!" };
      }
    } catch (err) {
      throw new Error("Failed to update task: " + err.message);
    }
  };

  // Update task details
  const updateTask = async (taskId, taskData) => {
    try {
      const response = await managerService.updateTask(taskId, taskData);
      if (response.success) {
        await fetchTasks();
        await fetchDashboardStats();
        return { success: true, message: "Task updated successfully!" };
      }
    } catch (err) {
      throw new Error("Failed to update task: " + err.message);
    }
  };

  // Get task by ID with completion details
  const getTaskById = async (taskId) => {
    try {
      const response = await managerService.getTaskById(taskId);
      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }
    } catch (err) {
      throw new Error("Failed to fetch task details: " + err.message);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const response = await managerService.deleteTask(taskId);
      if (response.success) {
        await fetchTasks();
        await fetchDashboardStats();
        return { success: true, message: "Task deleted successfully!" };
      }
    } catch (err) {
      throw new Error("Failed to delete task: " + err.message);
    }
  };

  // Generate report
  const generateReport = async (reportType, startDate, endDate) => {
    try {
      const reportData = {
        report_type: reportType,
        start_date:
          startDate ||
          new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],
        end_date: endDate || new Date().toISOString().split("T")[0],
      };

      const response = await managerService.generateReport(reportData);
      if (response.success) {
        return {
          success: true,
          message: "Report generated successfully!",
          data: response.data,
        };
      }
    } catch (err) {
      throw new Error("Failed to generate report: " + err.message);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchTasks(),
          fetchElectricians(),
          fetchActivities(),
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchTasks();
      fetchElectricians();
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    error,
    stats,
    tasks,
    filteredTasks,
    electricians,
    activities,
    activeFilter,
    userInfo,
    fetchDashboardStats,
    fetchTasks,
    fetchElectricians,
    fetchActivities,
    filterTasks,
    createTask,
    assignTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getTaskById,
    generateReport,
    setError,
  };
};
