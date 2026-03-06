import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ComposedChart, Scatter
} from 'recharts';
import { devicesAPI } from '../services/api';
import { useDeviceStore, useAuthStore, useAlertStore } from '../context/store';
import wsService from '../services/websocket';
import { format, formatDistanceToNow } from 'date-fns';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to generate time series data (for future use when user adds devices)
function generateTimeSeries(points, min, max) {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(now.getTime() - (points - 1 - i) * 300000),
    value: min + Math.random() * (max - min),
  }));
}

// ============================================
// WIDGET COMPONENTS
// ============================================

// Value Display Widget (ThingsBoard-style)
const ValueWidget = ({ title, value, unit, icon, color, trend, size = 'normal' }) => {
  const isLarge = size === 'large';
  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 ${isLarge ? 'p-5' : 'p-4'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <span className={`${isLarge ? 'text-3xl' : 'text-2xl'} group-hover:scale-110 transition-transform`}>{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`${isLarge ? 'text-4xl' : 'text-3xl'} font-bold text-white`} style={{ color, textShadow: `0 0 30px ${color}60` }}>{value}</span>
        {unit && <span className="text-slate-400 mb-1">{unit}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{trend > 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}%</span>
          <span className="text-slate-500">vs last hour</span>
        </div>
      )}
    </div>
  );
};

// Gauge Widget (Circular)
const GaugeWidget = ({ title, value, unit, min, max, color, size = 'normal' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 ${size === 'large' ? 'p-6' : 'p-4'}`}>
      <h4 className="text-slate-400 text-sm font-medium mb-4">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
            <circle
              cx="64" cy="64" r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-xs text-slate-400">{unit}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Chart Widget (Line/Area)
const ChartWidget = ({ title, data, dataKey, color, type = 'area', height = 200, unit = '' }) => {
  // Safe date formatter that handles invalid dates
  const safeFormat = (value) => {
    try {
      if (!value) return '';
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  // Filter out invalid data points
  const validData = Array.isArray(data) ? data.filter(item => item && item.value !== undefined && item.value !== null) : [];

  // If no valid data, show placeholder
  if (validData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white">{title}</h4>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-slate-400">Live</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tickFormatter={safeFormat} stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tickFormatter={safeFormat} stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <AreaChart data={validData}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tickFormatter={safeFormat} stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(val) => [`${val?.toFixed?.(1) ?? val} ${unit}`, title]} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${title})`} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Switch Control Widget
const SwitchWidget = ({ title, icon, active, onChange, activeColor = 'bg-cyan-500', disabled = false }) => {
  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4 ${!disabled ? 'hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20' : 'opacity-50'} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-white font-medium">{title}</p>
            <p className="text-xs text-slate-400">{active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        <button
          onClick={() => !disabled && onChange()}
          disabled={disabled}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 ${active ? activeColor : 'bg-slate-700'} ${!disabled && 'cursor-pointer hover:scale-105'}`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${active ? 'left-8' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
};

// Slider Control Widget
const SliderWidget = ({ title, icon, value, min, max, unit, onChange, color = '#06b6d4' }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-white font-medium">{title}</span>
        </div>
        <span className="text-cyan-400 font-bold" style={{ textShadow: `0 0 10px ${color}` }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #334155 ${((value - min) / (max - min)) * 100}%, #334155 100%)`,
        }}
      />
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

// Alarm Card Widget
const AlarmWidget = ({ alert }) => {
  const severityColors = {
    critical: { bg: 'from-red-900/30', border: 'border-red-500', icon: '🔴', text: 'text-red-400' },
    warning: { bg: 'from-yellow-900/30', border: 'border-yellow-500', icon: '🟡', text: 'text-yellow-400' },
    info: { bg: 'from-blue-900/30', border: 'border-blue-500', icon: '🔵', text: 'text-blue-400' },
  };
  const style = severityColors[alert.severity] || severityColors.info;
  
  return (
    <div className={`bg-gradient-to-r ${style.bg} to-transparent rounded-lg p-3 border-l-4 ${style.border} hover:bg-opacity-40 transition-colors cursor-pointer`}>
      <div className="flex items-start gap-3">
        <span className={`${style.text} text-xl`}>{style.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{alert.title}</p>
          <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs ${style.text} flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
              {alert.severity}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">{alert.deviceName}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Table Widget
const DataTableWidget = ({ title, columns, data, onRowClick }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.map((row, i) => (
              <tr key={i} onClick={() => onRowClick && onRowClick(row)} className="hover:bg-slate-700/30 transition-colors cursor-pointer">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-slate-300">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Progress Ring Widget
const ProgressRingWidget = ({ title, value, max, unit, color = '#06b6d4', size = 'normal' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isLarge = size === 'large';
  const radius = isLarge ? 50 : 36;
  const strokeWidth = isLarge ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 ${isLarge ? 'p-5' : 'p-4'}`}>
      <h4 className="text-slate-400 text-sm font-medium mb-3">{title}</h4>
      <div className="flex items-center justify-center">
        <div className={`relative ${isLarge ? 'w-32 h-32' : 'w-24 h-24'}`}>
          <svg className="w-full h-full transform -rotate-90">
            <circle cx={isLarge ? 64 : 48} cy={isLarge ? 64 : 48} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" />
            <circle
              cx={isLarge ? 64 : 48}
              cy={isLarge ? 64 : 48}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold text-white ${isLarge ? 'text-2xl' : 'text-xl'}`}>{value}{unit}</span>
            <span className="text-xs text-slate-400">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Battery Widget
const BatteryWidget = ({ title, level, charging = false, color = '#10b981' }) => {
  const getBatteryColor = () => {
    if (level > 60) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const batteryColor = color || getBatteryColor();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <span className="text-xl">🔋</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-8 border-2 border-slate-600 rounded-lg p-1">
          <div 
            className="h-full rounded transition-all duration-500"
            style={{ 
              width: `${level}%`, 
              backgroundColor: batteryColor,
              boxShadow: `0 0 10px ${batteryColor}60`
            }}
          />
          {charging && (
            <span className="absolute inset-0 flex items-center justify-center text-xs">⚡</span>
          )}
        </div>
        <div className="w-1 h-4 bg-slate-600 rounded-r" />
        <span className="text-2xl font-bold" style={{ color: batteryColor }}>{level}%</span>
      </div>
    </div>
  );
};

// Timeline Widget
const TimelineWidget = ({ title, items }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <h4 className="font-semibold text-white mb-4">{title}</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || '#06b6d4', boxShadow: `0 0 8px ${item.color || '#06b6d4'}` }}
              />
              {index < items.length - 1 && <div className="w-0.5 h-full bg-slate-700 mt-1" />}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm text-white">{item.title}</p>
              <p className="text-xs text-slate-400">{item.description}</p>
              <p className="text-xs text-slate-500 mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// LED Indicator Widget
const LEDIndicatorWidget = ({ title, status, labelOn = 'ON', labelOff = 'OFF' }) => {
  const isOn = status === true || status === 'on' || status === 'active';
  const ledColor = isOn ? '#10b981' : '#6b7280';

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 rounded-full transition-all duration-300 ${isOn ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: ledColor,
              boxShadow: isOn ? `0 0 12px ${ledColor}` : 'none'
            }}
          />
          <span className={`text-sm font-medium ${isOn ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isOn ? labelOn : labelOff}
          </span>
        </div>
      </div>
    </div>
  );
};

// Weather Widget
const WeatherWidget = ({ title, temperature, humidity, condition, icon = '🌤️' }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold text-white">{temperature}°C</span>
        <p className="text-sm text-slate-400 mt-1">{condition}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-700/30 rounded-lg p-2 text-center">
          <span className="text-lg">💧</span>
          <p className="text-xs text-slate-400">Humidity</p>
          <p className="text-sm font-semibold text-white">{humidity}%</p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-2 text-center">
          <span className="text-lg">🌡️</span>
          <p className="text-xs text-slate-400">Feels Like</p>
          <p className="text-sm font-semibold text-white">{temperature + 2}°C</p>
        </div>
      </div>
    </div>
  );
};

// Map Widget (placeholder)
const MapWidget = ({ title, devices }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white">{title}</h4>
        <span className="text-xl">🗺️</span>
      </div>
      <div className="relative h-48 bg-slate-700/30 rounded-lg overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        {/* Device markers */}
        {devices?.slice(0, 5).map((device, index) => {
          const positions = [
            { top: '30%', left: '40%' },
            { top: '50%', left: '60%' },
            { top: '70%', left: '30%' },
            { top: '40%', left: '70%' },
            { top: '60%', left: '50%' },
          ];
          return (
            <div
              key={device.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={positions[index] || positions[0]}
            >
              <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} style={{ boxShadow: device.status === 'online' ? '0 0 10px #10b981' : 'none' }} />
            </div>
          );
        })}
        <div className="absolute bottom-2 right-2 flex gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Online</span>
          <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 bg-slate-500 rounded-full" /> Offline</span>
        </div>
      </div>
    </div>
  );
};

// List Widget
const ListWidget = ({ title, items, icon }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-xl">{icon}</span>}
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-2">
              {item.icon && <span>{item.icon}</span>}
              <span className="text-sm text-slate-300">{item.label}</span>
            </div>
            <span className="text-sm font-medium" style={{ color: item.color || '#06b6d4' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Widget (simple card)
const CardWidget = ({ title, content, icon, action }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-white">
        {content}
      </div>
      {action && (
        <button className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
};

// Temperature Gauge Widget (Arc gauge)
const TemperatureGaugeWidget = ({ title, value, unit = '°C', min = -20, max = 50, color }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180;
  const getColor = () => {
    if (value < 10) return '#3b82f6'; // Cold - blue
    if (value < 25) return '#10b981'; // Normal - green
    if (value < 35) return '#f59e0b'; // Warm - yellow
    return '#ef4444'; // Hot - red
  };
  const gaugeColor = color || getColor();
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <h4 className="text-slate-400 text-sm font-medium mb-2">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-24">
          <svg viewBox="0 0 120 70" className="w-full h-full">
            {/* Background arc */}
            <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            {/* Colored arc */}
            <path 
              d="M 10 60 A 50 50 0 0 1 110 60" 
              fill="none" 
              stroke={gaugeColor} 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 157} 157`}
              style={{ filter: `drop-shadow(0 0 6px ${gaugeColor})` }}
            />
            {/* Temperature zones */}
            <circle cx="10" cy="60" r="4" fill="#3b82f6" />
            <circle cx="60" cy="10" r="4" fill="#10b981" />
            <circle cx="110" cy="60" r="4" fill="#ef4444" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
            <span className="text-3xl font-bold" style={{ color: gaugeColor, textShadow: `0 0 20px ${gaugeColor}60` }}>
              {value}{unit}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{min}°</span>
        <span>{max}°</span>
      </div>
    </div>
  );
};

// Humidity Gauge Widget
const HumidityGaugeWidget = ({ title, value, unit = '%', min = 0, max = 100, color = '#06b6d4' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <h4 className="text-slate-400 text-sm font-medium mb-2">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="50" stroke="#1e293b" strokeWidth="10" fill="none" />
            <circle
              cx="64" cy="64" r="50"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 314} 314`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
            {/* Water drops */}
            <text x="64" y="55" textAnchor="middle" fill={color} fontSize="32" fontWeight="bold">💧</text>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
            <span className="text-2xl font-bold text-white">{value}{unit}</span>
            <span className="text-xs text-slate-400">Humidity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Camera/Image Widget
const CameraWidget = ({ title, src, alt = 'Camera Feed', offline = false }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <span>📹</span>
          {title}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${offline ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {offline ? 'Offline' : 'Live'}
        </span>
      </div>
      <div className="relative h-48 bg-slate-950">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">📷</span>
              <p className="text-slate-400 text-sm mt-2">{offline ? 'Camera Offline' : 'No Feed'}</p>
            </div>
          </div>
        )}
        {/* Overlay controls */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
          <button className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs backdrop-blur-sm">⏸️ Pause</button>
          <button className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs backdrop-blur-sm">📷 Snapshot</button>
          <button className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs backdrop-blur-sm">⚙️ Settings</button>
        </div>
      </div>
    </div>
  );
};

// Numeric Display Widget
const NumericDisplayWidget = ({ title, value, unit, icon, color = '#06b6d4', decimals = 0 }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-white" style={{ color, textShadow: `0 0 30px ${color}60` }}>
          {typeof value === 'number' ? value.toFixed(decimals) : value}
        </span>
        {unit && <span className="text-slate-400 mb-1">{unit}</span>}
      </div>
    </div>
  );
};

// Button/Control Button Widget
const ButtonWidget = ({ title, icon, label, onClick, color = '#06b6d4', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${!disabled ? 'hover:border-cyan-500/50 hover:shadow-cyan-500/20' : ''}`}
      style={{ '--tw-shadow-color': color + '30' }}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div className="text-left">
          <p className="text-white font-medium">{title}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </button>
  );
};

// Status Indicator Array Widget
const StatusArrayWidget = ({ title, items }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        {title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1 p-2 bg-slate-700/30 rounded-lg">
            <div 
              className={`w-3 h-3 rounded-full ${item.status === 'online' ? 'bg-emerald-500 animate-pulse' : item.status === 'warning' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-500'}`}
              style={{ 
                boxShadow: item.status === 'online' ? '0 0 8px #10b981' : item.status === 'warning' ? '0 0 8px #f59e0b' : 'none' 
              }}
            />
            <span className="text-xs text-slate-400 truncate w-full text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// GPS/Location Widget
const GPSWidget = ({ title, latitude, longitude, speed, altitude }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span>📍</span>
        {title}
      </h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <span className="text-slate-400 text-sm">Latitude</span>
          <span className="text-white font-mono">{latitude?.toFixed(6) || '0.000000'}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
          <span className="text-slate-400 text-sm">Longitude</span>
          <span className="text-white font-mono">{longitude?.toFixed(6) || '0.000000'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
            <p className="text-xs text-slate-400">Speed</p>
            <p className="text-lg font-bold text-cyan-400">{speed || 0} <span className="text-xs">km/h</span></p>
          </div>
          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
            <p className="text-xs text-slate-400">Altitude</p>
            <p className="text-lg font-bold text-purple-400">{altitude || 0} <span className="text-xs">m</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Multi-Channel Chart Widget
const MultiChannelChartWidget = ({ title, channels, data, height = 200 }) => {
  const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white">{title}</h4>
        <div className="flex gap-2">
          {channels?.map((ch, i) => (
            <span key={i} className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-slate-400">{ch}</span>
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" tickFormatter={(v) => format(new Date(v), 'HH:mm')} stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          {channels?.map((ch, i) => (
            <Line 
              key={ch} 
              type="monotone" 
              dataKey={ch} 
              stroke={colors[i % colors.length]} 
              strokeWidth={2} 
              dot={false} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie/Donut Chart Widget
const DonutChartWidget = ({ title, data, colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 p-4">
      <h4 className="font-semibold text-white mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-slate-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Device Detail Panel
const DeviceDetailPanel = ({ device, onClose, onControlChange, onSliderChange, onDelete }) => {
  if (!device) return null;
  
  const isOnline = device.status === 'online';
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-700/50 overflow-y-auto animate-slide-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{device.name}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
          </div>
          
          {/* Device Status */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-800/50 rounded-xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{device.device_uuid}</p>
            </div>
          </div>
          
          {/* Device Info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-xs text-slate-400">Firmware</p>
              <p className="text-white font-medium">{device.firmware}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-xs text-slate-400">IP Address</p>
              <p className="text-white font-medium">{device.ip_address}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-xs text-slate-400">Location</p>
              <p className="text-white font-medium">{device.location}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-xs text-slate-400">Last Seen</p>
              <p className="text-white font-medium">{formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}</p>
            </div>
          </div>
          
          {/* Sensors */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Sensors</h3>
            <div className="space-y-2">
              {device.sensors.map((sensor) => (
                <div key={sensor.id} className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sensor.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{sensor.name}</p>
                      <p className="text-xs text-slate-400">{sensor.type}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold" style={{ color: sensor.color, textShadow: `0 0 15px ${sensor.color}60` }}>
                    {sensor.last_value}<span className="text-xs text-slate-400 ml-1">{sensor.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Controls</h3>
            <div className="space-y-3">
              {device.controls && Object.entries(device.controls).map(([key, value]) => {
                if (typeof value === 'boolean') {
                  const icons = { led: '💡', relay: '🔌', fan: '🌀', pump: '💧', irrigation: '🌱', gate: '🚪', alarm: '🔔', exhaust: '💨', light: '💡', ac: '❄️', dehumidifier: '💧' };
                  const colors = { led: 'bg-yellow-500', relay: 'bg-green-500', fan: 'bg-blue-500', pump: 'bg-cyan-500', irrigation: 'bg-purple-500', gate: 'bg-orange-500', alarm: 'bg-red-500', exhaust: 'bg-gray-500', light: 'bg-amber-500', ac: 'bg-cyan-500', dehumidifier: 'bg-blue-500' };
                  return (
                    <SwitchWidget
                      key={key}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                      icon={icons[key] || '⚙️'}
                      active={value}
                      activeColor={colors[key] || 'bg-cyan-500'}
                      onChange={() => onControlChange(key)}
                      disabled={!isOnline}
                    />
                  );
                }
                if (typeof value === 'number') {
                  const icons = { brightness: '💡', fanSpeed: '🌀', waterLevel: '💧', lightLevel: '💡' };
                  const sliderColors = { brightness: '#fbbf24', fanSpeed: '#3b82f6', waterLevel: '#06b6d4', lightLevel: '#fbbf24' };
                  return (
                    <SliderWidget
                      key={key}
                      title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      icon={icons[key] || '⚙️'}
                      value={value}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(val) => onSliderChange(key, val)}
                      color={sliderColors[key] || '#06b6d4'}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors">
              View History
            </button>
            <button className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
              Configure
            </button>
          </div>
          
          {/* Delete Button */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <button 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${device.name}"?`)) {
                  onDelete(device);
                  onClose();
                }
              }}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const Dashboard = () => {
  const { user } = useAuthStore();
  const { devices, deviceStats, setDevices, setDeviceStats } = useDeviceStore();
  const { alerts, addAlert } = useAlertStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceControls, setDeviceControls] = useState({});
  const [activeWidgetTab, setActiveWidgetTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  
  // Initialize device controls
  useEffect(() => {
    const controls = {};
    if (devices.length > 0) {
      devices.forEach(d => {
        controls[d.id] = d.controls || {};
      });
    }
    setDeviceControls(controls);
  }, [devices]);

  // Use actual store data
  const displayDevices = devices;
  const displayStats = deviceStats || { totalDevices: 0, onlineDevices: 0, offlineDevices: 0, totalSensors: 0, activeAlerts: 0, energyUsage: 0 };
  const displayAlerts = alerts;

  // Check if dashboard is empty
  const isDashboardEmpty = displayDevices.length === 0;

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Control handlers
  const handleDeviceControl = (deviceId, controlKey) => {
    setDeviceControls(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        [controlKey]: !prev[deviceId]?.[controlKey]
      }
    }));
  };

  const handleDeviceSlider = (deviceId, controlKey, value) => {
    setDeviceControls(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        [controlKey]: value
      }
    }));
  };

  // Delete device handler
  const handleDeleteDevice = async (device, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (window.confirm(`Are you sure you want to delete "${device.name}"?`)) {
      try {
        await devicesAPI.delete(device.id);
        // Refresh devices after delete
        const response = await devicesAPI.list({ page: 1, limit: 10 });
        setDevices(response.data?.data || response.data || [], response.data?.pagination || { page: 1, limit: 10, total: 0 });
        alert(`${device.name} has been deleted`);
      } catch (error) {
        console.error('Failed to delete device:', error);
        alert('Failed to delete device. Please try again.');
      }
    }
  };

  // Active alerts
  const activeAlerts = displayAlerts.filter(a => a.status === 'triggered');
  
  // Energy data
  const energyData = [
    { day: 'Mon', consumption: 120, cost: 2.4 },
    { day: 'Tue', consumption: 145, cost: 2.9 },
    { day: 'Wed', consumption: 132, cost: 2.6 },
    { day: 'Thu', consumption: 156, cost: 3.1 },
    { day: 'Fri', consumption: 148, cost: 3.0 },
    { day: 'Sat', consumption: 165, cost: 3.3 },
    { day: 'Sun', consumption: 158, cost: 3.2 },
  ];

  // Device status pie data
  const statusPieData = [
    { name: 'Online', value: displayStats.onlineDevices, color: '#10b981' },
    { name: 'Offline', value: displayStats.offlineDevices, color: '#6b7280' },
  ];

  // Health percentage
  const healthPercentage = Math.round((displayStats.onlineDevices / displayStats.totalDevices) * 100);

  // Table columns
  const deviceColumns = [
    { key: 'name', header: 'Device', render: (val, row) => <span className="font-medium text-white">{val}</span> },
    { key: 'device_uuid', header: 'UUID' },
    { key: 'device_type_name', header: 'Type' },
    { key: 'status', header: 'Status', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
        {val}
      </span>
    )},
    { key: 'sensors', header: 'Sensors', render: (val) => <span className="text-slate-400">{val?.length || 0}</span> },
    { key: 'last_seen_at', header: 'Last Seen', render: (val) => <span className="text-slate-400">{formatDistanceToNow(new Date(val), { addSuffix: true })}</span> },
    { key: 'actions', header: 'Actions', render: (val, row) => (
      <button
        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(row, e); }}
        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
        title="Delete Device"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    )},
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-cyan-400 font-medium animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================== */}
      {/* WELCOME BANNER */}
      {/* ========================================== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-cyan-500/30 transition-all duration-300">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="animate-pulse">📡</span>
              S6S IoT Platform
            </h1>
            <p className="text-cyan-100 mt-2 text-sm md:text-base">
              Professional IoT Device Management & Monitoring
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-cyan-200">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                System Operational
              </span>
              <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <div className="flex items-center gap-2">
                <span>📱</span>
                <div>
                  <div className="text-lg font-bold text-white">{displayStats.totalDevices}</div>
                  <div className="text-xs text-white/60">Devices</div>
                </div>
              </div>
            </div>
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <div>
                  <div className="text-lg font-bold text-emerald-200">{displayStats.onlineDevices}</div>
                  <div className="text-xs text-emerald-200/60">Online</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-500/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <span>📡</span>
                <div>
                  <div className="text-lg font-bold text-purple-200">{displayStats.totalSensors}</div>
                  <div className="text-xs text-purple-200/60">Sensors</div>
                </div>
              </div>
            </div>
            <div className="bg-cyan-500/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <div>
                  <div className="text-lg font-bold text-cyan-200">{displayStats.energyUsage}</div>
                  <div className="text-xs text-cyan-200/60">mWh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* WIDGET TABS */}
      {/* ========================================== */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'devices', label: 'Devices', icon: '📱' },
          { id: 'controls', label: 'Controls', icon: '🎛️' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'alarms', label: 'Alarms', icon: '🔔' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveWidgetTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeWidgetTab === tab.id
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* OVERVIEW TAB */}
      {/* ========================================== */}
      {activeWidgetTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ValueWidget title="Total Devices" value={displayStats.totalDevices} unit="" icon="📱" color="#06b6d4" trend={null} />
            <ValueWidget title="Online Devices" value={displayStats.onlineDevices} unit="" icon="🟢" color="#10b981" trend={null} />
            <ValueWidget title="Total Sensors" value={displayStats.totalSensors} unit="" icon="📡" color="#8b5cf6" trend={null} />
            <ValueWidget title="Active Alerts" value={displayStats.activeAlerts} unit="" icon="🔔" color="#ef4444" trend={null} />
          </div>

          {/* Empty State */}
          {isDashboardEmpty && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-12 text-center">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-white mb-2">No Devices Yet</h3>
              <p className="text-slate-400 mb-6">Add your first IoT device to start monitoring</p>
              <button 
                onClick={() => navigate('/devices')} 
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <span>➕</span>
                <span>Add Device</span>
              </button>
            </div>
          )}

          {/* Main Grid */}
          {!isDashboardEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Device Cards */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                Devices Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayDevices.map((device, index) => (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${device.status === 'online' ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                          <span className="text-xl">📱</span>
                          {device.status === 'online' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{device.name}</h4>
                          <p className="text-xs text-slate-400">{device.device_uuid}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteDevice(device, e)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                          title="Delete Device"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${device.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                          {device.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {device.sensors.slice(0, 4).map((sensor) => (
                        <div key={sensor.id} className="bg-slate-700/30 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{sensor.icon}</span>
                            <span className="text-xs text-slate-500">{sensor.name}</span>
                          </div>
                          <p className="font-bold text-lg" style={{ color: sensor.color, textShadow: `0 0 15px ${sensor.color}40` }}>
                            {sensor.last_value}<span className="text-xs text-slate-400 ml-1">{sensor.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - System Health & Alerts */}
            <div className="space-y-4">
              {/* System Health */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  System Health
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke={healthPercentage > 70 ? '#10b981' : healthPercentage > 40 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(healthPercentage / 100) * 352} 352`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{healthPercentage}%</span>
                      <span className="text-xs text-slate-400">Health</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-emerald-500/10 rounded-lg py-2 text-center">
                    <div className="text-lg font-bold text-emerald-400">{displayStats.onlineDevices}</div>
                    <div className="text-xs text-slate-400">Online</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg py-2 text-center">
                    <div className="text-lg font-bold text-slate-400">{displayStats.offlineDevices}</div>
                    <div className="text-xs text-slate-400">Offline</div>
                  </div>
                </div>
              </div>

              {/* Device Status Pie */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4">Device Status</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={8} dataKey="value">
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6">
                  {statusPieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }}></div>
                      <span className="text-sm text-slate-300">{item.name}: <span className="font-semibold">{item.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span>🔔</span>
                    Active Alerts
                  </h3>
                  {activeAlerts.length > 0 && (
                    <span className="bg-red-500/20 text-red-400 text-xs font-medium px-3 py-1 rounded-full animate-pulse">
                      {activeAlerts.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <AlarmWidget key={alert.id} alert={alert} />
                  ))}
                  {activeAlerts.length === 0 && (
                    <div className="text-center py-6 bg-emerald-500/10 rounded-lg">
                      <span className="text-4xl">✅</span>
                      <p className="text-sm text-emerald-400 mt-2">All systems normal</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* DEVICES TAB */}
      {/* ========================================== */}
      {activeWidgetTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
              All Devices
            </h2>
            <button onClick={() => navigate('/devices')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
              + Add Device
            </button>
          </div>
          
          <DataTableWidget
            title="Device Management"
            columns={deviceColumns}
            data={displayDevices}
            onRowClick={(device) => setSelectedDevice(device)}
          />
        </div>
      )}

      {/* ========================================== */}
      {/* CONTROLS TAB */}
      {/* ========================================== */}
      {activeWidgetTab === 'controls' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
            Device Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayDevices.filter(d => d.status === 'online').map((device) => (
              <div key={device.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <h4 className="font-semibold text-white">{device.name}</h4>
                  </div>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                
                <div className="space-y-3">
                  {device.controls && Object.entries(device.controls).map(([key, value]) => {
                    if (typeof value === 'boolean') {
                      const icons = { led: '💡', relay: '🔌', fan: '🌀', pump: '💧', irrigation: '🌱', gate: '🚪', alarm: '🔔', exhaust: '💨', light: '💡', ac: '❄️', dehumidifier: '💧' };
                      const colors = { led: 'bg-yellow-500', relay: 'bg-green-500', fan: 'bg-blue-500', pump: 'bg-cyan-500', irrigation: 'bg-purple-500', gate: 'bg-orange-500', alarm: 'bg-red-500', exhaust: 'bg-gray-500', light: 'bg-amber-500', ac: 'bg-cyan-500', dehumidifier: 'bg-blue-500' };
                      return (
                        <SwitchWidget
                          key={key}
                          title={key.charAt(0).toUpperCase() + key.slice(1)}
                          icon={icons[key] || '⚙️'}
                          active={deviceControls[device.id]?.[key] ?? value}
                          activeColor={colors[key] || 'bg-cyan-500'}
                          onChange={() => handleDeviceControl(device.id, key)}
                        />
                      );
                    }
                    if (typeof value === 'number') {
                      const icons = { brightness: '💡', fanSpeed: '🌀', waterLevel: '💧', lightLevel: '💡' };
                      return (
                        <SliderWidget
                          key={key}
                          title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          icon={icons[key] || '⚙️'}
                          value={deviceControls[device.id]?.[key] ?? value}
                          min={0}
                          max={100}
                          unit="%"
                          onChange={(val) => handleDeviceSlider(device.id, key, val)}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ANALYTICS TAB */}
      {/* ========================================== */}
      {activeWidgetTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
              Analytics & Telemetry
            </h2>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-slate-600 bg-slate-700/80 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
            >
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>

          {/* Sensor Charts Grid */}
          {displayDevices.length > 0 && displayDevices[0]?.sensors?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayDevices[0].sensors.slice(0, 4).map((sensor) => (
              <ChartWidget
                key={sensor.id}
                title={`${sensor.name} - ${displayDevices[0].name}`}
                data={sensor.data}
                dataKey="value"
                color={sensor.color}
                type="area"
                height={220}
                unit={sensor.unit}
              />
            ))}
          </div>
          ) : (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">No Analytics Data</h3>
            <p className="text-slate-400">Add devices with sensors to view analytics</p>
          </div>
          )}

          {/* Energy Chart */}
          <ChartWidget
            title="Energy Consumption"
            data={energyData.map(d => ({ ...d, time: d.day }))}
            dataKey="consumption"
            color="#06b6d4"
            type="bar"
            height={200}
            unit="mWh"
          />

          {/* Additional Widgets Grid */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Additional Widgets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Progress Ring Widget */}
            <ProgressRingWidget title="CPU Usage" value={45} max={100} unit="%" color="#8b5cf6" />
            <ProgressRingWidget title="Memory" value={72} max={100} unit="%" color="#06b6d4" />
            <ProgressRingWidget title="Storage" value={28} max={100} unit="%" color="#10b981" />
            <ProgressRingWidget title="Network" value={85} max={100} unit="%" color="#f59e0b" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Battery Widget */}
            <BatteryWidget title="Device Battery" level={78} charging={false} />
            <BatteryWidget title="Sensor Battery" level={15} charging={false} />
            <BatteryWidget title="Backup Power" level={100} charging={true} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LED Indicator Widgets */}
            <LEDIndicatorWidget title="System Status" status={true} />
            <LEDIndicatorWidget title="Network Connection" status={true} />
            <LEDIndicatorWidget title="Alarm System" status={false} labelOn="Armed" labelOff="Disarmed" />
            <LEDIndicatorWidget title="Maintenance Mode" status={false} />
          </div>

          {/* Weather & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <WeatherWidget 
              title="Environment" 
              temperature={24} 
              humidity={65} 
              condition="Partly Cloudy" 
              icon="⛅" 
            />
            <WeatherWidget 
              title="Outdoor" 
              temperature={22} 
              humidity={58} 
              condition="Sunny" 
              icon="☀️" 
            />
            <TimelineWidget 
              title="Recent Activity" 
              items={[
                { title: 'Device Connected', description: 'Living Room Sensor', time: '2 min ago', color: '#10b981' },
                { title: 'Alert Triggered', description: 'Temperature threshold', time: '15 min ago', color: '#f59e0b' },
                { title: 'Firmware Updated', description: 'Kitchen Device v2.1', time: '1 hour ago', color: '#8b5cf6' },
                { title: 'New Device Added', description: 'Garage Sensor', time: '3 hours ago', color: '#06b6d4' },
              ]}
            />
          </div>

          {/* Map and List Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MapWidget title="Device Locations" devices={displayDevices} />
            <ListWidget 
              title="Device Types" 
              icon="📱"
              items={[
                { label: 'Temperature Sensors', value: '12', icon: '🌡️', color: '#ef4444' },
                { label: 'Humidity Sensors', value: '8', icon: '💧', color: '#06b6d4' },
                { label: 'Motion Detectors', value: '5', icon: '👁️', color: '#8b5cf6' },
                { label: 'Smart Switches', value: '15', icon: '🔌', color: '#10b981' },
                { label: 'Cameras', value: '3', icon: '📹', color: '#f59e0b' },
              ]}
            />
          </div>

          {/* Card Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardWidget 
              title="System Info" 
              icon="ℹ️"
              content={<div className="text-center"><p className="text-2xl font-bold">v2.4.1</p><p className="text-xs text-slate-400">Firmware Version</p></div>}
              action="Check Updates →"
            />
            <CardWidget 
              title="Uptime" 
              icon="⏱️"
              content={<div className="text-center"><p className="text-2xl font-bold">99.9%</p><p className="text-xs text-slate-400">Last 30 days</p></div>}
            />
            <CardWidget 
              title="Support" 
              icon="💬"
              content={<div className="text-center"><p className="text-sm text-slate-300">Need help?</p><p className="text-xs text-slate-400">Our team is available 24/7</p></div>}
              action="Contact Support →"
            />
          </div>

          {/* IoT Sensor Widgets Section */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
            Sensor Gauges
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TemperatureGaugeWidget title="Temperature" value={24} unit="°C" />
            <TemperatureGaugeWidget title="Outdoor Temp" value={18} unit="°C" />
            <HumidityGaugeWidget title="Humidity" value={65} />
            <HumidityGaugeWidget title="Soil Moisture" value={42} color="#8b5cf6" />
          </div>

          {/* Numeric Displays */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            Real-time Values
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NumericDisplayWidget title="Power" value={1250} unit="W" icon="⚡" color="#fbbf24" />
            <NumericDisplayWidget title="Voltage" value={220.5} unit="V" icon="🔌" color="#10b981" />
            <NumericDisplayWidget title="Current" value={5.7} unit="A" icon="📊" color="#06b6d4" />
            <NumericDisplayWidget title="CO2 Level" value={412} unit="ppm" icon="🌬️" color="#8b5cf6" />
          </div>

          {/* Camera/Image Widgets */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-red-500 rounded-full"></span>
            Camera Feeds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CameraWidget title="Front Door" offline={false} />
            <CameraWidget title="Backyard" offline={true} />
          </div>

          {/* Control Buttons */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Quick Controls
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ButtonWidget title="Lights" icon="💡" label="Toggle All Lights" color="#fbbf24" />
            <ButtonWidget title="Fan" icon="🌀" label="Toggle Fan" color="#06b6d4" />
            <ButtonWidget title="Pump" icon="💧" label="Water Pump" color="#3b82f6" />
            <ButtonWidget title="Alarm" icon="🔔" label="Trigger Alarm" color="#ef4444" />
          </div>

          {/* Status Array */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
            Device Status Grid
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusArrayWidget 
              title="Room Sensors" 
              items={[
                { name: 'Living', status: 'online' },
                { name: 'Bedroom', status: 'online' },
                { name: 'Kitchen', status: 'online' },
                { name: 'Bathroom', status: 'offline' },
                { name: 'Garage', status: 'warning' },
                { name: 'Garden', status: 'online' },
                { name: 'Office', status: 'online' },
                { name: 'Basement', status: 'offline' },
              ]} 
            />
            <StatusArrayWidget 
              title="Zone Controllers" 
              items={[
                { name: 'Zone 1', status: 'online' },
                { name: 'Zone 2', status: 'online' },
                { name: 'Zone 3', status: 'online' },
                { name: 'Zone 4', status: 'online' },
                { name: 'Zone 5', status: 'warning' },
                { name: 'Zone 6', status: 'online' },
                { name: 'Zone 7', status: 'offline' },
                { name: 'Zone 8', status: 'online' },
              ]} 
            />
          </div>

          {/* GPS Location */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            GPS Tracking
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GPSWidget title="Device Location" latitude={40.7128} longitude={-74.0060} speed={0} altitude={10} />
            <GPSWidget title="Tracker 1" latitude={34.0522} longitude={-118.2437} speed={45} altitude={25} />
          </div>

          {/* Multi-Channel Chart */}
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            Multi-Channel Analysis
          </h3>

          <MultiChannelChartWidget 
            title="Sensor Channels"
            channels={['Temperature', 'Humidity', 'Pressure']}
            data={Array.from({ length: 20 }, (_, i) => ({
              time: new Date(Date.now() - (19 - i) * 300000),
              Temperature: 20 + Math.random() * 10,
              Humidity: 50 + Math.random() * 20,
              Pressure: 1000 + Math.random() * 30,
            }))}
          />

          {/* Donut Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DonutChartWidget 
              title="Device Distribution"
              data={[
                { name: 'Online', value: 45 },
                { name: 'Offline', value: 8 },
                { name: 'Warning', value: 3 },
              ]}
            />
            <DonutChartWidget 
              title="Sensor Types"
              data={[
                { name: 'Temp', value: 12 },
                { name: 'Humidity', value: 8 },
                { name: 'Motion', value: 5 },
                { name: 'Switch', value: 15 },
                { name: 'Camera', value: 3 },
              ]}
            />
            <DonutChartWidget 
              title="Power Usage"
              data={[
                { name: 'Active', value: 65 },
                { name: 'Standby', value: 25 },
                { name: 'Idle', value: 10 },
              ]}
            />
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ALARMS TAB */}
      {/* ========================================== */}
      {activeWidgetTab === 'alarms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
              Alarm Dashboard
            </h2>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
              + Create Alarm
            </button>
          </div>

          {/* Alarm Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ValueWidget title="Critical" value="1" icon="🔴" color="#ef4444" />
            <ValueWidget title="Warnings" value="1" icon="🟡" color="#f59e0b" />
            <ValueWidget title="Info" value="0" icon="🔵" color="#3b82f6" />
            <ValueWidget title="Resolved" value="5" icon="✅" color="#10b981" />
          </div>

          {/* Alarm List */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-4">
            <h3 className="font-semibold text-white mb-4">Active Alarms</h3>
            <div className="space-y-3">
              {displayAlerts.map((alert) => (
                <AlarmWidget key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DEVICE DETAIL PANEL */}
      {/* ========================================== */}
      {selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onControlChange={(controlKey) => handleDeviceControl(selectedDevice.id, controlKey)}
          onSliderChange={(controlKey, value) => handleDeviceSlider(selectedDevice.id, controlKey, value)}
          onDelete={handleDeleteDevice}
        />
      )}

      {/* ========================================== */}
      {/* QUICK ACTIONS */}
      {/* ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => navigate('/devices')} className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 rounded-xl p-4 text-white font-medium transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 flex flex-col items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
          <span className="text-sm">Add Device</span>
        </button>
        <button onClick={() => navigate('/alerts')} className="bg-gradient-to-r from-red-600 to-orange-700 hover:from-red-500 hover:to-orange-600 rounded-xl p-4 text-white font-medium transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 flex flex-col items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🔔</span>
          <span className="text-sm">View Alerts</span>
        </button>
        <button onClick={() => navigate('/developer')} className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 rounded-xl p-4 text-white font-medium transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 flex flex-col items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
          <span className="text-sm">View Reports</span>
        </button>
        <button onClick={() => navigate('/settings')} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-xl p-4 text-white font-medium transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 flex flex-col items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
