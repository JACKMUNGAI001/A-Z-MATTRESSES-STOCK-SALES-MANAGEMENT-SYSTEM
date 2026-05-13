import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { ArrowLeftRight } from 'lucide-react'

export default function TransferCardLink(){
  const [count, setCount] = useState(null)

  const fetchCount = async () => {
    try {
      const res = await api.get('/transfers')
      setCount(res.data.length)
    } catch (err){
      console.error('Error fetching transfer count', err)
    }
  }

  useEffect(() => { fetchCount() }, [])

  return (
    <div className="mt-10">
      <Link to="/transfers" className="no-underline group">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
          <div className="w-full flex justify-between items-center p-6">
            <div className="flex items-center gap-3">
              <ArrowLeftRight size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight">Stock Transfer History</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">Record of all inventory relocations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {count !== null && (
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-all">{count} Records</span>
              )}
              <span className="text-gray-400">View</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
