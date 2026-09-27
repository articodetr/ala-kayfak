import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import DashboardOverview from './pages/admin/DashboardOverview'
import ProductsManager from './pages/admin/ProductsManager'
import CategoriesManager from './pages/admin/CategoriesManager'
import OrdersManager from './pages/admin/OrdersManager'
import StoreSettings from './pages/admin/StoreSettings'

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><AuthProvider><StoreProvider><Routes>
  <Route path="/" element={<App />} />
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
    <Route index element={<DashboardOverview />} />
    <Route path="products" element={<ProductsManager />} />
    <Route path="categories" element={<CategoriesManager />} />
    <Route path="orders" element={<OrdersManager />} />
    <Route path="settings" element={<StoreSettings />} />
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes></StoreProvider></AuthProvider></BrowserRouter></StrictMode>)
