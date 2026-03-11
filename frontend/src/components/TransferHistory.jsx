import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { ArrowLeftRight, Clock, Box, Store, SearchX, User, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { SearchContext } from '../context/SearchContext';

export default function TransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { searchQuery } = useContext(SearchContext);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await api.get('/transfers');
        setTransfers(response.data);
      } catch (err) {
        console.error('Error fetching transfers:', err);
        setError("Failed to load transfer history");
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, [searchQuery]);

  const filteredTransfers = searchQuery
    ? transfers.filter(t => 
        t.from_shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.to_shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.items?.some(it => it.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : transfers;

  return (
    <div className="mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        {/* COLLAPSIBLE HEADER */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex justify-between items-center p-6 transition-all ${
            isExpanded ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight">Stock Transfer History</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">Record of all inventory relocations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isExpanded && transfers.length > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-all">
                {filteredTransfers.length} Records
              </span>
            )}
            {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
          </div>
        </button>

        {/* EXPANDABLE CONTENT */}
        {isExpanded && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            {loading ? (
              <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                Loading transfers...
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/30 p-10 text-center text-red-600 dark:text-red-400 font-bold">
                {error}
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="p-10 text-center text-gray-400 transition-colors">
                {searchQuery ? (
                  <>
                    <SearchX size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No transfers match your search</p>
                  </>
                ) : (
                  "No inter-shop transfers recorded yet."
                )}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                <table className="min-w-[800px] md:min-w-full relative border-collapse">
                  <thead className="bg-gray-50/90 dark:bg-gray-900/90 sticky top-0 z-10 backdrop-blur-sm transition-colors">
                    <tr className="transition-colors">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Movement</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Items</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Status/Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors text-sm">
                    {filteredTransfers.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From:</span>
                              <span className="font-bold text-gray-900 dark:text-white">{t.from_shop_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To:</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">{t.to_shop_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {t.items?.map((it, idx) => (
                              <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-tight">
                                {it.item_name} (x{it.qty})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {t.status}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                              <Clock size={10} /> {formatDate(t.created_at)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic max-w-xs truncate" title={t.notes}>
                            {t.notes || "No notes provided"}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                              <User size={10} /> {t.created_by_name}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
