// Demo mode API service - returns mock data without needing backend
const DEMO_MODE = true;

const DEMO_USER = { id: 'demo-1', email: 'demo@s6s-iot.com', firstName: 'Demo', lastName: 'User', company: 'S6S IoT' };
const DEMO_TOKENS = { accessToken: 'demo-access-token-' + Date.now(), refreshToken: 'demo-refresh-token-' + Date.now() };

// Initial demo devices
const INITIAL_DEMO_DEVICES = [
  { id: '1', name: 'Living Room', device_uuid: 'ESP32-001', device_type_name: 'ESP32', status: 'online', last_seen_at: new Date().toISOString(), location: 'Indoor', energy: 245, sensors: [{ id: 's1', name: 'Temperature', type: 'temperature', unit: '°C', last_value: 24.5 }, { id: 's2', name: 'Humidity', type: 'humidity', unit: '%', last_value: 65 }] },
  { id: '2', name: 'Garden', device_uuid: 'ESP8266-002', device_type_name: 'ESP8266', status: 'online', last_seen_at: new Date().toISOString(), location: 'Outdoor', energy: 189, sensors: [{ id: 's3', name: 'Soil Moisture', type: 'soil_moisture', unit: '%', last_value: 42 }] },
];

// Load from localStorage or use initial data
const loadDevices = () => {
  try {
    const stored = localStorage.getItem('demo_devices');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load devices from localStorage', e);
  }
  return INITIAL_DEMO_DEVICES;
};

// Save to localStorage
const saveDevices = (devices) => {
  try {
    localStorage.setItem('demo_devices', JSON.stringify(devices));
  } catch (e) {
    console.error('Failed to save devices to localStorage', e);
  }
};

let DEMO_DEVICES = loadDevices();

const DEMO_STATS = { total: 2, online: 2, offline: 0, error: 0 };
const DEMO_DEVICE_TYPES = [{ id: 1, name: 'ESP32', slug: 'esp32', manufacturer: 'Espressif', description: 'Powerful WiFi + Bluetooth MCU' }, { id: 2, name: 'ESP8266', slug: 'esp8266', manufacturer: 'Espressif', description: 'Low-cost WiFi MCU' }];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
  get: async (url) => {
    await delay(300);
    if (url.includes('/auth/me')) return { data: { success: true, data: { user: DEMO_USER, subscription: null, deviceCount: 2 } } };
    if (url.includes('/devices/stats')) return { data: { success: true, data: DEMO_STATS } };
    if (url === '/devices' || url.includes('/devices?')) return { data: { success: true, data: DEMO_DEVICES, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } } };
    if (url.includes('/devices/types')) return { data: { success: true, data: DEMO_DEVICE_TYPES } };
    if (url.includes('/devices/protocols')) return { data: { success: true, data: [{ id: 1, name: 'MQTT', description: 'Message Queuing Telemetry Transport' }] } };
    if (url.includes('/devices/microcontrollers')) return { data: { success: true, data: DEMO_DEVICE_TYPES } };
    return { data: { success: false, error: 'Not found' } };
  },
  post: async (url, data) => {
    await delay(300);
    if (url.includes('/auth/login') || url.includes('/auth/register')) return { data: { success: true, data: { user: DEMO_USER, ...DEMO_TOKENS } } };
    if (url === '/devices') {
      const newDevice = { id: String(DEMO_DEVICES.length + 1), name: data ? JSON.parse(data).name : 'New Device', device_uuid: 'ESP32-' + Math.random().toString(36).substr(2, 9).toUpperCase(), device_type_name: 'ESP32', status: 'online', last_seen_at: new Date().toISOString(), location: 'Indoor', energy: 0, sensors: [] };
      DEMO_DEVICES.push(newDevice);
      saveDevices(DEMO_DEVICES);
      return { data: { success: true, data: newDevice } };
    }
    return { data: { success: false, error: 'Not found' } };
  },
  put: async (url) => { await delay(300); return { data: { success: true } }; },
  delete: async (url) => { 
    await delay(300); 
    const id = url.split('/').pop();
    DEMO_DEVICES = DEMO_DEVICES.filter(d => d.id !== id);
    saveDevices(DEMO_DEVICES);
    return { data: { success: true } }; 
  },
};

export const authAPI = {
  register: (data) => api.post('/auth/register', JSON.stringify(data)),
  login: (data) => api.post('/auth/login', JSON.stringify(data)),
  logout: () => api.post('/auth/logout', {}),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', JSON.stringify(data)),
  changePassword: (data) => api.put('/auth/password', JSON.stringify(data)),
};

export const devicesAPI = {
  list: (params) => api.get('/devices' + (params ? '?limit=' + params.limit : '')),
  get: (id) => api.get('/devices/' + id),
  create: (data) => api.post('/devices', JSON.stringify(data)),
  update: (id, data) => api.put('/devices/' + id, JSON.stringify(data)),
  delete: (id) => api.delete('/devices/' + id),
  getStats: () => api.get('/devices/stats'),
  getTypes: () => api.get('/devices/types'),
  getProtocols: () => api.get('/devices/protocols'),
  regenerateCredentials: (id) => api.post('/devices/' + id + '/regenerate-credentials', {}),
  getSensors: (deviceId) => api.get('/devices/' + deviceId + '/sensors'),
  createSensor: (deviceId, data) => api.post('/devices/' + deviceId + '/sensors', JSON.stringify(data)),
  getMicrocontrollers: (filter = 'all') => api.get('/devices/microcontrollers?filter=' + filter),
  getMicrocontroller: (slug) => api.get('/devices/microcontrollers/' + slug),
  generateFirmware: (slug, data) => api.post('/devices/microcontrollers/' + slug + '/firmware', JSON.stringify(data)),
  downloadFirmware: (slug, params) => '/api/devices/microcontrollers/' + slug + '/firmware/download?' + Object.entries(params).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&'),
};

export const sensorsAPI = {
  get: (id) => api.get('/sensors/' + id),
  update: (id, data) => api.put('/sensors/' + id, JSON.stringify(data)),
  delete: (id) => api.delete('/sensors/' + id),
  getReadings: (id, params) => api.get('/sensors/' + id + '/readings'),
  getStats: (id, params) => api.get('/sensors/' + id + '/stats'),
  getLatest: (id) => api.get('/sensors/' + id + '/latest'),
};

export const alertsAPI = {
  list: (params) => api.get('/alerts'),
  get: (id) => api.get('/alerts/' + id),
  acknowledge: (id) => api.put('/alerts/' + id + '/acknowledge', {}),
  resolve: (id) => api.put('/alerts/' + id + '/resolve', {}),
};

export const dashboardsAPI = {
  list: () => api.get('/dashboards'),
  get: (id) => api.get('/dashboards/' + id),
  create: (data) => api.post('/dashboards', JSON.stringify(data)),
  update: (id, data) => api.put('/dashboards/' + id, JSON.stringify(data)),
  delete: (id) => api.delete('/dashboards/' + id),
};

export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  subscribe: (planId) => api.post('/subscriptions', JSON.stringify({ planId })),
  cancel: () => api.delete('/subscriptions'),
  updatePayment: (data) => api.put('/subscriptions/payment', JSON.stringify(data)),
};

export default api;
