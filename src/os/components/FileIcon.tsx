import React from 'react';
import { FileText, Folder, Box } from 'lucide-react';
import { VFile } from '../store';
import { cn } from '../../lib/utils';
import { useTranslation } from '../i18n';

interface FileIconProps {
  key?: React.Key;
  file: VFile;
  onDoubleClick?: () => void;
  className?: string;
}

export function FileIcon({ file, onDoubleClick, className }: FileIconProps) {
  const t = useTranslation();
  
  const getIcon = () => {
    switch (file.type) {
      case 'folder': return <Folder size={36} className="text-yellow-400 drop-shadow-md" fill="currentColor" />;
      case 'exe': return <Box size={36} className="text-purple-500 drop-shadow-md" fill="currentColor" />;
      default: return <FileText size={36} className="text-blue-200 drop-shadow-md" fill="currentColor" />;
    }
  };

  let displayName = file.name;
  if (file.id === 'recycle') {
    displayName = t.desktop?.recycleBin || "Recycle Bin";
  }

  return (
    <div 
      className={cn("w-20 rounded flex flex-col items-center justify-start gap-1 cursor-pointer p-2 hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors group", className)}
      onDoubleClick={onDoubleClick}
    >
      <div className="mb-1 group-hover:scale-105 transition-transform">
        {getIcon()}
      </div>
      <span className="text-xs text-white drop-shadow-md text-center break-words w-full line-clamp-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        {displayName}
      </span>
    </div>
  );
}
