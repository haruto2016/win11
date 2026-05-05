import React, { useState, useEffect, useRef } from 'react';
import { WindowState } from '../store';
import { Shield, RefreshCw, ArrowLeft, ArrowRight, Home, ShieldX } from 'lucide-react';

export function Browser({ win }: { win: WindowState }) {
  const initialUrl = typeof win.openProps?.url === 'string' ? win.openProps.url : 'https://www.google.com/webhp?igu=1';
  const initialInput = typeof win.openProps?.url === 'string' ? win.openProps.url : 'https://www.google.com/';
  
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [cryptoMode, setCryptoMode] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateTo = (newUrl: string) => {
    setUrl(newUrl);
    setInputUrl(newUrl);
    
    // Add to history and remove future forward history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
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

  useEffect(() => {
    if (typeof win.openProps?.url === 'string' && win.openProps.url !== url) {
      navigateTo(win.openProps.url);
    }
  }, [win.openProps?.url]);

  const handleReload = () => {
    // If the iframe shares the same origin, we could reload it via ref,
    // but typically we are dealing with cross-origin. 
    // Changing the key forces the element to re-mount and reload.
    setLoading(true);
    setReloadKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cryptoMode) return;
    setLoading(true);
    let finalUrl = inputUrl;
    if (!finalUrl.startsWith('http')) {
      if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
        finalUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(finalUrl);
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
    if (newMode) {
      navigateTo('https://www.croxyproxy.com/');
    } else {
      navigateTo('https://www.google.com/webhp?igu=1');
    }
  };


  return (
    <div className="flex flex-col h-full bg-black/40 text-white backdrop-blur-md">
      {/* Toolbar */}
      <div className="h-12 bg-black/20 flex items-center px-3 space-x-3 border-b border-white/10 shadow-inner">
        <button 
          onClick={handleBack}
          disabled={historyIndex === 0}
          className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft size={16} />
        </button>
        <button 
          onClick={handleForward}
          disabled={historyIndex >= history.length - 1}
          className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowRight size={16} />
        </button>
        <button className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white" onClick={handleReload}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
        <button className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white" onClick={() => { setCryptoMode(false); navigateTo('https://www.google.com/webhp?igu=1'); }}>
          <Home size={16} />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-black/40 px-3 py-1.5 rounded flex border border-white/10 mx-2 focus-within:border-white/30 transition-colors shadow-inner">
          <Shield size={14} className={cryptoMode ? "text-emerald-400 mr-2 shrink-0" : "text-white/40 mr-2 shrink-0"} title={cryptoMode ? "Advanced Cloud Unblocker Active" : "Basic Request"} />
          <input 
            type="text" 
            value={cryptoMode ? "🔒 Connected to Network Unblocker Engine" : inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={cryptoMode}
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-white/40 disabled:text-emerald-400 disabled:opacity-100"
          />
        </form>
        
        <button 
           onClick={toggleCryptoMode} 
           title="Toggle Advanced Unblocker Mode"
           className={`flex items-center px-3 py-1 text-xs font-semibold rounded shadow-sm border transition-all ${cryptoMode ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
        >
          {cryptoMode ? <Shield size={14} className="mr-1.5" /> : <ShieldX size={14} className="mr-1.5" />}
          {cryptoMode ? "Unblocker ON" : "Unblocker OFF"}
        </button>
      </div>

      {cryptoMode && (
        <div className="bg-emerald-500/20 px-4 py-1.5 border-b border-emerald-500/30 flex items-center shadow-inner">
          <Shield size={12} className="mr-2 text-emerald-400" />
          <span className="text-[10px] text-emerald-100">Directly bypass school / client-side filtering and X-Frame limits using Croxy Network protocol.</span>
        </div>
      )}

      <div className="flex-1 bg-white relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : null}
        
        <iframe 
          key={reloadKey}
          ref={iframeRef}
          src={url} 
          className="w-full h-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-popups-to-escape-sandbox"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          title="Browser"
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>
    </div>
  );
}
