import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import heroImage from './assets/hero-bags.png'
import { useStore } from './context'
import type { CartItem, CustomerInfo, Product } from './types'
import './App.css'

type IconName =
  | 'arrow'
  | 'bag'
  | 'check'
  | 'chevron'
  | 'close'
  | 'grid'
  | 'heart'
  | 'instagram'
  | 'mail'
  | 'menu'
  | 'minus'
  | 'phone'
  | 'plus'
  | 'search'
  | 'sparkle'
  | 'tag'
  | 'trash'
  | 'truck'
  | 'user'
  | 'whatsapp'
  | 'map-pin'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bag: <><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    minus: <path d="M5 12h14" />,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkle: <path d="M12 2c.7 5.4 4.6 9.3 10 10-5.4.7-9.3 4.6-10 10-.7-5.4-4.6-9.3-10-10 5.4-.7 9.3-4.6 10-10Z" />,
    tag: <><path d="M20 12 12 20l-8-8V4h8l8 8Z" /><circle cx="9" cy="9" r="1.5" /></>,
    trash: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="m7 7 1 13h8l1-13" /></>,
    truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    whatsapp: <><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" /><path d="M8.3 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.8 1.8c.1.3.1.5-.1.7l-.7.8c-.2.2-.2.4 0 .7.6 1.1 1.5 2 2.6 2.6.3.2.5.2.7-.1l.8-1c.2-.3.5-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .3-.1 1.5-1 2.1-.8.6-1.8.8-3.1.4-1.4-.4-3.2-1.2-5.1-3.1-1.5-1.5-2.5-3.3-2.8-4.6-.3-1.1 0-2 .2-2.5Z" /></>,
    'map-pin': <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="على كيفك - الرئيسية">
      <span className="brand-mark">
        <svg viewBox="0 0 46 40" aria-hidden="true">
          <defs><linearGradient id="bag-gradient" x1="0" x2="1"><stop stopColor="#8071bc" /><stop offset="1" stopColor="#ec9db0" /></linearGradient></defs>
          <path d="M8 15h30l-2 21H10L8 15Z" fill="none" stroke="url(#bag-gradient)" strokeWidth="2.4" />
          <path d="M15 17V11a8 8 0 0 1 16 0v6" fill="none" stroke="url(#bag-gradient)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="m11 21 12 8 12-8" fill="none" stroke="url(#bag-gradient)" strokeWidth="1.8" />
        </svg>
      </span>
      <span><strong>على كيفك</strong><small>ALA KAYFAK</small></span>
    </a>
  )
}

const POPULAR_CITY_CHIPS = ['صنعاء', 'عدن', 'تعز', 'حضرموت', 'إب', 'الرياض', 'جدة']

const ALL_CITIES_LIST = [
  'صنعاء',
  'عدن',
  'تعز',
  'حضرموت - المكلا',
  'حضرموت - سيئون',
  'إب',
  'الحديدة',
  'ذمار',
  'مأرب',
  'شبوة - عتق',
  'لحج',
  'أبين',
  'المهرة - الغيضة',
  'عمران',
  'صعدة',
  'حجة',
  'البيضاء',
  'الضالع',
  'سقطرى',
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الطائف',
  'أبها',
  'خميس مشيط',
  'تبوك',
  'جازان',
  'نجران',
  'بريدة',
  'حائل',
  'الجبيل',
  'ينبع',
  'الهفوف',
]

function App() {
  const { products: allProducts, categories: storedCategories, settings, createOrder } = useStore()
  const products = useMemo(() => allProducts.filter((product) => product.isActive), [allProducts])
  const categories = useMemo(() => [
    { id: 'all', label: 'كل الحقائب', subtitle: 'تصفحي التشكيلة', image: storedCategories[0]?.image || '/products/bag-blush.png' },
    ...storedCategories.filter((category) => category.isActive).map((category) => ({ id: category.slug, label: category.label, subtitle: category.subtitle, image: category.image })),
  ], [storedCategories])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState('#d8a8a3')
  const [toast, setToast] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)

  const [addressForm, setAddressForm] = useState(() => {
    try {
      const saved = localStorage.getItem('alakayfak_saved_address')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      fullName: '',
      phone: '',
      email: '',
      city: 'صنعاء',
      district: '',
      address: '',
      notes: '',
    }
  })

  const [completedOrderInfo, setCompletedOrderInfo] = useState<{
    orderNumber: string
    customer: CustomerInfo
    notes: string
    items: CartItem[]
    totalFormatted: string
    totalAmount: number
    currency: string
  } | null>(null)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' ||
        product.category === activeCategory ||
        product.categoryId === activeCategory ||
        product.categoryLabel === activeCategory
      const matchesSearch =
        !query || `${product.name} ${product.categoryLabel}`.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, search, products])

  const [selectedCurrency, setSelectedCurrency] = useState<'ر.ي' | 'ر.س' | '$'>(() => {
    if (settings.currency === '$') return '$'
    if (settings.currency === 'ر.س') return 'ر.س'
    return 'ر.ي'
  })

  useEffect(() => {
    if (settings.currency === '$' || settings.currency === 'ر.س' || settings.currency === 'ر.ي') {
      setSelectedCurrency(settings.currency as 'ر.ي' | 'ر.س' | '$')
    }
  }, [settings.currency])

  const rateSarToYer = settings.exchangeRateYer || 430
  const rateUsdToYer = settings.exchangeRateUsdYer || 1650
  const rateUsdToSar = settings.exchangeRateUsdSar || 3.75

  const convertAmount = useCallback(
    (amountInBase: number): number => {
      const base = settings.currency || 'ر.ي'

      // 1. Base is Yemeni Rial (ر.ي)
      if (base === 'ر.ي') {
        if (selectedCurrency === 'ر.س') {
          return Math.round(amountInBase / rateSarToYer)
        }
        if (selectedCurrency === '$') {
          return Math.round((amountInBase / rateUsdToYer) * 10) / 10
        }
        return amountInBase
      }

      // 2. Base is Saudi Rial (ر.س)
      if (base === 'ر.س') {
        if (selectedCurrency === 'ر.ي') {
          return Math.round(amountInBase * rateSarToYer)
        }
        if (selectedCurrency === '$') {
          return Math.round((amountInBase / rateUsdToSar) * 10) / 10
        }
        return amountInBase
      }

      // 3. Base is Dollar ($)
      if (base === '$') {
        if (selectedCurrency === 'ر.ي') {
          return Math.round(amountInBase * rateUsdToYer)
        }
        if (selectedCurrency === 'ر.س') {
          return Math.round(amountInBase * rateUsdToSar)
        }
        return amountInBase
      }

      return amountInBase
    },
    [settings.currency, selectedCurrency, rateSarToYer, rateUsdToYer, rateUsdToSar]
  )

  const formatPrice = useCallback(
    (amountInBase: number): string => {
      const converted = convertAmount(amountInBase)
      if (selectedCurrency === '$') {
        return `$${converted.toLocaleString('en-US')}`
      }
      return `${converted.toLocaleString('en-US')} ${selectedCurrency}`
    },
    [convertAmount, selectedCurrency]
  )

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  useEffect(() => {
    document.body.style.overflow = cartOpen || quickView || menuOpen || checkoutOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, quickView, menuOpen, checkoutOpen])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const addToCart = (product: Product, color = (product.colors && product.colors.length ? product.colors[0] : '#deb0ad')) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.color === color)
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { product, quantity: 1, color }]
    })
    setToast(`تمت إضافة ${product.name} إلى السلة`)
  }

  const updateQuantity = (index: number, change: number) => {
    setCart((current) => current.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return [item]
      const quantity = item.quantity + change
      return quantity > 0 ? [{ ...item, quantity }] : []
    }))
  }

  const chooseCategory = (id: string) => {
    setActiveCategory(id)
    setMenuOpen(false)
    window.setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittingOrder(true)
    setCheckoutError('')

    const customer: CustomerInfo = {
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      email: addressForm.email?.trim() || '',
      city: addressForm.city.trim(),
      district: addressForm.district.trim(),
      address: addressForm.address.trim(),
    }
    const notes = addressForm.notes?.trim() || ''

    if (!customer.fullName) {
      setCheckoutError('يرجى إدخال اسم المستلم الكامل.')
      setSubmittingOrder(false)
      return
    }
    if (!customer.phone) {
      setCheckoutError('يرجى إدخال رقم الجوال للتواصل وتأكيد الطلب.')
      setSubmittingOrder(false)
      return
    }
    if (!customer.city) {
      setCheckoutError('يرجى اختيار أو تحديد المدينة / المحافظة.')
      setSubmittingOrder(false)
      return
    }
    if (!customer.district) {
      setCheckoutError('يرجى كتابة اسم الحي أو المنطقة.')
      setSubmittingOrder(false)
      return
    }
    if (!customer.address) {
      setCheckoutError('يرجى كتابة العنوان بالتفصيل وأقرب معلم مميز.')
      setSubmittingOrder(false)
      return
    }

    try {
      try {
        localStorage.setItem('alakayfak_saved_address', JSON.stringify(addressForm))
      } catch {}

      const number = await createOrder(customer, cart, notes)
      const finalPriceFormatted = formatPrice(
        subtotal + (subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee)
      )

      setCompletedOrderInfo({
        orderNumber: number,
        customer,
        notes,
        items: [...cart],
        totalFormatted: finalPriceFormatted,
        totalAmount: subtotal + (subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee),
        currency: selectedCurrency,
      })
      setOrderComplete(true)
      setCart([])
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.')
    } finally {
      setSubmittingOrder(false)
    }
  }

  const cleanStoreWhatsapp = (settings.whatsapp || '').replace(/[^0-9]/g, '')
  const getWhatsAppConfirmationUrl = () => {
    if (!completedOrderInfo) return `https://wa.me/${cleanStoreWhatsapp}`
    const itemsText = completedOrderInfo.items
      .map((item) => `• ${item.product.name} (الكمية: ${item.quantity})`)
      .join('\n')

    const message = [
      'مرحباً متجر على كيفك 👋',
      `أرغب بتأكيد طلبي الجديد رقم: *${completedOrderInfo.orderNumber}*`,
      '',
      `👤 *الاسم:* ${completedOrderInfo.customer.fullName}`,
      `📞 *رقم الجوال:* ${completedOrderInfo.customer.phone}`,
      `📍 *العنوان:* ${completedOrderInfo.customer.city} - ${completedOrderInfo.customer.district} - ${completedOrderInfo.customer.address}`,
      completedOrderInfo.notes ? `📝 *ملاحظات التوصيل:* ${completedOrderInfo.notes}` : '',
      '',
      `🛍️ *المنتجات المطلوبة:*`,
      itemsText,
      '',
      `💰 *المبلغ المطلوب عند الاستلام:* ${completedOrderInfo.totalFormatted}`,
      '',
      '📍 سأشارك معكم موقعي الحالي (اللوكيشن) هنا في المحادثة لتسهيل وصول المندوب.',
    ]
      .filter(Boolean)
      .join('\n')

    return `https://wa.me/${cleanStoreWhatsapp}?text=${encodeURIComponent(message)}`
  }

  return (
    <div id="top">
      <div className="utility-bar">
        <div className="page-shell">
          <div className="welcome">أهلاً بكِ! <button onClick={() => setToast('سيتم ربط صفحة تسجيل الدخول')}>تسجيل الدخول</button> <span>أو</span> <button onClick={() => setToast('سيتم ربط صفحة إنشاء الحساب')}>إنشاء حساب</button><span className="utility-extra">العروض اليومية</span><span className="utility-extra">المساعدة والتواصل</span></div>
          <div className="utility-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="currency-selector" style={{ display: 'inline-flex', alignItems: 'center', background: '#eae5f5', padding: '2px 4px', borderRadius: '14px', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setSelectedCurrency('ر.ي')}
                style={{
                  border: 'none',
                  background: selectedCurrency === 'ر.ي' ? '#7565aa' : 'transparent',
                  color: selectedCurrency === 'ر.ي' ? '#fff' : '#444',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🇾🇪 ر.ي
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('ر.س')}
                style={{
                  border: 'none',
                  background: selectedCurrency === 'ر.س' ? '#7565aa' : 'transparent',
                  color: selectedCurrency === 'ر.س' ? '#fff' : '#444',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🇸🇦 ر.س
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency('$')}
                style={{
                  border: 'none',
                  background: selectedCurrency === '$' ? '#7565aa' : 'transparent',
                  color: selectedCurrency === '$' ? '#fff' : '#444',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🇺🇸 $
              </button>
            </div>
            <a href="/admin" className="sell-link" style={{ background: '#7565aa', color: 'white', textDecoration: 'none', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>لوحة التحكم ⚙️</a>
            <button className="sell-link" onClick={() => setToast('سيتم ربط نموذج بيع الحقيبة')}>بيعي معنا</button>
            <button onClick={() => setToast(`لديكِ ${favorites.length} في المفضلة`)}>قائمة المتابعة</button>
            <button onClick={() => setCartOpen(true)}>مشترياتي</button>
          </div>
        </div>
      </div>

      <header className="market-header">
        <div className="page-shell header-main">
          <button className="mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة"><Icon name="menu" /></button>
          <Brand />
          <div className="market-search">
            <Icon name="search" size={20} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} placeholder="ابحثي عن حقيبة، لون أو تصميم" aria-label="البحث عن الحقائب" />
            <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} aria-label="اختيار التصنيف">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>بحث</button>
          </div>
          <div className="market-actions">
            <button onClick={() => setToast(`لديكِ ${favorites.length} في المفضلة`)} aria-label="المفضلة"><Icon name="heart" /></button>
            <button className="header-cart" onClick={() => setCartOpen(true)} aria-label="سلة التسوق"><Icon name="bag" />{cartCount > 0 && <i>{cartCount}</i>}</button>
            <button className="account-action" onClick={() => setToast('سيتم ربط صفحة تسجيل الدخول')}><Icon name="user" /><span>دخول</span></button>
          </div>
        </div>
        <nav className="category-nav">
          <div className="page-shell">
            <button className="all-categories" onClick={() => chooseCategory('all')}><Icon name="grid" size={17} /> تصفّحي التصنيفات</button>
            {categories.slice(1).map((category) => <button key={category.id} onClick={() => chooseCategory(category.id)}>{category.label}</button>)}
            <button className="offer-link" onClick={() => { setActiveCategory('evening'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}><Icon name="tag" size={17} /> عروض اليوم</button>
          </div>
        </nav>
      </header>

      <main>
        <section className="market-hero page-shell">
          <div className="hero-copy">
            <span><Icon name="sparkle" size={15} /> اختيارات جديدة كل أسبوع</span>
            <h1>حقيبتك القادمة،<br />على كيفك.</h1>
            <p>اكتشفي تصاميم مختارة لكل يوم، بأسعار واضحة وتوصيل إلى بابك.</p>
            <div><a href="#products">اكتشفي المجموعة <Icon name="arrow" size={18} /></a><button onClick={() => chooseCategory('evening')}>شاهدي العروض</button></div>
          </div>
          <div className="hero-visual"><img src={heroImage} alt="تشكيلة حقائب من متجر على كيفك" /><span className="hero-sticker"><b>خصم</b><strong>حتى 25%</strong><small>على مختارات الصيف</small></span></div>
        </section>

        <section className="category-section page-shell" id="categories">
          <div className="market-section-title"><div><span>ابدئي من هنا</span><h2>تسوّقي حسب التصنيف</h2></div><button onClick={() => chooseCategory('all')}>عرض جميع الحقائب <Icon name="arrow" size={16} /></button></div>
          <div className="category-grid">
            {categories.slice(1).map((category) => (
              <button key={category.id} onClick={() => chooseCategory(category.id)}>
                <span className="category-image"><img src={category.image} alt="" /></span>
                <span className="category-copy"><strong>{category.label}</strong><small>{category.subtitle}</small></span>
              </button>
            ))}
          </div>
        </section>

        <section className="deal-banner page-shell" aria-label="عرض الأسبوع">
          <div><span>عرض الأسبوع</span><h2>{settings.bannerTitle}</h2><p>{settings.bannerDiscount} على حقائب مختارة — لفترة محدودة.</p></div>
          <button onClick={() => chooseCategory('evening')}>تسوّقي العرض <Icon name="arrow" size={18} /></button>
          <div className="deal-art"><img src={categories.find((category) => category.id === 'evening')?.image || '/products/bag-evening.png'} alt="حقيبة مناسبات ضمن عرض الأسبوع" /></div>
        </section>

        <section className="products-section page-shell" id="products">
          <div className="market-section-title"><div><span>الأكثر طلباً هذا الأسبوع</span><h2>مختارات قد تعجبكِ</h2><p>أسعار منافسة، تفاصيل واضحة، وتوصيل مجاني على المنتجات المختارة.</p></div><button onClick={() => { setSearch(''); setActiveCategory('all') }}>عرض الكل <Icon name="arrow" size={16} /></button></div>
          <div className="product-filter">
            {categories.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}>{category.label}</button>)}
          </div>

          {filteredProducts.length ? <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  <button className={`favorite-button ${favorites.includes(product.id) ? 'active' : ''}`} onClick={() => setFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])} aria-label="المفضلة"><Icon name="heart" size={19} /></button>
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <img src={product.image} alt={product.name} />
                  <button className="quick-button" onClick={() => { setQuickView(product); setSelectedColor(product.colors?.[0] || '#deb0ad') }}>نظرة سريعة</button>
                </div>
                <div className="product-info"><span>{product.categoryLabel}</span><h3>{product.name}</h3><small className="seller-note">جديدة · من متجر على كيفك</small><div className="product-meta"><div><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div><div className="swatches">{(product.colors?.length ? product.colors : ['#deb0ad']).map((color) => <i key={color} style={{ background: color }} />)}</div></div>{product.badge === 'شحن مجاني' || product.oldPrice ? <b className="shipping-note">توصيل مجاني</b> : <b className="shipping-note muted-note">توصيل خلال 2–4 أيام</b>}<button className="add-button" onClick={() => addToCart(product)}><Icon name="bag" size={17} /> أضيفي للسلة</button></div>
              </article>
            ))}
          </div> : <div className="empty-search"><Icon name="search" size={28} /><h3>لم نجد حقيبة مطابقة</h3><p>جرّبي كلمة أخرى أو اختاري تصنيفاً مختلفاً.</p><button onClick={() => { setSearch(''); setActiveCategory('all') }}>عرض كل الحقائب</button></div>}
        </section>

        <section className="market-promise page-shell">
          <div><Icon name="truck" /><span><strong>توصيل سريع</strong><small>إلى جميع مدن المملكة</small></span></div>
          <div><Icon name="check" /><span><strong>جودة مختارة</strong><small>نفحص كل حقيبة بعناية</small></span></div>
          <div><Icon name="whatsapp" /><span><strong>خدمة عملاء</strong><small>نحن معكِ عند الحاجة</small></span></div>
        </section>
      </main>

      <footer className="market-footer">
        <div className="page-shell footer-columns">
          <div className="footer-about"><Brand /><p>متجر متخصص في الحقائب النسائية، نختار تصاميم جميلة وعملية لتجد كل واحدة حقيبتها على كيفها.</p><div><a href={settings.instagram} aria-label="إنستغرام"><Icon name="instagram" /></a><a href={`https://wa.me/${settings.whatsapp}`} aria-label="واتساب"><Icon name="whatsapp" /></a></div></div>
          <div><h3>تسوّقي</h3><button onClick={() => chooseCategory('all')}>كل الحقائب</button><button onClick={() => chooseCategory('handbags')}>حقائب يد</button><button onClick={() => chooseCategory('crossbody')}>حقائب كروس</button><button onClick={() => chooseCategory('evening')}>وصل حديثاً</button></div>
          <div><h3>خدمة العملاء</h3><button onClick={() => setToast('سيتم إضافة صفحة من نحن')}>من نحن</button><button onClick={() => setToast('سيتم إضافة سياسة الشحن')}>الشحن والتوصيل</button><button onClick={() => setToast('سيتم إضافة سياسة الاستبدال')}>الاستبدال والاسترجاع</button><button onClick={() => setToast('سيتم إضافة الأسئلة الشائعة')}>الأسئلة الشائعة</button></div>
          <div className="contact-column"><h3>تواصلي معنا</h3><span><Icon name="whatsapp" size={18} /> واتساب المتجر</span><span><Icon name="phone" size={18} /> {settings.phone}</span><span><Icon name="mail" size={18} /> {settings.email}</span></div>
        </div>
        <div className="page-shell footer-bottom"><span>© 2026 على كيفك. جميع الحقوق محفوظة.</span><div><button>الخصوصية</button><button>الشروط والأحكام</button><button>سياسة ملفات الارتباط</button></div></div>
      </footer>

      <a className="whatsapp-float" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="واتساب"><Icon name="whatsapp" size={24} /><span>كيف نساعدكِ؟</span></a>

      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <aside className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="drawer-header"><Brand /><button onClick={() => setMenuOpen(false)} aria-label="إغلاق"><Icon name="close" /></button></div>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>العملة المعروضة:</span>
          <div style={{ display: 'inline-flex', background: '#eae5f5', padding: '3px', borderRadius: '12px', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setSelectedCurrency('ر.ي')}
              style={{
                border: 'none',
                background: selectedCurrency === 'ر.ي' ? '#7565aa' : 'transparent',
                color: selectedCurrency === 'ر.ي' ? '#fff' : '#444',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🇾🇪 ريال يمني
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('ر.س')}
              style={{
                border: 'none',
                background: selectedCurrency === 'ر.س' ? '#7565aa' : 'transparent',
                color: selectedCurrency === 'ر.س' ? '#fff' : '#444',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🇸🇦 ريال سعودي
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('$')}
              style={{
                border: 'none',
                background: selectedCurrency === '$' ? '#7565aa' : 'transparent',
                color: selectedCurrency === '$' ? '#fff' : '#444',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🇺🇸 دولار ($)
            </button>
          </div>
        </div>
        <nav>{categories.map((category) => <button key={category.id} onClick={() => chooseCategory(category.id)}>{category.label}<Icon name="chevron" /></button>)}<button onClick={() => { setMenuOpen(false); setToast('سيتم ربط صفحة تسجيل الدخول') }}>تسجيل الدخول<Icon name="user" /></button></nav>
      </aside>

      {cartOpen && <div className="backdrop" onClick={() => setCartOpen(false)} />}
      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
        <div className="drawer-header"><div><small>مشترياتكِ</small><h2>سلة التسوق <b>({cartCount})</b></h2></div><button onClick={() => setCartOpen(false)} aria-label="إغلاق"><Icon name="close" /></button></div>
        <div className="free-shipping"><p>{subtotal >= settings.freeShippingThreshold ? 'رائع! حصلتِ على الشحن المجاني' : `أضيفي ${formatPrice(Math.max(0, settings.freeShippingThreshold - subtotal))} لتحصلي على شحن مجاني`}</p><span><i style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }} /></span></div>
        {cart.length ? <><div className="cart-items">{cart.map((item, index) => <article className="cart-item" key={`${item.product.id}-${item.color}`}><img src={item.product.image} alt="" /><div><span>{item.product.categoryLabel}</span><h3>{item.product.name}</h3><small className="cart-color">اللون: <i style={{ background: item.color }} /></small><strong>{formatPrice(item.product.price)}</strong><div className="quantity"><button onClick={() => updateQuantity(index, -1)}><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(index, 1)}><Icon name="plus" size={14} /></button></div></div><button className="remove-item" onClick={() => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Icon name="trash" size={17} /></button></article>)}</div><div className="cart-summary"><div><span>المجموع الفرعي</span><strong>{formatPrice(subtotal)}</strong></div><small>الشحن والضريبة تُحسب عند إتمام الطلب</small><button onClick={() => { setCartOpen(false); setCheckoutOpen(true); setOrderComplete(false) }}>إتمام الطلب <Icon name="arrow" size={18} /></button><p><Icon name="check" size={14} /> دفع آمن ومشفّر</p></div></> : <div className="empty-cart"><span><Icon name="bag" size={34} /></span><h3>سلّتكِ فارغة</h3><p>اكتشفي حقيبة تستحق الاقتناء.</p><button onClick={() => { setCartOpen(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>ابدئي التسوق</button></div>}
      </aside>

      {quickView && <div className="modal-backdrop" onMouseDown={() => setQuickView(null)}><div className="product-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setQuickView(null)}><Icon name="close" /></button><div className="modal-image"><img src={quickView.image} alt={quickView.name} />{quickView.badge && <span>{quickView.badge}</span>}</div><div className="modal-content"><small>{quickView.categoryLabel}</small><h2>{quickView.name}</h2><div className="modal-price"><strong>{formatPrice(quickView.price)}</strong>{quickView.oldPrice && <del>{formatPrice(quickView.oldPrice)}</del>}</div><p>{quickView.description}</p><div className="modal-colors"><label>اختاري اللون</label><div>{(quickView.colors?.length ? quickView.colors : ['#deb0ad']).map((color, index) => <button key={color} className={selectedColor === color ? 'active' : ''} onClick={() => setSelectedColor(color)} style={{ background: color }} aria-label={`لون ${index + 1}`} />)}</div></div><div className="bag-features"><span><Icon name="check" size={15} /> حزام قابل للتعديل</span><span><Icon name="check" size={15} /> جيب داخلي منظّم</span></div><button className="modal-add" onClick={() => { addToCart(quickView, selectedColor); setQuickView(null); setCartOpen(true) }}>أضيفي للسلة — {formatPrice(quickView.price)} <Icon name="bag" size={18} /></button><small className="modal-delivery"><Icon name="truck" size={17} /> يصلكِ خلال 2–5 أيام عمل</small></div></div></div>}

      {checkoutOpen && (
        <div className="modal-backdrop" onMouseDown={() => !orderComplete && setCheckoutOpen(false)}>
          <div className="checkout-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setCheckoutOpen(false)
                if (orderComplete) {
                  setOrderComplete(false)
                  setCompletedOrderInfo(null)
                }
              }}
              aria-label="إغلاق"
            >
              <Icon name="close" />
            </button>

            {orderComplete && completedOrderInfo ? (
              <div className="order-success">
                <span>
                  <Icon name="check" size={36} />
                </span>
                <h2>تم استلام طلبك بنجاح! 🎉</h2>
                <p style={{ maxWidth: '440px', margin: '0 auto 16px' }}>
                  شكراً لتسوقك من متجر على كيفك. تم تسجيل طلبك برقم <strong>{completedOrderInfo.orderNumber}</strong>، وجارٍ تجهيزه للتوصيل.
                </p>

                {/* Delivery Address & Order Card */}
                <div className="order-summary-box">
                  <div className="summary-section-title">
                    <Icon name="map-pin" size={16} />
                    <span>تفاصيل عنوان التوصيل المسجل</span>
                  </div>
                  <div className="summary-details-grid">
                    <div>
                      <small>المستلم:</small>
                      <strong>{completedOrderInfo.customer.fullName}</strong>
                    </div>
                    <div>
                      <small>رقم الجوال:</small>
                      <strong>{completedOrderInfo.customer.phone}</strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <small>عنوان التوصيل:</small>
                      <p style={{ margin: '3px 0 0', fontWeight: 600 }}>
                        {completedOrderInfo.customer.city} · {completedOrderInfo.customer.district} · {completedOrderInfo.customer.address}
                      </p>
                    </div>
                    {completedOrderInfo.notes ? (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          background: '#fdf9ee',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #f6e6bd',
                        }}
                      >
                        <small style={{ color: '#92400e' }}>ملاحظات للمندوب:</small>
                        <p style={{ margin: '2px 0 0', color: '#78350f', fontSize: '12px' }}>
                          {completedOrderInfo.notes}
                        </p>
                      </div>
                    ) : null}
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        borderTop: '1px dashed #e4dfea',
                        paddingTop: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <small>المبلغ المطلوب تحصيله:</small>
                      <strong style={{ fontSize: '16px', color: '#173b37' }}>
                        {completedOrderInfo.totalFormatted} (الدفع عند الاستلام)
                      </strong>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <div style={{ display: 'grid', gap: '9px', width: '100%', maxWidth: '380px', marginTop: '16px' }}>
                  <a
                    href={getWhatsAppConfirmationUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="whatsapp-order-btn"
                  >
                    <Icon name="whatsapp" size={20} />
                    <span>تأكيد الطلب ومشاركة اللوكيشن عبر واتساب</span>
                  </a>

                  <button
                    type="button"
                    className="continue-shopping-btn"
                    onClick={() => {
                      setCheckoutOpen(false)
                      setOrderComplete(false)
                      setCompletedOrderInfo(null)
                    }}
                  >
                    العودة للمتجر ومتابعة التسوق
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="checkout-heading">
                  <small>خطوة أخيرة لتأكيد طلبك</small>
                  <h2>بيانات التوصيل والعنوان</h2>
                  <p>أدخلي بيانات عنوانك بدقة ليصل المندوب إلى باب منزلك في أسرع وقت.</p>
                </div>

                {/* Mini Order recap */}
                <div className="checkout-cart-recap">
                  <div className="recap-header">
                    <span>محتويات طلبك ({cartCount} قطع)</span>
                    <strong>{formatPrice(subtotal + (subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee))}</strong>
                  </div>
                  <div className="recap-items-scroll">
                    {cart.map((item, idx) => (
                      <div key={`${item.product.id}-${item.color}-${idx}`} className="recap-item">
                        <img src={item.product.image} alt="" />
                        <div>
                          <strong>{item.product.name}</strong>
                          <small>
                            العدد: {item.quantity} · <i style={{ background: item.color }} />
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form className="checkout-form" onSubmit={submitOrder}>
                  {/* Step 1: Customer Contact */}
                  <div className="form-subheading">
                    <Icon name="user" size={16} />
                    <span>بيانات المستلم والتواصل</span>
                  </div>

                  <div className="fields-grid-2">
                    <label>
                      الاسم الكامل <span className="req">*</span>
                      <input
                        name="fullName"
                        required
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        placeholder="مثال: ريم أحمد صالح"
                      />
                    </label>

                    <label>
                      رقم الجوال أو الواتساب <span className="req">*</span>
                      <input
                        name="phone"
                        required
                        type="tel"
                        inputMode="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="مثال: 771234567 أو 05xxxxxxxx"
                      />
                    </label>
                  </div>

                  <label>
                    البريد الإلكتروني <span className="opt">(اختياري لاستلام الفاتورة)</span>
                    <input
                      name="email"
                      type="email"
                      value={addressForm.email}
                      onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                      placeholder="name@example.com"
                    />
                  </label>

                  {/* Step 2: Delivery Address */}
                  <div className="form-subheading" style={{ marginTop: '8px' }}>
                    <Icon name="map-pin" size={16} />
                    <span>عنوان التوصيل بالتفصيل</span>
                  </div>

                  {/* Quick City Selection Chips */}
                  <div className="city-quick-picks">
                    <span className="quick-label">اختيار سريع:</span>
                    {POPULAR_CITY_CHIPS.map((chipCity) => (
                      <button
                        type="button"
                        key={chipCity}
                        className={addressForm.city === chipCity ? 'active' : ''}
                        onClick={() => setAddressForm({ ...addressForm, city: chipCity })}
                      >
                        {chipCity}
                      </button>
                    ))}
                  </div>

                  <div className="fields-grid-2">
                    <label>
                      المحافظة / المدينة <span className="req">*</span>
                      <input
                        name="city"
                        list="city-options-list"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="اكتبي أو اختاري المدينة..."
                      />
                      <datalist id="city-options-list">
                        {ALL_CITIES_LIST.map((cityOption) => (
                          <option key={cityOption} value={cityOption} />
                        ))}
                      </datalist>
                    </label>

                    <label>
                      المنطقة / الحي <span className="req">*</span>
                      <input
                        name="district"
                        required
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                        placeholder="مثال: حي حدة، المعلا، العليا..."
                      />
                    </label>
                  </div>

                  <label>
                    العنوان التفصيلي وأقرب معلم مميز <span className="req">*</span>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      placeholder="اسم الشارع، رقم العمارة أو المنزل، الدور، أو بجوار معلم معروف (مثال: شارع الخمسين - عمارة الأمل - بجوار جامع...)"
                    />
                  </label>

                  <label>
                    ملاحظات إضافية للمندوب أو أوقات التوصيل <span className="opt">(اختياري)</span>
                    <input
                      name="notes"
                      value={addressForm.notes}
                      onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })}
                      placeholder="مثال: الاتصال قبل الوصول بنصف ساعة، التوصيل في الفترة المسائية..."
                    />
                  </label>

                  {/* COD Assurance */}
                  <div className="cod-badge">
                    <span className="cod-icon">💵</span>
                    <div>
                      <strong>الدفع عند الاستلام (Cash on Delivery)</strong>
                      <p>لن يتم سحب أي مبالغ الآن؛ تدفعين فقط عند وصول المندوب ومعاينة الحقيبة بنفسك.</p>
                    </div>
                  </div>

                  {checkoutError ? <div className="checkout-error-box">{checkoutError}</div> : null}

                  <button type="submit" className="checkout-submit-btn" disabled={submittingOrder}>
                    {submittingOrder ? (
                      'جارٍ تسجيل طلبك وتجهيزه…'
                    ) : (
                      <>
                        <span>
                          تأكيد الطلب —{' '}
                          {formatPrice(subtotal + (subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee))}
                        </span>
                        <Icon name="check" size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast"><span><Icon name="check" size={16} /></span>{toast}</div>}
    </div>
  )
}

export default App
