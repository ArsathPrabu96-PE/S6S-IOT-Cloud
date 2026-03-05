import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { devicesAPI } from '../services/api';
import { useDeviceStore, useAuthStore, useAlertStore } from '../context/store';
import wsService from '../services/websocket';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { devices, deviceStats, setDevices, setDeviceStats } = useDeviceStore();
  const { alerts, addAlert } = useAlertStore();
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({});

  useEffect(() => {
    loadDashboardData();
    connectWebSocket();
    
    return () => {
      wsService.off('sensor_data');
      wsService.off('device_status');
      wsService.off('alert');
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load devices
      const devicesResponse = await devicesAPI.list({ limit: 10 });
      setDevices(devicesResponse.data.data, devicesResponse.data.pagination);
      
      // Load stats
      const statsResponse = await devicesAPI.getStats();
      setDeviceStats(statsResponse.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use demo data when API fails (no database)
      setDevices([], { page: 1, limit: 10, total: 0, totalPages: 0 });
      setDeviceStats({ total: 0, online: 0, offline: 0, error: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('accessToken');
    if (token && user?.id) {
      wsService.connect(user.id, token);
      
      // Listen for real-time sensor data
      wsService.on('sensor_data', (data) => {
        setRealTimeData((prev) => ({
          ...prev,
          [data.deviceId]: {
            ...prev[data.deviceId],
            lastUpdate: new Date(),
            readings: data.readings,
          },
        }));
      });
      
      // Listen for device status changes
      wsService.on('device_status', (data) => {
        setDevices(
          devices.map((d) =>
            d.id === data.deviceId ? { ...d, status: data.status } : d
          )
        );
      });
      
      // Listen for alerts
      wsService.on('alert', (data) => {
        addAlert(data);
      });
    }
  };

  // Get the first device with sensors for demo
  const demoDevice = devices.find((d) => d.sensors?.length > 0);
  const demoSensors = demoDevice?.sensors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}
          </h1>
          <p className="text-gray-500">Here's what's happening with your devices</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {format(new Date(), 'HH:mm:ss')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Devices"
          value={deviceStats?.total || 0}
          icon={DeviceIcon}
          color="primary"
        />
        <StatCard
          title="Online"
          value={deviceStats?.online || 0}
          icon={OnlineIcon}
          color="success"
        />
        <StatCard
          title="Offline"
          value={deviceStats?.offline || 0}
          icon={OfflineIcon}
          color="gray"
        />
        <StatCard
          title="Alerts"
          value={alerts.filter((a) => a.status === 'triggered').length}
          icon={AlertIcon}
          color="danger"
        />
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {demoSensors.length > 0 ? (
          demoSensors.slice(0, 2).map((sensor) => (
            <SensorChart
              key={sensor.id}
              sensor={sensor}
              realTimeData={realTimeData[demoDevice?.id]?.readings}
            />
          ))
        ) : (
          <>
            <DemoChart title="Temperature" color="#ef4444" unit="°C" />
            <DemoChart title="Humidity" color="#3b82f6" unit="%" />
          </>
        )}
      </div>

      {/* Recent Devices */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Devices</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {devices.slice(0, 5).map((device) => (
            <div
              key={device.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full status-${device.status}`}
                />
                <div>
                  <p className="font-medium text-gray-900">{device.name}</p>
                  <p className="text-sm text-gray-500">{device.device_uuid}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">
                  {device.last_seen_at
                    ? format(new Date(device.last_seen_at), 'HH:mm')
                    : 'Never'}
                </p>
                <p className="text-xs text-gray-500">{device.device_type_name}</p>
              </div>
            </div>
          ))}
          {devices.length === 0 && !isLoading && (
            <div className="p-8 text-center text-gray-500">
              No devices yet. Add your first device to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    danger: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Sensor Chart Component
const SensorChart = ({ sensor, realTimeData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // In a real app, you'd fetch historical data here
    // For demo, generate some sample data
    const now = new Date();
    const data = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now.getTime() - (19 - i) * 60000),
      value: 20 + Math.random() * 10 + Math.sin(i / 3) * 3,
    }));
    setChartData(data);
  }, [sensor.id]);

  // Update with real-time data if available
  const displayData = realTimeData
    ? [
        ...chartData.slice(0, -1),
        { time: new Date(), value: realTimeData[0]?.value || 0 },
      ]
    : chartData;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {sensor.last_value?.toFixed(1) || '--'}
          </span>
          <span className="text-gray-500">{sensor.unit}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id={`gradient-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={sensor.color || '#0ea5e9'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={sensor.color || '#0ea5e9'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => format(value, 'HH:mm')}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip
            labelFormatter={(value) => format(value, 'HH:mm:ss')}
            formatter={(value) => [value.toFixed(2), sensor.unit]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={sensor.color || '#0ea5e9'}
            strokeWidth={2}
            fill={`url(#gradient-${sensor.id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Demo Chart for when no sensors are connected
const DemoChart = ({ title, color, unit }) => {
  const now = new Date();
  const data = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(now.getTime() - (19 - i) * 60000),
    value: 20 + Math.random() * 10 + Math.sin(i / 3) * 3,
  }));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {data[data.length - 1].value.toFixed(1)}
          </span>
          <span className="text-gray-500">{unit}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => format(value, 'HH:mm')}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip
            labelFormatter={(value) => format(value, 'HH:mm:ss')}
            formatter={(value) => [value.toFixed(2), unit]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${title})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Icons
const DeviceIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const OnlineIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const OfflineIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default Dashboard;
