// services/electricianService.js
const API_URL = "http://localhost:5001/api";

class ElectricianService {
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

  // User Profile
  getUserProfile = () => {
    return this.apiRequest("/users/profile");
  };

  // Tasks
  getTodayTasks = (date) => {
    return this.apiRequest(`/tasks?date=${date}`);
  };

  getAllTasks = () => {
    return this.apiRequest("/tasks");
  };

  updateTaskStatus = (taskId, status) => {
    return this.apiRequest(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  };

  completeTask = (taskId, data) => {
    return this.apiRequest(`/tasks/${taskId}/complete`, {
      method: "POST",
      body: JSON.stringify({
        completion_notes: data.completionNotes,
        materials_used: data.materialsUsed || "",
        additional_charges: parseFloat(data.additionalCharges) || 0,
      }),
    });
  };

  // Notifications
  getNotifications = () => {
    return this.apiRequest("/dashboard/notifications");
  };

  markNotificationRead = (notificationId) => {
    return this.apiRequest(`/dashboard/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  };

  // Data Transformation Methods
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

  getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  transformTasks = (tasks) => {
    return tasks.map((task) => ({
      id: task.task_code || `T${task.id}`,
      taskId: task.id,
      title: task.title,
      customer: task.customer_name,
      address: task.customer_address,
      phone: task.customer_phone,
      priority: task.priority,
      status: task.status,
      scheduledTime: `${this.formatTime(
        task.scheduled_time_start
      )} - ${this.formatTime(task.scheduled_time_end)}`,
      estimatedHours: task.estimated_hours,
      description: task.description || "",
      startTime: task.actual_start_time
        ? this.formatTime(task.actual_start_time)
        : null,
      completedTime: task.actual_end_time
        ? this.formatTime(task.actual_end_time)
        : null,
      rating: task.rating,
      feedback: task.feedback,
      completionNotes: task.completion_notes,
      additionalCharges: task.additional_charges,
      materials: [],
      scheduledDate: task.scheduled_date,
    }));
  };

  transformTaskHistory = (tasks) => {
    return tasks
      .map((task) => ({
        id: task.task_code || `T${task.id}`,
        taskId: task.id,
        date: new Date(task.scheduled_date).toISOString().split("T")[0],
        title: task.title,
        customer: task.customer_name,
        status: task.status,
        rating: task.rating || 0,
        earnings: parseFloat(task.additional_charges) || 0,
        priority: task.priority,
        estimatedHours: task.estimated_hours,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  transformNotifications = (notifications) => {
    return notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      time: this.getRelativeTime(notif.created_at),
      unread: !notif.is_read,
    }));
  };
}

export default new ElectricianService();
