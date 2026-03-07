import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { devicesAPI } from '../services/api';

const DeviceConnectivity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mqtt');
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    fetchDevice();
  }, [id]);

  const fetchDevice = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const response = await devicesAPI.get(id);
        if (response.data?.success) {
          setDevice(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Demo device data for when no device is selected
  const demoDevice = {
    id: id || '1',
    name: 'Living Room Sensor',
    device_uuid: 'ESP32-001',
    mqtt_username: 'DEV-ESP32-001',
    mqtt_password: 'mqtt_secure_password_123',
    mqtt_broker: 'mqtt.s6s-iot.com',
    mqtt_port: 1883,
    mqtt_tls_port: 8883,
    http_endpoint: 'https://api.s6s-iot.com/v1/devices/ESP32-001',
    websocket_endpoint: 'wss://ws.s6s-iot.com',
    status: 'online',
    firmware_version: '1.2.0',
  };

  const displayDevice = device || demoDevice;

  const mqttTopics = {
    subscribe: [
      `s6siot/${displayDevice.device_uuid}/sensor/+/data`,
      `s6siot/${displayDevice.device_uuid}/status`,
      `s6siot/${displayDevice.device_uuid}/config`,
    ],
    publish: [
      `s6siot/${displayDevice.device_uuid}/sensor/temperature`,
      `s6siot/${displayDevice.device_uuid}/sensor/humidity`,
      `s6siot/${displayDevice.device_uuid}/control/#`,
    ],
  };

  const jsonExamples = {
    sensorData: JSON.stringify({
      device_id: displayDevice.device_uuid,
      sensors: [
        { name: "temperature", value: 24.5, unit: "°C", timestamp: "2026-03-07T12:00:00Z" },
        { name: "humidity", value: 65, unit: "%", timestamp: "2026-03-07T12:00:00Z" }
      ]
    }, null, 2),
    controlCommand: JSON.stringify({
      command: "set",
      target: "relay",
      value: true
    }, null, 2),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-cyan-400 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>🔌</span>
            Device Connectivity
          </h1>
          <p className="text-slate-400 mt-1">
            Connection credentials and protocols for {displayDevice.name}
          </p>
        </div>
        <button
          onClick={() => navigate(`/devices/${displayDevice.id}`)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Device
        </button>
      </div>

      {/* Device Info */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
              📱
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{displayDevice.name}</h2>
              <p className="text-sm text-slate-400">UUID: {displayDevice.device_uuid}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
            {displayDevice.status}
          </span>
        </div>
      </div>

      {/* Protocol Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-4 overflow-x-auto">
        {[
          { id: 'mqtt', label: 'MQTT', icon: '📡' },
          { id: 'http', label: 'REST API', icon: '🌐' },
          { id: 'websocket', label: 'WebSocket', icon: '🔗' },
          { id: 'lorawan', label: 'LoRaWAN', icon: '📶' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* MQTT Tab */}
      {activeTab === 'mqtt' && (
        <div className="space-y-6">
          {/* Connection Credentials */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
              MQTT Connection
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Broker Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${displayDevice.mqtt_broker}:${displayDevice.mqtt_port}`}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(`${displayDevice.mqtt_broker}:${displayDevice.mqtt_port}`)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">TLS Port</label>
                <input
                  type="text"
                  value={displayDevice.mqtt_tls_port}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayDevice.mqtt_username}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(displayDevice.mqtt_username)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                <div className="flex gap-2">
                  <input
                    type={showCredentials ? "text" : "password"}
                    value={displayDevice.mqtt_password}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    {showCredentials ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(displayDevice.mqtt_password)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MQTT Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subscribe Topics</h3>
              <div className="space-y-3">
                {mqttTopics.subscribe.map((topic, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={topic}
                      readOnly
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-green-400 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(topic)}
                      className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Publish Topics</h3>
              <div className="space-y-3">
                {mqttTopics.publish.map((topic, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={topic}
                      readOnly
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-yellow-400 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(topic)}
                      className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JSON Example */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Publish Sensor Data Example</h3>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-green-400 font-mono">
              {jsonExamples.sensorData}
            </pre>
          </div>
        </div>
      )}

      {/* HTTP Tab */}
      {activeTab === 'http' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              REST API Endpoint
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">HTTP Endpoint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayDevice.http_endpoint}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(displayDevice.http_endpoint)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">HTTP Method</label>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-mono">POST</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Headers</label>
                <pre className="bg-slate-950 p-4 rounded-lg text-sm text-slate-300 font-mono">
{`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                </pre>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Request Body</label>
                <pre className="bg-slate-950 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
                  {jsonExamples.sensorData}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WebSocket Tab */}
      {activeTab === 'websocket' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              WebSocket Connection
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">WebSocket URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayDevice.websocket_endpoint}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(displayDevice.websocket_endpoint)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Connection Message</label>
                <pre className="bg-slate-950 p-4 rounded-lg text-sm text-yellow-400 font-mono">
{`{
  "action": "subscribe",
  "device_id": "${displayDevice.device_uuid}",
  "sensors": ["temperature", "humidity"]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LoRaWAN Tab */}
      {activeTab === 'lorawan' && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            LoRaWAN Configuration
          </h3>
          <p className="text-slate-400 mb-4">
            Configure your device for LoRaWAN connectivity. Contact support for gateway setup.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Device EUI</label>
              <input
                type="text"
                value={displayDevice.device_uuid.toUpperCase().replace('-', '').padEnd(16, '0')}
                readOnly
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">App EUI</label>
              <input
                type="text"
                value="70B3D57ED8000001"
                readOnly
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lgono text-sm"
 text-white font-m              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceConnectivity;
