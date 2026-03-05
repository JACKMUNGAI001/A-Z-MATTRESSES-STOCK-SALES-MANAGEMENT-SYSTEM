import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export default function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  disabled = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange({ target: { value: option.id } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      >
        <span className={`truncate font-bold ${!selectedOption ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 py-1"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <X 
                size={16} 
                className="text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }}
              />
            )}
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    String(option.id) === String(value)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                  }`}
                >
                  <span className="truncate">{option.name}</span>
                  {String(option.id) === String(value) && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 text-xs italic">
                No matching results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
