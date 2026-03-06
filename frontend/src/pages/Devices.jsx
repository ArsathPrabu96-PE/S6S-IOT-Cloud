import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { devicesAPI } from '../services/api';
import { useDeviceStore } from '../context/store';
import wsService from '../services/websocket';
import { format } from 'date-fns';
import MicrocontrollerSelector from '../components/MicrocontrollerSelector';
import { DEVICE_TYPES } from '../data/deviceTypes';

const Devices = () => {
  const { devices, pagination, setDevices, setLoading } = useDeviceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMcSelector, setShowMcSelector] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState(DEVICE_TYPES);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deviceTypeId: '',
    locationName: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadDevices();
    
    // Listen for real-time status updates
    wsService.on('device_status', handleDeviceStatusUpdate);
    
    return () => {
      wsService.off('device_status');
    };
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const response = await devicesAPI.list({ limit: 50 });
      setDevices(response.data.data, response.data.pagination);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMicrocontrollers = async () => {
    try {
      // Load all microcontrollers as device types
      const response = await devicesAPI.getMicrocontrollers('all');
      // Transform microcontrollers to device types format
      const mcTypes = response.data.data.map(mc => ({
        id: mc.slug,
        name: mc.name,
        manufacturer: mc.manufacturer,
      }));
      setDeviceTypes(mcTypes);
    } catch (error) {
      console.error('Failed to load microcontrollers:', error);
    }
  };

  const handleDeviceStatusUpdate = (data) => {
    setDevices(
      devices.map((d) =>
        d.id === data.deviceId ? { ...d, status: data.status } : d
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await devicesAPI.create(formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        deviceTypeId: '',
        locationName: '',
        latitude: '',
        longitude: '',
      });
      loadDevices();
    } catch (error) {
      console.error('Failed to create device:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-500">Manage your IoT devices</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMcSelector(true)}
            className="btn btn-secondary"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Get Firmware
            </span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Device
            </span>
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : devices.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No devices yet</h3>
          <p className="text-gray-500 mb-6">Add your first device to start monitoring</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Add Your First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Device</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Device Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My ESP32 Sensor"
                  required
                />
              </div>
              <div>
                <label className="label">Device Type</label>
                <select
                  className="input"
                  value={formData.deviceTypeId}
                  onChange={(e) => setFormData({ ...formData, deviceTypeId: e.target.value })}
                >
                  <option value="">Select type...</option>
                  {deviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} {type.manufacturer ? `(${type.manufacturer})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="Living Room"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-74.0060"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Create Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Microcontroller Selector Modal */}
      {showMcSelector && (
        <MicrocontrollerSelector
          onSelect={(mc) => {
            console.log('Selected microcontroller:', mc);
            setShowMcSelector(false);
          }}
          onClose={() => setShowMcSelector(false)}
        />
      )}
    </div>
  );
};

// Device Card Component
const DeviceCard = ({ device }) => {
  return (
    <Link to={`/devices/${device.id}`} className="card card-hover p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full status-${device.status}`}></div>
          <div>
            <h3 className="font-semibold text-gray-900">{device.name}</h3>
            <p className="text-xs text-gray-500 font-mono">{device.device_uuid}</p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
          {device.device_type_name || 'Unknown'}
        </span>
      </div>

      {device.location_name && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {device.location_name}
        </div>
      )}

      {/* Sensors preview */}
      {device.sensors?.length > 0 && (
        <div className="space-y-2">
          {device.sensors.slice(0, 3).map((sensor) => (
            <div key={sensor.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{sensor.name}</span>
              <span className="font-medium">
                {sensor.last_value?.toFixed(1) ?? '--'} {sensor.unit}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Last seen: {device.last_seen_at ? format(new Date(device.last_seen_at), 'MMM d, HH:mm') : 'Never'}</span>
        <span className={`capitalize ${device.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
          {device.status}
        </span>
      </div>
    </Link>
  );
};

export default Devices;
