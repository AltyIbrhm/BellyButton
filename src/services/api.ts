import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_DASHBOARD_API_KEY}`,
  },
});

// Example placeholder function
export async function fetchDashboardData() {
  try {
    // Replace '/dashboard' with your actual endpoint
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    // Basic error handling
    console.error('API error:', error);
    throw error;
  }
}

export default api; 