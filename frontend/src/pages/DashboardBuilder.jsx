import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

// Widget types available in the builder
const WIDGET_TYPES = [
  { id: 'value', name: 'Value Display', icon: '📊', category: 'display' },
  { id: 'gauge', name: 'Gauge', icon: '🎯', category: 'display' },
  { id: 'line_chart', name: 'Line Chart', icon: '📈', category: 'chart' },
  { id: 'bar_chart', name: 'Bar Chart', icon: '📉', category: 'chart' },
  { id: 'switch', name: 'Switch', icon: '🔘', category: 'control' },
  { id: 'slider', name: 'Slider', icon: '🎚️', category: 'control' },
  { id: 'status', name: 'Status LED', icon: '💡', category: 'status' },
  { id: 'map', name: 'Map', icon: '🗺️', category: 'display' },
  { id: 'table', name: 'Data Table', icon: '📋', category: 'display' },
  { id: 'alarm', name: 'Alarm Panel', icon: '🔔', category: 'status' },
];

// Default widget configurations
const getDefaultConfig = (type) => {
  const configs = {
    value: { title: 'Value', color: '#06b6d4', unit: '', decimals: 1 },
    gauge: { title: 'Gauge', min: 0, max: 100, color: '#10b981', unit: '' },
    line_chart: { title: 'Line Chart', color: '#8b5cf6', height: 200 },
    bar_chart: { title: 'Bar Chart', color: '#f59e0b', height: 200 },
    switch: { title: 'Switch', color: '#10b981' },
    slider: { title: 'Slider', min: 0, max: 100, color: '#06b6d4' },
    status: { title: 'Status', color: '#10b981', label: 'ON' },
    map: { title: 'Map', height: 200 },
    table: { title: 'Table', columns: 3 },
    alarm: { title: 'Alarms', maxItems: 5 },
  };
  return configs[type] || {};
};

const DashboardBuilder = () => {
  const navigate = useNavigate();
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [widgets, setWidgets] = useState(() => {
    // Load saved dashboard from localStorage on mount
    try {
      const saved = localStorage.getItem('saved_dashboard');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.widgets && Array.isArray(parsed.widgets)) {
          return parsed.widgets;
        }
      }
    } catch (e) {
      console.error('Failed to load saved dashboard:', e);
    }
    return [];
  });
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false, widget: null });
  const gridRef = useRef(null);

  // Sample devices for widget binding
  const sampleDevices = [
    { id: '1', name: 'Living Room', sensors: [{ id: 's1', name: 'Temperature', unit: '°C' }, { id: 's2', name: 'Humidity', unit: '%' }] },
    { id: '2', name: 'Garden', sensors: [{ id: 's3', name: 'Soil Moisture', unit: '%' }] },
  ];

  const handleDragStart = (e, widgetType) => {
    setDraggedWidget(widgetType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedWidget) return;

    const rect = gridRef.current?.getBoundingClientRect();
    const x = rect ? Math.floor((e.clientX - rect.left) / 100) : 0;
    const y = rect ? Math.floor((e.clientY - rect.top) / 100) : 0;

    const newWidget = {
      id: Date.now().toString(),
      type: draggedWidget.id,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: draggedWidget.category === 'chart' ? 2 : 1,
      height: draggedWidget.category === 'chart' ? 2 : 1,
      config: getDefaultConfig(draggedWidget.id),
      deviceId: '',
      sensorId: '',
    };

    setWidgets([...widgets, newWidget]);
    setDraggedWidget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const updateWidget = (id, updates) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setSelectedWidget(null);
  };

  // Delete dialog handlers
  const showDeleteDialog = (widget) => {
    setDeleteDialogState({ isOpen: true, widget });
  };

  const executeDelete = () => {
    if (deleteDialogState.widget) {
      const updatedWidgets = widgets.filter(w => w.id !== deleteDialogState.widget.id);
      setWidgets(updatedWidgets);
      setSelectedWidget(null);
      // Persist to localStorage
      const dashboard = { name: dashboardName, widgets: updatedWidgets };
      localStorage.setItem('saved_dashboard', JSON.stringify(dashboard));
    }
    setDeleteDialogState({ isOpen: false, widget: null });
  };

  const cancelDelete = () => {
    setDeleteDialogState({ isOpen: false, widget: null });
  };

  const handleSave = () => {
    // Save dashboard to backend or local storage
    const dashboard = { name: dashboardName, widgets };
    localStorage.setItem('saved_dashboard', JSON.stringify(dashboard));
    alert('Dashboard saved!');
  };

  const renderWidget = (widget) => {
    const baseClass = "bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4 overflow-hidden";
    
    switch (widget.type) {
      case 'value':
        return (
          <div className={baseClass}>
            <h4 className="text-slate-400 text-sm font-medium mb-2">{widget.config.title}</h4>
            <p className="text-3xl font-bold text-white" style={{ color: widget.config.color }}>
              --.{widget.config.unit}
            </p>
          </div>
        );
      case 'gauge':
        return (
          <div className={baseClass}>
            <h4 className="text-slate-400 text-sm font-medium mb-2">{widget.config.title}</h4>
            <div className="h-24 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-slate-700 border-t-cyan-500 rotate-45"></div>
            </div>
          </div>
        );
      case 'line_chart':
        return (
          <div className={baseClass}>
            <h4 className="text-slate-400 text-sm font-medium mb-2">{widget.config.title}</h4>
            <div className="h-32 bg-slate-700/30 rounded flex items-center justify-center text-slate-500">
              📈 Chart Preview
            </div>
          </div>
        );
      case 'bar_chart':
        return (
          <div className={baseClass}>
            <h4 className="text-slate-400 text-sm font-medium mb-2">{widget.config.title}</h4>
            <div className="h-32 flex items-end gap-1">
              {[40, 65, 45, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-500 rounded-t" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        );
      case 'switch':
        return (
          <div className={baseClass}>
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{widget.config.title}</span>
              <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </div>
            </div>
          </div>
        );
      case 'slider':
        return (
          <div className={baseClass}>
            <h4 className="text-slate-400 text-sm font-medium mb-2">{widget.config.title}</h4>
            <input type="range" className="w-full" disabled />
          </div>
        );
      case 'status':
        return (
          <div className={baseClass}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-500"></div>
              <span className="text-white font-medium">{widget.config.title}</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={baseClass}>
            <h4 className="text-slate-400 text-sm font-medium">{widget.config.title}</h4>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>🎨</span>
            Dashboard Builder
          </h1>
          <p className="text-slate-400 mt-1">
            Drag and drop widgets to create your custom dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {isEditMode ? 'Done Editing' : 'Edit Dashboard'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            Save Dashboard
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Widget Palette */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-white font-semibold mb-4">Widgets</h3>
            <div className="space-y-2">
              {WIDGET_TYPES.map((widget) => (
                <div
                  key={widget.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, widget)}
                  className={`p-3 bg-slate-700/30 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                    isEditMode ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl">{widget.icon}</span>
                  <span className="text-white text-sm">{widget.name}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedWidget && isEditMode && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-white font-semibold mb-4">Widget Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedWidget.config.title}
                    onChange={(e) => {
                      const config = { ...selectedWidget.config, title: e.target.value };
                      updateWidget(selectedWidget.id, { config });
                    }}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Device</label>
                  <select
                    value={selectedWidget.deviceId}
                    onChange={(e) => updateWidget(selectedWidget.id, { deviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value="">Select Device</option>
                    {sampleDevices.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {selectedWidget.deviceId && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sensor</label>
                    <select
                      value={selectedWidget.sensorId}
                      onChange={(e) => updateWidget(selectedWidget.id, { sensorId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
                    >
                      <option value="">Select Sensor</option>
                      {sampleDevices.find(d => d.id === selectedWidget.deviceId)?.sensors.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={() => showDeleteDialog(selectedWidget)}
                  className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-sm transition-colors"
                >
                  Delete Widget
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1">
          <div
            ref={gridRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`min-h-[600px] bg-slate-800/30 rounded-xl border-2 border-dashed ${
              isEditMode ? 'border-slate-600' : 'border-transparent'
            } p-4 relative`}
          >
            {!isEditMode && widgets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">Click "Edit Dashboard" to start building</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  onClick={() => isEditMode && setSelectedWidget(widget)}
                  className={`${
                    widget.width === 2 ? 'col-span-2' : 'col-span-1'
                  } ${widget.height === 2 ? 'row-span-2' : ''} ${
                    selectedWidget?.id === widget.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                >
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogState.isOpen}
        title="Delete Widget"
        message={`Are you sure you want to delete the widget "${deleteDialogState.widget?.config?.title}"? This action cannot be undone.`}
        itemName={deleteDialogState.widget?.config?.title}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DashboardBuilder;
