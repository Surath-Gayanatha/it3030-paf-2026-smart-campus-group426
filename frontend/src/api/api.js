import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

// Attach JWT token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors (token expiry)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 302 redirects as successful responses
    if (error.response?.status === 302) {
      return error.response;
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;