import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Edit3,
  ExternalLink,
  Eye,
  FolderPlus,
  ImagePlus,
  Layers,
  LayoutGrid,
  Plus,
  Search,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useStore } from '../../context'
import type { Category, CategoryInput } from '../../types'

const PRESET_IMAGES = [
  { label: 'حقيبة وردية بلش', path: '/products/bag-blush.png' },
  { label: 'حقيبة لافندر هادئة', path: '/products/bag-lavender.png' },
  { label: 'حقيبة أخضر ميرمية', path: '/products/bag-sage.png' },
  { label: 'حقيبة مناسبات عاجية', path: '/products/bag-evening.png' },
]

const QUICK_SUGGESTIONS = [
  { label: 'حقائب يد', slug: 'handbags', subtitle: 'عملية وأنيقة لجميع الأوقات' },
  { label: 'حقائب كتف', slug: 'shoulder', subtitle: 'لإطلالة يومية عصرية ومريحة' },
  { label: 'حقائب كروس', slug: 'crossbody', subtitle: 'خفيفة ومريحة وسهلة الحركة' },
  { label: 'حقائب مناسبات', slug: 'evening', subtitle: 'للحظات الخاصة والسهرات الفاخرة' },
  { label: 'حقائب ظهر', slug: 'backpacks', subtitle: 'عملية وواسعة للدوام والجامعة' },
  { label: 'محافظ وإكسسوارات', slug: 'wallets', subtitle: 'تفاصيل ناعمة تكمل أناقتك' },
]

const emptyCategory: CategoryInput = {
  slug: '',
  label: '',
  subtitle: '',
  image: '/products/bag-blush.png',
  sortOrder: 1,
  isActive: true,
}

export default function CategoriesManager() {
  const { categories, products, saveCategory, deleteCategory } = useStore()
  const [draft, setDraft] = useState<CategoryInput | null>(null)
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const filteredCategories = categories.filter((c) =>
    `${c.label} ${c.slug} ${c.subtitle || ''}`.toLowerCase().includes(query.toLowerCase())
  )

  const openAddModal = () => {
    setDraft({
      ...emptyCategory,
      sortOrder: categories.length + 1,
    })
    setImageFile(undefined)
    setPreviewUrl('/products/bag-blush.png')
    setMessage('')
  }

  const openEditModal = (cat: Category) => {
    setDraft({ ...cat })
    setImageFile(undefined)
    setPreviewUrl(cat.image || '/products/bag-blush.png')
    setMessage('')
  }

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
      if (draft) {
        setDraft({ ...draft, image: localUrl })
      }
    }
  }

  const selectPresetImage = (path: string) => {
    setImageFile(undefined)
    setPreviewUrl(path)
    if (draft) {
      setDraft({ ...draft, image: path })
    }
  }

  const applySuggestion = (s: (typeof QUICK_SUGGESTIONS)[0]) => {
    if (draft) {
      setDraft({
        ...draft,
        label: s.label,
        slug: s.slug,
        subtitle: s.subtitle,
      })
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return
    setBusy(true)
    setMessage('')

    try {
      const generatedSlug =
        draft.slug?.trim() ||
        draft.label
          .trim()
          .toLowerCase()
          .replace(/[^\w\u0621-\u064A]+/g, '-')

      await saveCategory(
        {
          ...draft,
          slug: generatedSlug,
          image: previewUrl || draft.image || '/products/bag-blush.png',
        },
        imageFile
      )

      setDraft(null)
      setMessage(
        draft.id
          ? `تم تحديث تصنيف «${draft.label}» بنجاح!`
          : `تمت إضافة تصنيف «${draft.label}» الجديد بنجاح!`
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر حفظ التصنيف. يرجى المحاولة ثانية.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (category: Category) => {
    const count = products.filter(
      (p) =>
        p.categoryId === category.id ||
        p.category === category.slug ||
        p.categoryLabel === category.label
    ).length

    if (count > 0) {
      setMessage(
        `⚠️ لا يمكن حذف تصنيف «${category.label}» لأنه يحتوي على ${count} منتجات حالياً. قومي بنقل المنتجات لتصنيف آخر أولاً.`
      )
      return
    }

    if (!window.confirm(`هل أنتِ متأكدة من حذف تصنيف «${category.label}»؟`)) return

    try {
      await deleteCategory(category.id)
      setMessage(`تم حذف تصنيف «${category.label}» بنجاح.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر حذف التصنيف.')
    }
  }

  const activeCount = categories.filter((c) => c.isActive).length

  return (
    <div className="admin-page">
      {/* PAGE HEADER */}
      <div className="admin-page-title" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <small style={{ color: '#7565aa', fontWeight: 700, fontSize: '13px' }}>
            تنظيم وهيكلة المتجر
          </small>
          <h1 style={{ margin: '4px 0 6px', fontSize: '28px', fontWeight: 800 }}>
            إدارة التصنيفات والأقسام
          </h1>
          <p style={{ color: 'var(--admin-muted)', margin: 0, fontSize: '14px' }}>
            أضيفي ونظمي أقسام الحقائب التي تظهر للعملاء في شريط التنقل والصفحة الرئيسية.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={openAddModal}
          style={{
            padding: '11px 22px',
            fontSize: '15px',
            boxShadow: '0 4px 14px rgba(117,101,170,0.3)',
          }}
        >
          <Plus size={19} /> إضافة تصنيف جديد
        </button>
      </div>

      {message ? (
        <div
          className="admin-notice"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: message.includes('⚠️') ? '#fff7ed' : '#f4f1fa',
            borderColor: message.includes('⚠️') ? '#fdba74' : '#ded6eb',
            color: message.includes('⚠️') ? '#c2410c' : '#5e4e79',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          <span>{message}</span>
          <button
            onClick={() => setMessage('')}
            style={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* QUICK STATS BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid var(--admin-line)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#ede9f7',
              color: '#7565aa',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FolderPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>إجمالي التصنيفات</div>
            <strong style={{ fontSize: '20px', color: 'var(--admin-ink)' }}>
              {categories.length} أقسام
            </strong>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid var(--admin-line)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e6f7ef',
              color: '#16a34a',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Eye size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>التصنيفات النشطة</div>
            <strong style={{ fontSize: '20px', color: '#16a34a' }}>
              {activeCount} ظاهرة في المتجر
            </strong>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid var(--admin-line)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#fdf2f8',
              color: '#db2777',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>الحقائب المصنفة</div>
            <strong style={{ fontSize: '20px', color: 'var(--admin-ink)' }}>
              {products.length} حقيبة
            </strong>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', width: 'min(360px, 100%)' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8d8496',
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحثي عن تصنيف أو قسم بالاسم…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 38px 10px 12px',
              border: '1px solid #ded9e5',
              borderRadius: '10px',
              background: '#fff',
              fontSize: '14px',
            }}
          />
        </div>

        {/* View Mode Toggle */}
        <div
          style={{
            display: 'inline-flex',
            background: '#fff',
            border: '1px solid var(--admin-line)',
            borderRadius: '10px',
            padding: '3px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              border: 0,
              background: viewMode === 'grid' ? '#7565aa' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : '#655b70',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LayoutGrid size={16} /> عرض البطاقات
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              border: 0,
              background: viewMode === 'table' ? '#7565aa' : 'transparent',
              color: viewMode === 'table' ? '#fff' : '#655b70',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <TableIcon size={16} /> عرض الجدول
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: GRID OR TABLE */}
      {viewMode === 'grid' ? (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredCategories.map((category) => {
            const count = products.filter(
              (p) =>
                p.categoryId === category.id ||
                p.category === category.slug ||
                p.categoryLabel === category.label
            ).length

            return (
              <article
                key={category.id}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  border: '1px solid var(--admin-line)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* CARD HEADER */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f2eff6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#f2eff8',
                        color: '#7565aa',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                      }}
                    >
                      #{category.sortOrder}
                    </div>
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: '17px',
                          fontWeight: 800,
                          color: 'var(--admin-ink)',
                        }}
                      >
                        {category.label}
                      </h2>
                      <small style={{ color: 'var(--admin-muted)', direction: 'ltr' }}>
                        /{category.slug}
                      </small>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: category.isActive ? '#e6f7ef' : '#f3f0f5',
                      color: category.isActive ? '#16a34a' : '#887d94',
                    }}
                  >
                    {category.isActive ? '🟢 نشط' : '⚪ مخفي'}
                  </span>
                </div>

                {/* CARD IMAGE */}
                <div
                  style={{
                    height: '160px',
                    background: '#f8f6fb',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '12px',
                      }}
                    />
                  ) : (
                    <FolderPlus size={44} color="#9a8fa8" />
                  )}

                  {/* Product Count Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(4px)',
                      color: '#443c52',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    👜 {count} منتجات
                  </span>
                </div>

                {/* CARD BODY */}
                <div style={{ padding: '14px 16px', flex: 1 }}>
                  <p
                    style={{
                      margin: '0 0 10px',
                      color: 'var(--admin-muted)',
                      fontSize: '13px',
                      lineHeight: '1.4',
                    }}
                  >
                    {category.subtitle || 'لا يوجد وصف مختصر لهذا التصنيف.'}
                  </p>
                </div>

                {/* CARD ACTIONS */}
                <footer
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #f2eff6',
                    background: '#faf9fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => openEditModal(category)}
                    style={{
                      flex: 1,
                      border: '1px solid #dcd5e6',
                      background: '#fff',
                      color: '#554c60',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <Edit3 size={15} /> تعديل
                  </button>

                  <a
                    href="/admin/products"
                    title="الانتقال لصفحة المنتجات"
                    style={{
                      border: '1px solid #e2dcee',
                      background: '#f5f2f9',
                      color: '#7565aa',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ExternalLink size={14} /> الحقائب
                  </a>

                  <button
                    onClick={() => void remove(category)}
                    title="حذف التصنيف"
                    style={{
                      border: '1px solid #fecaca',
                      background: '#fff5f5',
                      color: '#dc2626',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </footer>
              </article>
            )
          })}
        </section>
      ) : (
        /* TABLE VIEW */
        <section className="admin-panel table-panel">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>الصورة</th>
                  <th>اسم التصنيف</th>
                  <th>الرابط المختصر</th>
                  <th>الوصف المختصر</th>
                  <th>عدد المنتجات</th>
                  <th>الترتيب</th>
                  <th>الحالة</th>
                  <th style={{ textAlign: 'left' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const count = products.filter(
                    (p) =>
                      p.categoryId === category.id ||
                      p.category === category.slug ||
                      p.categoryLabel === category.label
                  ).length

                  return (
                    <tr key={category.id}>
                      <td>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            background: '#f3eff6',
                            overflow: 'hidden',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          {category.image ? (
                            <img
                              src={category.image}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <FolderPlus size={20} color="#7565aa" />
                          )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '15px' }}>{category.label}</strong>
                      </td>
                      <td>
                        <code
                          style={{
                            background: '#f4f1f8',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#7565aa',
                          }}
                        >
                          /{category.slug}
                        </code>
                      </td>
                      <td style={{ color: 'var(--admin-muted)', fontSize: '13px' }}>
                        {category.subtitle || '—'}
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#f2eff8',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}
                        >
                          {count} حقائب
                        </span>
                      </td>
                      <td>#{category.sortOrder}</td>
                      <td>
                        <span className={`availability ${category.isActive ? 'active' : ''}`}>
                          {category.isActive ? 'نشط' : 'مخفي'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(category)}
                            style={{
                              border: '1px solid #dcd5e6',
                              background: '#fff',
                              color: '#554c60',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit3 size={14} /> تعديل
                          </button>
                          <button
                            onClick={() => void remove(category)}
                            style={{
                              border: '1px solid #fecaca',
                              background: '#fff5f5',
                              color: '#dc2626',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT CATEGORY (SUPER CLEAR & INTUITIVE) */}
      {/* ============================================================ */}
      {draft ? (
        <div className="admin-modal-backdrop" onMouseDown={() => setDraft(null)}>
          <section
            className="admin-modal"
            style={{ width: 'min(680px, 98%)', borderRadius: '20px' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header>
              <div>
                <small style={{ color: '#7565aa', fontWeight: 700, fontSize: '12px' }}>
                  {draft.id ? 'تعديل بيانات التصنيف' : 'تصنيف جديد للمتجر'}
                </small>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0' }}>
                  {draft.id ? `تعديل تصنيف: ${draft.label}` : 'إضافة تصنيف حقائب جديد'}
                </h2>
                <p style={{ margin: '2px 0 0', color: 'var(--admin-muted)', fontSize: '13px' }}>
                  حددي اسم التصنيف وصورته لتسهيل تصفح المتجر للعملاء في القوائم والصفحة الرئيسية.
                </p>
              </div>
              <button onClick={() => setDraft(null)} aria-label="إغلاق">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={submit} style={{ padding: '22px' }}>
              {/* STEP 1: CATEGORY IMAGE (UPLOAD OR PRESET) */}
              <div
                style={{
                  background: '#f9f8fc',
                  border: '1px solid #e9e3f2',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '18px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    marginBottom: '10px',
                    color: '#493e5e',
                    fontSize: '14px',
                  }}
                >
                  صورة التصنيف * (ارفعي من جهازك أو اختاري صورة جاهزة)
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Image Preview Box */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '12px',
                      background: 'white',
                      border: '2px solid #ded5eb',
                      overflow: 'hidden',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="معاينة صورة التصنيف"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                      />
                    ) : (
                      <ImagePlus size={32} color="#9a8fa8" />
                    )}
                  </div>

                  {/* Upload from Device Button */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        background: 'white',
                        border: '2px dashed #7565aa',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#7565aa',
                        fontWeight: 700,
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Upload size={18} />
                      <span>
                        {imageFile ? imageFile.name : 'اختاري صورة من جهازك (كمبيوتر أو هاتف)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {/* Presets Choice */}
                    <div style={{ marginTop: '10px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--admin-muted)',
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        أو اختاري صورة جاهزة بنقرة واحدة:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            type="button"
                            key={preset.path}
                            onClick={() => selectPresetImage(preset.path)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 9px',
                              background: previewUrl === preset.path ? '#7565aa' : '#fff',
                              color: previewUrl === preset.path ? '#fff' : '#574d64',
                              border: '1px solid #dcd4e7',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <img
                              src={preset.path}
                              alt=""
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                            />
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK SUGGESTION TAGS */}
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#655b74',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '6px',
                  }}
                >
                  <Sparkles size={14} color="#7565aa" /> اقتراحات تصنيفات شائعة (انقري لتعبئة البيانات):
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      onClick={() => applySuggestion(s)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ded6e9',
                        background: draft.label === s.label ? '#7565aa' : '#fff',
                        color: draft.label === s.label ? '#fff' : '#554c60',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className="form-grid">
                <label>
                  اسم التصنيف *
                  <input
                    value={draft.label}
                    onChange={(e) => {
                      const val = e.target.value
                      setDraft({
                        ...draft,
                        label: val,
                        // auto-generate slug if not set
                        slug:
                          draft.slug && draft.slug !== draft.label.trim().toLowerCase()
                            ? draft.slug
                            : val.trim().toLowerCase().replace(/\s+/g, '-'),
                      })
                    }}
                    placeholder="مثال: حقائب يد، حقائب ظهر"
                    required
                  />
                </label>

                <label>
                  الرابط المختصر (Slug) *
                  <input
                    dir="ltr"
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    placeholder="مثال: handbags, backpacks"
                    required
                  />
                  <small style={{ color: 'var(--admin-muted)', fontSize: '11px', marginTop: '2px' }}>
                    يُستخدم في مسار الرابط (بالحروف الإنجليزية أو العربية).
                  </small>
                </label>

                <label style={{ gridColumn: '1 / -1' }}>
                  الوصف القصير الترويجي
                  <input
                    value={draft.subtitle}
                    onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                    placeholder="مثال: عملية وأنيقة لكل مشوار، خفيفة وسهلة الحمل"
                  />
                  <small style={{ color: 'var(--admin-muted)', fontSize: '11px', marginTop: '2px' }}>
                    يظهر كعنوان فرعي أسفل اسم التصنيف في قسم التصنيفات بالمتجر.
                  </small>
                </label>

                <label>
                  ترتيب الظهور في القوائم
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({ ...draft, sortOrder: Number(e.target.value) || 1 })
                    }
                  />
                  <small style={{ color: 'var(--admin-muted)', fontSize: '11px', marginTop: '2px' }}>
                    رقم 1 يظهر أولاً في شريط التصنيفات.
                  </small>
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: '#f8f6fb',
                    borderRadius: '10px',
                    border: '1px solid #ece6f5',
                    alignSelf: 'center',
                  }}
                >
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={draft.isActive}
                    onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label
                    htmlFor="catIsActive"
                    style={{
                      margin: 0,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#493e5e',
                    }}
                  >
                    ظاهر في شريط التنقل وقوائم المتجر
                  </label>
                </div>
              </div>

              {/* LIVE STOREFRONT CARD PREVIEW */}
              <div
                style={{
                  background: '#fcfbfe',
                  border: '1px dashed #d5cce3',
                  borderRadius: '12px',
                  padding: '14px',
                  marginTop: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#7565aa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '10px',
                  }}
                >
                  <Eye size={15} /> معاينة شكل بطاقة التصنيف في المتجر للعميلات:
                </span>
                <div
                  style={{
                    maxWidth: '300px',
                    background: 'white',
                    border: '1px solid #ebe5f2',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <img
                    src={previewUrl || '/products/bag-blush.png'}
                    alt=""
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      borderRadius: '10px',
                      background: '#f9f7fa',
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: '15px', color: '#241f2c', display: 'block' }}>
                      {draft.label || 'اسم التصنيف'}
                    </strong>
                    <small style={{ color: '#888094', fontSize: '12px' }}>
                      {draft.subtitle || 'الوصف المختصر للتصنيف'}
                    </small>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <footer
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  borderTop: '1px solid var(--admin-line)',
                  paddingTop: '18px',
                  marginTop: '14px',
                }}
              >
                <button
                  type="button"
                  className="outline-action"
                  onClick={() => setDraft(null)}
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="primary-action"
                  disabled={busy}
                  style={{
                    padding: '10px 26px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(117,101,170,0.3)',
                  }}
                >
                  {busy ? 'جارٍ الحفظ…' : draft.id ? 'حفظ التعديلات' : 'إضافة التصنيف للمتجر'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
