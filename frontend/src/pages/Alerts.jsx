import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAlertStore, useDeviceStore } from '../context/store';
import { alertsAPI } from '../services/api';

// Initial demo alert rules
const INITIAL_ALERT_RULES = [
  {
    id: '1',
    name: 'High Temperature Alert',
    sensor: 'Temperature',
    device: 'Living Room',
    condition: 'above',
    threshold: 28,
    unit: '°C',
    enabled: true,
    severity: 'warning',
  },
  {
    id: '2',
    name: 'Low Humidity Alert',
    sensor: 'Humidity',
    device: 'Living Room',
    condition: 'below',
    threshold: 40,
    unit: '%',
    enabled: true,
    severity: 'info',
  },
  {
    id: '3',
    name: 'Smoke Detection',
    sensor: 'Smoke',
    device: 'Kitchen',
    condition: 'above',
    threshold: 50,
    unit: 'ppm',
    enabled: true,
    severity: 'critical',
  },
];

// Initial demo alerts
const INITIAL_ALERTS = [
  {
    id: '1',
    title: 'High Temperature in Living Room',
    message: 'Temperature exceeded 28°C threshold',
    severity: 'warning',
    status: 'triggered',
    deviceName: 'Living Room',
    sensorName: 'Temperature',
    value: '29.5°C',
    threshold: '28°C',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Smoke Detected in Kitchen',
    message: 'Smoke level above safety threshold',
    severity: 'critical',
    status: 'triggered',
    deviceName: 'Kitchen',
    sensorName: 'Smoke',
    value: '55ppm',
    threshold: '50ppm',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '3',
    title: 'Device Offline - Garage',
    message: 'Garage sensor has been offline for 1 hour',
    severity: 'warning',
    status: 'acknowledged',
    deviceName: 'Garage',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Load alerts from localStorage or use initial data
const loadAlerts = () => {
  try {
    const stored = localStorage.getItem('demo_alerts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load alerts from localStorage', e);
  }
  return INITIAL_ALERTS;
};

// Load rules from localStorage or use initial data
const loadAlertRules = () => {
  try {
    const stored = localStorage.getItem('demo_alert_rules');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load alert rules from localStorage', e);
  }
  return INITIAL_ALERT_RULES;
};

// Save alerts to localStorage
const saveAlerts = (alerts) => {
  try {
    localStorage.setItem('demo_alerts', JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts to localStorage', e);
  }
};

// Save rules to localStorage
const saveAlertRules = (rules) => {
  try {
    localStorage.setItem('demo_alert_rules', JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save alert rules to localStorage', e);
  }
};

const Alerts = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { alerts, setAlerts } = useAlertStore();
  const { devices } = useDeviceStore();
  
  const [alertRules, setAlertRules] = useState(loadAlertRules());
  const [activeTab, setActiveTab] = useState('alerts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Load alerts from localStorage or use demo data
  const [localAlerts, setLocalAlerts] = useState(loadAlerts());
  
  // Use localStorage data if no real data
  const displayAlerts = alerts.length > 0 ? alerts : localAlerts;

  const filteredAlerts = selectedSeverity === 'all' 
    ? displayAlerts 
    : displayAlerts.filter(a => a.severity === selectedSeverity);

  const acknowledgeAlert = (alertId) => {
    setAlerts(displayAlerts.map(a => 
      a.id === alertId ? { ...a, status: 'acknowledged' } : a
    ));
  };

  const toggleRule = (ruleId) => {
    setAlertRules(alertRules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteRule = (ruleId) => {
    const rule = alertRules.find(r => r.id === ruleId);
    if (window.confirm(`Are you sure you want to delete "${rule?.name}"?`)) {
      const newRules = alertRules.filter(r => r.id !== ruleId);
      setAlertRules(newRules);
      saveAlertRules(newRules);
      alert('Rule deleted successfully');
    }
  };

  const deleteAlert = (alertId) => {
    const alert = displayAlerts.find(a => a.id === alertId);
    if (window.confirm(`Are you sure you want to delete this alert?`)) {
      const newAlerts = displayAlerts.filter(a => a.id !== alertId);
      setAlerts(newAlerts);
      setLocalAlerts(newAlerts);
      saveAlerts(newAlerts);
      alert('Alert deleted successfully');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts & Automation</h1>
          <p className="text-slate-400 mt-1">Configure alerts and automation rules for your IoT devices</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Create Alert Rule</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'alerts' 
              ? 'bg-cyan-600 text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Alerts ({displayAlerts.filter(a => a.status === 'triggered').length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'rules' 
              ? 'bg-cyan-600 text-white' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Alert Rules ({alertRules.length})
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            {['all', 'critical', 'warning', 'info'].map(severity => (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSeverity === severity
                    ? severity === 'critical' ? 'bg-red-600 text-white' 
                      : severity === 'warning' ? 'bg-amber-600 text-white'
                      : severity === 'info' ? 'bg-blue-600 text-white'
                      : 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>

          {/* Alert Cards */}
          <div className="grid gap-4">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{alert.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>📱 {alert.deviceName}</span>
                        {alert.sensorName && <span>📊 {alert.sensorName}</span>}
                        {alert.value && <span className="text-cyan-400">Value: {alert.value}</span>}
                        {alert.threshold && <span className="text-amber-400">Threshold: {alert.threshold}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'triggered' 
                        ? 'bg-red-500/30 text-red-400' 
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      {alert.status === 'triggered' ? '🔔 Triggered' : '✓ Acknowledged'}
                    </span>
                    {alert.status === 'triggered' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Delete Alert"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl">✅</span>
                <p className="mt-2">No alerts to display</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <div 
                key={rule.id}
                className={`p-4 rounded-xl border ${
                  rule.enabled 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        rule.enabled 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-slate-500'
                      }`}
                    >
                      {rule.enabled && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div>
                      <h3 className="font-semibold text-white">{rule.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        When {rule.sensor} is {rule.condition} {rule.threshold}{rule.unit}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>📱 {rule.device}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          rule.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          rule.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.enabled 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Delete Rule"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Create Alert Rule</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g., High Temperature Alert"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Device</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option>Living Room</option>
                    <option>Garden</option>
                    <option>Kitchen</option>
                    <option>Garage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Sensor</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option>Temperature</option>
                    <option>Humidity</option>
                    <option>Smoke</option>
                    <option>Air Quality</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Condition</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Threshold</label>
                  <input
                    type="number"
                    placeholder="28"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                  <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
