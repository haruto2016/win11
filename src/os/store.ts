import { create } from 'zustand';
import { ReactNode } from 'react';

export type AppId = 'explorer' | 'browser' | 'settings' | 'exe-installer' | string;

export interface VFile {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'exe';
  content?: string; // base64 or text
  parentId: string | null;
  size?: number;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  openProps?: any;
}

interface OSState {
  bootState: 'login' | 'desktop';
  user: string;
  language: 'en' | 'ja' | 'zh';
  windows: WindowState[];
  files: VFile[];
  installedApps: { id: string; name: string; appId: AppId; icon?: string; size: number }[];
  activeWindowId: string | null;
  startMenuOpen: boolean;
  
  // Boot Actions
  login: (user: string) => void;
  loadFromImg: (files: VFile[], apps: any[], user: string, lang?: 'en'|'ja'|'zh') => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'ja' | 'zh') => void;

  // Actions
  openWindow: (appId: AppId, openProps?: any, title?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  
  // FS Actions
  addFile: (file: VFile) => void;
  deleteFile: (id: string) => void;
  clearFS: () => void;
  loadFS: (files: VFile[]) => void;
  
  // App Actions
  installApp: (name: string, size: number, originalFile?: VFile) => void;
  uninstallApp: (id: string) => void;
}

let windowIdCounter = 0;
let highestZIndex = 10;

const initialFS: VFile[] = [
  { id: 'root', name: 'C:', type: 'folder', parentId: null },
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'root' },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root' },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'root' },
  { id: 'program_files', name: 'Program Files', type: 'folder', parentId: 'root' },
  { id: 'readme', name: 'Welcome.txt', type: 'file', parentId: 'desktop', content: 'Welcome to the Windows 11 Web Simulator!\\n\\nYou can drop files here.\\nExe files will trigger a simulated installer.', size: 1024 },
  { id: 'sample_installer', name: 'BrowserSetup.exe', type: 'exe', parentId: 'downloads', size: 50485760 },
  { id: 'error_installer', name: 'Unsupported_x86.exe', type: 'exe', parentId: 'downloads', size: 1048576 },
];

const initialApps = [
  { id: 'explorer-main', name: 'File Explorer', appId: 'explorer', size: 15000000 },
  { id: 'browser-main', name: 'Microsoft Edge', appId: 'browser', size: 85000000 },
  { id: 'paint-main', name: 'Paint', appId: 'paint', size: 12000000 },
  { id: 'notepad-main', name: 'Notepad', appId: 'notepad', size: 1000000 },
  { id: 'calc-main', name: 'Calculator', appId: 'calculator', size: 2500000 },
  { id: 'snipping-main', name: 'Snipping Tool', appId: 'snipping', size: 3000000 },
  { id: 'camera-main', name: 'Camera', appId: 'camera', size: 4500000 },
  { id: 'settings-main', name: 'Settings', appId: 'settings', size: 5000000 }
];

export const useOSStore = create<OSState>((set, get) => ({
  bootState: 'login',
  user: 'Administrator',
  language: 'ja', // Default to Japanese as requested implicitly
  windows: [],
  files: initialFS,
  installedApps: initialApps,
  activeWindowId: null,
  startMenuOpen: false,

  login: (user) => set({ bootState: 'desktop', user }),
  loadFromImg: (files, apps, user, lang = 'ja') => set({ files, installedApps: apps, user, language: lang, bootState: 'desktop', windows: [] }),
  logout: () => set({ bootState: 'login', windows: [], startMenuOpen: false }),
  setLanguage: (lang) => set({ language: lang }),

  openWindow: (appId, openProps = {}, title = '') => {
    set((state) => {
      highestZIndex += 1;
      const newWindow: WindowState = {
        id: `win_${windowIdCounter++}`,
        appId,
        title: title || appId,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: highestZIndex,
        openProps
      };
      return { 
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        startMenuOpen: false
      };
    });
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id)
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => w.id === id ? { ...w, isMinimized: true } : w),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    }));
  },

  maximizeWindow: (id) => {
    set((state) => {
      highestZIndex += 1;
      return {
        windows: state.windows.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized, zIndex: highestZIndex } : w),
        activeWindowId: id
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      if (state.activeWindowId === id) {
        // If it's already active and we click taskbar icon for it, minimize it?
        // Let's just focus for now. We handle taskbar toggle separately if needed.
      }
      highestZIndex += 1;
      return {
        windows: state.windows.map((w) => {
          if (w.id === id) {
            return { ...w, zIndex: highestZIndex, isMinimized: false };
          }
          return w;
        }),
        activeWindowId: id,
        startMenuOpen: false
      };
    });
  },

  toggleStartMenu: () => {
    set((state) => ({ startMenuOpen: !state.startMenuOpen }));
  },

  closeStartMenu: () => {
    set({ startMenuOpen: false });
  },

  addFile: (file) => {
    set((state) => ({ files: [...state.files, file] }));
  },

  deleteFile: (id) => {
    set((state) => {
      // Very crude recursive delete
      const toDelete = new Set<string>([id]);
      let added = true;
      while(added) {
        added = false;
        state.files.forEach(f => {
          if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
            toDelete.add(f.id);
            added = true;
          }
        });
      }
      return { files: state.files.filter(f => !toDelete.has(f.id)) };
    });
  },

  clearFS: () => {
    set({ files: initialFS, installedApps: initialApps });
  },

  loadFS: (files) => {
    set({ files });
  },

  installApp: (name, size, originalFile) => {
    set((state) => {
      const exeFileId = `file_${Date.now()}`;
      let targetAppId: AppId = 'exe-runner';
      const lowercaseName = name.toLowerCase();
      if (lowercaseName.includes('chrome') || lowercaseName.includes('browser') || lowercaseName.includes('edge') || lowercaseName.includes('firefox')) {
        targetAppId = 'browser';
      }
      const newApp = { id: `app_${Date.now()}`, name, appId: targetAppId, size, fileId: exeFileId };
      // Simulate adding files to Program Files
      const exeFile: VFile = {
        id: exeFileId,
        name: `${name}.exe`,
        type: 'exe',
        parentId: 'program_files',
        size: size,
        content: originalFile?.content
      };
      return {
        installedApps: [...state.installedApps, newApp],
        files: [...state.files, exeFile]
      };
    });
  },
  
  uninstallApp: (id) => {
    set((state) => ({
      installedApps: state.installedApps.filter(app => app.id !== id)
    }));
  }
}));
