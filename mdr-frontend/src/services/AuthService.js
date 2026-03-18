import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
const USER_API_URL = "http://localhost:5000/api/users";

const AuthService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    return await axios.post(`${API_URL}/register`, userData);
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  // Admin Actions
  getAllUsers: async () => {
    const token = localStorage.getItem("token");
    return await axios.get(USER_API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  changePassword: async (userId, newPassword) => {
    const token = localStorage.getItem("token");
    return await axios.post(`${USER_API_URL}/change-password`, 
      { userId, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  updateStatus: async (userId, status) => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(`${USER_API_URL}/${userId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const token = localStorage.getItem("token");
    return await axios.delete(`${USER_API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export default AuthService;
