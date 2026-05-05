import React, { useState, useRef, useEffect } from 'react';
import { Search, Shield, RefreshCw, ArrowLeft, ArrowRight, Home, ShieldX, Frame, Maximize, Loader2 } from 'lucide-react';

export function ProxyApp() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [cryptoMode, setCryptoMode] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [swReady, setSwReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateTo = (newUrl: string) => {
    setUrl(newUrl);
    setInputUrl(newUrl);
    
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== newUrl) {
      newHistory.push(newUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setUrl(prevUrl);
      setInputUrl(prevUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setUrl(nextUrl);
      setInputUrl(nextUrl);
    }
  };

  const handleReload = () => {
    setLoading(true);
    setReloadKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setLoading(true);
    let finalUrl = inputUrl.trim();

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(finalUrl);
      } else {
        finalUrl = 'https://' + finalUrl;
      }
    }
    
    navigateTo(finalUrl);
    setTimeout(() => setLoading(false), 800);
  };

  const toggleCryptoMode = () => {
    const newMode = !cryptoMode;
    setCryptoMode(newMode);
    
    if (url && url !== 'https://www.croxyproxy.com/') {
      handleReload();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Register UV service worker and wait until it's fully active
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/uv/service/'
      }).then(async (reg) => {
        console.log('UV Service Worker registered with scope:', reg.scope);
        
        // Wait for the SW to become active
        const sw = reg.active || reg.waiting || reg.installing;
        if (sw) {
          if (sw.state === 'activated') {
            setSwReady(true);
          } else {
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') {
                setSwReady(true);
              }
            });
          }
        }
        
        // Also check if there's already a controlling SW
        if (navigator.serviceWorker.controller) {
          setSwReady(true);
        }
      }).catch(err => {
        console.error('UV Service Worker registration failed:', err);
        // Still allow browsing even if SW fails
        setSwReady(true);
      });

      // If a controller already exists from a previous load
      if (navigator.serviceWorker.controller) {
        setSwReady(true);
      }
    } else {
      setSwReady(true);
    }

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getUnblockedUrl = (targetUrl: string) => {
    if (!targetUrl) return targetUrl;
    if (cryptoMode) {
      const uvConfig = (window as any).__uv$config;
      if (uvConfig && uvConfig.prefix && uvConfig.encodeUrl) {
        return uvConfig.prefix + uvConfig.encodeUrl(targetUrl);
      }
      console.warn('Ultraviolet config not loaded yet. Make sure /uv/uv.config.js is accessible.');
    }
    return targetUrl;
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-gray-200">
      {/* Navigation Bar */}
      <div className="h-16 bg-[#1a1a1a] border-b border-[#333] flex items-center px-4 space-x-3 shrink-0">
        <div className="flex space-x-1">
          <button 
            onClick={handleBack}
            disabled={historyIndex <= 0}
            title="Go back"
            className="p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <button 
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            title="Go forward"
            className="p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={handleReload}
            title="Reload page"
            disabled={!url && !cryptoMode}
            className="p-2 rounded-full transition-colors text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <RefreshCw size={18} className={loading && url ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setCryptoMode(false); navigateTo(''); setInputUrl(''); }}
            title="Home"
            className="p-2 rounded-full transition-colors text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Home size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-3xl flex items-center bg-[#252525] rounded-full px-4 py-2 border border-[#3a3a3a] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
          <Shield size={16} className={cryptoMode ? "text-emerald-400 mr-3 shrink-0" : "text-gray-400 mr-3 shrink-0"} title={cryptoMode ? "Advanced Cloud Unblocker Active" : "Basic Request"} />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={cryptoMode ? "🔒 Enter URL to unblock (Unblocker ON)" : "Search the web or enter a URL"}
            className={`w-full bg-transparent border-none outline-none text-[15px] placeholder-gray-500 ${cryptoMode ? 'text-emerald-300' : 'text-white'}`}
          />
        </form>
        
        <div className="flex space-x-2">
          <button 
             onClick={toggleCryptoMode} 
             title="Toggle Advanced Unblocker Mode"
             className={`flex items-center px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-all ${cryptoMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-[#252525] border border-[#333] text-gray-300 hover:bg-[#333]'}`}
          >
            {cryptoMode ? <Shield size={16} className="mr-2" /> : <ShieldX size={16} className="mr-2" />}
            {cryptoMode ? "Unblocker ON" : "Unblocker OFF"}
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 rounded-full transition-colors text-gray-300 bg-[#252525] border border-[#333] hover:text-white hover:bg-[#333]"
          >
            {isFullscreen ? <Frame size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {cryptoMode && (
        <div className="bg-emerald-500/10 px-4 py-2 flex items-center shadow-inner shrink-0 border-b border-emerald-500/20">
          <Shield size={14} className="mr-2 text-emerald-400" />
          <span className="text-xs text-emerald-200">Directly bypass school / client-side filtering and X-Frame limits using Croxy Network protocol. Games and complex websites will work here.</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative bg-white flex flex-col">
        {!url && !cryptoMode ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
            {/* Minimalist Start Page */}
            <div className="max-w-xl w-full px-6 flex flex-col items-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Shield size={48} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Proxy Browser</h1>
              <p className="text-gray-400 mb-10 text-center">Enter a URL or search term above to start browsing securely and privately.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[
                  { name: 'YouTube', href: 'https://youtube.com', icon: '📹' },
                  { name: 'Poki Games', href: 'https://poki.com', icon: '🎮' },
                  { name: 'Twitch', href: 'https://twitch.tv', icon: '🟣' },
                  { name: 'Discord', href: 'https://discord.com/app', icon: '💬' }
                ].map((bookmark) => (
                  <button 
                    key={bookmark.name}
                    onClick={() => {
                      setInputUrl(bookmark.href);
                      navigateTo(bookmark.href);
                    }}
                    className="flex flex-col items-center p-4 bg-[#252525] hover:bg-[#333] rounded-xl border border-[#333] transition-all hover:scale-105"
                  >
                    <span className="text-2xl mb-2">{bookmark.icon}</span>
                    <span className="text-sm font-medium text-gray-300">{bookmark.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {cryptoMode && !swReady ? (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white">
                <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Initializing Network Unblocker Engine...</p>
              </div>
            ) : (
              <iframe 
                key={reloadKey}
                ref={iframeRef}
                src={getUnblockedUrl(url)} 
                className="w-full h-full border-none bg-white flex-1"
                {...(cryptoMode ? {} : { sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-popups-to-escape-sandbox allow-top-navigation allow-presentation allow-pointer-lock" })}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                title="Browser"
                allow="camera; microphone; fullscreen; display-capture; clipboard-read; clipboard-write; autoplay"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
