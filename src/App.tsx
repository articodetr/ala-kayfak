import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import heroImage from './assets/hero-bags.png'
import blushBagImage from './assets/catalog/bag-blush.png'
import lavenderBagImage from './assets/catalog/bag-lavender.png'
import sageBagImage from './assets/catalog/bag-sage.png'
import eveningBagImage from './assets/catalog/bag-evening.png'
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
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

type Product = {
  id: number
  name: string
  category: string
  categoryLabel: string
  price: number
  oldPrice?: number
  image: string
  badge?: string
  colors: string[]
  description: string
}

const products: Product[] = [
  { id: 1, name: 'حقيبة نُور العملية', category: 'handbags', categoryLabel: 'حقائب يد', price: 229, oldPrice: 269, image: blushBagImage, badge: 'الأكثر مبيعاً', colors: ['#deb0ad', '#2d2b2d', '#d8d1bd'], description: 'حقيبة يد أنيقة بمساحة عملية وحزام كتف قابل للإزالة، تناسب يومك من الصباح للمساء.' },
  { id: 2, name: 'حقيبة لافندر الناعمة', category: 'shoulder', categoryLabel: 'حقائب كتف', price: 189, image: lavenderBagImage, badge: 'وصل حديثاً', colors: ['#b5a2cd', '#d5b8bd', '#25262b'], description: 'حقيبة كتف ناعمة بخطوط منحنية وقفل ذهبي هادئ، خفيفة وسهلة التنسيق.' },
  { id: 3, name: 'حقيبة رُبى كروس', category: 'crossbody', categoryLabel: 'حقائب كروس', price: 169, image: sageBagImage, colors: ['#adb99d', '#d0b9a6', '#28323a'], description: 'حقيبة كروس مدمجة بحزام قابل للتعديل، تمنحك حرية الحركة وتحفظ أساسياتك بأناقة.' },
  { id: 4, name: 'حقيبة سَحابة للمناسبات', category: 'evening', categoryLabel: 'حقائب مناسبات', price: 199, oldPrice: 235, image: eveningBagImage, badge: 'خصم 15%', colors: ['#ece5d9', '#d7acae', '#b7b3a5'], description: 'حقيبة مناسبات بتصميم هلالي وسلسلة ذهبية رقيقة، تكمل إطلالتك بلمسة ناعمة.' },
  { id: 5, name: 'حقيبة رَواء اليومية', category: 'handbags', categoryLabel: 'حقائب يد', price: 245, image: blushBagImage, badge: 'اختيارنا لكِ', colors: ['#d8a8a3', '#6b463d', '#e9dfd3'], description: 'حقيبة يومية رحبة بجيوب منظمة وإغلاق آمن، مصممة لترافقك في العمل والمشاوير.' },
  { id: 6, name: 'حقيبة أُنس الصغيرة', category: 'shoulder', categoryLabel: 'حقائب كتف', price: 149, oldPrice: 179, image: lavenderBagImage, colors: ['#aa95c1', '#e6c6ca', '#23262b'], description: 'تصميم صغير وخفيف مع حزام كتف مريح ومساحة كافية لكل أساسياتك اليومية.' },
  { id: 7, name: 'حقيبة مَدى المرنة', category: 'crossbody', categoryLabel: 'حقائب كروس', price: 179, image: sageBagImage, badge: 'شحن مجاني', colors: ['#9ba98e', '#c9ad94', '#1f3035'], description: 'حقيبة كروس مرنة للاستخدام اليومي بحزام طويل قابل للتعديل وتفاصيل عملية.' },
  { id: 8, name: 'حقيبة لُجين المسائية', category: 'evening', categoryLabel: 'حقائب مناسبات', price: 215, oldPrice: 259, image: eveningBagImage, badge: 'كمية محدودة', colors: ['#e5ded1', '#c89b9e', '#aaa596'], description: 'حقيبة مسائية رقيقة بلمعة هادئة وسلسلة أنيقة، مثالية للدعوات والمناسبات.' },
]

const categories = [
  { id: 'all', label: 'كل الحقائب', subtitle: 'تصفحي التشكيلة', image: blushBagImage },
  { id: 'handbags', label: 'حقائب يد', subtitle: 'عملية وأنيقة', image: blushBagImage },
  { id: 'shoulder', label: 'حقائب كتف', subtitle: 'لإطلالة يومية', image: lavenderBagImage },
  { id: 'crossbody', label: 'حقائب كروس', subtitle: 'خفيفة ومريحة', image: sageBagImage },
  { id: 'evening', label: 'حقائب مناسبات', subtitle: 'للحظات الخاصة', image: eveningBagImage },
]

type CartItem = { product: Product; quantity: number; color: string }

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

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0])
  const [toast, setToast] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory
      const matchesSearch = !query || `${product.name} ${product.categoryLabel}`.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, search])

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

  const addToCart = (product: Product, color = product.colors[0]) => {
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

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOrderComplete(true)
    setCart([])
  }

  return (
    <div id="top">
      <div className="utility-bar">
        <div className="page-shell">
          <div className="welcome">أهلاً بكِ! <button onClick={() => setToast('سيتم ربط صفحة تسجيل الدخول')}>تسجيل الدخول</button> <span>أو</span> <button onClick={() => setToast('سيتم ربط صفحة إنشاء الحساب')}>إنشاء حساب</button><span className="utility-extra">العروض اليومية</span><span className="utility-extra">المساعدة والتواصل</span></div>
          <div className="utility-links"><button className="sell-link" onClick={() => setToast('سيتم ربط نموذج بيع الحقيبة')}>بيعي معنا</button><button onClick={() => setToast(`لديكِ ${favorites.length} في المفضلة`)}>قائمة المتابعة</button><button onClick={() => setCartOpen(true)}>مشترياتي</button></div>
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
          <div><span>عرض الأسبوع</span><h2>أناقة أكثر، بسعر ألطف.</h2><p>خصم يصل إلى 25% على حقائب المناسبات — لفترة محدودة.</p></div>
          <button onClick={() => chooseCategory('evening')}>تسوّقي العرض <Icon name="arrow" size={18} /></button>
          <div className="deal-art"><img src={eveningBagImage} alt="حقيبة مناسبات ضمن عرض الأسبوع" /></div>
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
                  <button className="quick-button" onClick={() => { setQuickView(product); setSelectedColor(product.colors[0]) }}>نظرة سريعة</button>
                </div>
                <div className="product-info"><span>{product.categoryLabel}</span><h3>{product.name}</h3><small className="seller-note">جديدة · من متجر على كيفك</small><div className="product-meta"><div><strong>{product.price} ر.س</strong>{product.oldPrice && <del>{product.oldPrice} ر.س</del>}</div><div className="swatches">{product.colors.map((color) => <i key={color} style={{ background: color }} />)}</div></div>{product.badge === 'شحن مجاني' || product.oldPrice ? <b className="shipping-note">توصيل مجاني</b> : <b className="shipping-note muted-note">توصيل خلال 2–4 أيام</b>}<button className="add-button" onClick={() => addToCart(product)}><Icon name="bag" size={17} /> أضيفي للسلة</button></div>
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
          <div className="footer-about"><Brand /><p>متجر متخصص في الحقائب النسائية، نختار تصاميم جميلة وعملية لتجد كل واحدة حقيبتها على كيفها.</p><div><a href="https://instagram.com" aria-label="إنستغرام"><Icon name="instagram" /></a><button onClick={() => setToast('سيتم ربط حساب واتساب')} aria-label="واتساب"><Icon name="whatsapp" /></button></div></div>
          <div><h3>تسوّقي</h3><button onClick={() => chooseCategory('all')}>كل الحقائب</button><button onClick={() => chooseCategory('handbags')}>حقائب يد</button><button onClick={() => chooseCategory('crossbody')}>حقائب كروس</button><button onClick={() => chooseCategory('evening')}>وصل حديثاً</button></div>
          <div><h3>خدمة العملاء</h3><button onClick={() => setToast('سيتم إضافة صفحة من نحن')}>من نحن</button><button onClick={() => setToast('سيتم إضافة سياسة الشحن')}>الشحن والتوصيل</button><button onClick={() => setToast('سيتم إضافة سياسة الاستبدال')}>الاستبدال والاسترجاع</button><button onClick={() => setToast('سيتم إضافة الأسئلة الشائعة')}>الأسئلة الشائعة</button></div>
          <div className="contact-column"><h3>تواصلي معنا</h3><span><Icon name="whatsapp" size={18} /> واتساب المتجر</span><span><Icon name="phone" size={18} /> +966 50 000 0000</span><span><Icon name="mail" size={18} /> hello@alakayfak.com</span></div>
        </div>
        <div className="page-shell footer-bottom"><span>© 2026 على كيفك. جميع الحقوق محفوظة.</span><div><button>الخصوصية</button><button>الشروط والأحكام</button><button>سياسة ملفات الارتباط</button></div></div>
      </footer>

      <button className="whatsapp-float" onClick={() => setToast('سيتم ربط رقم واتساب المتجر هنا')} aria-label="واتساب"><Icon name="whatsapp" size={24} /><span>كيف نساعدكِ؟</span></button>

      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <aside className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="drawer-header"><Brand /><button onClick={() => setMenuOpen(false)} aria-label="إغلاق"><Icon name="close" /></button></div>
        <nav>{categories.map((category) => <button key={category.id} onClick={() => chooseCategory(category.id)}>{category.label}<Icon name="chevron" /></button>)}<button onClick={() => { setMenuOpen(false); setToast('سيتم ربط صفحة تسجيل الدخول') }}>تسجيل الدخول<Icon name="user" /></button></nav>
      </aside>

      {cartOpen && <div className="backdrop" onClick={() => setCartOpen(false)} />}
      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
        <div className="drawer-header"><div><small>مشترياتكِ</small><h2>سلة التسوق <b>({cartCount})</b></h2></div><button onClick={() => setCartOpen(false)} aria-label="إغلاق"><Icon name="close" /></button></div>
        <div className="free-shipping"><p>{subtotal >= 350 ? 'رائع! حصلتِ على الشحن المجاني' : `أضيفي ${350 - subtotal} ر.س لتحصلي على شحن مجاني`}</p><span><i style={{ width: `${Math.min(100, (subtotal / 350) * 100)}%` }} /></span></div>
        {cart.length ? <><div className="cart-items">{cart.map((item, index) => <article className="cart-item" key={`${item.product.id}-${item.color}`}><img src={item.product.image} alt="" /><div><span>{item.product.categoryLabel}</span><h3>{item.product.name}</h3><small className="cart-color">اللون: <i style={{ background: item.color }} /></small><strong>{item.product.price} ر.س</strong><div className="quantity"><button onClick={() => updateQuantity(index, -1)}><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(index, 1)}><Icon name="plus" size={14} /></button></div></div><button className="remove-item" onClick={() => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Icon name="trash" size={17} /></button></article>)}</div><div className="cart-summary"><div><span>المجموع الفرعي</span><strong>{subtotal} ر.س</strong></div><small>الشحن والضريبة تُحسب عند إتمام الطلب</small><button onClick={() => { setCartOpen(false); setCheckoutOpen(true); setOrderComplete(false) }}>إتمام الطلب <Icon name="arrow" size={18} /></button><p><Icon name="check" size={14} /> دفع آمن ومشفّر</p></div></> : <div className="empty-cart"><span><Icon name="bag" size={34} /></span><h3>سلّتكِ فارغة</h3><p>اكتشفي حقيبة تستحق الاقتناء.</p><button onClick={() => { setCartOpen(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>ابدئي التسوق</button></div>}
      </aside>

      {quickView && <div className="modal-backdrop" onMouseDown={() => setQuickView(null)}><div className="product-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setQuickView(null)}><Icon name="close" /></button><div className="modal-image"><img src={quickView.image} alt={quickView.name} />{quickView.badge && <span>{quickView.badge}</span>}</div><div className="modal-content"><small>{quickView.categoryLabel}</small><h2>{quickView.name}</h2><div className="modal-price"><strong>{quickView.price} ر.س</strong>{quickView.oldPrice && <del>{quickView.oldPrice} ر.س</del>}</div><p>{quickView.description}</p><div className="modal-colors"><label>اختاري اللون</label><div>{quickView.colors.map((color, index) => <button key={color} className={selectedColor === color ? 'active' : ''} onClick={() => setSelectedColor(color)} style={{ background: color }} aria-label={`لون ${index + 1}`} />)}</div></div><div className="bag-features"><span><Icon name="check" size={15} /> حزام قابل للتعديل</span><span><Icon name="check" size={15} /> جيب داخلي منظّم</span></div><button className="modal-add" onClick={() => { addToCart(quickView, selectedColor); setQuickView(null); setCartOpen(true) }}>أضيفي للسلة — {quickView.price} ر.س <Icon name="bag" size={18} /></button><small className="modal-delivery"><Icon name="truck" size={17} /> يصلكِ خلال 2–5 أيام عمل</small></div></div></div>}

      {checkoutOpen && <div className="modal-backdrop" onMouseDown={() => !orderComplete && setCheckoutOpen(false)}><div className="checkout-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setCheckoutOpen(false)}><Icon name="close" /></button>{orderComplete ? <div className="order-success"><span><Icon name="check" size={34} /></span><h2>تم استلام طلبك!</h2><p>شكراً لاختيارك «على كيفك». سنرسل تفاصيل الطلب والتوصيل إلى بريدك.</p><button onClick={() => setCheckoutOpen(false)}>العودة للمتجر</button></div> : <><div className="checkout-heading"><small>خطوة أخيرة</small><h2>بيانات التوصيل</h2><p>طلبك بقيمة <strong>{subtotal} ر.س</strong></p></div><form className="checkout-form" onSubmit={submitOrder}><label>الاسم الكامل<input required placeholder="مثال: سارة محمد" /></label><label>رقم الجوال<input required inputMode="tel" placeholder="05xxxxxxxx" pattern="[0-9+ ]{8,}" /></label><label>البريد الإلكتروني<input required type="email" placeholder="name@example.com" /></label><div><label>المدينة<input required placeholder="الرياض" /></label><label>الحي<input required placeholder="اسم الحي" /></label></div><label>العنوان بالتفصيل<textarea required placeholder="الشارع، رقم المبنى، أقرب معلم" /></label><button type="submit">تأكيد الطلب — {subtotal} ر.س <Icon name="check" size={18} /></button><small>هذه تجربة توضيحية ولن يتم خصم أي مبلغ.</small></form></>}</div></div>}

      {toast && <div className="toast"><span><Icon name="check" size={16} /></span>{toast}</div>}
    </div>
  )
}

export default App
