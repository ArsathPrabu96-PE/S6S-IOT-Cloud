# S6S IoT Platform - Universal IoT Cloud Platform

**Version:** 1.1.0

## Architecture Overview

```
Device → MQTT → Backend → Database → API → Dashboard
```

## Project Structure

```
s6s-iot/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Express middleware
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utility functions
│   │   └── app.js             # Express app entry
│   ├── package.json
│   └── .env.example
├── frontend/                   # React Dashboard
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   ├── context/            # React context (Zustand)
│   │   ├── data/               # Data definitions
│   │   └── App.jsx             # Main app component
│   ├── package.json
│   └── vite.config.js
├── mqtt-broker/                # MQTT Broker config
│   └── mosquitto.conf
├── database/                   # Database schemas
│   ├── migrations/
│   └── schemas/
├── docs/                       # Documentation
│   └── USER_GUIDE.md
└── README.md
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **MQTT Broker**: Aedes (embedded) or Mosquitto
- **Frontend**: React, Vite, Recharts, Tailwind CSS, Zustand
- **Authentication**: JWT tokens
- **State Management**: Zustand
- **Date Handling**: date-fns

## Features

### Core Features
- User authentication (register, login, JWT)
- Social login (Google, GitHub)
- Forgot/reset password functionality
- Device registration (ESP32, ESP8266, and more)
- MQTT sensor data ingestion
- Real-time dashboard with WebSocket
- Sensor data graphs (line, gauge charts)
- Alert system with thresholds
- Multi-device support
- Project-based device organization
- SaaS subscription plans (Free, Pro, Enterprise)

### New Features (v1.1.0)

#### Authentication
- Social login with Google and GitHub
- Forgot password with email reset
- Session management with JWT

#### Project Management
- Create and manage IoT projects
- Project categories (Smart Home, Industrial IoT, Agriculture, Healthcare)
- Project-based device organization

#### Dashboard Enhancements
- **Tabbed Interface**: Overview, Devices, Controls, Analytics, Alarms
- **Overview Tab**: Device statistics, health status, recent activity
- **Devices Tab**: Grid view of all connected devices with status
- **Controls Tab**: Interactive control widgets for relays and actuators
- **Analytics Tab**: Detailed charts and data analysis
- **Alarms Tab**: Centralized alarm notification center
- **Dashboard Wizard**: 6-step guided process to create custom dashboards with project-based device selection and inline device creation

#### Device Management
- Enhanced device setup wizard
- Device connectivity page with credentials
- Auto-generated MQTT credentials
- Device grouping by project

#### Developer Options
- **Firmware Generation**: Generate Arduino code for microcontrollers
- **By Manufacturer Filter**: Browse microcontrollers grouped by manufacturer
- **Connectivity Filters**: Filter by WiFi or Bluetooth capability
- **12 Microcontrollers from 6 Manufacturers**:
  - Espressif: ESP32, ESP32-S3, ESP32-C3, ESP8266
  - Arduino: Arduino Uno R3, Arduino Nano 33 IoT, Arduino MKR WiFi 1010
  - Raspberry Pi: Raspberry Pi Pico W, Raspberry Pi 4
  - STMicroelectronics: STM32F103C8 (Blue Pill)
  - Nordic Semiconductor: Nordic nRF52840
  - PJRC: Teensy 4.0

#### UI/UX Enhancements
- Smooth page transitions and animations
- Gradient backgrounds and glow effects
- Loading skeleton animations
- Micro-interactions on hover states
- Tab navigation with scale effects
- Responsive design

#### Navigation
- Scrolling sidebar for better navigation
- User profile section in header (avatar, name, email)
- Logout button in header

### Dashboard Features
- **Home Tab**: Overview with device statistics, recent activity, system health
- **Devices Tab**: Device management with add, edit, delete functionality
- **Alerts Tab**: Alert configuration with localStorage persistence
- **Analytics Tab**: Advanced sensor visualization with multiple widget types
- **Settings Tab**: User profile and notification settings
- **Dashboard Wizard**: Guided 6-step process to create custom dashboards

### Developer Options Features
- **Endpoints Tab**: MQTT, HTTP, WebSocket endpoint configuration
- **API Keys Tab**: API key generation and management
- **Webhooks Tab**: Webhook configuration for external integrations
- **Data Templates Tab**: Sensor data template definitions
- **Widget Templates Tab**: Customizable dashboard widgets
- **Ingestion Patterns Tab**: Data ingestion pattern configuration
- **Data Streams Tab**: Real-time data stream monitoring
- **Platform Integrations Tab**: Multi-platform IoT integration showcase

## Platform Integrations

The Developer Options page includes a comprehensive **Platform Integrations** tab that showcases interoperability with leading IoT platforms:

### Supported Platforms
- **BLYNK IoT** - Next-gen IoT Platform
- **ThingsBoard** - Open-source IoT Platform
- **Node-RED** - Flow-based Programming
- **Ubidots** - IoT Data Visualization

### Platform Dashboard Features
- Real-time metrics cards (Active Devices, Data Points/min, Alerts, Uptime)
- Interactive temperature and humidity charts with gradient visualizations
- Connected devices table with status indicators
- Control panel with toggle switches and sliders
- Professional industrial IoT design

## Widget Templates

The Widget Templates feature includes 15+ customizable widget types:

1. **Gauge** - Circular value display
2. **Analog Meter** - Traditional analog needle meter
3. **Temperature Gauge** - Temperature arc gauge with zones
4. **Humidity Gauge** - Circular humidity gauge with water drop
5. **Graph** - Line/Bar charts for historical data
6. **Switch** - Toggle control for devices
7. **Indicator** - Status light and alerts
8. **Card** - Value display card
9. **Slider** - Range control
10. **Camera** - Live video feed display
11. **Numeric Display** - Digital value display
12. **Button** - Control button for actions
13. **Status Array** - Device status grid
14. **GPS** - Location tracking display
15. **Multi-Channel Chart** - Multi-line comparison charts
16. **Donut Chart** - Data distribution visualization

### Widget Animations
- Smooth CSS transitions
- Hover effects with scale and shadow
- Loading state animations
- Value change transitions
- Interactive graphic enhancements

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and MQTT settings in .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Usage

### Starting the Application

1. Start the backend server:
```bash
cd backend && npm run dev
```

2. Start the frontend development server:
```bash
cd frontend && npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Device Connection

1. Register a new account or login (or use social login)
2. Create a new project or use existing one
3. Add a new device from the Devices tab
4. Configure your microcontroller device with the API credentials
5. Send MQTT data to the configured topic
6. View real-time data on the Dashboard

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google social login
- `POST /api/auth/github` - GitHub social login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/devices` - List all devices
- `POST /api/devices` - Register new device
- `GET /api/sensors/:deviceId` - Get sensor data
- `POST /api/sensors/ingest` - Ingest sensor data
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project

## Environment Variables

### Backend (.env)
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/s6s_iot
JWT_SECRET=your_jwt_secret
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## MQTT Topics

- `s6s/{deviceId}/telemetry` - Sensor data
- `s6s/{deviceId}/attributes` - Device attributes
- `s6s/{deviceId}/commands` - Device commands

## Recent Updates

### Version 1.1.0 (Latest)

#### New Features
- Social login (Google, GitHub)
- Forgot/reset password functionality
- Project creation wizard
- Device setup wizard
- Device connectivity page
- Dashboard wizard flow with 6-step guided process
- **Dashboard Wizard Features:**
  - Project selection or creation
  - Device selection with project-based filtering
  - Inline device creation (add devices without leaving wizard)
  - Alert configuration
  - Developer options (API keys, webhooks)
  - Widget selection
  - Preview and save
- Tabbed dashboard interface (Overview, Devices, Controls, Analytics, Alarms)
- Device control widgets (relays, motors, actuators)
- Firmware generation with "By Manufacturer" filter
- 12 microcontrollers from 6 manufacturers

#### UI/UX Enhancements
- Smooth page transitions and animations
- Gradient backgrounds and glow effects
- Loading skeleton animations
- Micro-interactions on hover states
- Tab navigation with scale effects

#### Navigation Improvements
- Scrolling sidebar
- User profile in header with avatar, name, email
- Logout button in header

#### Bug Fixes
- Fixed Dashboard white screen issue
- Fixed healthPercentage division by zero
- Fixed project/device stats not updating
- Fixed header layout issues

### Version 1.0.1
- Added Platform Integrations tab with BLYNK, ThingsBoard, Node-RED, Ubidots
- Implemented working delete functionality across all Developer tabs
- Added Analog Meter widget type with SVG needle animation
- Enhanced widget previews with smooth CSS transitions and animations
- Added comprehensive IoT platform dashboard with real-time metrics
- Implemented drag-and-drop widget canvas
- Added staggered animations for widget templates

### Dashboard Enhancements (Earlier)
- Neon glow effects and visual design improvements
- Status cards with icons and color-coded indicators
- Interactive charts with better styling
- Responsive layout improvements

## Coming Soon

### AI & Analytics
- AI anomaly detection
- Predictive maintenance
- Machine learning-based forecasting
- Natural language querying

### Device Management
- OTA firmware updates
- Digital twin visualization
- Multi-device bulk operations
- Device cloning/duplication

### Cloud & Integration
- Edge computing support
- Cloud storage export (AWS S3, Google Drive)
- IFTTT/Zapier integration
- Voice assistant support (Alexa, Google Home)
- Third-party API integrations

### Collaboration & Security
- Role-based team collaboration
- Multi-user device sharing
- Audit logs and activity tracking
- Two-factor authentication (2FA)

### Automation
- Scheduled automation rules
- Custom widget builder
- Geofencing alerts
- Energy consumption analytics

### Mobile & Desktop
- Mobile app (iOS/Android)
- Desktop notifications
- PWA support

## License

MIT License - See LICENSE file for details
