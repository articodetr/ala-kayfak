import { useEffect } from 'react'
import { Boxes, CircleDollarSign, PackageCheck, ShoppingCart, TrendingUp } from 'lucide-react'
import { useStore } from '../../context'

export default function DashboardOverview() {
  const { products, categories, orders, settings, refreshOrders, usingFallbackData } = useStore()
  useEffect(() => { if (!usingFallbackData) void refreshOrders().catch(console.error) }, [refreshOrders, usingFallbackData])
  const revenue = orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0)
  const pending = orders.filter((order) => order.status === 'pending').length
  const topProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5)
  return <div className="admin-page">
    <div className="admin-page-title"><div><small>مرحباً بك</small><h1>نظرة عامة</h1><p>ملخص سريع لأداء متجر {settings.storeName}</p></div><a className="outline-action" href="/" target="_blank" rel="noreferrer">عرض المتجر</a></div>
    {usingFallbackData ? <div className="admin-notice">قاعدة Supabase لم تُطبّق بعد؛ تظهر هنا بيانات المعاينة فقط.</div> : null}
    <section className="stats-grid">
      <article><span className="stat-icon purple"><CircleDollarSign /></span><div><small>إجمالي المبيعات</small><strong>{revenue.toLocaleString('ar-SA')} {settings.currency}</strong></div><TrendingUp size={19} /></article>
      <article><span className="stat-icon pink"><ShoppingCart /></span><div><small>الطلبات</small><strong>{orders.length}</strong></div><em>{pending} جديد</em></article>
      <article><span className="stat-icon green"><Boxes /></span><div><small>المنتجات النشطة</small><strong>{products.filter((p) => p.isActive).length}</strong></div></article>
      <article><span className="stat-icon gold"><PackageCheck /></span><div><small>التصنيفات</small><strong>{categories.filter((c) => c.isActive).length}</strong></div></article>
    </section>
    <div className="dashboard-columns">
      <section className="admin-panel"><div className="panel-heading"><div><h2>أحدث الطلبات</h2><p>آخر عمليات الشراء</p></div><a href="/admin/orders">عرض الكل</a></div>{orders.length ? <div className="compact-list">{orders.slice(0, 5).map((order) => <div key={order.id}><span><strong>{order.orderNumber}</strong><small>{order.customer.fullName}</small></span><span><strong>{order.total} {settings.currency}</strong><small className={`status ${order.status}`}>{order.status}</small></span></div>)}</div> : <div className="empty-admin">لا توجد طلبات بعد.</div>}</section>
      <section className="admin-panel"><div className="panel-heading"><div><h2>الأكثر مبيعاً</h2><p>بحسب عدد الوحدات</p></div></div><div className="compact-list product-rank">{topProducts.map((product, index) => <div key={product.id}><b>{index + 1}</b><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.stockQuantity} في المخزون</small></span><em>{product.salesCount} مبيعة</em></div>)}</div></section>
    </div>
  </div>
}
