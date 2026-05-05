import React, { useState, useRef } from 'react';
import { useOSStore } from './store';
import { User, Image as ImageIcon, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from './i18n';

export function LoginScreen() {
  const { login, loadFromImg, language, setLanguage } = useOSStore();
  const [mode, setMode] = useState<'select' | 'new' | 'img'>('select');
  const [username, setUsername] = useState('Administrator');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
    }
  };

  const handleImgLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        if (data && data.files && data.installedApps) {
          loadFromImg(data.files, data.installedApps, data.user || 'LoadedUser');
        } else {
          alert('Invalid .img structure');
        }
      } catch (err) {
        alert('Failed to parse .img file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
      >
        <div className="w-32 h-32 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center mb-8 shadow-2xl backdrop-blur-md">
          <User size={64} className="text-white/80" />
        </div>

        {mode === 'select' && (
          <div className="space-y-4 w-full">
            <button 
              onClick={() => setMode('new')}
              className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium flex items-center transition-all backdrop-blur-md"
            >
              <User className="mr-3 text-blue-400" />
              {t.login.newSession}
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium flex items-center transition-all backdrop-blur-md"
            >
              <Upload className="mr-3 text-green-400" />
              {t.login.loadImg}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".img,.json" onChange={handleImgLoad} />
            <div className="pt-4 flex items-center justify-center gap-2 text-white/50 text-sm">
              <span>{t.login.langLabel}</span>
              <select 
                title="Language"
                className="bg-black/40 border border-white/20 rounded px-2 py-1 outline-none text-white text-xs" 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        )}

        {mode === 'new' && (
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.login.username}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 backdrop-blur-md text-center text-lg"
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setMode('select')}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all backdrop-blur-md"
              >
                {t.login.back}
              </button>
              <button 
                type="submit"
                className="flex-[2] py-3 px-4 bg-blue-600/80 hover:bg-blue-500/80 border border-blue-500/50 rounded-xl text-white font-medium transition-all shadow-lg backdrop-blur-md"
              >
                {t.login.boot}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
