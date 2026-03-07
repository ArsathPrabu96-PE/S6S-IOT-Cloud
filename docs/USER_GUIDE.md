# S6S IoT Platform - User Guide

Welcome to the S6S IoT Platform! This comprehensive guide will help you understand and utilize all the features available in our IoT management system.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Dashboard Wizard](#dashboard-wizard)
4. [Managing Devices](#managing-devices)
5. [Sensors & Data](#sensors--data)
6. [Alerts & Notifications](#alerts--notifications)
7. [Developer Options](#developer-options)
8. [Microcontroller Guide](#microcontroller-guide)
9. [Settings & Preferences](#settings--preferences)
10. [API Documentation](#api-documentation)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)
13. [What's New](#whats-new)

---

## Getting Started

Welcome to S6S IoT Platform! This guide will help you understand how to use all the features available.

### What is S6S IoT?

S6S IoT is a comprehensive platform for managing and monitoring your Internet of Things devices. It supports various microcontrollers including ESP32, ESP8266, Arduino, and more.

### Quick Start Guide

1. **First, add your IoT devices** in the Devices section
2. **Connect your sensors and microcontrollers**
3. **Monitor real-time data** on the Dashboard
4. **Set up alerts** for important events

### Platform Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection
- IoT devices (microcontrollers and sensors)
- MQTT broker for device communication

---

## Dashboard

The Dashboard is your central hub for monitoring all your IoT devices in real-time.

### New Features - Tabbed Interface

The Dashboard now features a **tabbed interface** with the following sections:

| Tab | Description |
|-----|-------------|
| Overview | Summary of all devices, health status, and recent activity |
| Devices | Grid view of all connected IoT devices with status indicators |
| Controls | Interactive control widgets for device management |
| Analytics | Detailed charts and data analysis |
| Alarms | Centralized alarm notification center |

### Features

- **Real-time Monitoring** - View live data from all your connected devices
- **Device Status** - See which devices are online/offline at a glance
- **Quick Stats** - View key metrics like total devices, active sensors, and alerts
- **Interactive Widgets** - Customize your dashboard with various widget types
- **Smooth Animations** - Enjoy fluid transitions and micro-interactions throughout the interface
- **Device Controls** - Toggle switches and controls for relays, motors, and actuators directly from the dashboard
- **Analytics Tab** - View detailed analytics with charts and data visualization
- **Alarm Management** - Monitor and manage all alarms from a dedicated tab

### Using the Dashboard

1. Navigate to the Dashboard from the sidebar
2. Switch between tabs for different perspectives on your IoT system
3. View the overview cards showing device statistics
4. Click on device cards to see detailed information
5. Use the time range selector to view historical data

### Dashboard Widgets

| Widget Type | Description |
|------------|-------------|
| Gauge | Circular display for temperature, humidity |
| Graph | Line/bar charts for historical data |
| Switch | Toggle controls for devices |
| Indicator | Status lights and alerts |
| Numeric Display | Digital value display |
| Button | Control buttons for devices |
| Status Array | Device status grid |
| GPS | Location tracking |
| Multi-Chart | Multi-line chart |
| Donut | Distribution chart |

### Tips

- Click on any device card to see detailed information
- Use the time range selector to view historical data
- Switch between tabs for different perspectives on your IoT system
- All transitions include smooth animations for a polished experience

---

## Dashboard Wizard

The Dashboard Wizard is a guided 6-step process to help you create custom dashboards quickly and easily.

### Overview

The wizard guides you through:

| Step | Title | Description |
|------|-------|-------------|
| 1 | Project Setup | Select or create a project |
| 2 | Device Selection | Choose devices to monitor |
| 3 | Alert Configuration | Set up notification rules (optional) |
| 4 | Developer Options | Configure API keys and webhooks (optional) |
| 5 | Widget Selection | Choose dashboard widgets |
| 6 | Preview & Save | Review and save dashboard |

### How to Use

#### Step 1: Project Setup

1. **Select Existing Project**: Choose from your existing projects from the dropdown
2. **OR Create New Project**:
   - Enter a project name (minimum 3 characters)
   - Select a category (Smart Home, Industrial IoT, Agriculture, etc.)

#### Step 2: Device Selection

**Key Feature: Project-Based Device Filtering**

- When you select an existing project, only devices associated with that project are shown
- When creating a new project, all your devices are available for selection

**Key Feature: Add Device Inline**

1. Click the "+ Add Device" button
2. Enter device name (e.g., "Living Room Sensor")
3. Select device type (ESP32, ESP8266, Arduino, etc.)
4. Click "Create & Add" to create and automatically select the device

This allows you to add new devices without leaving the wizard!

#### Step 3: Alert Configuration (Optional)

- Configure threshold alerts for each sensor
- Enable email or push notifications

#### Step 4: Developer Options (Optional)

- Generate API keys for external access
- Configure webhook URLs for event notifications
- View HTTP endpoint and data templates

#### Step 5: Widget Selection

Choose from 10+ widget types:
- Value Display, Gauge, Line Chart, Bar Chart
- Switch, Slider, Status LED, Map
- Data Table, Alarm Panel

#### Step 6: Preview & Save

- Review your dashboard configuration
- See a preview of your widgets
- Click "Create Dashboard" to save

### Tips

- You can navigate back to previous steps using the "Previous" button
- Each step shows validation feedback
- Devices shown in Step 2 are filtered based on your project selection in Step 1
- The wizard auto-saves your progress in localStorage

---

## Managing Devices

The Devices page is where you add, configure, and manage your IoT devices.

### Adding a New Device

1. Click the "Add Device" button
2. Choose your device type (ESP32, ESP8266, Arduino, etc.)
3. Enter a name and location for your device
4. Configure MQTT credentials (auto-generated)
5. Add sensors to your device

### Device Types Supported

| Device Type | Description |
|------------|-------------|
| ESP32 | Powerful WiFi + Bluetooth microcontroller |
| ESP8266 | Budget-friendly WiFi microcontroller |
| Arduino family | Various Arduino boards |
| Raspberry Pi | Single board computers |
| STM32 | ARM Cortex-M based controllers |

### Device Actions

- **View device details** - See all device information and sensors
- **Edit device configuration** - Update name, location, settings
- **Regenerate MQTT credentials** - Get new authentication keys
- **Delete devices** - Remove devices (with confirmation)

### Device Configuration

Each device can be configured with:

- **Name** - Custom identifier for the device
- **Location** - Physical location (room, building, etc.)
- **Coordinates** - GPS coordinates for mapping
- **Timezone** - Device local timezone
- **Firmware Version** - Current firmware running
- **Custom Metadata** - Additional JSON data

---

## Sensors & Data

Sensors are the heart of your IoT system. They collect data from the physical world.

### Adding Sensors

1. Go to your device's detail page
2. Click "Add Sensor"
3. Configure sensor properties:

   - **Name** - Descriptive name
   - **Identifier** - Unique ID for MQTT topics
   - **Data Type** - numeric, boolean, or string
   - **Unit** - °C, %, Pa, lux, etc.
   - **Pin Number** - GPIO pin for microcontroller
   - **Threshold Alerts** - Min/max values

### Supported Sensor Types

| Sensor Type | Unit | Description |
|------------|------|-------------|
| Temperature | °C, °F | Ambient temperature |
| Humidity | % | Relative humidity |
| Pressure | Pa, hPa | Atmospheric pressure |
| Light | lux | Light intensity |
| Motion | boolean | Motion detection |
| GPS | coordinates | Location data |
| Custom | varies | User-defined |

### Data Visualization

- **Line charts** - For time-series data
- **Gauge displays** - For current values
- **Bar charts** - For comparisons
- **Custom thresholds** - With alerts

### Reading Sensor Data

Sensor data can be read via:

1. **Dashboard Widgets** - Real-time display
2. **Device Detail Page** - Historical graphs
3. **API Endpoints** - Programmatic access
4. **MQTT Subscriptions** - Real-time streams

---

## Alerts & Notifications

Stay informed about what's happening with your devices through the Alerts system.

### Setting Up Alerts

1. Navigate to your device or sensor
2. Configure threshold values (min/max)
3. Enable alert notifications
4. Choose notification methods

### Alert Types

| Alert Type | Trigger | Description |
|------------|---------|-------------|
| Threshold | Value exceeds limits | When sensor values go too high/low |
| Device Offline | Connection lost | When devices go disconnected |
| Connection Error | MQTT/WebSocket issues | Communication failures |
| Custom | User-defined | Specific event triggers |

### Managing Alerts

- **View all alerts** in the Alerts page
- **Filter by status** - Read/unread
- **Mark as read/unread** - Track acknowledged alerts
- **Delete old alerts** - Keep inbox clean
- **Configure preferences** - In Settings

### Notification Methods

- **In-app alerts** - Platform notification center
- **Email notifications** - Optional email alerts
- **Webhooks** - Send to external services

---

## Developer Options

The Developer section provides advanced tools for building your IoT infrastructure.

### Endpoints Configuration

Configure how your devices communicate with the platform:

- **MQTT Broker** - Primary protocol for IoT
- **HTTP Ingest** - RESTful API endpoints
- **WebSocket** - Real-time bidirectional communication

### API Keys

Manage authentication for external applications:

1. Click "Generate API Key"
2. Set key name and permissions
3. Copy and store securely
4. Use in your applications

**Permission Levels:**

- **Read** - Access device data and status
- **Write** - Send commands to devices
- **Admin** - Full system access

### Data Templates

Create reusable data formats:

- **JSON** - JavaScript Object Notation
- **MQTT** - Message Queuing Telemetry Transport
- **HTTP** - Hypertext Transfer Protocol
- **Custom** - User-defined parsers

### Widget Templates

Pre-built visualization templates:

- Gauges, Charts, Switches, Indicators
- Drag-and-drop dashboard builder
- Custom thresholds and colors
- JSON configuration

### Firmware Generation

Generate ready-to-use code for microcontrollers:

1. Select microcontroller type
2. Choose sensors to include
3. Configure MQTT credentials
4. Download Arduino sketch

#### New Features - Enhanced Firmware Generation

The Developer page now includes additional features:

- **Filter by Manufacturer** - Browse microcontrollers grouped by manufacturer
- **Connectivity Filters** - Filter by WiFi or Bluetooth capability
- **Enhanced Code Generation** - Generate ready-to-use Arduino sketches with sensor configurations

---

## Microcontroller Guide

Learn about supported microcontrollers and how to program them.

### Supported Manufacturers & Devices

#### Espressif

| Device | Specifications |
|--------|---------------|
| ESP32 | Dual-core WiFi + Bluetooth, 240MHz, 4MB flash |
| ESP32-S3 | Single-core with USB OTG, 240MHz |
| ESP32-C3 | Single-core RISC-V, WiFi + Bluetooth |
| ESP8266 | Single-core WiFi, 80MHz, 4MB flash |

#### Arduino

| Device | Specifications |
|--------|---------------|
| Arduino Uno R3 | Classic ATmega328P, 16MHz |
| Arduino Nano 33 IoT | WiFi + Bluetooth, ARM Cortex-M0+ |
| Arduino MKR WiFi 1010 | WiFi + Bluetooth, Low power |

#### Raspberry Pi

| Device | Specifications |
|--------|---------------|
| Raspberry Pi Pico W | Dual-core ARM Cortex-M0+, WiFi |
| Raspberry Pi 4 | Quad-core ARM Cortex-A72, 8GB RAM |

#### STMicroelectronics

| Device | Specifications |
|--------|---------------|
| STM32F103C8 (Blue Pill) | ARM Cortex-M3, 72MHz |

#### Nordic Semiconductor

| Device | Specifications |
|--------|---------------|
| Nordic nRF52840 | Bluetooth 5.0, ARM Cortex-M4F |

#### PJRC

| Device | Specifications |
|--------|---------------|
| Teensy 4.0 | ARM Cortex-M7, 600MHz, 2MB flash |

### ESP32 Series

**Features:**
- Dual-core processor
- WiFi + Bluetooth connectivity
- Ideal for complex projects
- Multiple sensor support
- Low power consumption

**Best for:**
- Advanced IoT projects
- Audio/Video streaming
- Bluetooth applications

### ESP8266

**Features:**
- Single-core processor
- WiFi connectivity
- Budget-friendly
- Great for simple projects
- Limited GPIO pins

**Best for:**
- Simple sensor projects
- Cost-sensitive applications
- Basic home automation

### Arduino Family

**Supported Boards:**
- Arduino Uno/Mega
- Arduino Nano
- Arduino MKR series
- Arduino Nano 33 IoT

**Best for:**
- Learning IoT basics
- Prototyping
- Large community support

### Programming Your Microcontroller

1. **Select your microcontroller** in Developer options
2. **Choose sensors** to include in the code
3. **Generate firmware** - Automatic code generation
4. **Upload** via Arduino IDE

### WiFi Configuration

```cpp
const char* ssid = "YourWiFiNetwork";
const char* password = "YourWiFiPassword";
```

### MQTT Configuration

```cpp
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* mqttTopic = "s6s/your-device-id";
```

---

## Settings & Preferences

Customize your S6S IoT experience through Settings.

### Profile Settings

- **Update your name and email**
- **Change password**
- **Manage account security**

### Notification Preferences

- **Email notifications** on/off
- **Alert severity levels**
- **Quiet hours** configuration

### Display Options

- **Theme selection** (if available)
- **Dashboard layout** defaults
- **Time zone settings**

### Data Management

- **Export device data** - Download CSV/JSON
- **Clear historical data** - Remove old records
- **Data retention** policies

### Account Management

- **View subscription status**
- **Manage API access**
- **Delete account** (irreversible)

---

## API Documentation

The S6S IoT Platform provides a RESTful API for programmatic access.

### Authentication

All API requests require an API key passed in the header:

```
Authorization: Bearer YOUR_API_KEY
```

### Base URL

```
https://api.s6s-iot.com/v1
```

### Endpoints

#### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id` | Get device details |
| POST | `/api/devices` | Create new device |
| PUT | `/api/devices/:id` | Update device |
| DELETE | `/api/devices/:id` | Delete device |

#### Sensors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices/:id/sensors` | List sensors |
| POST | `/api/devices/:id/sensors` | Add sensor |
| PUT | `/api/sensors/:id` | Update sensor |
| DELETE | `/api/sensors/:id` | Delete sensor |

#### Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sensors/:id/data` | Get sensor data |
| POST | `/api/ingest` | Submit sensor data |

#### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts |
| PUT | `/api/alerts/:id` | Mark as read |
| DELETE | `/api/alerts/:id` | Delete alert |

### Example Requests

#### Get All Devices

```bash
curl -X GET https://api.s6s-iot.com/v1/devices \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Add Sensor Data

```bash
curl -X POST https://api.s6s-iot.com/v1/ingest \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-123",
    "sensor_id": "temperature",
    "value": 25.5,
    "timestamp": "2026-03-07T12:00:00Z"
  }'
```

### Rate Limits

- **Standard:** 100 requests/minute
- **Premium:** 1000 requests/minute

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

---

## Troubleshooting

Common issues and solutions for the S6S IoT Platform.

### Device Connection Issues

#### Device Not Showing Online

**Symptoms:** Device appears offline in dashboard

**Solutions:**
1. Check WiFi credentials are correct
2. Verify MQTT broker settings
3. Ensure device has internet access
4. Check firewall settings
5. Verify device firmware is up to date

#### Data Not Appearing

**Symptoms:** Sensor data not showing in dashboard

**Solutions:**
1. Verify sensor configuration
2. Check MQTT topic matches expected format
3. Review device serial logs
4. Confirm threshold settings aren't blocking data

### Dashboard Issues

#### Widgets Not Loading

**Solutions:**
1. Refresh the browser page
2. Check device is online
3. Verify data is being sent
4. Clear browser cache

#### Slow Performance

**Solutions:**
1. Reduce number of widgets
2. Increase dashboard refresh interval
3. Use data aggregation
4. Check internet connection

### Account Issues

#### Can't Log In

**Solutions:**
1. Check email/password are correct
2. Reset password if forgotten
3. Clear browser cookies
4. Try incognito/private mode
5. Check account isn't locked

#### Password Reset Not Working

**Solutions:**
1. Check spam folder
2. Verify email address is correct
3. Wait 5 minutes and try again
4. Contact support

### MQTT Issues

#### Connection Refused

**Solutions:**
1. Check broker URL is correct
2. Verify port number (1883 for non-TLS)
3. Check username/password
4. Ensure firewall allows connection

#### Messages Not Received

**Solutions:**
1. Verify topic subscription matches
2. Check QoS level settings
3. Review broker logs
4. Test with MQTT client tool

---

## FAQ

### General Questions

#### What is S6S IoT Platform?

S6S IoT Platform is a cloud-based system for managing, monitoring, and analyzing IoT devices and their sensor data. It provides real-time dashboards, alerts, and API access.

#### How much does it cost?

Please check our pricing page for current plans and pricing information.

#### What browsers are supported?

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Account Questions

#### How do I reset my password?

1. Click "Forgot Password" on login page
2. Enter your email address
3. Check your email for reset link
4. Create new password

#### Can I have multiple accounts?

Each email address can only have one account. Contact support if you need to merge accounts.

#### How do I delete my account?

Go to Settings > Account > Delete Account. Note this action is irreversible.

### Device Questions

#### How many devices can I add?

The number of devices depends on your subscription plan. Check your plan details for limits.

#### Which microcontrollers are supported?

- ESP32, ESP32-S2, ESP32-S3, ESP32-C3
- ESP8266
- Arduino Uno, Mega, Nano, MKR
- Raspberry Pi Pico, Raspberry Pi 4
- STM32 boards
- Nordic nRF52840
- Teensy 4.0
- And more...

#### How do I update device firmware?

1. Go to Developer > Firmware Generation
2. Select your device type
3. Configure sensors
4. Download new firmware
5. Upload via Arduino IDE

### Data Questions

#### How long is data stored?

Data retention depends on your subscription plan. Contact support for specific policies.

#### Can I export my data?

Yes! Go to Settings > Data Management > Export to download your data in CSV or JSON format.

#### Is my data secure?

Yes, we use industry-standard encryption and security practices. All data is encrypted in transit and at rest.

### Billing Questions

#### How do I upgrade my plan?

Go to Settings > Account > Subscription to view and upgrade your plan.

#### Can I get a refund?

Please refer to our refund policy or contact support.

---

## What's New

Stay up to date with the latest features and improvements in S6S IoT Platform.

### Recent Updates

#### UI/UX Enhancements

- Added smooth page transitions and animations throughout the platform
- Enhanced card designs with gradient backgrounds and glow effects
- Implemented loading skeleton animations for better UX
- Added micro-interactions on hover states
- Improved tab navigation with scale effects

#### Dashboard Wizard (NEW!)

- Added comprehensive 6-step Dashboard Wizard
- **Project-Based Device Filtering**: Devices shown based on selected project
- **Inline Device Creation**: Add new devices without leaving the wizard
- Step-by-step guided process for creating custom dashboards
- Real-time validation and progress tracking

#### Developer Features

- Fixed "By Manufacturer" filter in the firmware management section
- Added proper manufacturer grouping for microcontrollers
- Expanded connectivity filters (WiFi, Bluetooth)
- Added support for 12 microcontrollers from 6 manufacturers

#### Dashboard Improvements

- Added tabbed interface with Overview, Devices, Controls, Analytics, and Alarms tabs
- Enhanced real-time data visualization with live charts
- Added device control widgets for relays and actuators
- Improved device health status calculations

#### Navigation Updates

- Added scrolling sidebar for better navigation
- Moved user profile to header with avatar, name, email
- Added logout button in header

#### Bug Fixes

- Fixed white screen issue on Dashboard
- Fixed healthPercentage division by zero
- Fixed project and device stats not updating dynamically
- Fixed empty left margin in header

### Coming Soon

- AI anomaly detection
- Predictive maintenance
- OTA firmware updates
- Digital twin visualization
- Multi-device management
- Edge computing support

---

## Support

If you need additional help:

- **Documentation:** [docs.s6s-iot.com](https://docs.s6s-iot.com)
- **Support Email:** support@s6s-iot.com
- **Community Forum:** [forum.s6s-iot.com](https://forum.s6s-iot.com)
- **System Status:** [status.s6s-iot.com](https://status.s6s-iot.com)

---

*Last updated: March 2026*
*Version: 1.1.0*
