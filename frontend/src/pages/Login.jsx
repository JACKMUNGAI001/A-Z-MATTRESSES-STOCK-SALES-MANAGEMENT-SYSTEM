import React, { useState, useContext } from 'react'
import api from '../api/api'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Mail, Lock, LogIn, ArrowLeft, Zap } from 'lucide-react'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)

  const submit = async (e) => {
    e.preventDefault()
    try{
      const res = await api.post('/auth/login', { email, password })
      const { access_token, user } = res.data
      localStorage.setItem('token', access_token)
      setUser(user)
      if(user.role === 'admin') navigate('/admin')
      else navigate('/attendant')
    }catch(err){
      setMsg(err.response?.data?.msg || 'Login failed')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f5f9] p-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 bg-white border border-gray-200 text-gray-600 py-2.5 px-5 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 font-bold text-sm"
      >
        <ArrowLeft size={18} /> BACK TO HOME
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-200 mb-4">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 font-medium mt-2">Enter your credentials to access your shop</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
          {msg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 flex items-center gap-2 animate-bounce">
              <span className="text-lg">⚠️</span> {msg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-gray-900 transition-all" 
                  placeholder="name@company.com"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-gray-900 transition-all" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-4">
              <LogIn size={24} /> SECURE LOGIN
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-medium">
              Don't have an account yet? <br/>
              <Link to="/register" className="text-blue-600 font-black hover:underline mt-1 inline-block uppercase tracking-wider text-sm">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
