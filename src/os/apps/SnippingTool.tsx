import React, { useState } from 'react';
import { WindowState } from '../store';
import { Scissors, Camera } from 'lucide-react';
import { useTranslation } from '../i18n';

export function SnippingToolApp({ win }: { win: WindowState }) {
  const [isSnipping, setIsSnipping] = useState(false);
  const t = useTranslation();

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-black">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white m-2 rounded shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Scissors size={32} />
        </div>
        <h2 className="text-2xl font-light mb-2">{t.apps.snipping.title}</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">{t.apps.snipping.desc}</p>
        
        <button 
          onClick={() => setIsSnipping(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors shadow shadow-blue-600/20"
        >
          <Camera size={18} /> {isSnipping ? t.apps.snipping.cancelSnip : t.apps.snipping.newSnip}
        </button>

        {isSnipping && (
          <p className="mt-4 text-xs text-blue-600 animate-pulse">{t.apps.snipping.simulation}</p>
        )}
      </div>
    </div>
  );
}
