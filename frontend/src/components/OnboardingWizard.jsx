import { useState, useEffect, createContext, useContext } from 'react';
import { useAuthStore } from '../context/store';

// Onboarding Context
const OnboardingContext = createContext();

export const useOnboarding = () => useContext(OnboardingContext);

// Onboarding Steps Configuration
export const ONBOARDING_STEPS = [
  {
    id: 'device-connection',
    title: 'Device Connection',
    icon: '📡',
    description: 'Learn how to connect and manage your IoT devices',
    duration: '3 min',
    topics: [
      { id: 'mqtt', title: 'MQTT Topics', desc: 'Learn about MQTT topic hierarchy for device communication' },
      { id: 'ingestion', title: 'Ingestion Patterns', desc: 'Configure how devices send data to your dashboard' },
      { id: 'datasources', title: 'Data Sources', desc: 'Define and manage data streams from your devices' },
    ],
    example: {
      name: 'S6S IoT Temperature Sensor',
      pattern: 's6siot/{device_id}/temperature',
      flow: 'Device → MQTT Broker → Ingestion Pattern → Data Source → Widget',
    },
  },
  {
    id: 'widget-creation',
    title: 'Widget Templates',
    icon: '🧩',
    description: 'Create and customize visual widgets for your dashboard',
    duration: '4 min',
    topics: [
      { id: 'gauges', title: 'Gauges', desc: 'Circular displays for temperature, humidity, and more' },
      { id: 'charts', title: 'Charts & Graphs', desc: 'Line charts, bar graphs for historical data' },
      { id: 'indicators', title: 'Indicators', desc: 'Status lights, switches, and toggle controls' },
    ],
    example: {
      name: 'Temperature Gauge Widget',
      config: { type: 'gauge', min: 0, max: 100, unit: '°C', color: '#f59e0b' },
      preview: '📊 24.5°C',
    },
  },
  {
    id: 'property-linking',
    title: 'Property Linking',
    icon: '🔗',
    description: 'Connect widgets to your IoT devices for real-time updates',
    duration: '5 min',
    topics: [
      { id: 'databinding', title: 'Data Binding', desc: 'Link widget properties to device data sources' },
      { id: 'transforms', title: 'Data Transforms', desc: 'Apply calculations and unit conversions' },
      { id: 'events', title: 'Event Handling', desc: 'Trigger actions based on device state changes' },
    ],
    example: {
      device: 'S6S IoT Sensor',
      dataSource: 'temperature',
      linkedWidget: 'Temperature Gauge',
      relationship: 'temperature → gauge.value (real-time)',
    },
  },
  {
    id: 'device-control',
    title: 'Device Control',
    icon: '🎮',
    description: 'Control your IoT devices in real-time',
    duration: '3 min',
    topics: [
      { id: 'switches', title: 'Toggle Switches', desc: 'Control LEDs, relays, and on/off devices' },
      { id: 'sliders', title: 'Sliders', desc: 'Adjust fan speed, brightness, and values' },
      { id: 'commands', title: 'Commands', desc: 'Send custom commands to your devices' },
    ],
    example: {
      device: 'S6S IoT Relay',
      controls: ['💡 LED', '🔌 Relay', '🌀 Fan'],
      action: 'Toggle switch sends MQTT message: s6siot/relay/control { "state": "on" }',
    },
  },
  {
    id: 'alert-system',
    title: 'Alert System',
    icon: '🔔',
    description: 'Configure alerts and notifications for your devices',
    duration: '3 min',
    topics: [
      { id: 'thresholds', title: 'Thresholds', desc: 'Set min/max values that trigger alerts' },
      { id: 'notifications', title: 'Notifications', desc: 'Configure how you receive alerts' },
      { id: 'rules', title: 'Alert Rules', desc: 'Create complex conditional alerts' },
    ],
    example: {
      rule: 'Temperature Alert',
      condition: 'If temperature > 35°C for 5 minutes',
      action: 'Send notification + trigger automation',
    },
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    icon: '📊',
    description: 'Analyze device data and generate insights',
    duration: '4 min',
    topics: [
      { id: 'charts', title: 'Visualizations', desc: 'Charts, graphs, and dashboards' },
      { id: 'energy', title: 'Energy Monitoring', desc: 'Track power consumption and costs' },
      { id: 'reports', title: 'Reports', desc: 'Generate and export data reports' },
    ],
    example: {
      metric: 'Energy Consumption',
      chart: 'Bar chart - Weekly usage (kWh)',
      insight: 'Average daily usage: 2.4 kWh',
    },
  },
];

// Provider Component
export const OnboardingProvider = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  // Load progress from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem('onboarding_progress');
      if (saved) {
        const { currentStep: savedStep, completedSteps: savedCompleted, isComplete: savedComplete } = JSON.parse(saved);
        setCurrentStep(savedStep || 0);
        setCompletedSteps(savedCompleted || []);
        setIsComplete(savedComplete || false);
      } else {
        // Auto-start onboarding for new users
        setIsOpen(true);
      }
    }
  }, [isAuthenticated]);

  // Save progress to localStorage
  const saveProgress = (step, completed, complete) => {
    localStorage.setItem('onboarding_progress', JSON.stringify({
      currentStep: step,
      completedSteps: completed,
      isComplete: complete,
    }));
  };

  const startOnboarding = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsComplete(false);
    saveProgress(0, [], false);
  };

  const nextStep = () => {
    const newCompleted = [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      saveProgress(next, newCompleted, false);
    } else {
      setIsComplete(true);
      setIsOpen(false);
      saveProgress(currentStep, newCompleted, true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      saveProgress(prev, completedSteps, false);
    }
  };

  const skipOnboarding = () => {
    setIsOpen(false);
    setIsComplete(true);
    saveProgress(currentStep, completedSteps, true);
  };

  const restartOnboarding = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsComplete(false);
    setIsOpen(true);
    localStorage.removeItem('onboarding_progress');
  };

  const showTooltipFor = (tooltipId) => {
    setShowTooltip(tooltipId);
    setTimeout(() => setShowTooltip(null), 3000);
  };

  return (
    <OnboardingContext.Provider value={{
      isOpen,
      currentStep,
      completedSteps,
      isComplete,
      showTooltip,
      startOnboarding,
      nextStep,
      prevStep,
      skipOnboarding,
      restartOnboarding,
      showTooltipFor,
      setIsOpen,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Onboarding Wizard Modal Component
const OnboardingWizard = () => {
  const { isOpen, currentStep, completedSteps, isComplete, nextStep, prevStep, skipOnboarding, restartOnboarding, setIsOpen } = useOnboarding();
  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  if (!isOpen) return null;

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-cyan-500/30 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Onboarding Complete!</h2>
          <p className="text-slate-400 mb-6">You're now ready to build amazing IoT dashboards with S6S IoT!</p>
          <div className="flex gap-3">
            <button
              onClick={restartOnboarding}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              Restart Tutorial
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h2 className="text-white font-bold">Developer Onboarding</h2>
                <p className="text-cyan-100 text-sm">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
              </div>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-white/80 hover:text-white text-sm"
            >
              Skip →
            </button>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-cyan-600/20 rounded-xl flex items-center justify-center text-2xl">
              {step.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-slate-400 text-sm">{step.description}</p>
              <p className="text-cyan-400 text-xs mt-1">⏱️ Estimated time: {step.duration}</p>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">What you'll learn:</h4>
            <div className="grid gap-3">
              {step.topics.map((topic, idx) => (
                <div
                  key={topic.id}
                  className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="w-6 h-6 bg-cyan-600/20 rounded-full flex items-center justify-center text-cyan-400 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{topic.title}</h5>
                    <p className="text-slate-400 text-sm">{topic.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example (S6S IoT Pattern) */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-cyan-500/30 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h4 className="text-cyan-400 font-medium">S6S IoT Example</h4>
            </div>
            
            {currentStep === 0 && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Topic Pattern:</span>
                  <code className="text-green-400 font-mono">s6siot/{'{device_id}'}/temperature</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Example:</span>
                  <code className="text-yellow-400 font-mono">s6siot/sensor_01/temperature</code>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-400">Data Format:</span>
                  <code className="text-cyan-400 font-mono">{"{ value: 24.5, unit: '°C', timestamp: ... }"}</code>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Widget:</span>
                  <span className="text-white">Temperature Gauge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Config:</span>
                  <code className="text-yellow-400 font-mono">{"{ type: 'gauge', min: 0, max: 100, unit: '°C' }"}</code>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-400">Visual:</span>
                  <span className="text-2xl">📊</span>
                  <span className="text-white font-bold">24.5°C</span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-sm">
                <div className="flex items-center justify-between mb-3 p-2 bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <span>📡</span>
                    <span className="text-white">S6S IoT Sensor</span>
                  </div>
                  <span className="text-cyan-400">→</span>
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span className="text-white">Temperature Gauge</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Link:</span>
                  <code className="text-green-400 font-mono">temperature → gauge.value</code>
                </div>
                <div className="text-xs text-slate-500 mt-2">Updates in real-time as device sends data</div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <span className="text-white">LED Control</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">ON</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">MQTT Command:</span>
                  <code className="text-yellow-400 font-mono">s6siot/relay/control {"{ state: 'on' }"}</code>
                </div>
                <div className="text-xs text-slate-500">Toggle switch sends command → Device receives → State changes</div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-medium">Alert Rule:</span>
                  <span className="text-white">Temperature Too High</span>
                </div>
                <div className="p-2 bg-slate-800 rounded text-slate-300">
                  IF temperature {'>'} 35°C FOR 5 minutes
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Then:</span>
                  <span className="text-cyan-400">Send notification + Trigger automation</span>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <span className="text-white">Energy Consumption</span>
                </div>
                <div className="h-16 flex items-end gap-1 mb-2">
                  {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="mt-2 text-cyan-400">📈 Insight: 23% less than last week</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2">
              {ONBOARDING_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentStep
                      ? 'bg-cyan-400'
                      : completedSteps.includes(idx)
                      ? 'bg-green-500'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tooltip Component
export const OnboardingTooltip = ({ target, content, position = 'top' }) => {
  const { showTooltip } = useOnboarding();
  
  if (!showTooltip || showTooltip !== target) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
      <div className="bg-cyan-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
        {content}
        <div className={`absolute w-2 h-2 bg-cyan-600 rotate-45 ${
          position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
          position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
          position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
          'right-full top-1/2 -translate-y-1/2 -mr-1'
        }`} />
      </div>
    </div>
  );
};

// Add fade-in animation to index.css via JS
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
`;
document.head.appendChild(style);

export default OnboardingWizard;
