import React, { useState, useEffect } from 'react';
import { useOSStore, WindowState } from '../store';
import { Box, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';

export function ExeInstaller({ win }: { win: WindowState }) {
  const { file } = win.openProps || {};
  const { installApp, closeWindow } = useOSStore();
  const [step, setStep] = useState(0); 
  const t = useTranslation();
  // 0: Warning, 1: Installing, 2: Done, 3: Error
  const [errorMsg, setErrorMsg] = useState('');

  const isUnsupported = file?.name?.toLowerCase().includes('unsupported') || file?.size < 1000;

  const runInstall = () => {
    setStep(1);
  };

  useEffect(() => {
    if (step === 1) {
      if (isUnsupported) {
        setTimeout(() => {
          setErrorMsg('Virtualization Engine Error: Instruction set mismatch. The PE header specifies an architecture not supported by the current hypervisor profile.');
          setStep(3);
        }, 1500);
        return;
      }
      
      const timer = setTimeout(() => {
        setStep(2);
        const appSize = file?.size ? file.size * 1.5 : 5000000; // Inflate size a bit for "installation"
        installApp(file?.name.replace('.exe', '') || 'New Program', appSize, file);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-transparent text-white">
      
      {/* Header */}
      <div className="bg-black/20 p-6 flex items-center border-b border-white/10 shadow-inner">
        <div className="w-12 h-12 bg-white/5 rounded border border-white/10 flex items-center justify-center mr-4 shadow-sm">
          <Box size={24} className="text-purple-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1">{t.installer.sandboxMode}</div>
          <h2 className="text-xl font-light">{file?.name || 'Setup.exe'}</h2>
          <p className="text-xs text-white/50 mt-1">{t.installer.executingIn}</p>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
        {/* Background grid pattern subtle */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 w-full flex justify-center">
          {step === 0 && (
            <div className="max-w-md w-full bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl">
              <div className="flex items-start mb-6">
                <AlertTriangle className="text-yellow-500 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-sm">{t.installer.securityWarning}</h3>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    {t.installer.warningDesc}
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded p-3 mb-6 text-[11px] text-white/50 font-mono flex flex-col gap-1 shadow-inner">
                <span>{t.installer.file} <span className="text-white/80">{file?.name}</span></span>
                <span>{t.installer.size} <span className="text-white/80">{file?.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown'}</span></span>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => closeWindow(win.id)}
                  className="px-4 py-2 border border-white/10 rounded bg-white/5 hover:bg-white/10 font-semibold text-xs transition-colors"
                >
                  {t.installer.btnNo}
                </button>
                <button 
                  onClick={runInstall}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs transition-colors flex items-center shadow-lg shadow-blue-500/20"
                >
                  <Lock size={12} className="mr-2" /> {t.installer.btnYes}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="w-full max-w-md text-center">
              <h3 className="text-lg font-light mb-6">{t.installer.installing} {file?.name.replace('.exe', '') || 'Program'}...</h3>
              <div className="w-full bg-black/40 rounded-full h-1.5 mb-3 shadow-inner">
                <motion.div 
                  className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-white/50">{t.installer.allocating}</p>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-md text-center">
              <div className="mx-auto w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <h3 className="text-lg font-light mb-2">{t.installer.success}</h3>
              <p className="text-xs text-white/60 mb-8 leading-relaxed max-w-xs mx-auto">
                {t.installer.successDesc}
              </p>
              <button 
                onClick={() => closeWindow(win.id)}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded font-semibold text-xs transition-colors"
              >
                {t.installer.btnFinish}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="w-full max-w-md text-center">
              <div className="mx-auto w-12 h-12 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center mb-4 shadow-sm">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-light mb-2">{t.installer.error}</h3>
              <p className="text-xs text-red-400 mb-8 leading-relaxed max-w-xs mx-auto">
                {errorMsg}
              </p>
              <button 
                onClick={() => closeWindow(win.id)}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded font-semibold text-xs transition-colors"
              >
                {t.installer.btnFinish}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
