# S6S IoT Platform - Universal IoT Cloud Platform

**Version:** 1.0.0

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
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   └── app.js              # Express app entry
│   ├── package.json
│   └── .env.example
├── frontend/                   # React Dashboard
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   ├── context/            # React context
│   │   ├── utils/              # Utility functions
│   │   ├── styles/             # CSS/Styles
│   │   └── App.jsx             # Main app component
│   ├── package.json
│   └── vite.config.js
├── mqtt-broker/                # MQTT Broker config
│   └── mosquitto.conf
├── database/                   # Database schemas
│   ├── migrations/
│   └── schemas/
└── README.md
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **MQTT Broker**: Aedes (embedded) or Mosquitto
- **Frontend**: React, Vite, Recharts, Tailwind CSS
- **Authentication**: JWT tokens

## Features

### Core Features
- User authentication (register, login, JWT)
- Device registration (ESP32, ESP8266)
- MQTT sensor data ingestion
- Real-time dashboard with WebSocket
- Sensor data graphs (line, gauge charts)
- Alert system with thresholds
- Multi-device support
- SaaS subscription plans (Free, Pro, Enterprise)

### Dashboard Features
- **Home Tab**: Overview with device statistics, recent activity, system health
- **Devices Tab**: Device management with add, edit, delete functionality
- **Alerts Tab**: Alert configuration with localStorage persistence
- **Analytics Tab**: Advanced sensor visualization with multiple widget types
- **Settings Tab**: User profile and notification settings

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

1. Register a new account or login
2. Add a new device from the Devices tab
3. Configure your ESP32/ESP8266 device with the API credentials
4. Send MQTT data to the configured topic
5. View real-time data on the Dashboard

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/devices` - List all devices
- `POST /api/devices` - Register new device
- `GET /api/sensors/:deviceId` - Get sensor data
- `POST /api/sensors/ingest` - Ingest sensor data

## Environment Variables

### Backend (.env)
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/s6s_iot
JWT_SECRET=your_jwt_secret
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
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

### Version 1.0.1 (Latest)
- Added Platform Integrations tab with BLYNK, ThingsBoard, Node-RED, Ubidots
- Implemented working delete functionality across all Developer tabs
- Added Analog Meter widget type with SVG needle animation
- Enhanced widget previews with smooth CSS transitions and animations
- Added comprehensive IoT platform dashboard with real-time metrics
- Implemented drag-and-drop widget canvas
- Added staggered animations for widget templates

### Dashboard Enhancements
- Neon glow effects and visual design improvements
- Status cards with icons and color-coded indicators
- Interactive charts with better styling
- Responsive layout improvements
- Better spacing and typography
- Hover effects and transitions throughout

## License

MIT License - See LICENSE file for details
