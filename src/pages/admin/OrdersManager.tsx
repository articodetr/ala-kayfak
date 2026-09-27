import { useEffect, useState } from 'react'
import { ChevronDown, PackageOpen, RefreshCw } from 'lucide-react'
import { useStore } from '../../context'
import type { OrderStatus } from '../../types'

const statusLabels: Record<OrderStatus, string> = { pending: 'جديد', processing: 'قيد التجهيز', shipped: 'تم الشحن', delivered: 'مكتمل', cancelled: 'ملغي' }

export default function OrdersManager() {
  const { orders, refreshOrders, updateOrderStatus, settings, usingFallbackData } = useStore()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string>()
  const [message, setMessage] = useState('')
  useEffect(() => { if (!usingFallbackData) void refreshOrders().catch((error) => setMessage(error.message)) }, [refreshOrders, usingFallbackData])
  const shown = filter === 'all' ? orders : orders.filter((order) => order.status === filter)
  const changeStatus = async (id: string, status: OrderStatus) => { try { await updateOrderStatus(id, status); setMessage('تم تحديث حالة الطلب.') } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر التحديث.') } }
  return <div className="admin-page"><div className="admin-page-title"><div><small>المبيعات</small><h1>الطلبات</h1><p>متابعة الطلبات وتحديث حالتها.</p></div><button className="outline-action" onClick={() => void refreshOrders()} disabled={usingFallbackData}><RefreshCw size={17} /> تحديث</button></div>
    {message ? <div className="admin-notice">{message}</div> : null}<div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>الكل <b>{orders.length}</b></button>{(Object.keys(statusLabels) as OrderStatus[]).map((status) => <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{statusLabels[status]} <b>{orders.filter((o) => o.status === status).length}</b></button>)}</div>
    <section className="orders-list">{shown.map((order) => <article key={order.id} className="order-card"><header><button className="order-expand" onClick={() => setExpanded(expanded === order.id ? undefined : order.id)}><ChevronDown className={expanded === order.id ? 'rotated' : ''} /><span><strong>{order.orderNumber}</strong><small>{new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</small></span></button><div className="order-customer"><strong>{order.customer.fullName}</strong><small>{order.customer.phone} · {order.customer.city}</small></div><strong className="order-total">{order.total} {settings.currency}</strong><select className={`status-select ${order.status}`} value={order.status} onChange={(e) => void changeStatus(order.id, e.target.value as OrderStatus)}>{(Object.keys(statusLabels) as OrderStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></header>{expanded === order.id ? <div className="order-details"><div><h3>المنتجات</h3>{order.items.map((item) => <div className="order-item" key={item.id}><img src={item.productImage} alt="" /><span><strong>{item.productName}</strong><small>الكمية: {item.quantity} · اللون: <i style={{ background: item.color }} /></small></span><b>{item.unitPrice * item.quantity} {settings.currency}</b></div>)}</div><aside><h3>بيانات التوصيل</h3><p>{order.customer.address}، {order.customer.district}، {order.customer.city}</p><p>{order.customer.email}</p><hr /><p>المنتجات <b>{order.subtotal} {settings.currency}</b></p><p>الشحن <b>{order.shipping} {settings.currency}</b></p><p>الإجمالي <b>{order.total} {settings.currency}</b></p></aside></div> : null}</article>)}{!shown.length ? <div className="empty-admin large"><PackageOpen size={34} /><h2>لا توجد طلبات</h2><p>ستظهر الطلبات هنا فور إتمام العميل عملية الشراء.</p></div> : null}</section>
  </div>
}
