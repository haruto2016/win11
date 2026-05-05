import React, { useState } from 'react';
import { WindowState } from '../store';

export function CalculatorApp({ win }: { win: WindowState }) {
  const [display, setDisplay] = useState('0');

  const btnClass = "bg-gray-100 hover:bg-gray-200 rounded text-lg font-medium transition-colors flex items-center justify-center p-4 border border-gray-200/50 shadow-sm";
  const opClass = "bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-lg font-medium transition-colors flex items-center justify-center p-4 border border-blue-100/50 shadow-sm";

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-black p-4 select-none">
      <div className="text-right text-5xl p-4 font-light bg-transparent font-sans h-24 flex items-end justify-end mb-2">{display}</div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {['C','±','%','/'].map(c => <button key={c} className={opClass}>{c}</button>)}
        {['7','8','9','*'].map(c => <button key={c} className={c === '*' ? opClass : btnClass}>{c}</button>)}
        {['4','5','6','-'].map(c => <button key={c} className={c === '-' ? opClass : btnClass}>{c}</button>)}
        {['1','2','3','+'].map(c => <button key={c} className={c === '+' ? opClass : btnClass}>{c}</button>)}
        <button className={`${btnClass} col-span-2`}>0</button>
        <button className={btnClass}>.</button>
        <button className={`${opClass} bg-blue-600 text-white hover:bg-blue-700`}>=</button>
      </div>
    </div>
  );
}
