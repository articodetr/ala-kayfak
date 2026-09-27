import { useEffect, useState } from 'react'
import {
  ChevronDown,
  PackageOpen,
  RefreshCw,
  Phone,
  MessageSquare,
  MapPin,
  Copy,
  Check,
  Search,
  FileText,
  User,
  Mail,
} from 'lucide-react'
import { useStore } from '../../context'
import type { OrderStatus } from '../../types'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'جديد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'مكتمل',
  cancelled: 'ملغي',
}

export default function OrdersManager() {
  const { orders, refreshOrders, updateOrderStatus, settings, usingFallbackData } = useStore()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expanded, setExpanded] = useState<string | undefined>(orders[0]?.id)
  const [message, setMessage] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!usingFallbackData) void refreshOrders().catch((error) => setMessage(error.message))
  }, [refreshOrders, usingFallbackData])

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.customer.fullName.toLowerCase().includes(q) ||
      order.customer.phone.includes(q) ||
      order.customer.city.toLowerCase().includes(q) ||
      (order.customer.district && order.customer.district.toLowerCase().includes(q))
    return matchesFilter && matchesSearch
  })

  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status)
      setMessage(`تم تحديث حالة الطلب إلى "${statusLabels[status]}"`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر التحديث.')
    }
  }

  const copyOrderDetails = (order: (typeof orders)[0]) => {
    const text = [
      `📦 طلب رقم: ${order.orderNumber}`,
      `👤 العميل: ${order.customer.fullName}`,
      `📞 الجوال: ${order.customer.phone}`,
      `📍 المدينة: ${order.customer.city}`,
      `🏘️ الحي / المنطقة: ${order.customer.district || 'غير محدد'}`,
      `🏠 العنوان التفصيلي: ${order.customer.address}`,
      order.notes ? `📝 ملاحظات المندوب: ${order.notes}` : '',
      `💰 المبلغ المطلوب تحصيله: ${order.total} ${settings.currency} (الدفع عند الاستلام)`,
      `🛍️ المنتجات: ${order.items.map((i) => `${i.productName} (${i.quantity})`).join('، ')}`,
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(order.id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '')

  return (
    <div className="admin-page">
      <div className="admin-page-title">
        <div>
          <small>المبيعات والشحن</small>
          <h1>إدارة الطلبات وعناوين التوصيل</h1>
          <p>متابعة طلبات العملاء، تفاصيل العنوان بالتفصيل، والتواصل المباشر مع العملاء والمندوبين.</p>
        </div>
        <button className="outline-action" onClick={() => void refreshOrders()} disabled={usingFallbackData}>
          <RefreshCw size={17} /> تحديث الطلبات
        </button>
      </div>

      {message ? <div className="admin-notice">{message}</div> : null}

      {/* Tabs & Search */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}
      >
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            الكل <b>{orders.length}</b>
          </button>
          {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
            <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>
              {statusLabels[status]} <b>{orders.filter((o) => o.status === status).length}</b>
            </button>
          ))}
        </div>

        <div className="admin-search" style={{ minWidth: '280px' }}>
          <Search size={18} />
          <input
            placeholder="بحث بالرقم، الاسم، الجوال، أو المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="orders-list">
        {filteredOrders.map((order) => {
          const isExp = expanded === order.id
          const rawPhone = cleanPhone(order.customer.phone)
          const waText = encodeURIComponent(
            `مرحباً ${order.customer.fullName} 👋\nمعك متجر على كيفك بخصوص طلبك رقم: ${order.orderNumber}.\nحالة الطلب حالياً: ${statusLabels[order.status]}.\nتأكيد عنوان التوصيل: (${order.customer.city} - ${order.customer.district || ''}).`
          )

          return (
            <article key={order.id} className="order-card" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <header
                style={{ padding: '16px 20px', cursor: 'pointer' }}
                onClick={() => setExpanded(isExp ? undefined : order.id)}
              >
                <button
                  type="button"
                  className="order-expand"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(isExp ? undefined : order.id)
                  }}
                  aria-label="عرض التفاصيل"
                >
                  <ChevronDown className={isExp ? 'rotated' : ''} />
                  <span>
                    <strong style={{ fontSize: '15px' }}>{order.orderNumber}</strong>
                    <small>
                      {new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(
                        new Date(order.createdAt)
                      )}
                    </small>
                  </span>
                </button>

                <div className="order-customer">
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} style={{ color: '#7565aa' }} />
                    {order.customer.fullName}
                  </strong>
                  <small style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: '#888' }} />
                    {order.customer.city} {order.customer.district ? `· ${order.customer.district}` : ''}
                    <span style={{ color: '#bbb' }}>|</span>
                    {order.customer.phone}
                  </small>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <strong className="order-total" style={{ fontSize: '16px', color: '#173b37' }}>
                    {order.total.toLocaleString('ar-SA')} {settings.currency}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {order.items.reduce((s, i) => s + i.quantity, 0)} قطع
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    className={`status-select ${order.status}`}
                    value={order.status}
                    onChange={(e) => void changeStatus(order.id, e.target.value as OrderStatus)}
                    style={{ fontWeight: 700, cursor: 'pointer' }}
                  >
                    {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </header>

              {isExp && (
                <div className="order-details" style={{ padding: '22px' }}>
                  {/* Left Column: Products */}
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <PackageOpen size={18} style={{ color: '#7565aa' }} />
                      المنتجات المطلوبة ({order.items.length})
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {order.items.map((item, idx) => (
                        <div
                          className="order-item"
                          key={item.id || idx}
                          style={{
                            background: '#fff',
                            border: '1px solid #ebe7ee',
                            borderRadius: '10px',
                            padding: '10px 14px',
                          }}
                        >
                          <img
                            src={item.productImage}
                            alt=""
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <span>
                            <strong style={{ fontSize: '14px' }}>{item.productName}</strong>
                            <small
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}
                            >
                              <span>
                                الكمية: <b>{item.quantity}</b>
                              </span>
                              <span>·</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                اللون:
                                <i
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    background: item.color,
                                    border: '1px solid #ddd',
                                    display: 'inline-block',
                                  }}
                                />
                              </span>
                              <span>·</span>
                              <span>
                                سعر الحبة: {item.unitPrice} {settings.currency}
                              </span>
                            </small>
                          </span>
                          <b style={{ fontSize: '15px', color: '#173b37' }}>
                            {(item.unitPrice * item.quantity).toLocaleString('ar-SA')} {settings.currency}
                          </b>
                        </div>
                      ))}
                    </div>

                    {/* Quick Status actions */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center', fontWeight: 600 }}>
                        تغيير الحالة سريعاً:
                      </span>
                      {order.status !== 'processing' && (
                        <button
                          type="button"
                          className="outline-action"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => void changeStatus(order.id, 'processing')}
                        >
                          قيد التجهيز
                        </button>
                      )}
                      {order.status !== 'shipped' && (
                        <button
                          type="button"
                          className="outline-action"
                          style={{ padding: '5px 10px', fontSize: '12px', borderColor: '#b5d5f5' }}
                          onClick={() => void changeStatus(order.id, 'shipped')}
                        >
                          تم الشحن للمندوب
                        </button>
                      )}
                      {order.status !== 'delivered' && (
                        <button
                          type="button"
                          className="outline-action"
                          style={{ padding: '5px 10px', fontSize: '12px', borderColor: '#bbf0d2', color: '#1b6e42' }}
                          onClick={() => void changeStatus(order.id, 'delivered')}
                        >
                          تم الاستلام بنجاح
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Customer & Delivery Address */}
                  <aside style={{ display: 'grid', gap: '14px', alignContent: 'start' }}>
                    {/* Delivery Address Card */}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e2dde7',
                        borderRadius: '12px',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                          borderBottom: '1px solid #f0edf3',
                          paddingBottom: '8px',
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#2b2533',
                          }}
                        >
                          <MapPin size={17} style={{ color: '#c64b30' }} />
                          عنوان التوصيل للمندوب
                        </h3>
                        <button
                          type="button"
                          onClick={() => copyOrderDetails(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: copiedId === order.id ? '#e7f7ee' : '#f5f2f8',
                            color: copiedId === order.id ? '#1b7d42' : '#6b588e',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedId === order.id ? <Check size={13} /> : <Copy size={13} />}
                          {copiedId === order.id ? 'تم النسخ!' : 'نسخ العنوان'}
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: '#888', fontSize: '11px' }}>المستلم: </span>
                          <b style={{ color: '#222' }}>{order.customer.fullName}</b>
                        </div>

                        <div>
                          <span style={{ color: '#888', fontSize: '11px' }}>المحافظة / المدينة: </span>
                          <span
                            style={{
                              background: '#f0edf6',
                              color: '#4a3a6b',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {order.customer.city}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: '#888', fontSize: '11px' }}>المنطقة / الحي: </span>
                          <b>{order.customer.district || 'غير محدد'}</b>
                        </div>

                        <div>
                          <span style={{ color: '#888', fontSize: '11px' }}>العنوان بالتفصيل والمعلم: </span>
                          <p
                            style={{
                              margin: '4px 0 0',
                              padding: '8px 10px',
                              background: '#faf9fc',
                              border: '1px dashed #ded8e6',
                              borderRadius: '7px',
                              color: '#333',
                              lineHeight: 1.5,
                            }}
                          >
                            {order.customer.address}
                          </p>
                        </div>

                        {order.notes ? (
                          <div
                            style={{
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              borderRadius: '8px',
                              padding: '9px 12px',
                              marginTop: '4px',
                            }}
                          >
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#92400e',
                                fontWeight: 700,
                                fontSize: '11px',
                              }}
                            >
                              <FileText size={13} /> ملاحظات التوصيل:
                            </span>
                            <p style={{ margin: '3px 0 0', color: '#78350f', fontSize: '12px' }}>{order.notes}</p>
                          </div>
                        ) : null}

                        {order.customer.email ? (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#777',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              marginTop: '4px',
                            }}
                          >
                            <Mail size={13} /> {order.customer.email}
                          </div>
                        ) : null}
                      </div>

                      {/* Contact Buttons */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid #f0edf3',
                        }}
                      >
                        <a
                          href={`https://wa.me/${rawPhone}?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#25D366',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <MessageSquare size={14} /> واتساب
                        </a>

                        <a
                          href={`tel:${order.customer.phone}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#f3eff8',
                            color: '#4f3c71',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid #ded6e8',
                          }}
                        >
                          <Phone size={14} /> اتصال
                        </a>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e2dde7',
                        borderRadius: '12px',
                        padding: '16px',
                      }}
                    >
                      <h3 style={{ margin: '0 0 10px', fontSize: '14px', color: '#2b2533' }}>ملخص الحساب</h3>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                          <span>قيمة المنتجات:</span>
                          <b>
                            {order.subtotal.toLocaleString('ar-SA')} {settings.currency}
                          </b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                          <span>رسوم التوصيل:</span>
                          <b>
                            {order.shipping > 0
                              ? `${order.shipping.toLocaleString('ar-SA')} ${settings.currency}`
                              : 'شحن مجاني 🎁'}
                          </b>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px dashed #ded8e6', margin: '4px 0' }} />
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '15px',
                            color: '#173b37',
                            fontWeight: 800,
                          }}
                        >
                          <span>الإجمالي المطلوب:</span>
                          <span>
                            {order.total.toLocaleString('ar-SA')} {settings.currency}
                          </span>
                        </div>
                        <div
                          style={{
                            textAlign: 'center',
                            background: '#eef8f3',
                            color: '#1c7446',
                            padding: '5px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            marginTop: '4px',
                          }}
                        >
                          💵 الدفع عند الاستلام (COD)
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </article>
          )
        })}

        {!filteredOrders.length && (
          <div className="empty-admin large">
            <PackageOpen size={34} />
            <h2>لا توجد طلبات تطابق بحثك</h2>
            <p>يمكنك تغيير شروط البحث أو التبديل بين التبويبات لعرض الطلبات.</p>
          </div>
        )}
      </section>
    </div>
  )
}
