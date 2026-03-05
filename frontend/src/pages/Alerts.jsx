import { useEffect, useState } from 'react';
import { useAlertStore } from '../context/store';
import wsService from '../services/websocket';
import { format } from 'date-fns';

const Alerts = () => {
  const { alerts, setAlerts, acknowledgeAlert, resolveAlert } = useAlertStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
    
    wsService.on('alert', handleNewAlert);
    
    return () => {
      wsService.off('alert');
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      // Mock alerts for demo
      setAlerts([
        {
          id: '1',
          title: 'Temperature Threshold Exceeded',
          message: 'Temperature exceeded 30°C on Living Room Sensor',
          severity: 'critical',
          status: 'triggered',
          deviceName: 'ESP32-001',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Device Offline',
          message: 'Garden Sensor has been offline for 30 minutes',
          severity: 'warning',
          status: 'acknowledged',
          deviceName: 'ESP8266-002',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAlert = (data) => {
    setAlerts([
      {
        id: Date.now().toString(),
        ...data,
        status: 'triggered',
        created_at: new Date().toISOString(),
      },
      ...alerts,
    ]);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'triggered':
        return 'bg-red-500';
      case 'acknowledged':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500">Monitor alerts from your devices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'triggered', 'acknowledged', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
          <p className="text-gray-500">All your devices are running smoothly</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(alert.status)}`}></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{alert.deviceName}</span>
                      <span>•</span>
                      <span>{format(new Date(alert.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {alert.status === 'triggered' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                      Acknowledge
                    </button>
                  )}
                  {(alert.status === 'triggered' || alert.status === 'acknowledged') && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
