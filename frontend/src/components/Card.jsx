import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function Card({ title, children, onClick, interactive = false, className = "" }) {
  const isInteractive = interactive || !!onClick;
  
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border transition-all duration-300
        ${isInteractive 
          ? 'border-blue-100 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20' 
          : 'border-gray-100 dark:border-gray-700 cursor-default'}
        ${className}
      `} 
      onClick={onClick}
    >
      {title && (
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-[10px] uppercase tracking-[0.15em] transition-colors ${isInteractive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {title}
          </h3>
          {isInteractive && (
            <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none transition-colors">
              <ChevronRight size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      )}
      <div className={`font-black text-gray-900 dark:text-white transition-colors ${className.includes('text-') ? '' : 'text-2xl'}`}>
        {children}
      </div>
      
      {isInteractive && (
        <div className="mt-4 pt-3 border-t border-blue-50 dark:border-blue-900/30 text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details
        </div>
      )}
    </div>
  )
}

