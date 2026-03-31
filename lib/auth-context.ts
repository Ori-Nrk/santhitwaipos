// import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// // adjust this import to your actual User type source
// import type { User } from "./types"

// type AuthContextValue = {
//   user: User | null
//   loading: boolean
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function initializeAuth() {
//       try {
//         // fetch current user, token, etc.
//         // const currentUser = await authApi.getCurrentUser()
//         // setUser(currentUser)
//       } finally {
//         setLoading(false)
//       }
//     }

//     initializeAuth()
//   }, [])

//   const logout = () => {
//     // clear session, token, etc.
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }




// import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// // adjust this import to your actual User type source
// import type { User } from './types'

// type AuthContextValue = {
//   user: User | null
//   loading: boolean
//   logout: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function initializeAuth() {
//       try {
//         // fetch current user, token, etc.
//         const response = await fetch('/api/auth/me')
//         if (response.ok) {
//           const currentUser = await response.json()
//           setUser(currentUser)
//         }
//       } catch (error) {
//         console.error('Failed to initialize auth:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     initializeAuth()
//   }, [])

//   const logout = async () => {
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' })
//       setUser(null)
//     } catch (error) {
//       console.error('Logout failed:', error)
//     }
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
