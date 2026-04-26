import axios from "axios";
import AuthService from "./AuthService";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`;

const UserService = {
  getProfile: async () => {
    const user = AuthService.getCurrentUser();
    const token = AuthService.getToken();
    if (!user || !token) return null;

    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const user = AuthService.getCurrentUser();
    const token = AuthService.getToken();
    if (!user || !token) return null;

    // Use FormData for potential image upload
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    const response = await axios.put(`${API_URL}/profile`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      },
    });
    return response.data;
  }
};

export default UserService;
