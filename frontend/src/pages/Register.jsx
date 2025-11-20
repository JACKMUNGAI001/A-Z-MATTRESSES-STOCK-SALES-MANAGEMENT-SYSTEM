import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      await api.post('/auth/register', { name, email, password })
      alert('Registered. Await admin verification.')
      navigate('/login')
    }catch(err){
      setMsg(err.response?.data?.msg || 'Registration failed')
    }
  }
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {msg && <div className="text-red-600 mb-3">{msg}</div>}
        <form onSubmit={submit}>
          <label className="block mb-1">Name</label>
          <input className="w-full p-2 border rounded mb-3" value={name} onChange={e=>setName(e.target.value)} />
          <label className="block mb-1">Email</label>
          <input className="w-full p-2 border rounded mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="block mb-1">Password</label>
          <input type="password" className="w-full p-2 border rounded mb-3" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-pastel-500 text-white p-2 rounded">Register</button>
        </form>
      </div>
    </div>
  )
}
