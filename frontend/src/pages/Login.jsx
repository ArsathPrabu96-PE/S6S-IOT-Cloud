import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { authAPI } from '../services/api';
import wsService from '../services/websocket';

// Array of IoT-related background images (cycling slideshow)
const backgroundImages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
  'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=1920&q=80',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1920&q=80',
  'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1920&q=80',
  'https://images.unsplash.com/photo-1563770095-39d468f95742?w=1920&q=80',
];

// Animated IoT icons
const IoTIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 animate-float-1 opacity-20">
      <svg className="w-16 h-16 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    </div>
    <div className="absolute top-1/3 right-1/4 animate-float-2 opacity-20">
      <svg className="w-20 h-20 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2" />
      </svg>
    </div>
    <div className="absolute bottom-1/4 left-1/3 animate-float-3 opacity-20">
      <svg className="w-14 h-14 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      wsService.connect(user.id, accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        {backgroundImages.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={bg} alt="Background" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80" />
      </div>

      <IoTIcons />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 relative">
            {/* Breathing Image Container */}
            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-2xl animate-breath" />
            <div className="relative">
              <img 
                src="/image/ChatGPT Image Mar 6, 2026, 12_22_59 AM.png" 
                alt="S6S IoT Logo" 
                className="w-20 h-20 object-contain rounded-full border-4 border-yellow-400/30 animate-breath"
              />
              {/* Animated rings that sync with breathing */}
              <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-full animate-ring-1" />
              <div className="absolute inset-0 border-2 border-yellow-300/30 rounded-full animate-ring-2" />
              <div className="absolute inset-0 border-2 border-yellow-200/20 rounded-full animate-ring-3" />
            </div>
          </div>
          
          {/* Additional animated graphics that pulse with the logo */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-breath" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-breath" style={{ animationDelay: '0.3s' }} />
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-breath" style={{ animationDelay: '0.6s' }} />
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-breath" style={{ animationDelay: '0.9s' }} />
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-breath" style={{ animationDelay: '1.2s' }} />
          </div>
          
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 tracking-tight drop-shadow-lg">
            S6S IoT
          </h1>
          <p className="text-gray-300 mt-2 font-medium">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500">Sign in to your account</span>
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-400 font-medium bg-white/80"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-400 font-medium bg-white/80"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500" />
                <span className="ml-2 text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-bold text-yellow-500 hover:text-yellow-600">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign in
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-yellow-600 hover:text-yellow-700">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Secure IoT Platform • Connect • Monitor • Control
        </p>
      </div>
    </div>
  );
};

export default Login;
