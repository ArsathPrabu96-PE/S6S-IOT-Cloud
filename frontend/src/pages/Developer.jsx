import { useState } from 'react';
import { useOnboarding, ONBOARDING_STEPS } from '../components/OnboardingWizard';

// Demo data
const DEMO_API_KEYS = [
  { id: '1', name: 'Production API Key', key: 'sk_live_****...****8f2a', created: '2026-03-01', lastUsed: '2 min ago', permissions: ['read', 'write', 'admin'] },
  { id: '2', name: 'Development API Key', key: 'sk_test_****...****3b1c', created: '2026-02-15', lastUsed: '5 days ago', permissions: ['read'] },
];

const DEMO_ENDPOINTS = [
  { id: '1', name: 'MQTT Broker', type: 'mqtt', host: 'mqtt://broker.hivemq.com:1883', status: 'active', devices: 4 },
  { id: '2', name: 'HTTP Ingest', type: 'http', host: 'https://api.s6s-iot.com/v1/ingest', status: 'active', devices: 4 },
  { id: '3', name: 'WebSocket', type: 'ws', host: 'wss://ws.s6s-iot.com/realtime', status: 'inactive', devices: 0 },
];

const DEMO_WEBHOOKS = [
  { id: '1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/xxx', events: ['alert.triggered', 'device.offline'], status: 'active' },
  { id: '2', name: 'IFTTT Maker', url: 'https://maker.ifttt.com/trigger/xxx', events: ['sensor.threshold'], status: 'inactive' },
];

const DEMO_DATA_TEMPLATES = [
  { id: '1', name: 'Temperature Sensor', protocol: 'JSON', fields: [{ name: 'temperature', type: 'float', unit: '°C' }, { name: 'humidity', type: 'float', unit: '%' }], parser: 'json' },
  { id: '2', name: 'GPS Tracker', protocol: 'MQTT', fields: [{ name: 'latitude', type: 'float' }, { name: 'longitude', type: 'float' }, { name: 'speed', type: 'float' }], parser: 'custom' },
  { id: '3', name: 'Air Quality', protocol: 'HTTP', fields: [{ name: 'pm25', type: 'float' }, { name: 'pm10', type: 'float' }, { name: 'co2', type: 'integer' }], parser: 'json' },
];

const DEMO_INGESTION_PATTERNS = [
  { id: '1', name: 'ESP32 Standard', pattern: '/api/sensor/{device_id}', method: 'POST', format: 'JSON' },
  { id: '2', name: 'Arduino Telemetry', pattern: '/v2/data', method: 'PUT', format: 'XML' },
  { id: '3', name: 'Raspberry Pi', pattern: '/mqtt/stream', method: 'MQTT', format: 'Binary' },
];

const DEMO_WIDGET_TEMPLATES = [
  // Basic Widgets
  { id: '1', name: 'Temperature Display', widget: 'gauge', dataSource: 'temperature', min: 0, max: 100, unit: '°C', color: '#f59e0b', threshold: { low: 10, high: 35 } },
  { id: '2', name: 'Humidity Display', widget: 'gauge', dataSource: 'humidity', min: 0, max: 100, unit: '%', color: '#06b6d4', threshold: { low: 30, high: 70 } },
  { id: '3', name: 'Light Switch', widget: 'switch', dataSource: 'light', icon: '💡', onValue: 'on', offValue: 'off' },
  { id: '4', name: 'Temperature History', widget: 'graph', dataSource: 'temperature', chartType: 'line', timeRange: '24h', unit: '°C', color: '#f59e0b' },
  { id: '5', name: 'Energy Usage', widget: 'graph', dataSource: 'power', chartType: 'bar', timeRange: '7d', unit: 'W', color: '#10b981' },
  { id: '6', name: 'Door Status', widget: 'indicator', dataSource: 'door', icon: '🚪', states: { open: 'red', closed: 'green' } },
  // Advanced IoT Widgets
  { id: '7', name: 'Temperature Gauge', widget: 'temperatureGauge', dataSource: 'temperature', min: -20, max: 60, unit: '°C', color: '#ef4444', threshold: { cold: 10, warm: 25, hot: 35 } },
  { id: '8', name: 'Humidity Gauge', widget: 'humidityGauge', dataSource: 'humidity', min: 0, max: 100, unit: '%', color: '#06b6d4', threshold: { low: 30, optimal: 50, high: 70 } },
  { id: '9', name: 'Camera Feed', widget: 'camera', dataSource: 'camera1', icon: '📷', resolution: '1080p', status: 'live' },
  { id: '10', name: 'Power Display', widget: 'numericDisplay', dataSource: 'power', unit: 'W', icon: '⚡', color: '#f59e0b' },
  { id: '11', name: 'Voltage Display', widget: 'numericDisplay', dataSource: 'voltage', unit: 'V', icon: '🔌', color: '#8b5cf6' },
  { id: '12', name: 'Current Display', widget: 'numericDisplay', dataSource: 'current', unit: 'A', icon: '📊', color: '#10b981' },
  { id: '13', name: 'CO2 Level', widget: 'numericDisplay', dataSource: 'co2', unit: 'ppm', icon: '💨', color: '#ef4444' },
  { id: '14', name: 'Light Control', widget: 'button', dataSource: 'light', icon: '💡', action: 'toggle', label: 'On/Off' },
  { id: '15', name: 'Fan Control', widget: 'button', dataSource: 'fan', icon: '🌀', action: 'toggle', label: 'On/Off' },
  { id: '16', name: 'Pump Control', widget: 'button', dataSource: 'pump', icon: '💧', action: 'toggle', label: 'On/Off' },
  { id: '17', name: 'Alarm Control', widget: 'button', dataSource: 'alarm', icon: '🔔', action: 'trigger', label: 'Trigger' },
  { id: '18', name: 'Device Status', widget: 'statusArray', dataSource: 'devices', devices: ['ESP32-001', 'ESP32-002', 'ESP32-003', 'ESP32-004'] },
  { id: '19', name: 'GPS Location', widget: 'gps', dataSource: 'gps1', icon: '📍', format: 'decimal' },
  { id: '20', name: 'Multi-Channel', widget: 'multiChannelChart', dataSource: 'sensors', channels: ['temperature', 'humidity', 'pressure'], timeRange: '24h' },
  { id: '21', name: 'Data Distribution', widget: 'donutChart', dataSource: 'distribution', segments: ['Active', 'Inactive', 'Warning', 'Error'] },
  // Analog Meter Widget
  { id: '22', name: 'Analog Voltage Meter', widget: 'analogMeter', dataSource: 'voltage', min: 0, max: 12, unit: 'V', color: '#10b981', needleColor: '#ef4444' },
  { id: '23', name: 'Analog Amperage Meter', widget: 'analogMeter', dataSource: 'current', min: 0, max: 10, unit: 'A', color: '#f59e0b', needleColor: '#ef4444' },
  { id: '24', name: 'Analog Pressure Meter', widget: 'analogMeter', dataSource: 'pressure', min: 0, max: 100, unit: 'PSI', color: '#8b5cf6', needleColor: '#ef4444' },
];

const Developer = () => {
  const { startOnboarding, restartOnboarding } = useOnboarding();
  const [activeTab, setActiveTab] = useState('endpoints');
  const [showCreateModal, setShowCreateModal] = useState(null);
  const [apiKeys, setApiKeys] = useState(DEMO_API_KEYS);
  const [endpoints, setEndpoints] = useState(DEMO_ENDPOINTS);
  const [webhooks, setWebhooks] = useState(DEMO_WEBHOOKS);
  const [dataTemplates, setDataTemplates] = useState(DEMO_DATA_TEMPLATES);
  const [ingestionPatterns, setIngestionPatterns] = useState(DEMO_INGESTION_PATTERNS);
  const [widgetTemplates, setWidgetTemplates] = useState(DEMO_WIDGET_TEMPLATES);
  const [selectedWidgetType, setSelectedWidgetType] = useState(null);
  const [droppedWidgets, setDroppedWidgets] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('blynk');
  const [liveData, setLiveData] = useState({});

  // Delete handlers
  const handleDeleteEndpoint = (id) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
  };

  const handleDeleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleDeleteWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  const handleDeleteDataTemplate = (id) => {
    setDataTemplates(dataTemplates.filter(t => t.id !== id));
  };

  const handleDeleteWidgetTemplate = (id) => {
    setWidgetTemplates(widgetTemplates.filter(t => t.id !== id));
  };

  const handleDeleteIngestionPattern = (id) => {
    setIngestionPatterns(ingestionPatterns.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Developer Options</h1>
          <p className="text-slate-400 mt-1">Configure endpoints, API keys, and data integration settings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startOnboarding}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Start the interactive tutorial"
          >
            <span>❓</span> Help
          </button>
          <button
            onClick={restartOnboarding}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <span>🔄</span> Restart Tutorial
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        {[
          { id: 'endpoints', label: 'Endpoints', icon: '🔗' },
          { id: 'api-keys', label: 'API Keys', icon: '🔑' },
          { id: 'webhooks', label: 'Webhooks', icon: '🔔' },
          { id: 'templates', label: 'Data Templates', icon: '📋' },
          { id: 'widget-templates', label: 'Widget Templates', icon: '🧩' },
          { id: 'patterns', label: 'Ingestion Patterns', icon: '📥' },
          { id: 'streams', label: 'Data Streams', icon: '📊' },
          { id: 'integrations', label: 'Platforms', icon: '🔗' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-cyan-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setTooltip('endpoint-help')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm flex items-center gap-1"
            >
              <span>❓</span> Help
            </button>
            <button
              onClick={() => setShowCreateModal('endpoint')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add Endpoint
            </button>
          </div>
          {tooltip === 'endpoint-help' && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📡</span>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Endpoints Help</h4>
                  <p className="text-slate-300 text-sm">
                    Endpoints are connection points where your IoT devices send data. Configure MQTT, HTTP, or WebSocket endpoints:
                  </p>
                  <ul className="text-slate-400 text-sm mt-2 space-y-1">
                    <li>• <span className="text-yellow-400">MQTT</span> - Lightweight messaging for sensor networks</li>
                    <li>• <span className="text-green-400">HTTP</span> - RESTful API for direct device communication</li>
                    <li>• <span className="text-purple-400">WebSocket</span> - Real-time bidirectional communication</li>
                  </ul>
                  <p className="text-slate-400 text-sm mt-2">
                    <span className="text-cyan-400">S6S IoT example:</span> Use MQTT broker at <code className="text-yellow-400">mqtt://broker.hivemq.com:1883</code>
                  </p>
                  <button onClick={() => setTooltip(null)} className="mt-3 text-xs text-slate-400 hover:text-white">Got it! 👌</button>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4">
            {endpoints.map(endpoint => (
              <div key={endpoint.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      endpoint.type === 'mqtt' ? 'bg-yellow-900/50 text-yellow-400' :
                      endpoint.type === 'http' ? 'bg-green-900/50 text-green-400' :
                      'bg-purple-900/50 text-purple-400'
                    }`}>
                      <span className="text-xl">{endpoint.type === 'mqtt' ? '📡' : endpoint.type === 'http' ? '🌐' : '🔌'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{endpoint.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 font-mono">{endpoint.host}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Type: {endpoint.type.toUpperCase()}</span>
                        <span>Devices: {endpoint.devices}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      endpoint.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      {endpoint.status}
                    </span>
                    <button className="p-2 hover:bg-slate-700 rounded-lg">✏️</button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${endpoint.name}"?`)) {
                          handleDeleteEndpoint(endpoint.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Delete Endpoint"
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

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setTooltip('apikey-help')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm flex items-center gap-1"
            >
              <span>❓</span> Help
            </button>
            <button
              onClick={() => setShowCreateModal('apikey')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + Generate API Key
            </button>
          </div>
          {tooltip === 'apikey-help' && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">API Keys Help</h4>
                  <p className="text-slate-300 text-sm">
                    API keys authenticate your applications when accessing the S6S IoT platform:
                  </p>
                  <ul className="text-slate-400 text-sm mt-2 space-y-1">
                    <li>• <span className="text-green-400">Read</span> - Access device data and status</li>
                    <li>• <span className="text-yellow-400">Write</span> - Send commands to devices</li>
                    <li>• <span className="text-red-400">Admin</span> - Full system access</li>
                  </ul>
                  <p className="text-slate-400 text-sm mt-2">Keep your keys secure and never share them publicly!</p>
                  <button onClick={() => setTooltip(null)} className="mt-3 text-xs text-slate-400 hover:text-white">Got it! 👌</button>
                </div>
              </div>
            </div>
          )}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">API Key</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Permissions</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Last Used</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(key => (
                  <tr key={key.id} className="border-t border-slate-700">
                    <td className="p-4 text-white font-medium">{key.name}</td>
                    <td className="p-4 font-mono text-slate-400">{key.key}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {key.permissions.map(perm => (
                          <span key={perm} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{perm}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{key.lastUsed}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">Copy</button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to revoke "${key.name}"?`)) {
                              handleDeleteApiKey(key.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-400 rounded text-sm"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setTooltip('webhook-help')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm flex items-center gap-1"
            >
              <span>❓</span> Help
            </button>
            <button
              onClick={() => setShowCreateModal('webhook')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add Webhook
            </button>
          </div>
          {tooltip === 'webhook-help' && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Webhooks Help</h4>
                  <p className="text-slate-300 text-sm">
                    Webhooks notify external systems when events occur in your IoT network:
                  </p>
                  <ul className="text-slate-400 text-sm mt-2 space-y-1">
                    <li>• <span className="text-red-400">alert.triggered</span> - When an alert is triggered</li>
                    <li>• <span className="text-yellow-400">device.offline</span> - When a device goes offline</li>
                    <li>• <span className="text-cyan-400">sensor.threshold</span> - When sensor crosses threshold</li>
                  </ul>
                  <p className="text-slate-400 text-sm mt-2">
                    <span className="text-cyan-400">Example:</span> Send alerts to Slack, IFTTT, or custom servers
                  </p>
                  <button onClick={() => setTooltip(null)} className="mt-3 text-xs text-slate-400 hover:text-white">Got it! 👌</button>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{webhook.name}</h3>
                    <p className="text-sm text-slate-400 mt-1 font-mono">{webhook.url}</p>
                    <div className="flex gap-2 mt-2">
                      {webhook.events.map(event => (
                        <span key={event} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{event}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      webhook.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      {webhook.status}
                    </span>
                    <button className="p-2 hover:bg-slate-700 rounded-lg">🧪</button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${webhook.name}"?`)) {
                          handleDeleteWebhook(webhook.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Delete Webhook"
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

      {/* Data Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal('template')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + Create Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataTemplates.map(template => (
              <div key={template.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{template.name}</h3>
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{template.protocol}</span>
                </div>
                <div className="space-y-2 mb-3">
                  {template.fields.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{field.name}</span>
                      <span className="text-cyan-400">{field.type}{field.unit ? ` (${field.unit})` : ''}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Parser: {template.parser}</span>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
                        handleDeleteDataTemplate(template.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                    title="Delete Template"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widget Templates Tab */}
      {activeTab === 'widget-templates' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setTooltip('widget-help')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm flex items-center gap-1"
              title="Learn about widget templates"
            >
              <span>❓</span> Help
            </button>
            <button
              onClick={() => setShowCreateModal('widgettemplate')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + Create Widget Template
            </button>
          </div>
          {tooltip === 'widget-help' && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Widget Templates Help</h4>
                  <p className="text-slate-300 text-sm">
                    Create reusable widget templates for your IoT dashboard. Widgets can display sensor data in various formats:
                  </p>
                  <ul className="text-slate-400 text-sm mt-2 space-y-1">
                    <li>• <span className="text-cyan-400">Gauges</span> - Circular displays for temperature, humidity</li>
                    <li>• <span className="text-cyan-400">Charts</span> - Line/bar graphs for historical data</li>
                    <li>• <span className="text-cyan-400">Switches</span> - Toggle controls for devices</li>
                    <li>• <span className="text-cyan-400">Indicators</span> - Status lights and alerts</li>
                  </ul>
                  <button 
                    onClick={() => setTooltip(null)}
                    className="mt-3 text-xs text-slate-400 hover:text-white"
                  >
                    Got it! 👌
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Widget Type Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { type: 'gauge', icon: '📊', label: 'Gauge', desc: 'Circular value display' },
              { type: 'analogMeter', icon: '🧭', label: 'Analog', desc: 'Analog meter needle' },
              { type: 'graph', icon: '📈', label: 'Graph', desc: 'Line/Bar charts' },
              { type: 'switch', icon: '💡', label: 'Switch', desc: 'Toggle control' },
              { type: 'indicator', icon: '🔴', label: 'Indicator', desc: 'Status light' },
              { type: 'card', icon: '🃏', label: 'Card', desc: 'Value display' },
              { type: 'slider', icon: '🎚️', label: 'Slider', desc: 'Range control' },
              { type: 'temperatureGauge', icon: '🌡️', label: 'Temp Gauge', desc: 'Temperature arc gauge' },
              { type: 'humidityGauge', icon: '💧', label: 'Humidity', desc: 'Humidity gauge' },
              { type: 'camera', icon: '📷', label: 'Camera', desc: 'Live video feed' },
              { type: 'numericDisplay', icon: '🔢', label: 'Numeric', desc: 'Digital display' },
              { type: 'button', icon: '🖱️', label: 'Button', desc: 'Control button' },
              { type: 'statusArray', icon: '📶', label: 'Status', desc: 'Device status grid' },
              { type: 'gps', icon: '🗺️', label: 'GPS', desc: 'Location tracking' },
              { type: 'multiChannelChart', icon: '📉', label: 'Multi-Chart', desc: 'Multi-line chart' },
              { type: 'donutChart', icon: '🍩', label: 'Donut', desc: 'Distribution chart' },
            ].map((widget, index) => (
              <button
                key={widget.type}
                onClick={() => setSelectedWidgetType(widget.type)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedWidgetType === widget.type
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-2xl mb-2 transition-transform duration-300 hover:scale-110">{widget.icon}</div>
                <div className="font-medium text-white text-sm">{widget.label}</div>
                <div className="text-xs text-slate-400">{widget.desc}</div>
              </button>
            ))}
          </div>

          {/* Widget Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetTemplates.map((template, index) => (
              <div 
                key={template.id} 
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 group"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('widget', JSON.stringify(template));
                }}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      template.widget === 'gauge' ? 'bg-amber-900/50 text-amber-400' :
                      template.widget === 'analogMeter' ? 'bg-green-900/50 text-green-400' :
                      template.widget === 'temperatureGauge' ? 'bg-red-900/50 text-red-400' :
                      template.widget === 'humidityGauge' ? 'bg-cyan-900/50 text-cyan-400' :
                      template.widget === 'camera' ? 'bg-purple-900/50 text-purple-400' :
                      template.widget === 'numericDisplay' ? 'bg-green-900/50 text-green-400' :
                      template.widget === 'button' ? 'bg-pink-900/50 text-pink-400' :
                      template.widget === 'statusArray' ? 'bg-indigo-900/50 text-indigo-400' :
                      template.widget === 'gps' ? 'bg-orange-900/50 text-orange-400' :
                      template.widget === 'multiChannelChart' ? 'bg-teal-900/50 text-teal-400' :
                      template.widget === 'donutChart' ? 'bg-violet-900/50 text-violet-400' :
                      template.widget === 'graph' ? 'bg-green-900/50 text-green-400' :
                      template.widget === 'switch' ? 'bg-purple-900/50 text-purple-400' :
                      template.widget === 'indicator' ? 'bg-red-900/50 text-red-400' :
                      'bg-blue-900/50 text-blue-400'
                    }`}>
                      <span className="text-lg transition-transform duration-300 group-hover:rotate-12">
                        {template.widget === 'gauge' ? '📊' :
                         template.widget === 'analogMeter' ? '🧭' :
                         template.widget === 'temperatureGauge' ? '🌡️' :
                         template.widget === 'humidityGauge' ? '💧' :
                         template.widget === 'camera' ? '📷' :
                         template.widget === 'numericDisplay' ? '🔢' :
                         template.widget === 'button' ? '🖱️' :
                         template.widget === 'statusArray' ? '📶' :
                         template.widget === 'gps' ? '🗺️' :
                         template.widget === 'multiChannelChart' ? '📉' :
                         template.widget === 'donutChart' ? '🍩' :
                         template.widget === 'graph' ? '📈' :
                         template.widget === 'switch' ? '💡' :
                         template.widget === 'indicator' ? '🔴' : '🃏'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300">{template.name}</h3>
                      <span className="text-xs text-slate-400 capitalize">{template.widget}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-slate-700 rounded transition-colors duration-200 hover:scale-110">✏️</button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
                          handleDeleteWidgetTemplate(template.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all duration-200 hover:scale-110"
                      title="Delete Template"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Widget Preview */}
                <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                  {template.widget === 'gauge' && (
                    <div className="flex items-center justify-center">
                      <div className="relative w-20 h-20 group">
                        <svg className="w-20 h-20 transform -rotate-90 transition-all duration-500 group-hover:scale-110">
                          <circle cx="40" cy="40" r="35" stroke={template.color || '#f59e0b'} strokeWidth="6" fill="none" opacity="0.3" className="transition-opacity duration-300 group-hover:opacity-50" />
                          <circle cx="40" cy="40" r="35" stroke={template.color || '#f59e0b'} strokeWidth="6" fill="none" strokeDasharray="220" strokeDashoffset="110" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-125">
                          <span className="text-white font-bold">{template.unit || ''}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {template.widget === 'analogMeter' && (
                    <div className="flex items-center justify-center py-2 group">
                      <div className="relative w-24 h-16">
                        {/* Meter background */}
                        <svg className="w-24 h-16 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 100 50">
                          {/* Arc background */}
                          <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                          {/* Colored arc segments */}
                          <path d="M 10 45 A 40 40 0 0 1 35 15" fill="none" stroke={template.color || '#10b981'} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                          <path d="M 35 15 A 40 40 0 0 1 65 15" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                          <path d="M 65 15 A 40 40 0 0 1 90 45" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                          {/* Needle */}
                          <line x1="50" y1="45" x2="50" y2="20" stroke={template.needleColor || '#ef4444'} strokeWidth="2" strokeLinecap="round" className="transition-all duration-1000 ease-out" transform="rotate(-30, 50, 45)" />
                          {/* Center circle */}
                          <circle cx="50" cy="45" r="4" fill={template.needleColor || '#ef4444'} />
                        </svg>
                        {/* Value display */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                          <span className="text-white font-bold text-sm">{template.min || 0}</span>
                          <span className="text-slate-500 text-xs mx-1">|</span>
                          <span className="text-white font-bold text-sm">{template.max || 100}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {template.widget === 'temperatureGauge' && (
                    <div className="flex items-center justify-center">
                      <div className="relative w-24 h-16 group">
                        <svg className="w-24 h-16 transition-all duration-500 group-hover:scale-105" viewBox="0 0 100 50">
                          <path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" className="transition-all duration-300 group-hover:stroke-slate-600" />
                          <path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" stroke={template.color || '#ef4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray="110" strokeDashoffset="30" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-end justify-center pb-1 transition-transform duration-300 group-hover:scale-110">
                          <span className="text-white text-sm font-bold">24°C</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {template.widget === 'humidityGauge' && (
                    <div className="flex items-center justify-center">
                      <div className="relative w-16 h-16 group">
                        <svg className="w-16 h-16 transform -rotate-90 transition-all duration-500 group-hover:scale-110">
                          <circle cx="32" cy="32" r="28" stroke="#334155" strokeWidth="6" fill="none" className="transition-all duration-300 group-hover:stroke-slate-600" />
                          <circle cx="32" cy="32" r="28" stroke={template.color || '#06b6d4'} strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset="50" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-125">
                          <span className="text-cyan-400">💧</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white transition-all duration-300 group-hover:text-cyan-300">65%</div>
                      </div>
                    </div>
                  )}
                  {template.widget === 'camera' && (
                    <div className="bg-slate-950 rounded-lg h-20 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="text-3xl transition-transform duration-300 group-hover:scale-110">{template.icon || '📷'}</div>
                      <div className="absolute top-1 right-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-400">LIVE</span>
                      </div>
                      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">⏸️</span>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">📸</span>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">⚙️</span>
                      </div>
                    </div>
                  )}
                  {template.widget === 'numericDisplay' && (
                    <div className="text-center py-2 group cursor-pointer">
                      <div className="text-2xl font-bold transition-all duration-300 group-hover:scale-110" style={{ color: template.color || '#fff' }}>
                        {template.icon || ''} <span className="inline-block transition-transform duration-300 group-hover:-translate-y-1">240</span>
                      </div>
                      <div className="text-sm text-slate-400 transition-all duration-300 group-hover:text-white">{template.unit || 'W'}</div>
                    </div>
                  )}
                  {template.widget === 'button' && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{template.icon || '🖱️'}</span>
                      <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 active:scale-95">
                        {template.label || 'Toggle'}
                      </button>
                    </div>
                  )}
                  {template.widget === 'statusArray' && (
                    <div className="grid grid-cols-2 gap-2">
                      {template.devices ? template.devices.slice(0, 4).map((dev, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs p-1 rounded transition-all duration-300 hover:bg-slate-700/50 group">
                          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${i < 3 ? 'bg-green-500 group-hover:bg-green-400 group-hover:shadow-lg group-hover:shadow-green-500/50' : 'bg-red-500 group-hover:bg-red-400 group-hover:shadow-lg group-hover:shadow-red-500/50'} ${i < 3 ? 'animate-pulse' : ''}`}></span>
                          <span className="text-slate-400 group-hover:text-white truncate transition-colors duration-300">{dev}</span>
                        </div>
                      )) : (
                        <>
                          <div className="flex items-center gap-1 text-xs p-1 rounded transition-all duration-300 hover:bg-slate-700/50 group"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:bg-green-400 group-hover:shadow-lg group-hover:shadow-green-500/50"></span><span className="text-slate-400 group-hover:text-white">Online</span></div>
                          <div className="flex items-center gap-1 text-xs p-1 rounded transition-all duration-300 hover:bg-slate-700/50 group"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:bg-green-400 group-hover:shadow-lg group-hover:shadow-green-500/50"></span><span className="text-slate-400 group-hover:text-white">Online</span></div>
                          <div className="flex items-center gap-1 text-xs p-1 rounded transition-all duration-300 hover:bg-slate-700/50 group"><span className="w-2 h-2 rounded-full bg-red-500 group-hover:bg-red-400 group-hover:shadow-lg group-hover:shadow-red-500/50"></span><span className="text-slate-400 group-hover:text-white">Offline</span></div>
                          <div className="flex items-center gap-1 text-xs p-1 rounded transition-all duration-300 hover:bg-slate-700/50 group"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:bg-green-400 group-hover:shadow-lg group-hover:shadow-green-500/50"></span><span className="text-slate-400 group-hover:text-white">Online</span></div>
                        </>
                      )}
                    </div>
                  )}
                  {template.widget === 'gps' && (
                    <div className="text-center py-2 group cursor-pointer">
                      <div className="text-2xl mb-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">{template.icon || '📍'}</div>
                      <div className="text-xs text-slate-400 transition-all duration-300 group-hover:text-cyan-300">40.7128° N</div>
                      <div className="text-xs text-slate-400 transition-all duration-300 group-hover:text-cyan-300">74.0060° W</div>
                    </div>
                  )}
                  {template.widget === 'multiChannelChart' && (
                    <div className="h-16 flex items-end gap-1">
                      {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t transition-all duration-300 hover:from-cyan-400 hover:to-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50"
                          style={{ 
                            height: `${h}%`,
                            animationDelay: `${i * 100}ms`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                  {template.widget === 'donutChart' && (
                    <div className="flex items-center justify-center group">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90 transition-all duration-500 group-hover:scale-110">
                          <circle cx="32" cy="32" r="24" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="37.7" strokeDashoffset="0" className="transition-all duration-300 hover:stroke-green-400" />
                          <circle cx="32" cy="32" r="24" stroke="#f59e0b" strokeWidth="8" fill="none" strokeDasharray="37.7" strokeDashoffset="-37.7" className="transition-all duration-300 hover:stroke-yellow-400" />
                          <circle cx="32" cy="32" r="24" stroke="#ef4444" strokeWidth="8" fill="none" strokeDasharray="37.7" strokeDashoffset="-75.4" className="transition-all duration-300 hover:stroke-red-400" />
                          <circle cx="32" cy="32" r="24" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="37.7" strokeDashoffset="-113.1" className="transition-all duration-300 hover:stroke-violet-400" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {template.widget === 'graph' && (
                    <div className="h-16 flex items-end gap-1">
                      {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t transition-all duration-300 hover:from-cyan-400 hover:to-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50"
                          style={{ 
                            height: `${h}%`,
                            animationDelay: `${i * 100}ms`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                  {template.widget === 'switch' && (
                    <div className="flex items-center justify-center gap-3 group">
                      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{template.icon || '💡'}</span>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/50">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 group-hover:scale-110"></div>
                      </div>
                    </div>
                  )}
                  {template.widget === 'indicator' && (
                    <div className="flex items-center justify-center gap-3 group">
                      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{template.icon || '🚪'}</span>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110"></div>
                        <span className="text-green-400 text-sm transition-all duration-300 group-hover:text-green-300">Closed</span>
                      </div>
                    </div>
                  )}
                  {template.widget === 'card' && (
                    <div className="text-center group cursor-pointer">
                      <div className="text-2xl font-bold text-white transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-400">24.5</div>
                      <div className="text-sm text-slate-400 transition-all duration-300 group-hover:text-white">{template.unit || '°C'}</div>
                    </div>
                  )}
                  {template.widget === 'slider' && (
                    <div className="py-2 group">
                      <input 
                        type="range" 
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        defaultValue="50" 
                      />
                      <div className="text-center text-slate-400 text-sm transition-all duration-300 group-hover:text-white">50%</div>
                    </div>
                  )}
                </div>

                {/* Configuration */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Data Source:</span>
                    <span className="text-cyan-400 font-mono">{template.dataSource}</span>
                  </div>
                  {template.min !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Range:</span>
                      <span className="text-white">{template.min} - {template.max}{template.unit}</span>
                    </div>
                  )}
                  {template.threshold && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Threshold:</span>
                      <span className="text-yellow-400">{template.threshold.low} - {template.threshold.high}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Drag and Drop Canvas */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎯</span> Dashboard Canvas - Drag widgets here
            </h3>
            <div 
              className="bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-xl p-6 min-h-64"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const widgetData = e.dataTransfer.getData('widget');
                if (widgetData) {
                  const widget = JSON.parse(widgetData);
                  setDroppedWidgets([...droppedWidgets, { ...widget, dropId: Date.now() }]);
                }
              }}
            >
              {droppedWidgets.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <div className="text-4xl mb-2">📦</div>
                  <p>Drag and drop widgets from above to build your dashboard</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {droppedWidgets.map((widget, index) => (
                    <div 
                      key={widget.dropId}
                      className="bg-slate-800 rounded-lg p-3 border border-slate-600 relative group hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <button 
                        onClick={() => setDroppedWidgets(droppedWidgets.filter(w => w.dropId !== widget.dropId))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                      >
                        ×
                      </button>
                      <div className="text-center">
                        <div className="text-2xl mb-1 transition-transform duration-300 group-hover:scale-110">
                          {widget.widget === 'gauge' ? '📊' :
                           widget.widget === 'analogMeter' ? '🧭' :
                           widget.widget === 'temperatureGauge' ? '🌡️' :
                           widget.widget === 'humidityGauge' ? '💧' :
                           widget.widget === 'camera' ? '📷' :
                           widget.widget === 'numericDisplay' ? '🔢' :
                           widget.widget === 'button' ? '🖱️' :
                           widget.widget === 'statusArray' ? '📶' :
                           widget.widget === 'gps' ? '🗺️' :
                           widget.widget === 'multiChannelChart' ? '📉' :
                           widget.widget === 'donutChart' ? '🍩' :
                           widget.widget === 'graph' ? '📈' :
                           widget.widget === 'switch' ? '💡' :
                           widget.widget === 'indicator' ? '🔴' : '🃏'}
                        </div>
                        <div className="text-xs text-white truncate group-hover:text-cyan-400 transition-colors duration-300">{widget.name}</div>
                        <div className="text-xs text-slate-400">{widget.dataSource}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {droppedWidgets.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-400">{droppedWidgets.length} widget(s) on canvas</span>
                <button 
                  onClick={() => setDroppedWidgets([])}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  Clear Canvas
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ingestion Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal('pattern')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              + Add Pattern
            </button>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Pattern</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Format</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingestionPatterns.map(pattern => (
                  <tr key={pattern.id} className="border-t border-slate-700">
                    <td className="p-4 text-white font-medium">{pattern.name}</td>
                    <td className="p-4 font-mono text-slate-400">{pattern.pattern}</td>
                    <td className="p-4 text-slate-300">{pattern.method}</td>
                    <td className="p-4 text-slate-300">{pattern.format}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">Edit</button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${pattern.name}"?`)) {
                              handleDeleteIngestionPattern(pattern.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                          title="Delete Pattern"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Streams Tab */}
      {activeTab === 'streams' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setTooltip('streams-help')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm flex items-center gap-1"
            >
              <span>❓</span> Help
            </button>
          </div>
          {tooltip === 'streams-help' && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Data Streams Help</h4>
                  <p className="text-slate-300 text-sm">
                    Real-time data streams show live data from your connected devices:
                  </p>
                  <ul className="text-slate-400 text-sm mt-2 space-y-1">
                    <li>• <span className="text-green-400">Refresh Rate</span> - How often data updates (1s-30s)</li>
                    <li>• <span className="text-cyan-400">Protocol Parser</span> - Parse incoming data formats</li>
                    <li>• <span className="text-purple-400">Buffer Size</span> - Number of data points to keep</li>
                  </ul>
                  <p className="text-slate-400 text-sm mt-2">
                    <span className="text-cyan-400">S6S IoT:</span> Temperature updates every 5 seconds via MQTT
                  </p>
                  <button onClick={() => setTooltip(null)} className="mt-3 text-xs text-slate-400 hover:text-white">Got it! 👌</button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Live Stream</h3>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Refresh Rate</span>
                  <select className="bg-slate-700 text-white rounded px-2 py-1 text-xs">
                    <option>1 second</option>
                    <option>5 seconds</option>
                    <option>10 seconds</option>
                    <option>30 seconds</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buffer Size</span>
                  <span className="text-white">1000 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol</span>
                  <span className="text-cyan-400">WebSocket</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold text-white mb-4">Protocol Parser</h3>
              <div className="space-y-2 text-sm">
                <select className="w-full bg-slate-700 text-white rounded px-2 py-2 text-xs">
                  <option>JSON</option>
                  <option>XML</option>
                  <option>CSV</option>
                  <option>Custom</option>
                </select>
                <textarea 
                  className="w-full h-20 bg-slate-700 text-slate-300 rounded p-2 text-xs font-mono"
                  placeholder="// Custom parser function&#10;function parse(data) {&#10;  return JSON.parse(data);&#10;}"
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold text-white mb-4">Stream Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Messages/sec</span>
                  <span className="text-green-400 font-bold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Total Messages</span>
                  <span className="text-white font-bold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Error Rate</span>
                  <span className="text-green-400 font-bold">0.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Avg Latency</span>
                  <span className="text-cyan-400 font-bold">45ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Data Preview */}
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Real-time Data Preview</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Filter:</span>
                <select className="bg-slate-700 text-white rounded px-2 py-1 text-xs">
                  <option>All Devices</option>
                  <option>Living Room</option>
                  <option>Garden</option>
                  <option>Kitchen</option>
                </select>
                <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">Start</button>
                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">Stop</button>
              </div>
            </div>
            <div className="p-4 max-h-64 overflow-auto">
              <div className="font-mono text-xs space-y-1">
                <div className="text-slate-500">[10:23:45] Connected to stream</div>
                <div className="text-cyan-400">[10:23:46] {`{ device: "Living Room", temperature: 24.5, humidity: 65 }`}</div>
                <div className="text-cyan-400">[10:23:47] {`{ device: "Garden", soil_moisture: 42, light: 1200 }`}</div>
                <div className="text-cyan-400">[10:23:48] {`{ device: "Kitchen", smoke: 12, gas: 45 }`}</div>
                <div className="text-green-400">[10:23:49] ✓ Data processed successfully</div>
                <div className="text-cyan-400">[10:23:50] {`{ device: "Living Room", temperature: 24.6, humidity: 64 }`}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Platform Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'blynk', name: 'BLYNK IoT', icon: '⚡', color: 'from-green-500 to-emerald-600', desc: 'Next-gen IoT Platform' },
              { id: 'thingsboard', name: 'ThingsBoard', icon: '🔶', color: 'from-orange-500 to-red-600', desc: 'Open-source IoT Platform' },
              { id: 'nodered', name: 'Node-RED', icon: '🔴', color: 'from-red-500 to-pink-600', desc: 'Flow-based Programming' },
              { id: 'ubidots', name: 'Ubidots', icon: '📡', color: 'from-purple-500 to-indigo-600', desc: 'IoT Data Visualization' },
            ].map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedPlatform === platform.id
                    ? `border-cyan-500 bg-gradient-to-br ${platform.color} shadow-lg shadow-cyan-500/20`
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-4xl mb-3 transition-transform duration-300 hover:scale-110">{platform.icon}</div>
                <h3 className={`font-bold text-lg ${selectedPlatform === platform.id ? 'text-white' : 'text-white'}`}>{platform.name}</h3>
                <p className={`text-sm ${selectedPlatform === platform.id ? 'text-white/80' : 'text-slate-400'}`}>{platform.desc}</p>
              </button>
            ))}
          </div>

          {/* Platform Dashboard */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            {/* Platform Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                  {selectedPlatform === 'blynk' && '⚡'}
                  {selectedPlatform === 'thingsboard' && '🔶'}
                  {selectedPlatform === 'nodered' && '🔴'}
                  {selectedPlatform === 'ubidots' && '📡'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedPlatform === 'blynk' && 'BLYNK IoT Dashboard'}
                    {selectedPlatform === 'thingsboard' && 'ThingsBoard Dashboard'}
                    {selectedPlatform === 'nodered' && 'Node-RED Flow Editor'}
                    {selectedPlatform === 'ubidots' && 'Ubidots Dashboard'}
                  </h2>
                  <p className="text-slate-400">Real-time IoT monitoring and control</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Refresh
                </button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Active Devices', value: '24', icon: '📱', change: '+3', color: 'text-green-400' },
                { label: 'Data Points/min', value: '1.2K', icon: '📊', change: '+12%', color: 'text-cyan-400' },
                { label: 'Alerts', value: '3', icon: '🔔', change: '-2', color: 'text-yellow-400' },
                { label: 'Uptime', value: '99.9%', icon: '✅', change: '+0.1%', color: 'text-green-400' },
              ].map((metric, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <span className={`text-xs ${metric.color} font-medium`}>{metric.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-xs text-slate-400">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Temperature Chart */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>🌡️</span> Temperature Sensor Data
                </h3>
                <div className="h-40 flex items-end gap-2">
                  {[22, 24, 23, 25, 24, 26, 25, 24, 23, 25, 26, 27, 25, 24].map((val, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t transition-all duration-500 hover:from-orange-400 hover:to-yellow-400" style={{ height: `${val * 3}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                </div>
              </div>

              {/* Humidity Chart */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>💧</span> Humidity Sensor Data
                </h3>
                <div className="h-40 flex items-end gap-2">
                  {[65, 68, 62, 70, 72, 68, 65, 62, 58, 60, 62, 65, 68, 70].map((val, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t transition-all duration-500 hover:from-cyan-400 hover:to-blue-400" style={{ height: `${val * 1.2}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </div>

            {/* Devices Table */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>📱</span> Connected Devices
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-sm font-medium text-slate-400">Device</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-400">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-400">Last Seen</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'ESP32-Sensor-01', type: 'Temperature', status: 'online', lastSeen: 'Just now', temp: '24.5°C' },
                      { name: 'ESP32-Sensor-02', type: 'Humidity', status: 'online', lastSeen: '1 min ago', temp: '65%' },
                      { name: 'Raspberry-Pi-01', type: 'Gateway', status: 'online', lastSeen: 'Just now', temp: '45.2°C' },
                      { name: 'Arduino-UNO-01', type: 'Relay', status: 'offline', lastSeen: '2 hrs ago', temp: 'N/A' },
                      { name: 'ESP8266-Node-01', type: 'Motion', status: 'online', lastSeen: '30 sec ago', temp: 'Active' },
                    ].map((device, idx) => (
                      <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 text-white font-medium">{device.name}</td>
                        <td className="p-3 text-slate-400">{device.type}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            device.status === 'online' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {device.status === 'online' ? '● Online' : '● Offline'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-sm">{device.lastSeen}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-cyan-600/50 hover:bg-cyan-600 text-cyan-400 rounded text-xs transition-colors">
                              Details
                            </button>
                            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors">
                              Config
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Control Panel */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Living Room Light', icon: '💡', status: true, type: 'switch' },
                { name: 'Garden Pump', icon: '💧', status: false, type: 'switch' },
                { name: 'Garage Door', icon: '🚗', status: false, type: 'switch' },
                { name: 'AC Unit', icon: '❄️', status: true, type: 'slider', value: 72 },
              ].map((control, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{control.icon}</span>
                    <span className={`w-3 h-3 rounded-full ${control.status ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  </div>
                  <div className="text-white font-medium text-sm mb-2">{control.name}</div>
                  {control.type === 'switch' ? (
                    <button className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                      control.status 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                    }`}>
                      {control.status ? 'ON' : 'OFF'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        type="range" 
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        defaultValue={control.value} 
                      />
                      <div className="text-center text-slate-400 text-xs">{control.value}°F</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {showCreateModal === 'endpoint' && 'Add Endpoint'}
              {showCreateModal === 'apikey' && 'Generate API Key'}
              {showCreateModal === 'webhook' && 'Add Webhook'}
              {showCreateModal === 'template' && 'Create Data Template'}
              {showCreateModal === 'widgettemplate' && 'Create Widget Template'}
              {showCreateModal === 'pattern' && 'Add Ingestion Pattern'}
            </h2>
            <form className="space-y-4">
              {showCreateModal === 'endpoint' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                    <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      <option>MQTT</option>
                      <option>HTTP</option>
                      <option>WebSocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Host/URL</label>
                    <input type="text" placeholder="mqtt://broker.example.com:1883" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                </>
              )}
              {showCreateModal === 'apikey' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Key Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Permissions</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" className="rounded" /> Read
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" className="rounded" /> Write
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" className="rounded" /> Admin
                      </label>
                    </div>
                  </div>
                </>
              )}
              {showCreateModal === 'webhook' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Webhook URL</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Events</label>
                    <div className="flex flex-wrap gap-2">
                      {['alert.triggered', 'device.offline', 'sensor.threshold', 'data.ingested'].map(event => (
                        <label key={event} className="flex items-center gap-2 text-slate-300 text-sm">
                          <input type="checkbox" className="rounded" /> {event}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {showCreateModal === 'template' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Template Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Protocol</label>
                    <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      <option>JSON</option>
                      <option>MQTT</option>
                      <option>HTTP</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </>
              )}
              {showCreateModal === 'widgettemplate' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Widget Template Name</label>
                    <input type="text" placeholder="e.g., Temperature Gauge" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Widget Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'gauge', icon: '📊', label: 'Gauge' },
                        { type: 'analogMeter', icon: '🧭', label: 'Analog' },
                        { type: 'temperatureGauge', icon: '🌡️', label: 'Temp Gauge' },
                        { type: 'humidityGauge', icon: '💧', label: 'Humidity' },
                        { type: 'graph', icon: '📈', label: 'Graph' },
                        { type: 'switch', icon: '💡', label: 'Switch' },
                        { type: 'indicator', icon: '🔴', label: 'Indicator' },
                        { type: 'card', icon: '🃏', label: 'Card' },
                        { type: 'slider', icon: '🎚️', label: 'Slider' },
                        { type: 'camera', icon: '📷', label: 'Camera' },
                        { type: 'numericDisplay', icon: '🔢', label: 'Numeric' },
                        { type: 'button', icon: '🖱️', label: 'Button' },
                        { type: 'statusArray', icon: '📶', label: 'Status' },
                        { type: 'gps', icon: '🗺️', label: 'GPS' },
                        { type: 'multiChannelChart', icon: '📉', label: 'Multi-Chart' },
                        { type: 'donutChart', icon: '🍩', label: 'Donut' },
                      ].map(w => (
                        <label key={w.type} className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
                          <input type="radio" name="widgetType" value={w.type} className="text-cyan-500" />
                          <span>{w.icon}</span>
                          <span className="text-white text-sm">{w.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Data Source</label>
                    <input type="text" placeholder="e.g., temperature, humidity, power" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Min Value</label>
                      <input type="number" defaultValue="0" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Max Value</label>
                      <input type="number" defaultValue="100" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Unit</label>
                      <input type="text" placeholder="e.g., °C, %, W" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Color</label>
                      <div className="flex gap-2">
                        {['#f59e0b', '#06b6d4', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                          <button key={c} type="button" className="w-8 h-8 rounded-lg" style={{ backgroundColor: c }}></button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Threshold (optional)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Low threshold" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                      <input type="number" placeholder="High threshold" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                    </div>
                  </div>
                </>
              )}
              {showCreateModal === 'pattern' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Pattern Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">URL Pattern</label>
                    <input type="text" placeholder="/api/sensor/{device_id}" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">HTTP Method</label>
                    <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(null)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Developer;
