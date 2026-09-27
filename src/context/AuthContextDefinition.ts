import { createContext } from 'react'
import type { AdminUser } from '../types'

export type AuthContextType = { isAuthenticated: boolean; isLoading: boolean; user: AdminUser | null; login: (email: string, password: string) => Promise<string | null>; registerFirstAdmin: (email: string, password: string, name: string) => Promise<string | null>; logout: () => Promise<void> }
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
