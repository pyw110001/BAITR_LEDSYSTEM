import React from 'react';

/**
 * A purely visual component that overlays a grid mask to simulate 
 * vertical LED strips on a building facade.
 */
export const LedPreview: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden">
      {/* 
        This mask creates vertical black bars with transparent gaps (the LED strips).
        We use a repeating linear gradient.
      */}
      <div 
        className="w-full h-full opacity-90"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            rgba(0,0,0,0.95) 0px,
            rgba(0,0,0,0.95) 12px, 
            transparent 12px,
            transparent 16px
          )`
        }}
      />
      
      {/* Scanline effect for realism */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
      
      {/* Glare/Reflection if active */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
};

// A small component to simulate the physical controller feedback
export const PhysicalLedController: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <div className="h-full w-4 bg-led-900 rounded-full border border-led-700 relative overflow-hidden flex flex-col justify-end">
            <div 
                className={`w-full transition-all duration-500 ease-out ${isActive ? 'h-full bg-gradient-to-t from-led-500 to-led-accent animate-pulse-fast' : 'h-0 bg-slate-800'}`}
                style={{ boxShadow: isActive ? '0 0 10px #6366f1' : 'none' }}
            />
        </div>
    )
}