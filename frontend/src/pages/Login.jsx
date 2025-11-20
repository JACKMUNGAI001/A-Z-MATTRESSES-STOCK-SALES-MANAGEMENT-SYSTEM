import React, { useState, useContext } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

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
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">A - Z Mattresses</h1>
        {msg && <div className="text-red-600 mb-3">{msg}</div>}
        <form onSubmit={submit}>
          <label className="block mb-1">Email</label>
          <input type="email" className="w-full p-2 border rounded mb-3" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <label className="block mb-1">Password</label>
          <input type="password" className="w-full p-2 border rounded mb-3" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full bg-pastel-500 text-white p-2 rounded">Login</button>
        </form>
        <div className="mt-4 text-sm">Don't have an account? <a href="/register" className="text-blue-600">Register</a></div>
      </div>
    </div>
  )
}
