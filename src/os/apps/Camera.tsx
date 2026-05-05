import React, { useRef, useEffect, useState } from 'react';
import { WindowState } from '../store';
import { Camera as CameraIcon, SwitchCamera, Video } from 'lucide-react';
import { useTranslation } from '../i18n';

export function CameraApp({ win }: { win: WindowState }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const t = useTranslation();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(t.apps?.camera?.error || "Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    // Only visual flash for simulator
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-300';
    document.getElementById('camera-container')?.appendChild(flash);
    requestAnimationFrame(() => {
      flash.classList.remove('opacity-0');
      flash.classList.add('opacity-100');
      setTimeout(() => {
        flash.classList.remove('opacity-100');
        flash.classList.add('opacity-0');
        setTimeout(() => flash.remove(), 300);
      }, 100);
    });
  };

  return (
    <div id="camera-container" className="flex flex-col h-full bg-black text-white relative">
      <div className="flex-1 overflow-hidden flex items-center justify-center relative">
        {error ? (
          <div className="text-center p-6 text-red-400">
            <CameraIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="h-full w-full object-cover transform scale-x-[-1]" 
          />
        )}
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-24 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center space-y-8 border-l border-white/10 z-10">
        <button className="text-white hover:text-blue-400 transition" title={t.apps?.camera?.takeVideo || "Video Mode"}>
          <Video size={24} />
        </button>
        
        <button 
          onClick={takePhoto}
          disabled={!!error}
          className="w-14 h-14 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/40 hover:scale-105 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:pointer-events-none"
          title={t.apps?.camera?.takePhoto || "Take Photo"}
        >
        </button>

        <button className="text-white hover:text-blue-400 transition" title={t.apps?.camera?.switchCamera || "Switch Camera"}>
          <SwitchCamera size={24} />
        </button>
      </div>
    </div>
  );
}
