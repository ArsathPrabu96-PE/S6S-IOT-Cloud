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
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utility functions
│   │   └── app.js              # Express app entry
│   ├── package.json
│   └── .env.example
├── frontend/                   # React Dashboard
│   ├── src/
│   │   ├── components/         # React components
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
- **Frontend**: React, Vite, Recharts
- **Authentication**: JWT tokens

## Features

- User authentication (register, login, JWT)
- Device registration (ESP32, ESP8266)
- MQTT sensor data ingestion
- Real-time dashboard with WebSocket
- Sensor data graphs (line, gauge charts)
- Alert system with thresholds
- Multi-device support
- SaaS subscription plans (Free, Pro, Enterprise)
