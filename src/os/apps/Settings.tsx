import React, { useState } from 'react';
import { Shield, Globe, HardDrive, Download, Power, Info, Box, Languages } from 'lucide-react';
import { useOSStore } from '../store';
import { useTranslation } from '../i18n';

export function Settings() {
  const { files, clearFS, installedApps, uninstallApp, logout, language, setLanguage } = useOSStore();
  const [proxyEnabled, setProxyEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('security');
  const t = useTranslation();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

  return (
    <div className="flex h-full bg-transparent text-white">
      {/* Sidebar */}
      <div className="w-56 bg-black/10 border-r border-white/5 p-4 flex flex-col pt-6">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-4 px-2">{t.settings.title}</h2>
        
        <div className="space-y-1">
          <button 
            className={`w-full flex items-center px-3 py-2 rounded font-medium text-xs transition ${activeTab === 'security' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={16} className={`mr-3 ${activeTab === 'security' ? 'text-blue-400' : ''}`} />
            {t.settings.security}
          </button>
          <button 
            className={`w-full flex items-center px-3 py-2 rounded font-medium text-xs transition ${activeTab === 'storage' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('storage')}
          >
            <HardDrive size={16} className={`mr-3 ${activeTab === 'storage' ? 'text-green-400' : ''}`} />
            {t.settings.storage}
          </button>
          <button 
            className={`w-full flex items-center px-3 py-2 rounded font-medium text-xs transition ${activeTab === 'apps' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('apps')}
          >
            <Box size={16} className={`mr-3 ${activeTab === 'apps' ? 'text-purple-400' : ''}`} />
            {t.settings.apps}
          </button>
          <button 
            className={`w-full flex items-center px-3 py-2 rounded font-medium text-xs transition ${activeTab === 'language' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('language')}
          >
            <Languages size={16} className={`mr-3 ${activeTab === 'language' ? 'text-orange-400' : ''}`} />
            {t.settings.language}
          </button>
          <button 
            className={`w-full flex items-center px-3 py-2 rounded font-medium text-xs transition ${activeTab === 'about' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={16} className={`mr-3 ${activeTab === 'about' ? 'text-blue-400' : ''}`} />
            {t.settings.about}
          </button>
        </div>

        <div className="mt-auto">
          <button 
            className="w-full flex items-center px-3 py-2 rounded hover:bg-white/5 text-white/60 hover:text-white font-medium text-xs transition"
            onClick={logout}
          >
            <Power size={16} className="mr-3 text-red-500" />
            {t.settings.signout}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto w-full">
        {activeTab === 'security' && (
          <>
            <h3 className="text-xl font-light mb-6">{t.settings.security}</h3>
            
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden mb-8">
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold flex items-center text-sm">
                    <Globe size={16} className="mr-2 text-green-400" /> {t.settings.networkBridge}
                  </span>
                  <span className="text-xs text-white/50 mt-1">{t.settings.networkDesc}</span>
                </div>
                
                {/* Toggle */}
                <button 
                  className={`w-10 h-5 rounded-full transition-colors relative border ${proxyEnabled ? 'bg-blue-600 border-blue-500' : 'bg-black/40 border-white/20'}`}
                  onClick={() => setProxyEnabled(!proxyEnabled)}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-[3px] transition-transform ${proxyEnabled ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                </button>
              </div>
              
              <div className="p-5 bg-black/20">
                <p className="text-xs text-white/70 mb-2">{t.settings.currentNode} <strong className="text-green-400 font-mono">jp-tokyo-secure-01</strong></p>
                <p className="text-[10px] text-white/40">{t.settings.nodeDesc}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'storage' && (
          <>
            <h3 className="text-xl font-light mb-6">{t.settings.storage}</h3>
            
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">{t.settings.diskUsage}</div>
                  <span className="text-xs text-white/70 font-mono">{formatSize(totalSize)}</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 shadow-inner">
                  <div className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: Math.max((totalSize / 104857600) * 100, 1) + '%' }}></div>
                </div>
              </div>
              
              <div className="p-5 flex gap-3">
                <button 
                  onClick={() => alert("To export, open File Explorer and click 'Export as .img' under External Content.")}
                  className="flex items-center px-4 py-2 border border-white/10 rounded bg-white/5 hover:bg-white/10 font-semibold text-xs transition-colors"
                >
                  <Download size={14} className="mr-2" /> {t.settings.exportBtn}
                </button>
                <button 
                  onClick={() => {
                    if (confirm(t.settings.formatConfirm)) {
                      clearFS();
                    }
                  }}
                  className="flex items-center px-4 py-2 border border-red-500/30 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold text-xs transition-colors"
                >
                  <Power size={14} className="mr-2" /> {t.settings.formatBtn}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'apps' && (
          <>
            <h3 className="text-xl font-light mb-6">{t.settings.apps}</h3>
            
            <div className="space-y-4">
              {installedApps.map(app => (
                <div key={app.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-black/20 rounded flex items-center justify-center mr-4 border border-white/5">
                      <Box size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white/90">{app.name}</h4>
                      <p className="text-xs text-white/50">{formatSize(app.size)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm(`Uninstall ${app.name}?`)) uninstallApp(app.id);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    disabled={app.id.includes('-main')}
                  >
                    {t.settings.uninstall}
                  </button>
                </div>
              ))}
              {installedApps.length === 0 && (
                <div className="text-center p-8 text-white/50 text-sm">{t.settings.noApps}</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'about' && (
          <div className="text-white/70 text-sm space-y-4">
            <h3 className="text-xl font-light mb-6 text-white">{t.settings.aboutTitle}</h3>
            <p>{t.settings.aboutDesc1}</p>
            <p>{t.settings.aboutDesc2}</p>
          </div>
        )}

        {activeTab === 'language' && (
          <>
            <h3 className="text-xl font-light mb-6">{t.settings.language}</h3>
            
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden mb-8 p-5">
              <label className="text-sm font-semibold flex items-center mb-4">
                <Languages size={18} className="mr-2 text-orange-400" /> {t.settings.chooseLanguage}
              </label>
              
              <select 
                className="bg-black/40 border border-white/20 rounded-md px-4 py-2 outline-none text-white text-sm w-full font-sans cursor-pointer focus:border-blue-400 transition" 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="ja">日本語 (Japanese)</option>
                <option value="en">English</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
