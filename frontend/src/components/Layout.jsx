import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useAlertStore, useUIStore } from '../context/store';
import wsService from '../services/websocket';
import { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useAlertStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activePage, setActivePage] = useState('');

  useEffect(() => {
    setActivePage(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    wsService.disconnect();
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 300);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, ariaLabel: 'Go to Dashboard' },
    { path: '/dashboard-wizard', label: 'Dashboard Wizard', icon: WizardIcon, ariaLabel: 'Go to Dashboard Wizard' },
    { path: '/projects', label: 'Projects', icon: ProjectsIcon, ariaLabel: 'Go to Projects' },
    { path: '/devices', label: 'Devices', icon: DevicesIcon, ariaLabel: 'Go to Devices' },
    { path: '/alerts', label: 'Alerts', icon: AlertsIcon, badge: unreadCount, ariaLabel: 'Go to Alerts' },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, ariaLabel: 'Go to Settings' },
    { path: '/developer', label: 'Developer', icon: DeveloperIcon, ariaLabel: 'Go to Developer Options' },
    { path: '/guide', label: 'User Guide', icon: GuideIcon, ariaLabel: 'Go to User Guide' },
  ];

  const colorMap = [
    { name: 'cyan', gradient: 'from-cyan-500', via: 'via-cyan-400', to: 'to-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500', glow: 'rgba(6, 182, 212, 0.5)', bg: 'from-cyan-500/20 to-blue-500/20', smoke: 'nav-smoke-cyan' },
    { name: 'purple', gradient: 'from-purple-500', via: 'via-purple-400', to: 'to-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500', glow: 'rgba(168, 85, 247, 0.5)', bg: 'from-purple-500/20 to-pink-500/20', smoke: 'nav-smoke-purple' },
    { name: 'pink', gradient: 'from-pink-500', via: 'via-pink-400', to: 'to-pink-500', border: 'border-pink-500', shadow: 'shadow-pink-500', glow: 'rgba(236, 72, 153, 0.5)', bg: 'from-pink-500/20 to-rose-500/20', smoke: 'nav-smoke-pink' },
    { name: 'blue', gradient: 'from-blue-500', via: 'via-blue-400', to: 'to-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500', glow: 'rgba(59, 130, 246, 0.5)', bg: 'from-blue-500/20 to-indigo-500/20', smoke: 'nav-smoke-blue' },
    { name: 'yellow', gradient: 'from-yellow-500', via: 'via-yellow-400', to: 'to-yellow-500', border: 'border-yellow-500', shadow: 'shadow-yellow-500', glow: 'rgba(234, 179, 8, 0.5)', bg: 'from-yellow-500/20 to-orange-500/20', smoke: 'nav-smoke-yellow' },
    { name: 'green', gradient: 'from-green-500', via: 'via-green-400', to: 'to-green-500', border: 'border-green-500', shadow: 'shadow-green-500', glow: 'rgba(34, 197, 94, 0.5)', bg: 'from-green-500/20 to-emerald-500/20', smoke: 'nav-smoke-green' },
    { name: 'red', gradient: 'from-red-500', via: 'via-red-400', to: 'to-red-500', border: 'border-red-500', shadow: 'shadow-red-500', glow: 'rgba(239, 68, 68, 0.5)', bg: 'from-red-500/20 to-orange-500/20', smoke: 'nav-smoke-red' },
    { name: 'indigo', gradient: 'from-indigo-500', via: 'via-indigo-400', to: 'to-indigo-500', border: 'border-indigo-500', shadow: 'shadow-indigo-500', glow: 'rgba(99, 102, 241, 0.5)', bg: 'from-indigo-500/20 to-violet-500/20', smoke: 'nav-smoke-indigo' },
  ];

  const getNavLinkClass = (active, colors) => {
    if (active) {
      return `bg-gradient-to-r ${colors.gradient}/40 ${colors.via}/30 ${colors.to}/40 border ${colors.border}/60 shadow-lg ${colors.shadow}/40 text-cyan-400`;
    }
    return `bg-slate-800/30 border border-slate-700/30 hover:bg-gradient-to-r hover:${colors.gradient}/20 hover:${colors.via}/20 hover:${colors.to}/20 hover:${colors.border}/40 text-slate-300 hover:text-white hover:shadow-lg hover:${colors.shadow}/30`;
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-slate-900/70 z-10" />
      {/* Content */}
      <div className="relative z-20">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border-r border-slate-700/30 shadow-2xl transform transition-transform duration-300 overflow-hidden rounded-br-xl ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          {/* Colorful Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
          
          {/* Animated Colorful Orbs */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-20 right-1/3 w-16 h-16 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

          {/* Bubble Effect Container */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute rounded-full bubble-rise-1 blur-sm" style={{ left: '10%', width: '12px', height: '12px', background: 'rgba(6, 182, 212, 0.4)', '--duration': '7s', '--delay': '0s' }} />
            <div className="absolute rounded-full bubble-rise-2 blur-xs" style={{ left: '25%', width: '6px', height: '6px', background: 'rgba(168, 85, 247, 0.5)', '--duration': '9s', '--delay': '1s' }} />
            <div className="absolute rounded-full bubble-rise-3 blur-sm" style={{ left: '45%', width: '18px', height: '18px', background: 'rgba(236, 72, 153, 0.3)', '--duration': '6s', '--delay': '2s' }} />
            <div className="absolute rounded-full bubble-rise-1 blur-xs" style={{ left: '60%', width: '8px', height: '8px', background: 'rgba(59, 130, 246, 0.45)', '--duration': '8s', '--delay': '0.5s' }} />
            <div className="absolute rounded-full bubble-rise-2 blur-sm" style={{ left: '75%', width: '14px', height: '14px', background: 'rgba(6, 182, 212, 0.35)', '--duration': '10s', '--delay': '1.5s' }} />
            <div className="absolute rounded-full bubble-rise-3 blur-xs" style={{ left: '85%', width: '5px', height: '5px', background: 'rgba(168, 85, 247, 0.55)', '--duration': '7s', '--delay': '3s' }} />
            <div className="absolute rounded-full bubble-rise-1 blur-sm" style={{ left: '15%', width: '10px', height: '10px', background: 'rgba(236, 72, 153, 0.4)', '--duration': '8s', '--delay': '4s' }} />
            <div className="absolute rounded-full bubble-rise-2 blur-xs" style={{ left: '35%', width: '16px', height: '16px', background: 'rgba(59, 130, 246, 0.3)', '--duration': '9s', '--delay': '2.5s' }} />
            <div className="absolute rounded-full bubble-rise-3 blur-sm" style={{ left: '55%', width: '4px', height: '4px', background: 'rgba(6, 182, 212, 0.6)', '--duration': '6s', '--delay': '0.8s' }} />
            <div className="absolute rounded-full bubble-rise-1 blur-xs" style={{ left: '70%', width: '20px', height: '20px', background: 'rgba(168, 85, 247, 0.25)', '--duration': '10s', '--delay': '3.5s' }} />
          </div>

          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-700/30 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50 ring-2 ring-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-lg">S6S IoT</span>
                <span className="text-xs text-cyan-400/80">Cloud Platform</span>
              </div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <div className="h-[calc(100vh-85px)] overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              const colors = colorMap[index] || colorMap[0];
              const textColor = colors.name === 'cyan' ? 'text-cyan-400' : colors.name === 'purple' ? 'text-purple-400' : colors.name === 'pink' ? 'text-pink-400' : colors.name === 'yellow' ? 'text-yellow-400' : 'text-blue-400';
              const textHoverColor = colors.name === 'cyan' ? 'text-cyan-300' : colors.name === 'purple' ? 'text-purple-300' : colors.name === 'pink' ? 'text-pink-300' : colors.name === 'yellow' ? 'text-yellow-300' : 'text-blue-300';
              
              return (
                <NavLink
                  to={item.path}
                  key={item.path}
                  className={`group relative flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 hover:scale-105 ${getNavLinkClass(active, colors)}`}
                  style={{
                    boxShadow: active ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}40` : 'none',
                  }}
                >
                  {/* Smoke/Mist Effect Container */}
                  <div className={`nav-smoke-container ${colors.smoke}`}>
                    {/* Smoke flow layer */}
                    <div className={`nav-smoke-layer ${active ? 'active' : ''}`} />
                    {/* Mist spread layer */}
                    <div className={`nav-mist-layer ${active ? 'active' : ''}`} />
                    {/* Vapor rising layer */}
                    <div className={`nav-vapor-layer ${active ? 'active' : ''}`} />
                    {/* Shimmer effect */}
                    <div className={`nav-shimmer ${active ? 'active' : ''}`} />
                    {/* Particle effects */}
                    <div className={`nav-particle ${active ? 'active-1' : ''}`} style={{ left: '20%', top: '60%' }} />
                    <div className={`nav-particle ${active ? 'active-2' : ''}`} style={{ left: '50%', top: '70%' }} />
                    <div className={`nav-particle ${active ? 'active-3' : ''}`} style={{ left: '80%', top: '50%' }} />
                  </div>
                  {/* Neon glow background effect */}
                  <div 
                    className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                      active 
                        ? `opacity-100 bg-gradient-to-r ${colors.gradient}/20 ${colors.via}/15 ${colors.to}/20` 
                        : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r group-hover:' + colors.gradient + '/10 group-hover:' + colors.via + '/5 group-hover:' + colors.to + '/10'
                    }`}
                  />
                  {/* Glow overlay */}
                  <div 
                    className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{
                      boxShadow: `0 0 15px ${colors.glow}, inset 0 0 15px ${colors.glow}30`,
                    }}
                  />
                  <item.icon className={`w-5 h-5 relative z-10 transition-all duration-300 ${active ? `${textColor} drop-shadow-lg` : 'text-white group-hover:text-white group-hover:drop-shadow-lg'}`} 
                    style={{
                      filter: active || 'group-hover' in item ? `drop-shadow(0 0 8px ${colors.glow})` : 'none',
                    }}
                  />
                  <span className={`font-medium relative z-10 transition-all duration-300 ${active ? 'text-white' : 'text-white group-hover:text-white'}`}
                    style={{
                      textShadow: active || 'group-hover' in item ? `0 0 10px ${colors.glow}` : 'none',
                    }}
                  >{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* User section - Removed, now in header */}
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header with smooth transitions */}
          <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-700/30 flex items-center justify-end px-4 lg:px-8 gap-4 transition-all duration-300 hover:bg-slate-900/70 -mt-px">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Tooltip content="Toggle sidebar menu" position="right">
                <svg className="w-6 h-6 transition-transform duration-300 hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Tooltip>
            </button>

            <div className="flex items-center gap-4">
              {/* Connection Status with smooth pulse */}
              <Tooltip content="Real-time connection active">
                <div className="flex items-center gap-2 text-sm text-slate-300 cursor-help transition-all duration-300 hover:text-green-400 hover:scale-105">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="hidden sm:inline transition-all duration-200">Connected</span>
                </div>
              </Tooltip>

              {/* User Profile Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50 transition-all duration-300 hover:border-slate-600/50">
                {/* User Avatar with gradient ring */}
                <div className="relative w-10 h-10 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-2 ring-slate-700/50 transition-all duration-300 hover:ring-purple-400 hover:scale-110 hover:shadow-purple-500/50">
                  <span className="text-white font-semibold text-sm transition-transform duration-300 hover:scale-110">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>

                {/* User Info - Hidden on small screens */}
                <div className="hidden md:flex flex-col transition-all duration-300 hover:scale-[1.02]">
                  <span className="text-sm font-semibold text-white truncate max-w-[120px] transition-all duration-200 hover:text-cyan-300">
                    {user?.firstName || user?.email || 'User'}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-[120px] transition-all duration-200 hover:text-slate-300">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>

                {/* Logout Button with smooth hover */}
                <Tooltip content="Sign out of your account" position="bottom">
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-600/50 hover:text-red-300 text-slate-300 transition-all duration-200 border border-slate-600/30 hover:border-red-500/50 group hover:scale-110 active:scale-95"
                    aria-label="Sign out"
                  >
                    <svg className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          </header>

          {/* Page content with entrance animation */}
          <main className="p-4 lg:p-8 pt-0">
            <div 
              key={location.pathname}
              className="animate-fade-in-up"
              style={{
                animationDuration: '0.4s',
                animationFillMode: 'both',
              }}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Icons
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const ProjectsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DevicesIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const AlertsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DeveloperIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const GuideIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const WizardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

export default Layout;
