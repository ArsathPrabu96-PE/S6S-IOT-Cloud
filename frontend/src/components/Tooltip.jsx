import { useState } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-700',
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-700 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

// Button with built-in tooltip
export const TooltipButton = ({ 
  children, 
  tooltip, 
  position = 'top', 
  delay = 300,
  className = '',
  ...props 
}) => {
  return (
    <Tooltip content={tooltip} position={position} delay={delay} className={className}>
      <button {...props}>
        {children}
      </button>
    </Tooltip>
  );
};

// Icon button with tooltip
export const TooltipIconButton = ({ 
  children, 
  tooltip, 
  position = 'top', 
  delay = 300,
  className = '',
  ...props 
}) => {
  return (
    <Tooltip content={tooltip} position={position} delay={delay} className={className}>
      <button 
        className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default Tooltip;
