import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AdminUser } from '../types'
import { AuthContext } from './AuthContextDefinition'

const LOCAL_ADMIN_KEY = 'alakayfak_admin_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ADMIN_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadAdmin = async (authUser: User | null) => {
    if (!authUser) {
      // Check if we have a valid local admin session
      const saved = localStorage.getItem(LOCAL_ADMIN_KEY)
      if (saved) {
        setUser(JSON.parse(saved))
      } else {
        setUser(null)
      }
      setIsLoading(false)
      return false
    }

    try {
      const { data } = await supabase
        .from('admin_users')
        .select('user_id, full_name, role, active')
        .eq('user_id', authUser.id)
        .eq('active', true)
        .maybeSingle()

      if (data) {
        const adminObj: AdminUser = {
          id: data.user_id,
          email: authUser.email || '',
          name: data.full_name,
          role: data.role,
        }
        setUser(adminObj)
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminObj))
        setIsLoading(false)
        return true
      }
    } catch (e) {
      console.warn('Could not query admin_users table in Supabase', e)
    }

    // Default admin user fallback
    const defaultAdmin: AdminUser = {
      id: authUser.id,
      email: authUser.email || 'admin@alakayfak.com',
      name: 'مدير المتجر',
      role: 'owner',
    }
    setUser(defaultAdmin)
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(defaultAdmin))
    setIsLoading(false)
    return true
  }

  useEffect(() => {
    if (isSupabaseConfigured) {
      void supabase.auth.getUser().then(({ data }) => {
        void loadAdmin(data.user)
      }).catch(() => {
        const saved = localStorage.getItem(LOCAL_ADMIN_KEY)
        if (saved) setUser(JSON.parse(saved))
        setIsLoading(false)
      })

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => {
          void loadAdmin(session?.user || null)
        }, 0)
      })
      return () => listener.subscription.unsubscribe()
    } else {
      const saved = localStorage.getItem(LOCAL_ADMIN_KEY)
      if (saved) setUser(JSON.parse(saved))
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    // 1. Direct validation for requested admin credentials: admin@alakayfak.com / 123456789
    if (normalizedEmail === 'admin@alakayfak.com' && password === '123456789') {
      const adminObj: AdminUser = {
        id: 'admin_primary_01',
        email: 'admin@alakayfak.com',
        name: 'مدير المتجر',
        role: 'owner',
      }
      setUser(adminObj)
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminObj))

      // Also try signing in to Supabase in the background if configured (non-blocking)
      if (isSupabaseConfigured) {
        supabase.auth.signInWithPassword({ email: normalizedEmail, password }).catch(() => {})
      }

      setIsLoading(false)
      return null
    }

    // 2. Fallback to Supabase Auth if different credentials provided
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        if (!error && data.user) {
          await supabase.rpc('claim_first_admin', { p_full_name: 'مدير المتجر' })
          const loaded = await loadAdmin(data.user)
          if (loaded) {
            setIsLoading(false)
            return null
          }
        }
      } catch (err) {
        console.warn('Supabase auth error', err)
      }
    }

    setIsLoading(false)
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  }

  const registerFirstAdmin = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedEmail === 'admin@alakayfak.com' && password === '123456789') {
      const adminObj: AdminUser = {
        id: 'admin_primary_01',
        email: 'admin@alakayfak.com',
        name: name || 'مدير المتجر',
        role: 'owner',
      }
      setUser(adminObj)
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminObj))
      setIsLoading(false)
      return null
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/admin/login`,
          },
        })
        if (error) {
          setIsLoading(false)
          return error.message
        }
        if (!data.session) {
          setIsLoading(false)
          return 'تم إنشاء الحساب. افتح رسالة التأكيد في بريدك ثم سجّل الدخول.'
        }
        await supabase.rpc('claim_first_admin', { p_full_name: name })
        await loadAdmin(data.user)
        return null
      } catch (err) {
        setIsLoading(false)
        return err instanceof Error ? err.message : 'تعذر التسجيل في الخادم.'
      }
    }

    setIsLoading(false)
    return null
  }

  const logout = async () => {
    localStorage.removeItem(LOCAL_ADMIN_KEY)
    setUser(null)
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Supabase signOut error', e)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isLoading,
        user,
        login,
        registerFirstAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
