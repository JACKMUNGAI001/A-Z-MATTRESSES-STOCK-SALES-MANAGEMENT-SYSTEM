import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function Card({ title, children, onClick, interactive = false, className = "" }) {
  const isInteractive = interactive || !!onClick;
  
  return (
    <div 
      className={`
        bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300
        ${isInteractive 
          ? 'border-blue-100 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer bg-gradient-to-br from-white to-blue-50/30' 
          : 'border-gray-100 cursor-default'}
        ${className}
      `} 
      onClick={onClick}
    >
      {title && (
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-[10px] uppercase tracking-[0.15em] ${isInteractive ? 'text-blue-600' : 'text-gray-400'}`}>
            {title}
          </h3>
          {isInteractive && (
            <div className="bg-blue-100 p-1 rounded-lg text-blue-600 shadow-sm shadow-blue-100">
              <ChevronRight size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      )}
      <div className={`font-black text-gray-900 ${className.includes('text-') ? '' : 'text-2xl'}`}>
        {children}
      </div>
      
      {isInteractive && (
        <div className="mt-4 pt-3 border-t border-blue-50 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details
        </div>
      )}
    </div>
  )
}
