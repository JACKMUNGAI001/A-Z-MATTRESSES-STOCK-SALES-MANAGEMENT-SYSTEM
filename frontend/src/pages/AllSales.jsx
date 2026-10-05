import React, { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { History, ShoppingBag, Store, User, FileText, Trash2, SearchX, Edit, Wallet } from "lucide-react";
import { formatDate, formatPaymentMethod, formatSaleType } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import EditSaleModal from "../components/EditSaleModal";
import MobileSaleCard from "../components/MobileSaleCard";
import Pagination from "../components/Pagination";
import useDebouncedValue from "../hooks/useDebouncedValue";

export default function AllSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const { user } = useContext(AuthContext);
  const { searchQuery, searchType } = useContext(SearchContext);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  useEffect(() => {
    setPage(1);
    fetchSales(1);
  }, [debouncedSearchQuery, searchType]);

  const fetchSales = async (pageToLoad = page) => {
    setLoading(true);
    setLoadError('');
    try {
      const params = {
        page: pageToLoad,
        per_page: 25,
        search: searchType === 'date' ? undefined : debouncedSearchQuery || undefined,
        date: searchType === 'date' ? debouncedSearchQuery || undefined : undefined,
      };
      const response = await api.get("/sales/all", { params });
      if (Array.isArray(response.data)) {
        // Keep the screen usable while an older API deployment is rolling forward.
        const matchingSales = response.data.filter((sale) => {
          if (!debouncedSearchQuery) return true;
          if (searchType === 'date') {
            return new Date(sale.created_at).toISOString().slice(0, 10) === debouncedSearchQuery;
          }
          const query = debouncedSearchQuery.toLowerCase();
          return sale.shop_name?.toLowerCase().includes(query) ||
            sale.items?.some((item) => item.item_name?.toLowerCase().includes(query));
        });
        const perPage = 25;
        const totalPages = Math.max(Math.ceil(matchingSales.length / perPage), 1);
        const safePage = Math.min(pageToLoad, totalPages);
        setSales(matchingSales.slice((safePage - 1) * perPage, safePage * perPage));
        setPagination({
          page: safePage,
          per_page: perPage,
          total: matchingSales.length,
          total_pages: totalPages,
        });
        setPage(safePage);
      } else if (
        Array.isArray(response.data?.items) &&
        response.data.pagination &&
        Array.isArray(response.data.pagination) === false
      ) {
        setSales(response.data.items);
        setPagination(response.data.pagination);
        setPage(response.data.pagination.page);
      } else {
        throw new Error('The sales API returned an unsupported response format.');
      }
    } catch (err) {
      console.error("Error fetching sales", err);
      setSales([]);
      setPagination(null);
      setLoadError(err.response?.data?.msg || err.message || 'Unable to load sales. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (sale) => {
    const remaining = (sale.total_amount || 0) - (sale.paid_amount || 0);
    const input = window.prompt(`Enter payment amount (remaining KES ${remaining}):`, "");
    if (!input) return;
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await api.post(`/sales/${sale.id}/payments`, { amount });
      alert('Payment recorded');
      fetchSales();
    } catch (err) {
      alert(`Error recording payment: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale record? Inventory levels for the items in this sale will be reverted.")) return;
    try {
      await api.delete(`/sales/${id}`);
      alert("Sale record deleted and stock reverted successfully");
      fetchSales();
    } catch (err) {
      alert(`Error deleting record: ${err.response?.data?.msg || err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredSales = sales;

  return (
    <>
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Sales Ledger</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Complete historical record of all transactions across all branches</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-600 dark:text-blue-400" />
              Transaction History {searchQuery && <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-2 transition-all">Searching: "{searchQuery}"</span>}
            </h2>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
              {pagination?.total || 0} {searchQuery ? 'Matching' : 'Total'} Records
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Retrieving sales data...</div>
            ) : loadError ? (
              <div className="p-12 text-center border-t border-gray-100 dark:border-gray-700">
                <p className="mb-4 text-red-600 dark:text-red-400">{loadError}</p>
                <button
                  type="button"
                  onClick={() => fetchSales(page)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">No matches found for "{searchQuery}"</p>
                {searchQuery && <p className="text-xs text-gray-400 mt-2 transition-colors">Try searching for a different product name</p>}
              </div>
            ) : (
              <>
              <div className="space-y-3 p-3 md:hidden">
                {filteredSales.map((sale) => (
                  <MobileSaleCard
                    key={sale.id}
                    sale={sale}
                    searchQuery={searchQuery}
                    actions={<>
                      {sale.receipt_uuid && (
                        <a href={`${API_BASE}/receipts/${sale.receipt_uuid}`} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-blue-300 px-3 py-2 text-xs font-bold text-blue-600 dark:border-blue-700 dark:text-blue-400">
                          <FileText size={16} /> VIEW
                        </a>
                      )}
                      {user?.role === 'admin' && <>
                        <button onClick={() => setEditingSale(sale)} className="rounded-lg border border-amber-300 p-2 text-amber-600 dark:border-amber-700 dark:text-amber-400" title="Edit Sale"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(sale.id)} className="rounded-lg border border-red-300 p-2 text-red-600 dark:border-red-700 dark:text-red-400" title="Delete Sale"><Trash2 size={16} /></button>
                        {sale.sale_type === 'credit' && (sale.paid_amount || 0) < (sale.total_amount || 0) && (
                          <button onClick={() => handlePay(sale)} className="rounded-lg border border-green-300 p-2 text-green-600 dark:border-green-700 dark:text-green-400" title="Record Payment"><Wallet size={16} /></button>
                        )}
                      </>}
                    </>}
                  />
                ))}
              </div>
              <table className="hidden w-full relative border-collapse md:table">
                <thead className="bg-gray-50/90 dark:bg-gray-900/90 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Date & Time</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Shop / Attendant</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Items Sold</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Amount</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900 dark:text-white transition-colors">{formatDate(sale.created_at)}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{new Date(sale.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-1 font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-tight mb-1">
                          <Store size={14} /> {sale.shop_name}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                          <User size={14} /> {sale.attendant_name}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {sale.items?.map((item, idx) => {
                            const isMatch = searchQuery && item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${isMatch ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}>
                                {item.item_name} (x{item.qty})
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="font-black text-gray-900 dark:text-white text-lg transition-colors">{formatCurrency(sale.total_amount)}</div>
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{formatPaymentMethod(sale.payment_type)}</div>
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-1">{formatSaleType(sale.sale_type)}</div>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <div className="flex items-center justify-center gap-2">
                          {sale.receipt_uuid && (
                            <a
                              href={`${API_BASE}/receipts/${sale.receipt_uuid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
                            >
                              <FileText size={16} /> VIEW
                            </a>
                          )}
                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => setEditingSale(sale)}
                                className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-lg hover:bg-amber-600 hover:text-white transition-all"
                                title="Edit Sale"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(sale.id)}
                                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                title="Delete Sale"
                              >
                                <Trash2 size={16} />
                              </button>
                              {/* Pay button for credit sales with outstanding balance */}
                              {sale.sale_type === 'credit' && (sale.paid_amount || 0) < (sale.total_amount || 0) && (
                                <button
                                  onClick={() => handlePay(sale)}
                                  className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                  title="Record Payment"
                                >
                                  <Wallet size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>
          <Pagination pagination={pagination} onPageChange={(nextPage) => fetchSales(nextPage)} />
        </div>

        {editingSale && (
          <EditSaleModal 
            sale={editingSale} 
            onClose={() => setEditingSale(null)} 
            onUpdate={fetchSales} 
          />
        )}
    </>
  );
}
