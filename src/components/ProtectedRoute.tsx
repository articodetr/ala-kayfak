import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="admin-loading">جاري التحقق من الجلسة…</div>
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <>{children}</>
}
