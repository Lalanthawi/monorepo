// services/managerService.js
const API_URL = "http://localhost:5001/api";

class ManagerService {
  getToken = () => localStorage.getItem("token");

  apiRequest = async (endpoint, options = {}) => {
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "API request failed");
    }

    return response.json();
  };

  // Dashboard Stats
  getDashboardStats = () => {
    return this.apiRequest("/dashboard/stats");
  };

  // Tasks
  getAllTasks = () => {
    return this.apiRequest("/tasks");
  };

  getTaskById = async (taskId) => {
    const response = await this.apiRequest(`/tasks/${taskId}`);
    if (response.success && response.data) {
      return {
        ...response,
        data: this.transformTask(response.data),
      };
    }
    return response;
  };

  getTasksByStatus = (status) => {
    return this.apiRequest(`/tasks?status=${status}`);
  };

  createTask = (taskData) => {
    return this.apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  };

  assignTask = (taskId, electricianId) => {
    return this.apiRequest(`/tasks/${taskId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ electrician_id: electricianId }),
    });
  };

  updateTaskStatus = (taskId, status) => {
    return this.apiRequest(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  };

  updateTask = (taskId, taskData) => {
    return this.apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  };

  deleteTask = (taskId) => {
    return this.apiRequest(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  };

  // Users/Electricians
  getElectricians = () => {
    return this.apiRequest("/users/electricians");
  };

  getElectricianDetails = (electricianId) => {
    return this.apiRequest(`/users/${electricianId}`);
  };

  // Reports
  generateReport = (reportData) => {
    return this.apiRequest("/dashboard/reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  };

  // Issues
  getIssueStats = () => {
    return this.apiRequest("/issues/stats");
  };

  // Activities
  getRecentActivities = () => {
    return this.apiRequest("/dashboard/activities");
  };

  // Notifications
  getNotifications = () => {
    return this.apiRequest("/dashboard/notifications");
  };

  // Helper methods
  formatDate = (dateString, compensateTimezone = false) => {
    if (!dateString) return "";
    
    // Handle both YYYY-MM-DD and full ISO date strings
    let dateStr = dateString.includes("T") ? dateString.split("T")[0] : dateString;
    
    // Add +1 day compensation when explicitly requested (for timezone issues)
    if (compensateTimezone) {
      try {
        const date = new Date(dateStr + "T12:00:00"); // Use noon to avoid timezone issues
        date.setDate(date.getDate() + 1); // Add 1 day
        return date.toISOString().split("T")[0];
      } catch (error) {
        // If date parsing fails, return original
        return dateStr;
      }
    }
    
    return dateStr;
  };

  formatTime = (timeString) => {
    if (!timeString) return "";

    let date;
    if (timeString.includes("T")) {
      date = new Date(timeString);
    } else if (timeString.includes(":")) {
      const today = new Date().toISOString().split("T")[0];
      date = new Date(`${today}T${timeString}`);
    } else {
      return timeString;
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  transformTasks = (tasks) => {
    return tasks.map((task) => this.transformTask(task));
  };

  transformTask = (task) => ({
    id: task.id,
    taskCode: task.task_code || `T${task.id}`,
    title: task.title,
    description: task.description,
    customerName: task.customer_name,
    customerPhone: task.customer_phone,
    customerAddress: task.customer_address,
    priority: task.priority,
    status: task.status,
    assignedTo: task.assigned_to,
    assignedElectrician: task.assigned_electrician,
    scheduledDate: this.formatDate(task.scheduled_date, true),
    scheduledTimeStart: task.scheduled_time_start,
    scheduledTimeEnd: task.scheduled_time_end,
    estimatedHours: task.estimated_hours,
    createdBy: task.created_by_name,
    rating: task.rating,
    feedback: task.feedback,
    // Completion data
    completion_notes: task.completion_notes,
    materials_used: task.materials_used,
    additional_charges: task.additional_charges,
    completed_at: task.completed_at,
  });

  transformElectricians = (electricians) => {
    return electricians.map((elec) => ({
      id: elec.id,
      name: elec.full_name,
      phone: elec.phone,
      status:
        elec.current_tasks > 0
          ? "On Task"
          : elec.status === "Active"
          ? "Available"
          : "Offline",
      currentTasks: elec.current_tasks || 0,
      tasksCompleted: elec.total_tasks_completed || 0,
      skills: elec.skills ? elec.skills.split(",").map((s) => s.trim()) : [],
      rating: parseFloat(elec.rating) || 0,
      employeeCode: elec.employee_code,
    }));
  };
}

export default new ManagerService();
