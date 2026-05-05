import React, { useRef, useState } from 'react';
import { useOSStore } from './store';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { WindowFrame } from './components/WindowFrame';
import { FileExplorer } from './apps/FileExplorer';
import { Browser } from './apps/Browser';
import { Settings } from './apps/Settings';
import { ExeInstaller } from './apps/ExeInstaller';
import { NotepadApp } from './apps/Notepad';
import { CalculatorApp } from './apps/Calculator';
import { PaintApp } from './apps/Paint';
import { SnippingToolApp } from './apps/SnippingTool';
import { CameraApp } from './apps/Camera';
import { ExeRunner } from './apps/ExeRunner';
import { FileIcon } from './components/FileIcon';

export function Desktop() {
  const { windows, files, addFile, openWindow } = useOSStore();
  const desktopFiles = files.filter(f => f.parentId === 'desktop');
  const desktopRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file: File) => {
        const isExe = file.name.endsWith('.exe');
        
        // Read file content for small text files, else just store name
        if (file.type.startsWith('text/') || isExe) {
          const reader = new FileReader();
          reader.onload = (event) => {
            addFile({
              id: `file_${Date.now()}_${Math.random()}`,
              name: file.name,
              type: isExe ? 'exe' : 'file',
              content: event.target?.result as string,
              parentId: 'desktop',
              size: file.size
            });
          };
          reader.readAsDataURL(file as unknown as Blob); // Store as data url for simplicity
        } else {
          addFile({
            id: `file_${Date.now()}_${Math.random()}`,
            name: file.name,
            type: 'file',
            parentId: 'desktop',
            size: file.size
          });
        }
      });
    }
  };

  return (
    <div 
      className="w-full h-screen overflow-hidden bg-[#005a9e] relative select-none font-sans text-white"
      style={{ background: 'radial-gradient(circle at center, #0078d4 0%, #001a35 100%)' }}
      ref={desktopRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      />
      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 bottom-12 p-2 flex flex-col flex-wrap gap-4 content-start">
        {desktopFiles.map(file => (
          <FileIcon key={file.id} file={file} onDoubleClick={() => {
            if (file.type === 'exe') {
              openWindow('exe-installer', { file }, file.name);
            } else if (file.type === 'folder') {
              openWindow('explorer', { path: file.id }, file.name);
            } else {
              // Open in text viewer or generic app
              openWindow('explorer', { fileId: file.id }, file.name);
            }
          }} />
        ))}
      </div>

      {/* Windows */}
      {windows.map((win) => {
        let AppContent = null;
        switch (win.appId) {
          case 'explorer': AppContent = <FileExplorer win={win} />; break;
          case 'browser': AppContent = <Browser win={win} />; break;
          case 'settings': AppContent = <Settings win={win} />; break;
          case 'exe-installer': AppContent = <ExeInstaller win={win} />; break;
          case 'notepad': AppContent = <NotepadApp win={win} />; break;
          case 'calculator': AppContent = <CalculatorApp win={win} />; break;
          case 'paint': AppContent = <PaintApp win={win} />; break;
          case 'snipping': AppContent = <SnippingToolApp win={win} />; break;
          case 'camera': AppContent = <CameraApp win={win} />; break;
          case 'exe-runner': AppContent = <ExeRunner win={win} />; break;
          default: AppContent = <div className="p-4">App not found</div>;
        }

        return (
          <WindowFrame key={win.id} win={win}>
            {AppContent}
          </WindowFrame>
        );
      })}

      <StartMenu />
      <Taskbar />
    </div>
  );
}
