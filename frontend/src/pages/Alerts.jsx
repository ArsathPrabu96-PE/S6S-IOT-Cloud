import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Alert Rule Builder Component
const AlertRuleBuilder = ({ isOpen, onClose, onSave, devices, existingRule }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deviceId: '',
    sensorId: '',
    conditionType: 'threshold',
    condition: {
      min: '',
      max: '',
      rate: '',
      duration: '',
    },
    severity: 'warning',
    notifications: {
      email: false,
      push: false,
      sms: false,
    },
    isActive: true,
  });

  useEffect(() => {
    if (existingRule) {
      setFormData({
        name: existingRule.name || '',
        description: existingRule.description || '',
        deviceId: existingRule.deviceId || '',
        sensorId: existingRule.sensorId || '',
        conditionType: existingRule.conditionType || 'threshold',
        condition: existingRule.condition || { min: '', max: '', rate: '', duration: '' },
        severity: existingRule.severity || 'warning',
        notifications: existingRule.notifications || { email: false, push: false, sms: false },
        isActive: existingRule.isActive ?? true,
      });
    }
  }, [existingRule, isOpen]);

  const selectedDevice = devices?.find(d => d.id === formData.deviceId);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 sticky top-0">
          <h2 className="text-xl font-bold text-white">
            {existingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </h2>
          <p className="text-orange-100 text-sm">
            Configure conditions that trigger notifications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rule Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="High Temperature Alert"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Alert when temperature exceeds threshold..."
                rows={2}
              />
            </div>
          </div>

          {/* Device & Sensor Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Trigger Condition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Device *</label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value, sensorId: '' })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Device</option>
                  {devices?.map(device => (
                    <option key={device.id} value={device.id}>{device.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sensor *</label>
                <select
                  value={formData.sensorId}
                  onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={!formData.deviceId}
                >
                  <option value="">Select Sensor</option>
                  {selectedDevice?.sensors?.map(sensor => (
                    <option key={sensor.id} value={sensor.id}>{sensor.name} ({sensor.unit})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Condition Type */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Condition</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'threshold', label: 'Threshold', icon: '📊' },
                { id: 'range', label: 'Range', icon: '↔️' },
                { id: 'change_rate', label: 'Change Rate', icon: '📈' },
                { id: 'offline', label: 'Offline', icon: '🔌' },
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, conditionType: type.id })}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    formData.conditionType === type.id
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>

            {/* Condition Values */}
            {formData.conditionType === 'threshold' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Minimum Value</label>
                  <input
                    type="number"
                    value={formData.condition.min}
                    onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, min: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Maximum Value</label>
                  <input
                    type="number"
                    value={formData.condition.max}
                    onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, max: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            {formData.conditionType === 'change_rate' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Change Rate (% per minute)</label>
                  <input
                    type="number"
                    value={formData.condition.rate}
                    onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, rate: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.condition.duration}
                    onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, duration: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="5"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Severity</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'critical', label: 'Critical', color: 'bg-red-500', icon: '🔴' },
                { id: 'warning', label: 'Warning', color: 'bg-yellow-500', icon: '🟡' },
                { id: 'info', label: 'Info', color: 'bg-blue-500', icon: '🔵' },
              ].map(sev => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: sev.id })}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    formData.severity === sev.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="text-xl mb-1">{sev.icon}</div>
                  <div className="text-sm font-medium text-white">{sev.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Notifications</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'email', label: 'Email', icon: '📧' },
                { id: 'push', label: 'Push', icon: '📱' },
                { id: 'sms', label: 'SMS', icon: '💬' },
              ].map(channel => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, [channel.id]: !formData.notifications[channel.id] }
                  })}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    formData.notifications[channel.id]
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{channel.icon}</div>
                  <div className="text-sm font-medium text-white">{channel.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-medium transition-colors"
            >
              {existingRule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Alerts Page Enhancement
const AlertsWithRules = () => {
  const navigate = useNavigate();
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [alertRules, setAlertRules] = useState([
    { id: '1', name: 'High Temperature', device: 'Living Room', sensor: 'Temperature', condition: '> 35°C', severity: 'critical', isActive: true },
    { id: '2', name: 'Low Humidity', device: 'Garden', sensor: 'Humidity', condition: '< 30%', severity: 'warning', isActive: true },
    { id: '3', name: 'Device Offline', device: 'Garage', sensor: 'Status', condition: 'offline', severity: 'info', isActive: false },
  ]);
  
  const demoDevices = [
    { id: '1', name: 'Living Room', sensors: [{ id: 's1', name: 'Temperature', unit: '°C' }, { id: 's2', name: 'Humidity', unit: '%' }] },
    { id: '2', name: 'Garden', sensors: [{ id: 's3', name: 'Soil Moisture', unit: '%' }] },
  ];

  const handleSaveRule = (rule) => {
    const newRule = {
      id: Date.now().toString(),
      ...rule,
    };
    setAlertRules([...alertRules, newRule]);
  };

  const toggleRule = (id) => {
    setAlertRules(alertRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteRule = (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      setAlertRules(alertRules.filter(r => r.id !== id));
    }
  };

  const severityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>🔔</span>
            Alerts & Rules
          </h1>
          <p className="text-slate-400 mt-1">
            Configure alerts and automation rules for your devices
          </p>
        </div>
        <button
          onClick={() => setShowRuleBuilder(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Alert Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔴</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertRules.filter(r => r.severity === 'critical' && r.isActive).length}</p>
              <p className="text-sm text-slate-400">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🟡</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertRules.filter(r => r.severity === 'warning' && r.isActive).length}</p>
              <p className="text-sm text-slate-400">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔵</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertRules.filter(r => r.severity === 'info' && r.isActive).length}</p>
              <p className="text-sm text-slate-400">Info</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertRules.filter(r => r.isActive).length}</p>
              <p className="text-sm text-slate-400">Active Rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Rules List */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Alert Rules</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {alertRules.map((rule) => (
            <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${rule.isActive ? 'left-7' : 'left-1'}`} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{rule.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[rule.severity]}`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {rule.device} → {rule.sensor} ({rule.condition})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rule Builder Modal */}
      <AlertRuleBuilder
        isOpen={showRuleBuilder}
        onClose={() => setShowRuleBuilder(false)}
        onSave={handleSaveRule}
        devices={demoDevices}
      />
    </div>
  );
};

export default AlertsWithRules;
