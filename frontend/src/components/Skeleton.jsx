// Skeleton loading components for better user experience
// Provides visual feedback while content is loading

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-slate-800/50 rounded-xl p-6 border border-slate-700/30 ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-700 rounded" />
        <div className="h-3 bg-slate-700 rounded w-5/6" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, className = '' }) => (
  <div className={`bg-slate-800/50 rounded-xl border border-slate-700/30 overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-slate-700/50 p-4 grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-600 rounded" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 grid grid-cols-4 gap-4 border-t border-slate-700/30">
          {[...Array(4)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-slate-700 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = ({ className = '' }) => (
  <div className={`bg-slate-800/50 rounded-xl p-6 border border-slate-700/30 ${className}`}>
    <div className="animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
      <div className="flex items-end justify-between gap-2 h-48">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="flex-1 bg-slate-700 rounded-t"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className={`h-4 bg-slate-700 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-slate-700 animate-pulse ${className}`} />
  );
};

export const SkeletonButton = ({ className = '' }) => (
  <div className={`h-10 bg-slate-700 rounded-lg w-24 animate-pulse ${className}`} />
);

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg className="animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
        <circle 
          className="opacity-25" 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </svg>
    </div>
  );
};

// Full Page Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-cyan-400 text-lg font-medium animate-pulse">{message}</p>
    </div>
  </div>
);

// Empty State Component
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    {Icon && (
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
    )}
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 mb-6 max-w-md">{description}</p>
    {action && (
      <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200">
        {action}
      </button>
    )}
  </div>
);

// Page Transition Wrapper
export const PageTransition = ({ children, className = '' }) => (
  <div 
    className={`animate-fade-in-up ${className}`}
    style={{ 
      animationDuration: '300ms',
      animationFillMode: 'both',
    }}
  >
    {children}
  </div>
);

// Staggered List Animation
export const StaggeredList = ({ children, className = '', delay = 50 }) => {
  const childArray = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <div 
          key={index}
          style={{ 
            animationDelay: `${index * delay}ms`,
            animationDuration: '300ms',
          }}
          className="animate-slide-up"
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default {
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  LoadingSpinner,
  LoadingOverlay,
  EmptyState,
  PageTransition,
  StaggeredList,
};
