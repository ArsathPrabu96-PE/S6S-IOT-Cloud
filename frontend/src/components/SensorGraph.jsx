import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../services/api';

const SensorGraph = ({ deviceId, sensorId, sensorName, dataType = 'temperature', timeRange = '24h' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSensorData();
  }, [deviceId, sensorId, timeRange]);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sensors/${sensorId}/data`, {
        params: { timeRange }
      });
      
      const formattedData = response.data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: item.value,
        timestamp: item.timestamp
      }));
      
      setData(formattedData);
      setError(null);
    } catch (err) {
      setError('Failed to load sensor data');
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getColor = () => {
    switch (dataType) {
      case 'temperature': return '#ef4444';
      case 'humidity': return '#3b82f6';
      case 'pressure': return '#10b981';
      case 'light': return '#f59e0b';
      case 'motion': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getUnit = () => {
    switch (dataType) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'pressure': return 'hPa';
      case 'light': return 'lux';
      case 'motion': return '';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
  const avgValue = data.length > 0 
    ? (data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1) 
    : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-200 font-medium">{sensorName}</h3>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">Current</p>
            <p className="text-white font-semibold" style={{ color: getColor() }}>
              {latestValue}{getUnit()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Average</p>
            <p className="text-white font-semibold">{avgValue}{getUnit()}</p>
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${sensorId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor()} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af" 
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={getColor()}
              strokeWidth={2}
              fill={`url(#gradient-${sensorId})`}
              dot={false}
              activeDot={{ r: 4, fill: getColor() }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorGraph;
