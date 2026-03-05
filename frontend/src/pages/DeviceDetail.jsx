import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { devicesAPI, sensorsAPI } from '../services/api';
import { format } from 'date-fns';
import wsService from '../services/websocket';

const DeviceDetail = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [mqttCredentials, setMqttCredentials] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    loadDevice();
    loadSensors();
    
    // Listen for real-time data
    wsService.on('sensor_data', handleSensorData);
    
    return () => {
      wsService.off('sensor_data');
    };
  }, [id]);

  const loadDevice = async () => {
    try {
      const response = await devicesAPI.get(id);
      setDevice(response.data.data);
    } catch (error) {
      console.error('Failed to load device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSensors = async () => {
    try {
      const response = await devicesAPI.getSensors(id);
      setSensors(response.data.data);
      
      // Load readings for each sensor
      for (const sensor of response.data.data) {
        loadSensorReadings(sensor.id);
      }
    } catch (error) {
      console.error('Failed to load sensors:', error);
    }
  };

  const loadSensorReadings = async (sensorId) => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const response = await sensorsAPI.getReadings(sensorId, {
        startTime: oneHourAgo.toISOString(),
        endTime: now.toISOString(),
        limit: 100,
      });
      
      setReadings((prev) => ({
        ...prev,
        [sensorId]: response.data.data,
      }));
    } catch (error) {
      console.error('Failed to load readings:', error);
    }
  };

  const handleSensorData = (data) => {
    if (data.deviceId === id) {
      // Update readings in real-time
      data.readings.forEach((reading) => {
        setReadings((prev) => ({
          ...prev,
          [reading.sensorId]: [
            ...(prev[reading.sensorId] || []).slice(-99),
            { timestamp: reading.timestamp, value: reading.value },
          ],
        }));
      });
    }
  };

  const handleRegenerateCredentials = async () => {
    try {
      const response = await devicesAPI.regenerateCredentials(id);
      setMqttCredentials(response.data.data);
      setShowCredentials(true);
    } catch (error) {
      console.error('Failed to regenerate credentials:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Device not found</p>
        <Link to="/devices" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to devices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/devices" className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded capitalize status-${device.status}`}>
                {device.status}
              </span>
            </div>
            <p className="text-gray-500 font-mono">{device.device_uuid}</p>
          </div>
        </div>
        <button onClick={handleRegenerateCredentials} className="btn btn-secondary">
          Regenerate MQTT Password
        </button>
      </div>

      {/* MQTT Credentials Modal */}
      {showCredentials && mqttCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCredentials(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">MQTT Credentials</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-mono bg-gray-100 p-2 rounded">{mqttCredentials.mqttUsername}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Password</p>
                <p className="font-mono bg-gray-100 p-2 rounded">{mqttCredentials.mqttPassword}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              ⚠️ This password will only be shown once. Save it securely.
            </p>
            <button onClick={() => setShowCredentials(false)} className="btn btn-primary w-full mt-4">
              I have saved this password
            </button>
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="card p-4 lg:col-span-1">
          <h2 className="font-semibold text-gray-900 mb-4">Device Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">{device.device_type_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Protocol</span>
              <span className="font-medium">{device.device_protocol_name || 'MQTT'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span className="font-medium">{device.location_name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Seen</span>
              <span className="font-medium">
                {device.last_seen_at ? format(new Date(device.last_seen_at), 'MMM d, HH:mm') : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Firmware</span>
              <span className="font-medium">{device.firmware_version || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* MQTT Config */}
        <div className="card p-4 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">MQTT Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Broker Host</p>
              <p className="font-mono bg-gray-100 p-2 rounded">your-server.com</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Port</p>
              <p className="font-mono bg-gray-100 p-2 rounded">1883</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Username</p>
              <p className="font-mono bg-gray-100 p-2 rounded">{device.mqtt_username}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Topic</p>
              <p className="font-mono bg-gray-100 p-2 rounded">{device.device_uuid}/sensors</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Send sensor data as JSON to the topic above. Example: <code className="bg-gray-100 px-1 rounded">{"{ \"temperature\": 25.5, \"humidity\": 60 }"}</code>
          </p>
        </div>
      </div>

      {/* Sensor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensors.length > 0 ? (
          sensors.map((sensor) => (
            <SensorChart key={sensor.id} sensor={sensor} readings={readings[sensor.id] || []} />
          ))
        ) : (
          <div className="card p-8 text-center col-span-2">
            <p className="text-gray-500">No sensors configured for this device</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sensor Chart Component
const SensorChart = ({ sensor, readings }) => {
  const chartData = readings.length > 0 ? readings : generateDemoData();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
          <p className="text-sm text-gray-500">{sensor.identifier}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {readings.length > 0 
              ? readings[readings.length - 1]?.value?.toFixed(1) 
              : '--'}
          </p>
          <p className="text-sm text-gray-500">{sensor.unit}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => format(new Date(value), 'HH:mm')}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip
            labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
            formatter={(value) => [value?.toFixed(2), sensor.unit]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill={`url(#gradient-${sensor.id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Generate demo data for visualization
const generateDemoData = () => {
  const now = new Date();
  return Array.from({ length: 20 }, (_, i) => ({
    timestamp: new Date(now.getTime() - (19 - i) * 60000),
    value: 20 + Math.random() * 10 + Math.sin(i / 3) * 3,
  }));
};

export default DeviceDetail;
