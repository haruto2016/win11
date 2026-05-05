import React, { useState } from 'react';
import { useOSStore, WindowState } from '../store';
import { Search, ChevronLeft, ChevronRight, ChevronUp, Download, HardDrive, Usb } from 'lucide-react';
import { FileIcon } from '../components/FileIcon';
import { useTranslation } from '../i18n';

export function FileExplorer({ win }: { win: WindowState }) {
  const { files, addFile, openWindow } = useOSStore();
  const [currentPath, setCurrentPath] = useState<string>(win.openProps?.path || 'root');
  const t = useTranslation();
  
  const currentFolder = files.find(f => f.id === currentPath);
  const contents = files.filter(f => f.parentId === currentPath);

  const handleExportImg = () => {
    // Simulates saving system state as an .img (JSON blob)
    const state = useOSStore.getState();
    const dataObj = {
      files: state.files,
      installedApps: state.installedApps,
      user: state.user
    };
    const data = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'windows_backup.img'; // Pseudo .img
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          useOSStore.getState().loadFS(parsed);
          alert('OS details restored from .img!');
        } catch (err) {
          alert('Invalid .img file.');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-white">
      {/* Toolbar */}
      <div className="flex items-center px-4 py-2 space-x-4 bg-black/20 border-b border-white/5">
        <div className="flex items-center space-x-1 text-white/50">
          <button className="p-1 hover:bg-white/10 hover:text-white rounded transition-colors" onClick={() => { if(currentFolder?.parentId) setCurrentPath(currentFolder.parentId) }}>
            <ChevronLeft size={20} />
          </button>
          <button className="p-1 hover:bg-white/10 hover:text-white rounded transition-colors disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
          <button className="p-1 hover:bg-white/10 hover:text-white rounded transition-colors" onClick={() => { if(currentFolder?.parentId) setCurrentPath(currentFolder.parentId) }}>
            <ChevronUp size={20} />
          </button>
        </div>

        <div className="flex-1 flex px-3 py-1.5 bg-black/40 border border-white/10 rounded items-center shadow-inner">
          <HardDrive size={16} className="text-blue-400 mr-2" />
          <span className="text-sm text-white/90 flex-1">{currentFolder?.name || t.explorer.localDisk}</span>
        </div>

        <div className="w-64 flex px-3 py-1.5 bg-black/40 border border-white/10 rounded items-center shadow-inner">
          <Search size={16} className="text-white/40 mr-2" />
          <input type="text" placeholder={`${t.explorer.search} ${currentFolder?.name || t.explorer.localDisk}`} className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-white/40" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-black/10 border-r border-white/5 p-4 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-2 mb-1">{t.explorer.quickAccess}</div>
            {['desktop', 'documents', 'downloads'].map(id => {
              const f = files.find(file => file.id === id);
              if (!f) return null;
              // Translate common folder names
              let displayName = f.name;
              if (id === 'desktop') displayName = t.explorer.desktop;
              if (id === 'documents') displayName = t.explorer.documents;
              if (id === 'downloads') displayName = t.explorer.downloads;
              
              return (
                <div 
                  key={id} 
                  className={`px-3 py-2 rounded cursor-pointer flex items-center space-x-3 text-xs transition-colors ${currentPath === id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => setCurrentPath(id)}
                >
                  <FileIcon file={{...f, type: 'folder'}} className="w-5 h-5 p-0 scale-[0.6] border-none hover:bg-transparent -ml-2 filter drop-shadow-none" />
                  <span>{displayName}</span>
                </div>
              );
            })}
            
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider px-2 pt-6 pb-2 border-t border-white/5 mt-4">{t.explorer.externalContent}</div>
            
            <div className="px-3 py-2 rounded cursor-pointer flex items-center space-x-3 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors" onClick={handleExportImg}>
              <Download size={14} className="text-purple-400" />
              <span>{t.explorer.exportImg}</span>
            </div>
            
            <label className="px-3 py-2 rounded cursor-pointer flex items-center space-x-3 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors">
              <Usb size={14} className="text-yellow-400" />
              <span>{t.explorer.importImg}</span>
              <input type="file" className="hidden" accept=".img,.json" onChange={handleImportImg} />
            </label>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-6 overflow-y-auto w-full">
          {contents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <span className="text-sm font-medium">{t.explorer.emptyFolder}</span>
              <span className="text-xs mt-2">{t.explorer.dragDrop}</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 content-start">
              {contents.map(file => (
                <div key={file.id} className="relative group flex flex-col items-center">
                  <FileIcon 
                    file={file} 
                    onDoubleClick={() => {
                      if (file.type === 'folder') setCurrentPath(file.id);
                      else if (file.type === 'exe') openWindow('exe-installer', { file }, file.name);
                      else openWindow('explorer', { fileId: file.id }, file.name); // basic open, maybe a viewer
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
