import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { IUser, AuthResponse } from '../Utils/Types/userTypes'

interface AuthContextType {
  user: IUser | null
  token: string | null
  loading: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('kinefit_token')
    const storedUser = localStorage.getItem('kinefit_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = (data: AuthResponse) => {
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('kinefit_token', data.token)
    localStorage.setItem('kinefit_user', JSON.stringify(data.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('kinefit_token')
    localStorage.removeItem('kinefit_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)