import React, { createContext, useState, useEffect } from 'react'
import api from '../api/api'
export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  useEffect(() => {
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }
  return <AuthContext.Provider value={{user,setUser,logout}}>{children}</AuthContext.Provider>
}
