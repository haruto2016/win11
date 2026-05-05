import React, { useState } from 'react';
import { WindowState } from '../store';
import { useTranslation } from '../i18n';

export function NotepadApp({ win }: { win: WindowState }) {
  const [text, setText] = useState('');
  const t = useTranslation();
  return (
    <div className="flex flex-col h-full bg-white text-black">
      <div className="h-8 bg-gray-100 border-b border-gray-300 flex items-center px-4 text-xs space-x-4">
        <span className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">{t.apps.notepad.file}</span>
        <span className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">{t.apps.notepad.edit}</span>
        <span className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">{t.apps.notepad.format}</span>
        <span className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">{t.apps.notepad.view}</span>
        <span className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">{t.apps.notepad.help}</span>
      </div>
      <textarea 
        className="flex-1 w-full p-2 resize-none outline-none font-mono text-sm leading-relaxed"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
