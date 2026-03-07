import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Guide content data
const guideSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    content: `Welcome to S6S IoT Platform! This guide will help you understand how to use all the features available.

**Quick Start:**
1. First, add your IoT devices in the Devices section
2. Connect your sensors and microcontrollers
3. Monitor real-time data on the Dashboard
4. Set up alerts for important events

**What is S6S IoT?**
S6S IoT is a comprehensive platform for managing and monitoring your Internet of Things devices. It supports various microcontrollers including ESP32, ESP8266, Arduino, and more.`
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '📊',
    content: `The Dashboard is your central hub for monitoring all your IoT devices in real-time.

**Features:**
• **Tabbed Interface** - Navigate through different views: Overview, Devices, Controls, Analytics, and Alarms
• **Real-time Monitoring** - View live data from all your connected devices
• **Device Status** - See which devices are online/offline at a glance
• **Quick Stats** - View key metrics like total devices, active sensors, and alerts
• **Interactive Widgets** - Customize your dashboard with various widget types
• **Smooth Animations** - Enjoy fluid transitions and micro-interactions throughout the interface
• **Device Controls** - Toggle switches and controls for relays, motors, and actuators directly from the dashboard
• **Analytics Tab** - View detailed analytics with charts and data visualization
• **Alarm Management** - Monitor and manage all alarms from a dedicated tab
• **Dashboard Wizard** - Guided 6-step process to create custom dashboards

**Tab Descriptions:**
• **Overview** - Summary of all devices, health status, and recent activity
• **Devices** - Grid view of all connected IoT devices with status indicators
• **Controls** - Interactive control widgets for device management
• **Analytics** - Detailed charts and data analysis
• **Alarms** - Centralized alarm notification center

**Tips:**
• Click on any device card to see detailed information
• Use the time range selector to view historical data
• Switch between tabs for different perspectives on your IoT system
• All transitions include smooth animations for a polished experience`
  },
  {
    id: 'dashboard-wizard',
    title: 'Dashboard Wizard',
    icon: '🧭',
    content: `The Dashboard Wizard is a guided 6-step process to create custom dashboards quickly and easily.

**Wizard Steps:**

**Step 1: Project Setup**
• Select an existing project from the dropdown
• OR create a new project with a name (min 3 characters)
• Choose a category (Smart Home, Industrial IoT, Agriculture, etc.)

**Step 2: Device Selection**
• **Project-Based Filtering** - Devices shown based on selected project
• **Add Device Inline** - Click "+ Add Device" to create new devices without leaving the wizard
• Select device type (ESP32, ESP8266, Arduino, Raspberry Pi, STM32, etc.)
• New devices are automatically added to your selection

**Step 3: Alert Configuration (Optional)**
• Configure threshold alerts for each sensor
• Enable email or push notifications

**Step 4: Developer Options (Optional)**
• Generate API keys for external access
• Configure webhook URLs for event notifications
• View HTTP endpoint and data templates

**Step 5: Widget Selection**
Choose from 10+ widget types:
• Value Display, Gauge, Line Chart, Bar Chart
• Switch, Slider, Status LED, Map
• Data Table, Alarm Panel

**Step 6: Preview & Save**
• Review your dashboard configuration
• See a preview of your widgets
• Click "Create Dashboard" to save

**Key Features:**
• Project-based device filtering - only shows devices from selected project
• Inline device creation - add devices without leaving wizard
• Real-time validation at each step
• Progress tracking with visual indicators`
  },
  {
    id: 'devices',
    title: 'Managing Devices',
    icon: '📱',
    content: `The Devices page is where you add, configure, and manage your IoT devices.

**Adding a New Device:**
1. Click the "Add Device" button
2. Choose your device type (ESP32, ESP8266, Arduino, etc.)
3. Enter a name and location for your device
4. Configure MQTT credentials (auto-generated)
5. Add sensors to your device

**Device Types Supported:**
• ESP32 - Powerful WiFi + Bluetooth microcontroller
• ESP8266 - Budget-friendly WiFi microcontroller
• Arduino family - Various Arduino boards
• Raspberry Pi - Single board computers
• STM32 - ARM Cortex-M based controllers

**Device Actions:**
• View device details and status
• Edit device configuration
• Regenerate MQTT credentials
• Delete devices (with confirmation)`
  },
  {
    id: 'sensors',
    title: 'Sensors & Data',
    icon: '🌡️',
    content: `Sensors are the heart of your IoT system. They collect data from the physical world.

**Adding Sensors:**
1. Go to your device's detail page
2. Click "Add Sensor"
3. Configure sensor properties:
   - Name and identifier
   - Data type (numeric, boolean, string)
   - Unit of measurement
   - Pin number (for microcontroller)
   - Threshold alerts

**Supported Sensor Types:**
• Temperature (°C, °F)
• Humidity (%)
• Pressure (Pa, hPa)
• Light (lux)
• Motion detection
• GPS coordinates
• Custom sensors

**Data Visualization:**
• Line charts for time-series data
• Gauge displays for current values
• Bar charts for comparisons
• Custom thresholds with alerts`
  },
  {
    id: 'alerts',
    title: 'Alerts & Notifications',
    icon: '🔔',
    content: `Stay informed about what's happening with your devices through the Alerts system.

**Setting Up Alerts:**
1. Navigate to your device or sensor
2. Configure threshold values (min/max)
3. Enable alert notifications
4. Choose notification methods

**Alert Types:**
• Threshold alerts - When values exceed limits
• Device offline - When devices go disconnected
• Connection errors - MQTT/WebSocket issues
• Custom events - User-defined triggers

**Managing Alerts:**
• View all alerts in the Alerts page
• Filter by status (read/unread)
• Mark as read/unread
• Delete old alerts
• Configure alert preferences in Settings`
  },
  {
    id: 'developer',
    title: 'Developer Options',
    icon: '⚙️',
    content: `The Developer section provides advanced tools for building your IoT infrastructure.

**Features:**

**Endpoints Configuration:**
• Set up MQTT brokers for device communication
• Configure HTTP ingestion endpoints
• WebSocket connections for real-time data

**API Keys:**
• Generate keys for external applications
• Set permissions (read, write, admin)
• Revoke keys when needed

**Data Templates:**
• Create reusable data formats
• Support for JSON, MQTT, HTTP protocols
• Custom parser configurations

**Widget Templates:**
• Pre-built visualization templates
• Drag-and-drop dashboard builder
• Custom thresholds and colors

**Firmware Generation:**
• Generate code for microcontrollers
• Support for ESP32, ESP8266, Arduino, and more
• Auto-configure MQTT credentials
• Filter by Manufacturer - Browse microcontrollers grouped by manufacturer
• Connectivity Filters - Filter by WiFi or Bluetooth capability
• Enhanced Code Generation - Generate ready-to-use Arduino sketches with sensor configurations

**Supported Microcontrollers (12 devices from 6 manufacturers):**
• Espressif - ESP32, ESP32-S3, ESP32-C3, ESP8266
• Arduino - Arduino Uno R3, Arduino Nano 33 IoT, Arduino MKR WiFi 1010
• Raspberry Pi - Raspberry Pi Pico W, Raspberry Pi 4
• STMicroelectronics - STM32F103C8 (Blue Pill)
• Nordic Semiconductor - Nordic nRF52840
• PJRC - Teensy 4.0

**By Manufacturer Filter:**
The Developer page includes a "By Manufacturer" filter button that groups all supported microcontrollers by their manufacturer. This makes it easy to:
• Compare microcontrollers from the same manufacturer
• Quickly find all products from a specific brand
• Access detailed specifications including cores, frequency, flash, RAM, voltage, and connectivity options`
  },
  {
    id: 'microcontrollers',
    title: 'Microcontroller Guide',
    icon: '🔧',
    content: `Learn about supported microcontrollers and how to program them.

**Supported Manufacturers & Devices:**

**Espressif:**
• ESP32 - Dual-core WiFi + Bluetooth, 240MHz, 4MB flash
• ESP32-S3 - Single-core with USB OTG, 240MHz
• ESP32-C3 - Single-core RISC-V, WiFi + Bluetooth
• ESP8266 - Single-core WiFi, 80MHz, 4MB flash

**Arduino:**
• Arduino Uno R3 - Classic ATmega328P, 16MHz
• Arduino Nano 33 IoT - WiFi + Bluetooth, ARM Cortex-M0+
• Arduino MKR WiFi 1010 - WiFi + Bluetooth, Low power

**Raspberry Pi:**
• Raspberry Pi Pico W - Dual-core ARM Cortex-M0+, WiFi
• Raspberry Pi 4 - Quad-core ARM Cortex-A72, 8GB RAM

**STMicroelectronics:**
• STM32F103C8 (Blue Pill) - ARM Cortex-M3, 72MHz

**Nordic Semiconductor:**
• Nordic nRF52840 - Bluetooth 5.0, ARM Cortex-M4F

**PJRC:**
• Teensy 4.0 - ARM Cortex-M7, 600MHz, 2MB flash

**Programming:**
1. Select your microcontroller in Developer options
2. Choose sensors to include
3. Generate firmware code
4. Upload to your device via Arduino IDE

**WiFi Configuration:**
• Enter your network credentials
• Configure MQTT server settings
• Set device identifier`
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    icon: '⚡',
    content: `Customize your S6S IoT experience through Settings.

**Profile Settings:**
• Update your name and email
• Change password
• Manage account security

**Notification Preferences:**
• Email notifications on/off
• Alert severity levels
• Quiet hours configuration

**Display Options:**
• Theme selection (if available)
• Dashboard layout defaults
• Time zone settings

**Data Management:**
• Export device data
• Clear historical data
• Data retention policies

**Account:**
• View subscription status
• Manage API access
• Delete account (irreversible)`
  },
  {
    id: 'energy-units',
    title: 'Energy Units Explained',
    icon: '⚡',
    content: `Understanding energy consumption measurements is essential for monitoring your IoT devices.

**What is kWh (Kilowatt-hour)?**
kWh stands for kilowatt-hour, which is the standard unit for measuring energy consumption. It's the amount of energy used when a device with a power of 1 kilowatt operates for 1 hour.

**Common Energy Units:**
• kWh (kilowatt-hour) = 1,000 watt-hours - Standard unit for energy billing
• Wh (watt-hour) = Basic unit of energy
• mWh (milliwatt-hour) = 0.001 watt-hours - Used for very small devices
• MWh (megawatt-hour) = 1,000 kilowatt-hours - Used for large-scale energy

**Conversion Examples:**
• 1 kWh = 1,000 Wh
• 1 kWh = 1,000,000 mWh
• 1 MWh = 1,000 kWh

**In the S6S Dashboard:**
The dashboard displays energy consumption in kWh, which is the standard unit for:
• Home energy monitoring
• IoT device power consumption
• Solar/wind energy generation
• Electric vehicle charging

**Understanding Your Energy Data:**
• Low consumption (< 1 kWh/day): Small IoT sensors, low-power devices
• Medium consumption (1-10 kWh/day): Standard appliances, multiple devices
• High consumption (> 10 kWh/day): Power-heavy equipment, industrial IoT

**Tips for Energy Monitoring:**
• Track energy usage over time to identify patterns
• Set alerts for unusual consumption spikes
• Compare device energy usage to optimize efficiency
• Use historical data for predictive maintenance`
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔍',
    content: `Common issues and solutions for the S6S IoT Platform.

**Device Connection Issues:**

*Device not showing online:*
• Check WiFi credentials
• Verify MQTT broker settings
• Ensure device has internet access
• Check firewall settings

*Data not appearing:*
• Verify sensor configuration
• Check MQTT topic matches
• Review device logs
• Confirm threshold settings

**Dashboard Issues:**

*Widgets not loading:*
• Refresh the page
• Check device is online
• Verify data is being sent
• Clear browser cache

**Account Issues:**

*Can't log in:*
• Check email/password
• Reset password if forgotten
• Clear browser cookies
• Try incognito mode

**Getting Help:**
• Check our documentation online
• Review developer forums
• Contact support team
• Check system status page`
  },
  {
    id: 'whats-new',
    title: "What's New",
    icon: '✨',
    content: `Stay up to date with the latest features and improvements in S6S IoT Platform.

**Recent Updates:**

**Dashboard Wizard (NEW!):**
• Added comprehensive 6-step Dashboard Wizard
• Project-Based Device Filtering - devices shown based on selected project
• Inline Device Creation - add new devices without leaving the wizard
• Step-by-step guided process for creating custom dashboards
• Real-time validation and progress tracking

**UI/UX Enhancements:**
• Added smooth page transitions and animations throughout the platform
• Enhanced card designs with gradient backgrounds and glow effects
• Implemented loading skeleton animations for better UX
• Added micro-interactions on hover states
• Improved tab navigation with scale effects

**Developer Features:**
• Fixed "By Manufacturer" filter in the firmware management section
• Added proper manufacturer grouping for microcontrollers
• Expanded connectivity filters (WiFi, Bluetooth)
• Added support for 12 microcontrollers from 6 manufacturers

**Dashboard Improvements:**
• Added tabbed interface with Overview, Devices, Controls, Analytics, and Alarms tabs
• Enhanced real-time data visualization with live charts
• Added device control widgets for relays and actuators
• Improved device health status calculations

**Navigation Updates:**
• Added scrolling sidebar for better navigation
• Moved user profile to header with avatar, name, email
• Added logout button in header

**Bug Fixes:**
• Fixed white screen issue on Dashboard
• Fixed healthPercentage division by zero
• Fixed project and device stats not updating dynamically
• Fixed empty left margin in header

**Coming Soon:**
• AI anomaly detection
• Predictive maintenance
• OTA firmware updates
• Digital twin visualization`
  }
];

// Load guide preferences from localStorage
const loadGuidePreferences = () => {
  try {
    const stored = localStorage.getItem('s6s_guide_preferences');
    return stored ? JSON.parse(stored) : {
      dismissed: false,
      viewedSections: [],
      lastVisit: null
    };
  } catch {
    return { dismissed: false, viewedSections: [], lastVisit: null };
  }
};

// Save guide preferences to localStorage
const saveGuidePreferences = (prefs) => {
  try {
    localStorage.setItem('s6s_guide_preferences', JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save guide preferences:', e);
  }
};

const UserGuide = ({ isModal = false, onClose }) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(loadGuidePreferences);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(['getting-started']);

  // Update preferences when sections are viewed
  useEffect(() => {
    const newPrefs = {
      ...preferences,
      viewedSections: [...new Set([...preferences.viewedSections, activeSection])],
      lastVisit: new Date().toISOString()
    };
    setPreferences(newPrefs);
    saveGuidePreferences(newPrefs);
  }, [activeSection]);

  const handleClose = () => {
    const newPrefs = {
      ...preferences,
      dismissed: true,
      lastVisit: new Date().toISOString()
    };
    setPreferences(newPrefs);
    saveGuidePreferences(newPrefs);
    
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const markAllAsRead = () => {
    const allSectionIds = guideSections.map(s => s.id);
    const newPrefs = {
      ...preferences,
      viewedSections: allSectionIds,
      lastVisit: new Date().toISOString()
    };
    setPreferences(newPrefs);
    saveGuidePreferences(newPrefs);
  };

  const resetGuide = () => {
    const newPrefs = {
      dismissed: false,
      viewedSections: [],
      lastVisit: new Date().toISOString()
    };
    setPreferences(newPrefs);
    saveGuidePreferences(newPrefs);
  };

  // Filter sections by search query
  const filteredSections = guideSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewedCount = preferences.viewedSections.length;
  const totalSections = guideSections.length;
  const progress = Math.round((viewedCount / totalSections) * 100);

  const currentSection = guideSections.find(s => s.id === activeSection);

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`}>
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">User Guide</h1>
                <p className="text-sm text-slate-400">Learn how to use S6S IoT Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Mark All Read
              </button>
              <button
                onClick={resetGuide}
                className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Reset Guide
              </button>
              {isModal && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Reading Progress</span>
              <span className="text-cyan-400">{viewedCount}/{totalSections} sections viewed ({progress}%)</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Section List */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Section list */}
            <div className="space-y-2">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    toggleSection(section.id);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{section.icon}</span>
                      <span className="font-medium">{section.title}</span>
                    </div>
                    {preferences.viewedSections.includes(section.id) && (
                      <span className="text-green-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              {currentSection && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{currentSection.icon}</span>
                    <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    {currentSection.content.split('\n').map((line, idx) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h3 key={idx} className="text-lg font-semibold text-cyan-400 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                      }
                      if (line.startsWith('*') && line.endsWith('*')) {
                        return <h4 key={idx} className="text-md font-medium text-white mt-3 mb-2">{line.replace(/\*/g, '')}</h4>;
                      }
                      if (line.startsWith('•')) {
                        return <li key={idx} className="text-slate-300 ml-4">{line.substring(1).trim()}</li>;
                      }
                      if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
                        return <li key={idx} className="text-slate-300 ml-4 list-decimal">{line.substring(2).trim()}</li>;
                      }
                      if (line.trim() === '') {
                        return <br key={idx} />;
                      }
                      // Handle inline code
                      const parts = line.split(/(`[^`]+`)/);
                      return (
                        <p key={idx} className="text-slate-300 mb-2">
                          {parts.map((part, i) => 
                            part.startsWith('`') && part.endsWith('`') ? (
                              <code key={i} className="bg-slate-700 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-sm">{part.slice(1, -1)}</code>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
                    <button
                      onClick={() => {
                        const currentIdx = guideSections.findIndex(s => s.id === activeSection);
                        if (currentIdx > 0) {
                          setActiveSection(guideSections[currentIdx - 1].id);
                        }
                      }}
                      disabled={guideSections.findIndex(s => s.id === activeSection) === 0}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    {!isModal && (
                      <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Back to Dashboard
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        const currentIdx = guideSections.findIndex(s => s.id === activeSection);
                        if (currentIdx < guideSections.length - 1) {
                          setActiveSection(guideSections[currentIdx + 1].id);
                        }
                      }}
                      disabled={guideSections.findIndex(s => s.id === activeSection) === guideSections.length - 1}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
                  { label: 'Devices', path: '/devices', icon: '📱' },
                  { label: 'Alerts', path: '/alerts', icon: '🔔' },
                  { label: 'Developer', path: '/developer', icon: '⚙️' },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-center"
                  >
                    <span className="text-2xl block mb-1">{link.icon}</span>
                    <span className="text-sm text-slate-300">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
