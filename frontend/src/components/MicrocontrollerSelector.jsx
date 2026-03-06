import { useState, useEffect } from 'react';
import { devicesAPI } from '../services/api';

const MicrocontrollerSelector = ({ onSelect, onClose }) => {
  const [microcontrollers, setMicrocontrollers] = useState([]);
  const [manufacturers, setManufacturers] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedMc, setSelectedMc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firmwareGenerating, setFirmwareGenerating] = useState(false);
  const [generatedFirmware, setGeneratedFirmware] = useState(null);

  useEffect(() => {
    loadMicrocontrollers();
  }, [filter]);

  const loadMicrocontrollers = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getMicrocontrollers(filter);
      if (filter === 'manufacturer') {
        setManufacturers(response.data.data);
        setMicrocontrollers([]);
      } else {
        setMicrocontrollers(response.data.data);
        setManufacturers({});
      }
    } catch (error) {
      console.error('Failed to load microcontrollers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMc = async (mc) => {
    try {
      const response = await devicesAPI.getMicrocontroller(mc.slug);
      setSelectedMc(response.data.data);
    } catch (error) {
      console.error('Failed to get microcontroller details:', error);
    }
  };

  const handleGenerateFirmware = async (sensors) => {
    try {
      setFirmwareGenerating(true);
      const response = await devicesAPI.generateFirmware(selectedMc.slug, {
        sensors,
        mqttServer: 'mqtt.example.com',
      });
      setGeneratedFirmware(response.data.data);
    } catch (error) {
      console.error('Failed to generate firmware:', error);
    } finally {
      setFirmwareGenerating(false);
    }
  };

  const handleDownloadFirmware = () => {
    if (!selectedMc || !generatedFirmware) return;
    
    const blob = new Blob([generatedFirmware.firmware], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `s6s_firmware_${selectedMc.slug}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedMc ? selectedMc.name : 'Select Microcontroller'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {!selectedMc ? (
            <>
              {/* Filters */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'wifi', label: 'WiFi' },
                    { value: 'bluetooth', label: 'Bluetooth' },
                    { value: 'manufacturer', label: 'By Manufacturer' },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === f.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Microcontroller Grid */}
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                ) : filter === 'manufacturer' ? (
                  <div className="space-y-6">
                    {Object.entries(manufacturers).map(([manufacturer, mcs]) => (
                      <div key={manufacturer}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{manufacturer}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {mcs.map((mc) => (
                            <button
                              key={mc.slug}
                              onClick={() => handleSelectMc(mc)}
                              className="p-3 text-left border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{mc.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {mc.cores} Core • {mc.frequency}
                              </div>
                              <div className="flex gap-1 mt-2">
                                {mc.wifi && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">WiFi</span>}
                                {mc.bluetooth && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">BLE</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {microcontrollers.map((mc) => (
                      <button
                        key={mc.slug}
                        onClick={() => handleSelectMc(mc)}
                        className="p-4 text-left border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <div className="font-semibold text-gray-900">{mc.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{mc.manufacturer}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          {mc.cores} Core • {mc.frequency}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mc.wifi && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">WiFi</span>}
                          {mc.bluetooth && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">BLE</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Selected Microcontroller Details */
            <div className="p-4">
              <button
                onClick={() => {
                  setSelectedMc(null);
                  setGeneratedFirmware(null);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Manufacturer</span>
                      <span className="font-medium">{selectedMc.manufacturer}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Architecture</span>
                      <span className="font-medium">{selectedMc.architecture}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Cores</span>
                      <span className="font-medium">{selectedMc.cores}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Frequency</span>
                      <span className="font-medium">{selectedMc.frequency}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Flash</span>
                      <span className="font-medium">{selectedMc.flash}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">RAM</span>
                      <span className="font-medium">{selectedMc.ram}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Voltage</span>
                      <span className="font-medium">{selectedMc.voltage}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Connectivity</span>
                      <div className="flex gap-2">
                        {selectedMc.wifi && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">WiFi</span>}
                        {selectedMc.bluetooth && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">BLE</span>}
                        {!selectedMc.wifi && !selectedMc.bluetooth && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">None</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Programming Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMc.programmingLanguages.map((lang) => (
                        <span key={lang} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Firmware Generation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Firmware</h3>
                  {generatedFirmware ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Firmware Generated!
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Programming: {generatedFirmware.programmingLanguage}
                        </p>
                      </div>
                      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-auto max-h-64">
                        {generatedFirmware.firmware.substring(0, 1000)}...
                      </pre>
                      <button
                        onClick={handleDownloadFirmware}
                        className="w-full btn btn-primary"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Firmware
                      </button>
                      <button
                        onClick={() => setGeneratedFirmware(null)}
                        className="w-full btn btn-secondary"
                      >
                        Generate New
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Generate ready-to-use firmware code for your {selectedMc.name}. 
                        The firmware will include MQTT connectivity to the S6S IoT platform.
                      </p>
                      <button
                        onClick={() => handleGenerateFirmware([
                          { name: 'Temperature', identifier: 'temperature', pin: 34 },
                          { name: 'Humidity', identifier: 'humidity', pin: 35 },
                        ])}
                        disabled={firmwareGenerating}
                        className="w-full btn btn-primary"
                      >
                        {firmwareGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Generate Firmware
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrocontrollerSelector;
