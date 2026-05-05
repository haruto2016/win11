import React, { useEffect, useState, useRef } from 'react';
import { WindowState, useOSStore } from '../store';
import { useTranslation } from '../i18n';
import { ThreeDViewer } from '../components/ThreeDViewer';
import { Box } from 'lucide-react';

export function ExeRunner({ win }: { win: WindowState }) {
  const { files } = useOSStore();
  const t = useTranslation();
  const app = win.openProps?.app;
  const fileId = app?.fileId;
  const file = files.find(f => f.id === fileId);

  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let isMounted = true;
    const addLog = (msg: string, delay: number) => {
      return new Promise(resolve => setTimeout(() => {
        if (isMounted) {
          setLogs(prev => [...prev, msg]);
          resolve(null);
        }
      }, delay));
    };

    const run = async () => {
      await addLog(t.apps.exeRunner.loadingEngine, 500);
      if (!file) {
        await addLog(t.apps.exeRunner.missingFile, 500);
        return;
      }

      await addLog(t.apps.exeRunner.mounting.replace('{name}', file.name), 600);
      await addLog(t.apps.exeRunner.size.replace('{size}', file.size?.toString() || '0'), 200);

      let content = file.content || "";
      if (content.startsWith("data:")) {
        const base64 = content.split(",")[1];
        try {
          const binStr = atob(base64);
          const isPE = binStr.length > 2 && binStr.charCodeAt(0) === 0x4D && binStr.charCodeAt(1) === 0x5A;

          await addLog(isPE ? t.apps.exeRunner.validMZ : t.apps.exeRunner.invalidMZ, 800);
          await addLog(t.apps.exeRunner.extracting, 800);

          // Extract ASCII strings heuristically to simulate binary parsing
          const strings = [];
          let currentString = "";
          for (let i = 0; i < Math.min(binStr.length, 100000); i++) {
            const code = binStr.charCodeAt(i);
            if (code >= 32 && code <= 126) {
              currentString += String.fromCharCode(code);
            } else {
              if (currentString.length >= 5) {
                strings.push(currentString);
              }
              currentString = "";
            }
          }

          await addLog(t.apps.exeRunner.foundStrings.replace('{count}', strings.length.toString()), 500);
          await addLog(t.apps.exeRunner.execStart, 500);

          const displayCount = Math.min(strings.length, 30);
          for (let i = 0; i < displayCount; i++) {
            await addLog(`[STDOUT] ${strings[i]}`, Math.random() * 200 + 50);
          }

          if (strings.length === 0) {
             await addLog(`[STDOUT] ${t.apps.exeRunner.noOutput}`, 1000);
          }

        } catch (e) {
          await addLog(t.apps.exeRunner.errorDecode, 500);
        }
      } else {
        await addLog(t.apps.exeRunner.validMZ, 800);
        await addLog(t.apps.exeRunner.execStart, 500);
        await addLog("[STDOUT] Valid binary container mapped.", 400);
        await addLog("[STDOUT] Simulation complete.", 800);
      }

      await addLog(t.apps.exeRunner.execEnd, 1000);
      await addLog(t.apps.exeRunner.exited, 100);
      setIsDone(true);
    };

    run();
    return () => { isMounted = false; };
  }, [file, t]);

  if (show3D) {
    return (
      <div className="flex flex-col h-full bg-[#0c0c0c]">
         <div className="flex-1 relative">
            <ThreeDViewer />
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-green-500 font-mono p-4 overflow-auto text-xs sm:text-sm selection:bg-green-500 selection:text-black">
      <div className="pb-4 items-center justify-between flex border-b border-white/10 mb-4">
        <div className="flex items-center opacity-50">
          <span className="bg-white/20 px-2 py-0.5 rounded text-white mr-3">x86 V-Engine</span>
          <span>Ring-3 execution active</span>
        </div>
        {isDone && (
          <button 
            onClick={() => setShow3D(true)}
            className="flex items-center bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 px-3 py-1 rounded transition ml-auto"
          >
            <Box size={14} className="mr-2" /> {t.apps.exeRunner.launch3D}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto break-all whitespace-pre-wrap" ref={scrollRef}>
        {logs.map((log, i) => (
          <div key={i} className="mb-1">{log}</div>
        ))}
        <div className="animate-pulse inline-block w-2.5 h-4 bg-green-500 ml-1 translate-y-[2px]" />
      </div>
    </div>
  );
}
