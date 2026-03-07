import { useEffect, useState } from 'react';
import { Icons } from './Icons';

/**
 * DeleteConfirmDialog - A modern, visually striking delete confirmation dialog
 */
const DeleteConfirmDialog = ({
  isOpen = false,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onCancel) {
        onCancel();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      onCancel();
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Background overlay */}
      <div className={`absolute inset-0 bg-slate-900/85 backdrop-blur-md ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} />

      {/* Dialog container */}
      <div className={`relative w-full max-w-md bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700/50 overflow-hidden ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'} transition-all duration-400 ease-out`}>
        
        {/* Gradient border top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
        
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5 pointer-events-none" />

        {/* Icon section */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
            
            {/* Icon circle */}
            <div className={`relative p-4 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/40 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'} transition-all duration-500`}>
              <Icons.Trash className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-2 text-center">
          <h2 className={`text-2xl font-bold text-white mb-3 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-300 delay-100`}>
            {title}
          </h2>
          
          <p className={`text-slate-400 text-sm leading-relaxed mb-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-300 delay-200`}>
            {message}
          </p>
          
          {itemName && (
            <div className={`mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-300 delay-250`}>
              <span className="text-white font-semibold text-base">"{itemName}"</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className={`px-8 pb-8 flex gap-3 justify-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-300 delay-300`}>
          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Icons.X className="w-4 h-4" />
            {cancelText}
          </button>

          {/* Delete */}
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <Icons.Trash className="w-4 h-4" />
            {confirmText}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          aria-label="Close"
        >
          <Icons.X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
