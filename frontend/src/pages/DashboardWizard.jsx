import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, devicesAPI } from '../services/api';

// Wizard Steps Configuration
const WIZARD_STEPS = [
  {
    id: 'project',
    title: 'Project Setup',
    description: 'Select or create a project',
    icon: '📁',
  },
  {
    id: 'device',
    title: 'Device Selection',
    description: 'Choose devices to monitor',
    icon: '📱',
  },
  {
    id: 'alerts',
    title: 'Alert Configuration',
    description: 'Set up notification rules',
    icon: '🔔',
  },
  {
    id: 'developer',
    title: 'Developer Options',
    description: 'API keys and webhooks',
    icon: '🔧',
  },
  {
    id: 'widgets',
    title: 'Widget Selection',
    description: 'Choose dashboard widgets',
    icon: '🧩',
  },
  {
    id: 'preview',
    title: 'Preview & Save',
    description: 'Review and save dashboard',
    icon: '✅',
  },
];

// Available Widget Types
const WIDGET_TYPES = [
  { id: 'value', name: 'Value Display', icon: '📊', description: 'Show single value' },
  { id: 'gauge', name: 'Gauge', icon: '🎯', description: 'Circular gauge display' },
  { id: 'line_chart', name: 'Line Chart', icon: '📈', description: 'Time series line chart' },
  { id: 'bar_chart', name: 'Bar Chart', icon: '📉', description: 'Bar graph visualization' },
  { id: 'switch', name: 'Switch', icon: '🔘', description: 'Toggle switch control' },
  { id: 'slider', name: 'Slider', icon: '🎚️', description: 'Slider control' },
  { id: 'status', name: 'Status LED', icon: '💡', description: 'Status indicator' },
  { id: 'map', name: 'Map', icon: '🗺️', description: 'GPS location map' },
  { id: 'table', name: 'Data Table', icon: '📋', description: 'Tabular data view' },
  { id: 'alarm', name: 'Alarm Panel', icon: '🔔', description: 'Alert notifications' },
];

const DashboardWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationError, setValidationError] = useState('');
  
  // Form Data State
  const [formData, setFormData] = useState({
    // Step 1: Project
    projectName: '',
    projectCategory: '',
    existingProject: '',
    // Step 2: Device
    selectedDevices: [],
    // Step 3: Alerts
    alertRules: [],
    // Step 4: Developer
    apiKeyName: '',
    generatedApiKey: '',
    webhookUrl: '',
    webhookEvents: [],
    // Step 5: Widgets
    selectedWidgets: [],
  });

  // Data from API
  const [projects, setProjects] = useState([]);
  const [devices, setDevices] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  
  // Add device form state
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('ESP32');
  const [isCreatingDevice, setIsCreatingDevice] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch devices when project is selected
  useEffect(() => {
    if (currentStep >= 1) {
      const projectId = formData.existingProject;
      fetchProjectDevices(projectId);
    }
  }, [formData.existingProject, currentStep]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, devicesRes, categoriesRes] = await Promise.all([
        projectsAPI.list(),
        devicesAPI.list(),
        projectsAPI.getCategories(),
      ]);
      
      if (projectsRes.data?.success) {
        setProjects(projectsRes.data.data || []);
      }
      if (devicesRes.data?.success) {
        setDevices(devicesRes.data.data || []);
      }
      if (categoriesRes.data?.success) {
        setProjectCategories(categoriesRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch devices when project is selected
  const fetchProjectDevices = async (projectId) => {
    if (!projectId) {
      // No project selected, fetch all devices
      try {
        const devicesRes = await devicesAPI.list();
        if (devicesRes.data?.success) {
          setDevices(devicesRes.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      }
      return;
    }
    
    try {
      // Try to fetch devices for the specific project
      const devicesRes = await projectsAPI.getDevices(projectId);
      if (devicesRes.data?.success) {
        setDevices(devicesRes.data.data || []);
      } else {
        // If no devices linked to project, fetch all devices as fallback
        const allDevicesRes = await devicesAPI.list();
        if (allDevicesRes.data?.success) {
          setDevices(allDevicesRes.data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project devices:', error);
      // Fallback to all devices
      try {
        const allDevicesRes = await devicesAPI.list();
        if (allDevicesRes.data?.success) {
          setDevices(allDevicesRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      }
    }
  };

  // Validation for each step
  const validateStep = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Project - either new project with name OR existing project selected
        if (formData.projectName && formData.projectName.trim().length >= 3) {
          return true;
        }
        if (formData.existingProject) {
          return true;
        }
        return false;
      case 1: // Device - at least one device required
        if (devices.length === 0) {
          // If no devices available, allow proceeding with warning
          return true;
        }
        return formData.selectedDevices.length > 0;
      case 2: // Alerts (optional)
        return true;
      case 3: // Developer (optional)
        return true;
      case 4: // Widgets
        return formData.selectedWidgets.length > 0;
      case 5: // Preview
        return true;
      default:
        return true;
    }
  };

  // Get validation error message
  const getValidationMessage = () => {
    switch (currentStep) {
      case 0:
        if (!formData.projectName && !formData.existingProject) {
          return 'Please select an existing project or create a new one.';
        }
        if (formData.projectName && formData.projectName.trim().length < 3) {
          return 'Project name must be at least 3 characters.';
        }
        return '';
      case 1:
        // Only show error if devices exist but none selected
        if (devices.length > 0 && formData.selectedDevices.length === 0) {
          return 'Please select at least one device.';
        }
        // If no devices, validation passes (no error message)
        return '';
      case 4:
        if (formData.selectedWidgets.length === 0) {
          return 'Please select at least one widget.';
        }
        return '';
      default:
        return '';
    }
  };

  // Get project categories with fallback defaults
  const getProjectCategories = () => {
    if (projectCategories.length > 0) return projectCategories;
    return [
      { id: 'home', name: 'Home', icon: '🏠' },
      { id: 'industrial', name: 'Industrial', icon: '🏭' },
      { id: 'agriculture', name: 'Agriculture', icon: '🌱' },
      { id: 'environmental', name: 'Environment', icon: '🌡️' },
    ];
  };

  // Navigation handlers
  const handleNext = () => {
    const errorMsg = getValidationMessage();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    
    if (validateStep(currentStep)) {
      setValidationError('');
      const newCompleted = [...completedSteps, currentStep];
      setCompletedSteps(newCompleted);
      if (currentStep < WIZARD_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setValidationError('Please complete all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  // Generate API Key
  const handleGenerateApiKey = () => {
    const key = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData({ ...formData, generatedApiKey: key });
  };

  // Add/Remove selected items
  const toggleDevice = (deviceId) => {
    const selected = formData.selectedDevices.includes(deviceId)
      ? formData.selectedDevices.filter(id => id !== deviceId)
      : [...formData.selectedDevices, deviceId];
    setFormData({ ...formData, selectedDevices: selected });
  };

  // Create new device inline
  const handleCreateDevice = async () => {
    if (!newDeviceName.trim()) return;
    
    setIsCreatingDevice(true);
    try {
      const deviceData = {
        name: newDeviceName,
        device_type_name: newDeviceType,
        status: 'online',
      };
      
      const response = await devicesAPI.create(deviceData);
      
      if (response.data?.success) {
        const newDevice = response.data.data;
        // Add to devices list
        setDevices([...devices, newDevice]);
        // Add to selected devices
        setFormData({
          ...formData,
          selectedDevices: [...formData.selectedDevices, newDevice.id],
        });
        // Reset form
        setNewDeviceName('');
        setShowAddDevice(false);
      }
    } catch (error) {
      console.error('Failed to create device:', error);
    } finally {
      setIsCreatingDevice(false);
    }
  };

  const toggleWidget = (widgetId) => {
    const selected = formData.selectedWidgets.find(w => w.id === widgetId)
      ? formData.selectedWidgets.filter(w => w.id !== widgetId)
      : [...formData.selectedWidgets, { id: widgetId, config: {} }];
    setFormData({ ...formData, selectedWidgets: selected });
  };

  // Final save
  const handleSave = () => {
    const dashboard = {
      name: formData.projectName || projects.find(p => p.id === formData.existingProject)?.name,
      category: formData.projectCategory,
      devices: formData.selectedDevices,
      alerts: formData.alertRules,
      apiKey: formData.generatedApiKey,
      webhook: formData.webhookUrl,
      widgets: formData.selectedWidgets,
    };
    localStorage.setItem('wizard_dashboard', JSON.stringify(dashboard));
    alert('Dashboard created successfully!');
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-cyan-400 font-medium animate-pulse">Loading Wizard...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span>🧭</span>
          Dashboard Wizard
        </h1>
        <p className="text-cyan-100 mt-1">
          Create your IoT dashboard in {WIZARD_STEPS.length} easy steps
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-cyan-100 mb-2">
            <span>Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isAccessible = index <= currentStep || isCompleted;
          
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              disabled={!isAccessible}
              className={`flex flex-col items-center group ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/30' 
                    : 'bg-slate-700 text-slate-400'
              }`}>
                {isCompleted ? '✓' : step.icon}
              </div>
              <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-slate-500'}`}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 min-h-[400px]">
        
        {/* Validation Error Message */}
        {validationError && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {validationError}
            </p>
          </div>
        )}
        
        {/* Step 1: Project Setup */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{WIZARD_STEPS[0].title}</h2>
              <p className="text-slate-400">Select an existing project or create a new one</p>
            </div>

            {/* Existing Project Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Existing Project</label>
              <select
                value={formData.existingProject}
                onChange={(e) => {
                  setFormData({ ...formData, existingProject: e.target.value, projectName: '' });
                  fetchProjectDevices(e.target.value);
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select a project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name} ({project.category})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center text-slate-500">
              <span className="px-4">- OR -</span>
            </div>

            {/* New Project Creation */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => {
                    setFormData({ ...formData, projectName: e.target.value, existingProject: '' });
                    fetchProjectDevices('');
                  }}
                  placeholder="My IoT Dashboard"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Category <span className="text-slate-500">(optional)</span></label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getProjectCategories().map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, projectCategory: cat.id })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.projectCategory === cat.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs text-white">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Device Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{WIZARD_STEPS[1].title}</h2>
                <p className="text-slate-400">
                  {formData.existingProject 
                    ? `Select devices from: ${projects.find(p => p.id === formData.existingProject)?.name || 'Selected Project'}`
                    : 'Select the devices you want to include in your dashboard'}
                </p>
              </div>
              <button
                onClick={() => setShowAddDevice(!showAddDevice)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <span>+</span> Add Device
              </button>
            </div>

            {/* Add Device Form */}
            {showAddDevice && (
              <div className="p-4 bg-slate-700/50 rounded-lg border border-cyan-500/30">
                <h3 className="text-white font-medium mb-4">Add New Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Device Name</label>
                    <input
                      type="text"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      placeholder="My Device"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Device Type</label>
                    <select
                      value={newDeviceType}
                      onChange={(e) => setNewDeviceType(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="ESP32">ESP32</option>
                      <option value="ESP8266">ESP8266</option>
                      <option value="Arduino Uno">Arduino Uno</option>
                      <option value="Raspberry Pi Pico">Raspberry Pi Pico</option>
                      <option value="STM32">STM32</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateDevice}
                      disabled={!newDeviceName.trim() || isCreatingDevice}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      {isCreatingDevice ? 'Creating...' : 'Create & Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.length > 0 ? devices.map(device => (
                <div
                  key={device.id}
                  onClick={() => toggleDevice(device.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.selectedDevices.includes(device.id)
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📱</span>
                      <div>
                        <h3 className="text-white font-medium">{device.name}</h3>
                        <p className="text-xs text-slate-400">{device.device_uuid}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      formData.selectedDevices.includes(device.id) ? 'bg-cyan-500 text-white' : 'bg-slate-600'
                    }`}>
                      {formData.selectedDevices.includes(device.id) && '✓'}
                    </div>
                  </div>
                  {device.sensors && device.sensors.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {device.sensors.map(sensor => (
                        <span key={sensor.id} className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                          {sensor.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  {formData.existingProject ? (
                    <div>
                      <p className="mb-2">No devices found in this project.</p>
                      <p className="text-sm">Go to Devices page to add devices to this project, or select a different project.</p>
                    </div>
                  ) : (
                    <p>No devices found. Please add devices first.</p>
                  )}
                </div>
              )}
            </div>

            {formData.selectedDevices.length > 0 && (
              <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <p className="text-cyan-400 text-sm">
                  ✓ {formData.selectedDevices.length} device(s) selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Alert Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{WIZARD_STEPS[2].title}</h2>
              <p className="text-slate-400">Configure alert rules for your devices (optional)</p>
            </div>

            <div className="space-y-4">
              {formData.selectedDevices.length > 0 ? (
                formData.selectedDevices.map(deviceId => {
                  const device = devices.find(d => d.id === deviceId);
                  return device ? (
                    <div key={deviceId} className="p-4 bg-slate-700/30 rounded-lg">
                      <h3 className="text-white font-medium mb-3">{device.name}</h3>
                      {device.sensors?.map(sensor => (
                        <div key={sensor.id} className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-500 text-cyan-500"
                          />
                          <span className="text-slate-300 text-sm">
                            {sensor.name} ({sensor.unit})
                          </span>
                          <input
                            type="number"
                            placeholder="Threshold"
                            className="ml-auto px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm w-24"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null;
                })
              ) : (
                <p className="text-slate-500 text-center py-8">No devices selected. Please go back to step 2.</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" className="w-4 h-4 rounded" />
                Enable email notifications
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" className="w-4 h-4 rounded" />
                Enable push notifications
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Developer Options */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{WIZARD_STEPS[3].title}</h2>
              <p className="text-slate-400">Configure API access and webhooks (optional)</p>
            </div>

            {/* API Key Section */}
            <div className="space-y-4">
              <h3 className="text-white font-medium">API Key</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">API Key Name</label>
                <input
                  type="text"
                  value={formData.apiKeyName}
                  onChange={(e) => setFormData({ ...formData, apiKeyName: e.target.value })}
                  placeholder="My Dashboard API Key"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                onClick={handleGenerateApiKey}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Generate API Key
              </button>
              {formData.generatedApiKey && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.generatedApiKey}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-green-400 font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(formData.generatedApiKey)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Webhook Section */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-white font-medium">Webhook Configuration</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  placeholder="https://your-server.com/webhook"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Events to trigger</label>
                <div className="flex flex-wrap gap-3">
                  {['device.online', 'device.offline', 'alert.triggered', 'sensor.threshold'].map(event => (
                    <label key={event} className="flex items-center gap-2 text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={formData.webhookEvents.includes(event)}
                        onChange={(e) => {
                          const events = e.target.checked 
                            ? [...formData.webhookEvents, event]
                            : formData.webhookEvents.filter(e => e !== event);
                          setFormData({ ...formData, webhookEvents: events });
                        }}
                        className="w-4 h-4 rounded" 
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Template */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-white font-medium">Data Template</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">HTTP Endpoint</label>
                <input
                  type="text"
                  value={`https://api.s6s-iot.com/v1/data`}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-cyan-400 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Example Payload</label>
                <pre className="p-4 bg-slate-950 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
{JSON.stringify({
  device_id: "ESP32-001",
  sensors: [
    { name: "temperature", value: 24.5, unit: "°C" },
    { name: "humidity", value: 65, unit: "%" }
  ],
  timestamp: "2026-03-07T12:00:00Z"
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Widget Selection */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{WIZARD_STEPS[4].title}</h2>
              <p className="text-slate-400">Choose widgets to display on your dashboard</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {WIDGET_TYPES.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    formData.selectedWidgets.find(w => w.id === widget.id)
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{widget.icon}</div>
                  <div className="text-white text-sm font-medium">{widget.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{widget.description}</div>
                </button>
              ))}
            </div>

            {formData.selectedWidgets.length > 0 && (
              <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <p className="text-cyan-400 text-sm">
                  ✓ {formData.selectedWidgets.length} widget(s) selected: {formData.selectedWidgets.map(w => {
                    const widget = WIDGET_TYPES.find(wt => wt.id === w.id);
                    return widget?.name;
                  }).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Preview & Save */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{WIZARD_STEPS[5].title}</h2>
              <p className="text-slate-400">Review your dashboard configuration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Card */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Configuration Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Project</span>
                    <span className="text-white">{formData.projectName || projects.find(p => p.id === formData.existingProject)?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white">{formData.projectCategory || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Devices</span>
                    <span className="text-white">{formData.selectedDevices.length}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Widgets</span>
                    <span className="text-white">{formData.selectedWidgets.length}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">API Key</span>
                    <span className="text-white">{formData.generatedApiKey ? 'Generated' : 'Not created'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Webhook</span>
                    <span className="text-white">{formData.webhookUrl ? 'Configured' : 'Not configured'}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Dashboard Preview</h3>
                <div className="p-4 bg-slate-700/30 rounded-lg min-h-[200px]">
                  <div className="grid grid-cols-2 gap-2">
                    {formData.selectedWidgets.slice(0, 4).map(w => {
                      const widget = WIDGET_TYPES.find(wt => wt.id === w.id);
                      return (
                        <div key={w.id} className="p-3 bg-slate-800 rounded flex items-center gap-2">
                          <span>{widget?.icon}</span>
                          <span className="text-white text-xs">{widget?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  {formData.selectedDevices.length > 0 && (
                    <div className="mt-4 p-2 bg-green-500/10 rounded text-green-400 text-sm text-center">
                      Connected to {formData.selectedDevices.length} device(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          ← Previous
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-colors"
            >
              ✓ Create Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWizard;
