import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Boxes, FolderTree, LogOut, Menu, Settings, ShoppingBag, ShoppingCart, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import '../styles/admin.css'

const links = [
  { to: '/admin', label: 'نظرة عامة', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'المنتجات', icon: Boxes },
  { to: '/admin/categories', label: 'التصنيفات', icon: FolderTree },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
  { to: '/admin/settings', label: 'إعدادات المتجر', icon: Settings },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  return <div className="admin-shell" dir="rtl">
    {open ? <button className="admin-overlay" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} /> : null}
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
      <div className="admin-brand"><span><ShoppingBag size={23} /></span><div><strong>على كيفك</strong><small>لوحة الإدارة</small></div><button onClick={() => setOpen(false)} aria-label="إغلاق"><X /></button></div>
      <nav>{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
      <div className="admin-profile"><div><strong>{user?.name}</strong><small>{user?.email}</small></div><button onClick={() => void logout()} title="تسجيل الخروج"><LogOut size={18} /></button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-mobile-header"><button onClick={() => setOpen(true)} aria-label="فتح القائمة"><Menu /></button><strong>لوحة «على كيفك»</strong><a href="/">المتجر</a></header>
      <Outlet />
    </main>
  </div>
}
