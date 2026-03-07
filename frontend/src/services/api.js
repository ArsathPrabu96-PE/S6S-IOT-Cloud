// Demo mode API service - returns mock data without needing backend
const DEMO_MODE = true;

const DEMO_USER = { id: 'demo-1', email: 'demo@s6s-iot.com', firstName: 'Demo', lastName: 'User', company: 'S6S IoT' };
const DEMO_TOKENS = { accessToken: 'demo-access-token-' + Date.now(), refreshToken: 'demo-refresh-token-' + Date.now() };

// Initial demo devices
const INITIAL_DEMO_DEVICES = [
  { id: '1', name: 'Living Room', device_uuid: 'ESP32-001', device_type_name: 'ESP32', status: 'online', last_seen_at: new Date().toISOString(), location: 'Indoor', energy: 245, sensors: [{ id: 's1', name: 'Temperature', type: 'temperature', unit: '°C', last_value: 24.5 }, { id: 's2', name: 'Humidity', type: 'humidity', unit: '%', last_value: 65 }] },
  { id: '2', name: 'Garden', device_uuid: 'ESP8266-002', device_type_name: 'ESP8266', status: 'online', last_seen_at: new Date().toISOString(), location: 'Outdoor', energy: 189, sensors: [{ id: 's3', name: 'Soil Moisture', type: 'soil_moisture', unit: '%', last_value: 42 }] },
];

// Initial demo projects
const INITIAL_DEMO_PROJECTS = [
  { id: 'p1', name: 'Smart Home', description: 'Home automation and monitoring', category: 'smart_home', status: 'active', device_count: 2, created_at: new Date().toISOString() },
  { id: 'p2', name: 'Garden Monitor', description: 'Soil and plant monitoring', category: 'agriculture', status: 'active', device_count: 1, created_at: new Date().toISOString() },
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

// Load projects from localStorage or use initial data
const loadProjects = () => {
  try {
    const stored = localStorage.getItem('demo_projects');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
  }
  return INITIAL_DEMO_PROJECTS;
};

// Save to localStorage
const saveDevices = (devices) => {
  try {
    localStorage.setItem('demo_devices', JSON.stringify(devices));
  } catch (e) {
    console.error('Failed to save devices to localStorage', e);
  }
};

// Save projects to localStorage
const saveProjects = (projects) => {
  try {
    localStorage.setItem('demo_projects', JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
};

let DEMO_DEVICES = loadDevices();
let DEMO_PROJECTS = loadProjects();

// Alert rules for demo mode
const INITIAL_DEMO_ALERT_RULES = [
  { id: '1', name: 'High Temperature', type: 'threshold', condition: 'temperature', value: 30, unit: '°C', status: 'active', deviceName: 'Living Room' },
  { id: '2', name: 'Low Humidity', type: 'threshold', condition: 'humidity', value: 30, unit: '%', status: 'active', deviceName: 'Garden' },
  { id: '3', name: 'Device Offline', type: 'status', condition: 'status', value: 'offline', status: 'paused', deviceName: 'All Devices' },
];

const loadAlertRules = () => {
  try {
    const stored = localStorage.getItem('demo_alert_rules');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load alert rules from localStorage', e);
  }
  return INITIAL_DEMO_ALERT_RULES;
};

const saveAlertRules = (rules) => {
  try {
    localStorage.setItem('demo_alert_rules', JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save alert rules to localStorage', e);
  }
};

let DEMO_ALERT_RULES = loadAlertRules();

// Dynamic device stats calculation
const getDeviceStats = () => {
  const stats = { total: 0, online: 0, offline: 0, error: 0 };
  
  DEMO_DEVICES.forEach(device => {
    stats.total++;
    if (device.status === 'online') stats.online++;
    else if (device.status === 'offline') stats.offline++;
    else stats.error++;
  });
  
  return stats;
};

const DEMO_STATS = { total: 2, online: 2, offline: 0, error: 0 };

// Dynamic project stats calculation
const getProjectStats = () => {
  const stats = { total: 0, active: 0, paused: 0, archived: 0, smart_home: 0, industrial: 0, agriculture: 0, healthcare: 0, smart_city: 0, environmental: 0, other: 0 };
  
  DEMO_PROJECTS.forEach(project => {
    stats.total++;
    
    // Count by status
    if (project.status === 'active') stats.active++;
    else if (project.status === 'paused') stats.paused++;
    else if (project.status === 'archived') stats.archived++;
    
    // Count by category
    const category = project.category || 'other';
    if (stats[category] !== undefined) {
      stats[category]++;
    } else {
      stats.other++;
    }
  });
  
  return stats;
};
const DEMO_DEVICE_TYPES = [{ id: 1, name: 'ESP32', slug: 'esp32', manufacturer: 'Espressif', description: 'Powerful WiFi + Bluetooth MCU' }, { id: 2, name: 'ESP8266', slug: 'esp8266', manufacturer: 'Espressif', description: 'Low-cost WiFi MCU' }];

// Full microcontroller data with all details
const DEMO_MICROCONTROLLERS = [
  { slug: 'esp32', name: 'ESP32', manufacturer: 'Espressif', cores: 'Dual', frequency: '240MHz', flash: '4MB', ram: '520KB', voltage: '3.3V', wifi: true, bluetooth: true, architecture: 'Xtensa', programmingLanguages: ['C', 'C++', 'Python', 'Arduino'] },
  { slug: 'esp8266', name: 'ESP8266', manufacturer: 'Espressif', cores: 'Single', frequency: '80MHz', flash: '4MB', ram: '80KB', voltage: '3.3V', wifi: true, bluetooth: false, architecture: 'Xtensa', programmingLanguages: ['C', 'C++', 'Python', 'Arduino'] },
  { slug: 'esp32-s3', name: 'ESP32-S3', manufacturer: 'Espressif', cores: 'Dual', frequency: '240MHz', flash: '8MB', ram: '512KB', voltage: '3.3V', wifi: true, bluetooth: true, architecture: 'Xtensa', programmingLanguages: ['C', 'C++', 'Python', 'Arduino'] },
  { slug: 'arduino-uno', name: 'Arduino Uno', manufacturer: 'Arduino', cores: 'Single', frequency: '16MHz', flash: '32KB', ram: '2KB', voltage: '5V', wifi: false, bluetooth: false, architecture: 'AVR', programmingLanguages: ['C', 'C++', 'Arduino'] },
  { slug: 'arduino-nano', name: 'Arduino Nano', manufacturer: 'Arduino', cores: 'Single', frequency: '16MHz', flash: '32KB', ram: '2KB', voltage: '5V', wifi: false, bluetooth: false, architecture: 'AVR', programmingLanguages: ['C', 'C++', 'Arduino'] },
  { slug: 'arduino-mega', name: 'Arduino Mega', manufacturer: 'Arduino', cores: 'Single', frequency: '16MHz', flash: '256KB', ram: '8KB', voltage: '5V', wifi: false, bluetooth: false, architecture: 'AVR', programmingLanguages: ['C', 'C++', 'Arduino'] },
  { slug: 'raspberry-pi-pico', name: 'Raspberry Pi Pico', manufacturer: 'Raspberry Pi', cores: 'Dual', frequency: '133MHz', flash: '2MB', ram: '264KB', voltage: '3.3V', wifi: false, bluetooth: false, architecture: 'ARM Cortex-M0+', programmingLanguages: ['C', 'C++', 'Python', 'MicroPython'] },
  { slug: 'raspberry-pi-pico-w', name: 'Raspberry Pi Pico W', manufacturer: 'Raspberry Pi', cores: 'Dual', frequency: '133MHz', flash: '2MB', ram: '264KB', voltage: '3.3V', wifi: true, bluetooth: false, architecture: 'ARM Cortex-M0+', programmingLanguages: ['C', 'C++', 'Python', 'MicroPython'] },
  { slug: 'stm32f103', name: 'STM32F103', manufacturer: 'STMicroelectronics', cores: 'Single', frequency: '72MHz', flash: '64KB', ram: '20KB', voltage: '3.3V', wifi: false, bluetooth: false, architecture: 'ARM Cortex-M3', programmingLanguages: ['C', 'C++'] },
  { slug: 'stm32f407', name: 'STM32F407', manufacturer: 'STMicroelectronics', cores: 'Single', frequency: '168MHz', flash: '1MB', ram: '192KB', voltage: '3.3V', wifi: false, bluetooth: false, architecture: 'ARM Cortex-M4', programmingLanguages: ['C', 'C++'] },
  { slug: 'nrf52', name: 'nRF52', manufacturer: 'Nordic Semiconductor', cores: 'Single', frequency: '64MHz', flash: '512KB', ram: '64KB', voltage: '3.3V', wifi: false, bluetooth: true, architecture: 'ARM Cortex-M4', programmingLanguages: ['C', 'C++'] },
  { slug: 'teensy-4', name: 'Teensy 4.0', manufacturer: 'PJRC', cores: 'Single', frequency: '600MHz', flash: '2MB', ram: '1024KB', voltage: '3.3V', wifi: false, bluetooth: false, architecture: 'ARM Cortex-M7', programmingLanguages: ['C', 'C++', 'Arduino'] },
];
const DEMO_CATEGORIES = [
  { id: 'smart_home', name: 'Smart Home', icon: '🏠', description: 'Home automation and monitoring' },
  { id: 'industrial', name: 'Industrial IoT', icon: '🏭', description: 'Factory and manufacturing automation' },
  { id: 'agriculture', name: 'Agriculture', icon: '🌱', description: 'Smart farming and crop monitoring' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Medical device monitoring' },
  { id: 'smart_city', name: 'Smart City', icon: '🏙️', description: 'Urban infrastructure monitoring' },
  { id: 'environmental', name: 'Environmental', icon: '🌍', description: 'Environmental monitoring' },
  { id: 'other', name: 'Other', icon: '📦', description: 'Other IoT projects' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
  get: async (url) => {
    await delay(300);
    if (url.includes('/auth/me')) return { data: { success: true, data: { user: DEMO_USER, subscription: null, deviceCount: 2 } } };
    if (url.includes('/devices/stats')) return { data: { success: true, data: getDeviceStats() } };
    if (url === '/devices' || url.includes('/devices?')) return { data: { success: true, data: DEMO_DEVICES, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } } };
    if (url.includes('/devices/types')) return { data: { success: true, data: DEMO_DEVICE_TYPES } };
    if (url.includes('/devices/protocols')) return { data: { success: true, data: [{ id: 1, name: 'MQTT', description: 'Message Queuing Telemetry Transport' }] } };
    // Handle firmware generation (must be before microcontrollers check)
    if (url.includes('/microcontrollers/') && url.includes('/firmware')) {
      const slug = url.split('/microcontrollers/')[1]?.split('/firmware')[0];
      const mc = DEMO_MICROCONTROLLERS.find(m => m.slug === slug) || { name: slug, manufacturer: 'Unknown' };
      
      // Generate mock firmware code
      const firmwareCode = `// S6S IoT Firmware for ${mc.name}
// Manufacturer: ${mc.manufacturer}
// Generated: ${new Date().toISOString()}

#include <WiFi.h>
#include <PubSubClient.h>

// Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqttServer = "mqtt.s6s-iot.com";
const int mqttPort = 1883;
const char* deviceId = "${slug}-${Math.random().toString(36).substr(2, 9)}";

// Pins
#define SENSOR_PIN 34

// Objects
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  
  // Connect to WiFi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  
  // Connect to MQTT
  client.setServer(mqttServer, mqttPort);
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect(deviceId)) {
      Serial.println("MQTT connected");
    } else {
      delay(500);
    }
  }
}

void loop() {
  // Read sensor data
  int sensorValue = analogRead(SENSOR_PIN);
  float voltage = sensorValue * (3.3 / 4096.0);
  
  // Publish data
  char payload[100];
  snprintf(payload, sizeof(payload), 
    "{\"device\":\"%s\",\"sensor\":\"temperature\",\"value\":%.2f,\"timestamp\":%lu}",
    deviceId, voltage, millis());
  
  client.publish("s6s/sensors/data", payload);
  
  client.loop();
  delay(5000);
}`;
      
      return { data: { 
        success: true, 
        data: { 
          firmware: firmwareCode, 
          programmingLanguage: 'Arduino',
          microcontroller: mc.name,
          createdAt: new Date().toISOString()
        } 
      }};
    }
    
    if (url.includes('/devices/microcontrollers')) {
      // Check if this is a specific microcontroller request (has slug but no filter)
      const hasSlug = url.match(/\/devices\/microcontrollers\/([^/?]+)$/);
      const hasFilter = url.includes('filter=');
      
      // Handle specific microcontroller by slug (e.g., /devices/microcontrollers/esp32)
      if (hasSlug && !hasFilter) {
        const slug = hasSlug[1];
        const mc = DEMO_MICROCONTROLLERS.find(m => m.slug === slug);
        if (mc) {
          return { data: { success: true, data: mc } };
        }
        return { data: { success: false, error: 'Microcontroller not found' } };
      }
      
      // Handle filter-based requests
      const filter = url.split('filter=')[1]?.split('&')[0] || 'all';
      
      // If filter is 'manufacturer', group by manufacturer
      if (filter === 'manufacturer') {
        const groupedByManufacturer = {};
        DEMO_MICROCONTROLLERS.forEach(mc => {
          if (!groupedByManufacturer[mc.manufacturer]) {
            groupedByManufacturer[mc.manufacturer] = [];
          }
          groupedByManufacturer[mc.manufacturer].push(mc);
        });
        return { data: { success: true, data: groupedByManufacturer } };
      }
      
      // If filter is wifi or bluetooth, filter the results
      let filteredMcs = DEMO_MICROCONTROLLERS;
      if (filter === 'wifi') {
        filteredMcs = DEMO_MICROCONTROLLERS.filter(mc => mc.wifi);
      } else if (filter === 'bluetooth') {
        filteredMcs = DEMO_MICROCONTROLLERS.filter(mc => mc.bluetooth);
      }
      
      return { data: { success: true, data: filteredMcs } };
    }
    if (url.includes('/projects/stats')) return { data: { success: true, data: getProjectStats() } };
    if (url.includes('/projects/categories')) return { data: { success: true, data: DEMO_CATEGORIES } };
    if (url === '/projects' || url.includes('/projects?')) return { data: { success: true, data: DEMO_PROJECTS, pagination: { page: 1, limit: 10, total: DEMO_PROJECTS.length, totalPages: 1 } } };
    if (url.includes('/projects/')) {
      const id = url.split('/projects/')[1]?.split('?')[0];
      const project = DEMO_PROJECTS.find(p => p.id === id);
      if (project) return { data: { success: true, data: project } };
    }
    if (url.includes('/alerts')) return { data: { success: true, data: DEMO_ALERT_RULES } };
    return { data: { success: false, error: 'Not found' } };
  },
  post: async (url, data) => {
    await delay(300);
    if (url.includes('/auth/login') || url.includes('/auth/register')) return { data: { success: true, data: { user: DEMO_USER, ...DEMO_TOKENS } } };
    if (url.includes('/auth/social')) return { data: { success: true, data: { user: DEMO_USER, ...DEMO_TOKENS } } };
    if (url.includes('/auth/forgot-password')) return { data: { success: true, message: 'If the email exists, a reset link will be sent' } };
    if (url === '/projects') {
      const parsedData = data ? JSON.parse(data) : {};
      const newProject = { 
        id: 'p' + (DEMO_PROJECTS.length + 1), 
        name: parsedData.name || 'New Project', 
        description: parsedData.description || '', 
        category: parsedData.category || 'other', 
        status: 'active', 
        device_count: 0, 
        created_at: new Date().toISOString() 
      };
      DEMO_PROJECTS.push(newProject);
      saveProjects(DEMO_PROJECTS);
      return { data: { success: true, data: newProject } };
    }
    if (url === '/devices') {
      const newDevice = { id: String(DEMO_DEVICES.length + 1), name: data ? JSON.parse(data).name : 'New Device', device_uuid: 'ESP32-' + Math.random().toString(36).substr(2, 9).toUpperCase(), device_type_name: 'ESP32', status: 'online', last_seen_at: new Date().toISOString(), location: 'Indoor', energy: 0, sensors: [] };
      DEMO_DEVICES.push(newDevice);
      saveDevices(DEMO_DEVICES);
      return { data: { success: true, data: newDevice } };
    }
    return { data: { success: false, error: 'Not found' } };
  },
  put: async (url, data) => { 
    await delay(300); 
    if (url.includes('/projects/')) {
      const id = url.split('/projects/')[1];
      const index = DEMO_PROJECTS.findIndex(p => p.id === id);
      if (index !== -1) {
        const parsedData = data ? JSON.parse(data) : {};
        DEMO_PROJECTS[index] = { ...DEMO_PROJECTS[index], ...parsedData };
        saveProjects(DEMO_PROJECTS);
        return { data: { success: true, data: DEMO_PROJECTS[index] } };
      }
    }
    return { data: { success: true } }; 
  },
  delete: async (url) => { 
    await delay(300); 
    if (url.includes('/projects/')) {
      const id = url.split('/projects/')[1];
      DEMO_PROJECTS = DEMO_PROJECTS.filter(p => p.id !== id);
      saveProjects(DEMO_PROJECTS);
      return { data: { success: true } };
    }
    if (url.includes('/alerts/')) {
      // Alerts are handled in the DEMO_ALERT_RULES array below
      const id = url.split('/alerts/')[1];
      DEMO_ALERT_RULES = DEMO_ALERT_RULES.filter(r => r.id !== id);
      saveAlertRules(DEMO_ALERT_RULES);
      return { data: { success: true } };
    }
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
  create: (data) => api.post('/alerts', JSON.stringify(data)),
  update: (id, data) => api.put('/alerts/' + id, JSON.stringify(data)),
  delete: (id) => api.delete('/alerts/' + id),
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

export const projectsAPI = {
  list: (params) => api.get('/projects' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  get: (id) => api.get('/projects/' + id),
  create: (data) => api.post('/projects', JSON.stringify(data)),
  update: (id, data) => api.put('/projects/' + id, JSON.stringify(data)),
  delete: (id) => api.delete('/projects/' + id),
  getStats: () => api.get('/projects/stats'),
  getCategories: () => api.get('/projects/categories'),
  getDevices: (projectId) => api.get('/projects/' + projectId + '/devices'),
};

export default api;
