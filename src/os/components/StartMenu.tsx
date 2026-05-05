import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../store';
import { Search, Power } from 'lucide-react';
import { cn } from '../../lib/utils';
import { APP_ICONS } from './Taskbar';
import { useTranslation } from '../i18n';

export function StartMenu() {
  const { startMenuOpen, closeStartMenu, installedApps, openWindow, user } = useOSStore();
  const t = useTranslation();

  const handleOpen = (app: any) => {
    openWindow(app.appId as any, { app }, app.name);
  };

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeStartMenu} />
          
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[600px] h-[650px] bg-[#1a1a1a]/90 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 z-50 flex flex-col p-8 text-white"
          >
            {/* Search */}
            <div className="w-full bg-black/20 rounded border border-white/10 h-10 px-4 flex items-center shadow-inner">
              <Search size={18} className="text-blue-400 mr-3" />
              <input 
                type="text" 
                placeholder={t.startMenu.search}
                className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-white/40"
              />
            </div>

            {/* Pinned Apps */}
            <div className="mt-8 flex-1">
              <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-sm font-semibold">{t.startMenu.pinned}</h3>
                <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 transition-colors">{t.startMenu.allApps} {'>'}</button>
              </div>
              
              <div className="grid grid-cols-6 gap-y-6">
                {installedApps.map((app) => (
                  <div key={app.id} 
                    onClick={() => handleOpen(app)}
                    className="flex flex-col items-center justify-center cursor-pointer p-2 rounded hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-white/5 border border-white/10 group-hover:border-white/20 rounded flex items-center justify-center mb-2 shadow-sm transition-colors">
                      {APP_ICONS[app.appId] ? React.cloneElement(APP_ICONS[app.appId] as React.ReactElement, { size: 28 }) : <span className="text-blue-400 font-bold">{app.name.substring(0,2).toUpperCase()}</span>}
                    </div>
                    <span className="text-xs text-center truncate w-full px-1 opacity-80 group-hover:opacity-100">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Profile / Power */}
            <div className="h-16 flex items-center justify-between border-t border-white/10 -mx-8 px-8 pb-4 pt-4 mt-auto">
              <div className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded cursor-pointer transition">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5"><div className="w-full h-full bg-black/20 rounded-sm"></div></div>
                <span className="text-sm font-medium">{user}</span>
              </div>
              
              <button onClick={() => window.location.reload()} className="p-2 rounded hover:bg-white/10 transition" title={t.startMenu.restart}>
                <Power size={18} className="text-white/80" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
