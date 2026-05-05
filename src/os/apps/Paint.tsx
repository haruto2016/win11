import React, { useRef, useEffect, useState } from 'react';
import { WindowState } from '../store';
import { Pencil, Eraser } from 'lucide-react';

export function PaintApp({ win }: { win: WindowState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set intrinsic size
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if(ctx) ctx.beginPath();
    draw(e);
  };
  const endDraw = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if(ctx) ctx.beginPath();
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);

    ctx.lineWidth = isEraser ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? 'white' : color;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 text-black">
      <div className="h-14 bg-white border-b border-gray-300 flex items-center px-4 space-x-2">
        <button 
          className={`p-2 rounded ${!isEraser ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={() => setIsEraser(false)}
        >
          <Pencil size={20} />
        </button>
        <button 
          className={`p-2 rounded ${isEraser ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={() => setIsEraser(true)}
        >
          <Eraser size={20} />
        </button>
        <div className="w-px h-8 bg-gray-300 mx-3" />
        <div className="flex gap-1.5">
          {['black','red','blue','green','yellow','orange','purple'].map(c => (
            <button 
              key={c} 
              className={`w-7 h-7 rounded-sm border-2 shadow-sm ${color === c && !isEraser ? 'border-blue-400 scale-110' : 'border-gray-200'}`} 
              style={{ backgroundColor: c }}
              onClick={() => { setColor(c); setIsEraser(false); }}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto bg-[#e5e5e5] flex justify-center items-center">
        <canvas 
          ref={canvasRef}
          className="bg-white shadow-md border border-gray-300 cursor-crosshair shrink-0"
          style={{ width: '800px', height: '600px' }}
          onMouseDown={startDraw}
          onMouseUp={endDraw}
          onMouseMove={draw}
          onMouseLeave={endDraw}
        />
      </div>
    </div>
  );
}
