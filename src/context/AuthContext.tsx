import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AdminUser } from '../types'
import { AuthContext } from './AuthContextDefinition'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadAdmin = async (authUser: User | null) => {
    if (!authUser) { setUser(null); setIsLoading(false); return false }
    const { data } = await supabase.from('admin_users').select('user_id, full_name, role, active').eq('user_id', authUser.id).eq('active', true).maybeSingle()
    if (!data) { setUser(null); setIsLoading(false); return false }
    setUser({ id: data.user_id, email: authUser.email || '', name: data.full_name, role: data.role })
    setIsLoading(false)
    return true
  }

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => loadAdmin(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { void loadAdmin(session?.user || null) }, 0)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) { setIsLoading(false); return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }
    await supabase.rpc('claim_first_admin', { p_full_name: 'مدير المتجر' })
    if (!await loadAdmin(data.user)) { await supabase.auth.signOut(); return 'هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة.' }
    return null
  }

  const registerFirstAdmin = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/admin/login`,
      },
    })
    if (error) { setIsLoading(false); return error.message }
    if (!data.session) { setIsLoading(false); return 'تم إنشاء الحساب. افتح رسالة التأكيد في بريدك ثم سجّل الدخول.' }
    const { data: claimed, error: claimError } = await supabase.rpc('claim_first_admin', { p_full_name: name })
    if (claimError || !claimed) { setIsLoading(false); return 'تعذر تهيئة المدير الأول. قد يكون هناك مدير مسجل بالفعل.' }
    await loadAdmin(data.user)
    return null
  }

  const logout = async () => { await supabase.auth.signOut(); setUser(null) }
  return <AuthContext.Provider value={{ isAuthenticated: Boolean(user), isLoading, user, login, registerFirstAdmin, logout }}>{children}</AuthContext.Provider>
}
