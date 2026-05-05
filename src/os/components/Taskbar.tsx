import React from 'react';
import { useOSStore } from '../store';
import { Folder, Chrome, Settings, Terminal, Box, FileText, Calculator, Palette, Scissors, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';

export const APP_ICONS: Record<string, React.ReactNode> = {
  explorer: <Folder className="text-yellow-400" fill="currentColor" size={24} />,
  browser: <Chrome className="text-blue-400" fill="currentColor" size={24} />,
  settings: <Settings className="text-gray-400" fill="currentColor" size={24} />,
  'exe-installer': <Box className="text-purple-400" fill="currentColor" size={24} />,
  notepad: <FileText className="text-cyan-400" fill="currentColor" size={24} />,
  paint: <Palette className="text-pink-400" fill="currentColor" size={24} />,
  calculator: <Calculator className="text-green-400" fill="currentColor" size={24} />,
  snipping: <Scissors className="text-red-400" fill="currentColor" size={24} />,
  camera: <Camera className="text-blue-400" fill="currentColor" size={24} />,
  'exe-runner': <Terminal className="text-emerald-500" fill="currentColor" size={24} />
};

export function Taskbar() {
  const { windows, toggleStartMenu, focusWindow, openWindow, installedApps, activeWindowId } = useOSStore();

  const handleAppClick = (appObj: any) => {
    // If there is an open window for this app, focus it. Otherwise open it.
    // For simplicity, we just find the first window with this appId.
    const existing = windows.find(w => w.appId === appObj.appId);
    if (existing) {
      if (existing.isMinimized) {
        focusWindow(existing.id);
      } else if (activeWindowId === existing.id) {
        // Toggle minimize if it's already active? Windows 11 behavior is complex.
        // Let's just minimize it for true OS feel.
        // minimizeWindow(existing.id);
        useOSStore.getState().minimizeWindow(existing.id);
      } else {
        focusWindow(existing.id);
      }
    } else {
      openWindow(appObj.appId as any, { app: appObj.app }, appObj.name);
    }
  };

  const getIcon = (appId: string) => APP_ICONS[appId] || <Box size={24} />;

  // Pinned apps + running apps that aren't pinned
  const taskbarApps = [
    { appId: 'explorer', name: 'File Explorer', app: null },
    { appId: 'browser', name: 'Microsoft Edge', app: null },
    { appId: 'paint', name: 'Paint', app: null },
    { appId: 'notepad', name: 'Notepad', app: null },
    ...installedApps.filter(app => !['explorer', 'browser', 'paint', 'notepad'].includes(app.appId)).map(app => ({ appId: app.appId, name: app.name, app: app }))
  ];

  // Add any running windows that aren't in taskbarApps (dynamically spawned)
  windows.forEach(w => {
    if (!taskbarApps.find(a => a.appId === w.appId)) {
      taskbarApps.push({ appId: w.appId, name: w.title, app: w.openProps?.app });
    }
  });

  return (
    <div className="h-12 bg-black/30 backdrop-blur-xl border-t border-white/10 fixed bottom-0 w-full z-50 flex items-center justify-between px-4">
      <div className="w-1/3"></div>
      
      <div className="flex items-center justify-center space-x-2">
        {/* Start Button */}
        <button 
          onClick={toggleStartMenu}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <div className="w-5 h-5 flex flex-wrap gap-[2px] opacity-90">
            <div className="w-[9px] h-[9px] bg-blue-400"></div>
            <div className="w-[9px] h-[9px] bg-blue-400"></div>
            <div className="w-[9px] h-[9px] bg-blue-400"></div>
            <div className="w-[9px] h-[9px] bg-blue-400"></div>
          </div>
        </button>

        {/* App Icons */}
        {taskbarApps.map((app) => {
          const isOpen = windows.some(w => w.appId === app.appId);
          const isActive = windows.some(w => w.appId === app.appId && activeWindowId === w.id);
          
          return (
            <button
              key={app.appId}
              onClick={() => handleAppClick(app)}
              className={cn(
                "w-10 h-10 rounded flex items-center justify-center transition-all relative group hover:bg-white/10",
                isActive ? "bg-white/10 border-b-2 border-blue-400" : "border-b-2 border-transparent"
              )}
              title={app.name}
            >
              <div className={cn("transition-transform opacity-90", isActive ? "scale-95" : "")}>
                {getIcon(app.appId)}
              </div>
              
              {/* Open indicator */}
              {isOpen && !isActive && (
                <div className="absolute bottom-[2px] h-[2px] w-4 bg-white/40 rounded-sm" />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-1/3 flex justify-end items-center gap-3">
        <div className="flex gap-2 opacity-80 text-white">
          <div className="w-4 h-4 border border-white rounded-full flex items-center justify-center text-[10px]">i</div>
        </div>
        <div className="text-right pr-2 text-white">
          <div className="text-[10px] font-semibold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          <div className="text-[10px] opacity-60">{new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
