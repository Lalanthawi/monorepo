// api service - handles all the backend communication stuff

// gets the api url from env vars (vite injects VITE_ prefixed vars)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// token stuff - for authentication
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// user data management
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null; // parse json or return null
};
export const setUser = (user) =>
  localStorage.setItem("user", JSON.stringify(user)); // stringify before saving
export const removeUser = () => localStorage.removeItem("user"); // oops had a typo here before

// main api request function - all other requests use this
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // check if request was successful
    if (!response.ok) {
      const error = await response.json(); // try to get error message from response
      
      // if unauthorized, only redirect if we're NOT on the login page
      if (response.status === 401) {
        // check if this is a login attempt (dont redirect during login)
        if (!window.location.pathname.includes('/login')) {
          removeToken();
          removeUser();
          window.location.href = "/login"; // force redirect
        }
        throw new Error(error.message || "Unauthorized");
      }
      
      throw new Error(error.message || "API request failed");
    }

    return await response.json(); // parse response as json
  } catch (error) {
    console.error("API Error:", error); // log it so we can debug
    throw error; // re-throw for caller to handle
  }
};
