import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { useOSStore, WindowState } from '../store';
import { cn } from '../../lib/utils';

export function WindowFrame({ win, children, key }: { win: WindowState, children: React.ReactNode, key?: React.Key }) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId } = useOSStore();
  const isActive = activeWindowId === win.id;
  
  const constraintsRef = useRef(null);

  if (win.isMinimized) return null;

  return (
    <motion.div
      drag={!win.isMaximized}
      dragMomentum={false}
      dragElastic={0}
      onMouseDown={() => focusWindow(win.id)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ zIndex: win.zIndex }}
      className={cn(
        "absolute bg-[#1a1a1a]/90 backdrop-blur-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col pointer-events-auto text-white",
        win.isMaximized 
          ? "top-0 left-0 w-full h-[calc(100%-48px)] rounded-none" 
          : "top-[10%] left-[15%] w-[800px] h-[600px] resize",
          isActive ? "ring-1 ring-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" : "opacity-95"
      )}
    >
      <div 
        className="h-10 shrink-0 flex items-center justify-between px-4 select-none cursor-move bg-black/20 border-b border-transparent"
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        <div className="flex items-center space-x-2 overflow-hidden whitespace-nowrap text-xs font-semibold">
          <span>{win.title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          >
            {win.isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden pointer-events-auto bg-transparent">
        {children}
      </div>
    </motion.div>
  );
}
