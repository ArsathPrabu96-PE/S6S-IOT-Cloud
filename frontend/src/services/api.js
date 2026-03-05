import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Devices API
export const devicesAPI = {
  list: (params) => api.get('/devices', { params }),
  get: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  getStats: () => api.get('/devices/stats'),
  getTypes: () => api.get('/devices/types'),
  getProtocols: () => api.get('/devices/protocols'),
  regenerateCredentials: (id) => api.post(`/devices/${id}/regenerate-credentials`),
  
  // Sensors
  getSensors: (deviceId) => api.get(`/devices/${deviceId}/sensors`),
  createSensor: (deviceId, data) => api.post(`/devices/${deviceId}/sensors`, data),
};

// Sensors API
export const sensorsAPI = {
  get: (id) => api.get(`/sensors/${id}`),
  update: (id, data) => api.put(`/sensors/${id}`, data),
  delete: (id) => api.delete(`/sensors/${id}`),
  getReadings: (id, params) => api.get(`/sensors/${id}/readings`, { params }),
  getStats: (id, params) => api.get(`/sensors/${id}/stats`, { params }),
  getLatest: (id) => api.get(`/sensors/${id}/latest`),
  getDeviceReadings: (deviceId, params) => api.get(`/sensors/device/${deviceId}/readings`, { params }),
};

// Alerts API
export const alertsAPI = {
  list: (params) => api.get('/alerts', { params }),
  get: (id) => api.get(`/alerts/${id}`),
  acknowledge: (id) => api.put(`/alerts/${id}/acknowledge`),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
};

// Dashboards API
export const dashboardsAPI = {
  list: () => api.get('/dashboards'),
  get: (id) => api.get(`/dashboards/${id}`),
  create: (data) => api.post('/dashboards', data),
  update: (id, data) => api.put(`/dashboards/${id}`, data),
  delete: (id) => api.delete(`/dashboards/${id}`),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  subscribe: (planId) => api.post('/subscriptions', { planId }),
  cancel: () => api.delete('/subscriptions'),
  updatePayment: (data) => api.put('/subscriptions/payment', data),
};

export default api;
