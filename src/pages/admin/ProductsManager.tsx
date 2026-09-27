import { useState, type FormEvent, type ChangeEvent } from 'react'
import {
  Edit3,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  X,
  Tag,
  Check,
  TrendingDown,
  Upload,
} from 'lucide-react'
import { useStore } from '../../context'
import type { Product, ProductInput } from '../../types'

const PRESET_IMAGES = [
  { label: 'وردي ناعم', path: '/products/bag-blush.png' },
  { label: 'لافندر هادئ', path: '/products/bag-lavender.png' },
  { label: 'أخضر ميرمية', path: '/products/bag-sage.png' },
  { label: 'مناسبات عاجي', path: '/products/bag-evening.png' },
]

const emptyProduct: ProductInput = {
  name: '',
  slug: '',
  categoryId: '',
  price: 199,
  image: '/products/bag-blush.png',
  colors: ['#deb0ad', '#2d2b2d'],
  description: '',
  stockQuantity: 10,
  featured: false,
  isActive: true,
}

export default function ProductsManager() {
  const { products, categories, saveProduct, updateProductPrice, deleteProduct, settings } = useStore()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<ProductInput | null>(null)
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  // Quick Price Modal State
  const [quickPriceProduct, setQuickPriceProduct] = useState<Product | null>(null)
  const [quickPrice, setQuickPrice] = useState<number>(0)
  const [quickOldPrice, setQuickOldPrice] = useState<string>('')
  const [priceSaving, setPriceSaving] = useState(false)

  const filtered = products.filter((p) =>
    `${p.name} ${p.categoryLabel}`.toLowerCase().includes(query.toLowerCase())
  )

  const openAddModal = () => {
    setDraft({ ...emptyProduct, categoryId: categories[0]?.id || '' })
    setImageFile(undefined)
    setPreviewUrl('/products/bag-blush.png')
    setMessage('')
  }

  const openEditModal = (product: Product) => {
    setDraft({
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      badge: product.badge,
      colors: product.colors,
      description: product.description,
      stockQuantity: product.stockQuantity,
      featured: product.featured,
      isActive: product.isActive,
    })
    setImageFile(undefined)
    setPreviewUrl(product.image)
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

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return
    setBusy(true)
    setMessage('')
    try {
      await saveProduct(
        {
          ...draft,
          slug: draft.slug || draft.name.trim().replace(/\s+/g, '-').toLowerCase(),
        },
        imageFile
      )
      setDraft(null)
      setImageFile(undefined)
      setPreviewUrl('')
      setMessage('تم حفظ الحقيبة وتحديث الكتالوج بنجاح.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر حفظ المنتج.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (product: Product) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف «${product.name}» نهائياً؟`)) return
    try {
      await deleteProduct(product.id)
      setMessage(`تم حذف «${product.name}».`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر الحذف.')
    }
  }

  // Quick Price Handlers
  const openQuickPriceModal = (product: Product) => {
    setQuickPriceProduct(product)
    setQuickPrice(product.price)
    setQuickOldPrice(product.oldPrice ? String(product.oldPrice) : '')
  }

  const saveQuickPrice = async (e: FormEvent) => {
    e.preventDefault()
    if (!quickPriceProduct) return
    setPriceSaving(true)
    try {
      const oldPriceNum = quickOldPrice ? Number(quickOldPrice) : undefined
      await updateProductPrice(quickPriceProduct.id, Number(quickPrice), oldPriceNum)
      setMessage(`تم تحديث سعر «${quickPriceProduct.name}» بنجاح إلى ${quickPrice} ${settings.currency}.`)
      setQuickPriceProduct(null)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذر تحديث السعر.')
    } finally {
      setPriceSaving(false)
    }
  }

  const calculateDiscountPercent = (price: number, oldPrice?: number) => {
    if (!oldPrice || oldPrice <= price) return null
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  return (
    <div className="admin-page">
      <div className="admin-page-title">
        <div>
          <small>إدارة الكتالوج</small>
          <h1>إدارة المنتجات والأسعار</h1>
          <p>{products.length} حقائب متوفرة في المتجر</p>
        </div>
        <button className="primary-action" onClick={openAddModal}>
          <Plus size={18} /> إضافة حقيبة جديدة
        </button>
      </div>

      {message ? <div className="admin-notice">{message}</div> : null}

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحثي عن حقيبة أو تصنيف…"
          />
        </div>
      </div>

      <section className="admin-panel table-panel">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>الحقيبة</th>
                <th>التصنيف</th>
                <th>السعر الحالي</th>
                <th>تعديل السعر السريع</th>
                <th>المخزون</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const discount = calculateDiscountPercent(product.price, product.oldPrice)
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img src={product.image} alt={product.name} />
                        <span>
                          <strong>{product.name}</strong>
                          {product.badge ? (
                            <small style={{ color: '#9a4e72', fontWeight: 700 }}>
                              {product.badge}
                            </small>
                          ) : (
                            <small>{product.slug}</small>
                          )}
                        </span>
                      </div>
                    </td>
                    <td>{product.categoryLabel}</td>
                    <td>
                      <strong>
                        {product.price} {settings.currency}
                      </strong>
                      {product.oldPrice ? (
                        <small className="old-price">
                          {product.oldPrice} {settings.currency}
                        </small>
                      ) : null}
                      {discount ? (
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#fcf0f3',
                            color: '#9a4e72',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '6px',
                            marginTop: '2px',
                          }}
                        >
                          خصم {discount}%
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <button
                        className="outline-action"
                        style={{ padding: '6px 11px', fontSize: '12px' }}
                        onClick={() => openQuickPriceModal(product)}
                        title="تعديل السعر مباشرة"
                      >
                        <Tag size={13} />
                        <span>تعديل السعر</span>
                      </button>
                    </td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span className={`availability ${product.isActive ? 'active' : ''}`}>
                        {product.isActive ? 'نشط' : 'مخفي'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openEditModal(product)} aria-label="تعديل تفاصيل الحقيبة" title="تعديل">
                          <Edit3 size={17} />
                        </button>
                        <button className="danger" onClick={() => void remove(product)} aria-label="حذف" title="حذف">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length ? <div className="empty-admin">لا توجد حقائب مطابقة للبحث.</div> : null}
      </section>

      {/* Quick Price Editor Modal */}
      {quickPriceProduct ? (
        <div className="admin-modal-backdrop" onMouseDown={() => setQuickPriceProduct(null)}>
          <section
            className="admin-modal compact"
            onMouseDown={(event) => event.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <header>
              <div>
                <h2>تعديل السعر: {quickPriceProduct.name}</h2>
                <p>تحديث سعر البيع والخصم مباشرة للعملاء.</p>
              </div>
              <button onClick={() => setQuickPriceProduct(null)}>
                <X />
              </button>
            </header>

            <form onSubmit={saveQuickPrice}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img
                  src={quickPriceProduct.image}
                  alt=""
                  style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover' }}
                />
                <div>
                  <strong>{quickPriceProduct.name}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
                    السعر السابق: {quickPriceProduct.price} {settings.currency}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  سعر البيع الجديد ({settings.currency}) *
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(Number(e.target.value))}
                  />
                </label>

                <label>
                  السعر القديم قبل الخصم
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="اختياري"
                    value={quickOldPrice}
                    onChange={(e) => setQuickOldPrice(e.target.value)}
                  />
                </label>
              </div>

              {quickOldPrice && Number(quickOldPrice) > quickPrice ? (
                <div
                  style={{
                    background: '#fbf0f4',
                    border: '1px solid #ebd3dc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#9a4e72',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  <TrendingDown size={15} />
                  <span>
                    نسبة الخصم المحسوبة: خصم{' '}
                    <strong>{calculateDiscountPercent(quickPrice, Number(quickOldPrice))}%</strong>
                  </span>
                </div>
              ) : null}

              <footer>
                <button
                  type="button"
                  className="outline-action"
                  onClick={() => setQuickPriceProduct(null)}
                >
                  إلغاء
                </button>
                <button className="primary-action" disabled={priceSaving}>
                  {priceSaving ? 'جارٍ الحفظ…' : 'حفظ السعر الجديد'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}

      {/* Add / Edit Full Product Modal with Image Uploader */}
      {draft ? (
        <div className="admin-modal-backdrop" onMouseDown={() => setDraft(null)}>
          <section
            className="admin-modal"
            onMouseDown={(event) => event.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <header>
              <div>
                <h2>{draft.id ? 'تعديل بيانات الحقيبة' : 'إضافة حقيبة جديدة'}</h2>
                <p>يمكنك رفع صورة من جهازك وتحديد السعر والألوان بدقة.</p>
              </div>
              <button onClick={() => setDraft(null)}>
                <X />
              </button>
            </header>

            <form onSubmit={submit}>
              {/* IMAGE UPLOAD SECTION */}
              <div
                style={{
                  background: '#f8f6fa',
                  border: '1px solid #e7e2ed',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '18px',
                }}
              >
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                  صورة الحقيبة
                </label>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Current Preview */}
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 12,
                      background: 'white',
                      border: '2px solid #ded8e6',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="معاينة الحقيبة"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImagePlus size={32} color="#9a8fa8" />
                    )}
                  </div>

                  {/* Upload button from device */}
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
                      }}
                    >
                      <Upload size={18} />
                      <span>{imageFile ? imageFile.name : 'اختاري صورة من جهازك (كمبيوتر أو هاتف)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {/* Presets Choice */}
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                        أو اختاري من الصور الجاهزة المتوفرة:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            type="button"
                            key={preset.path}
                            onClick={() => selectPresetImage(preset.path)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              background: previewUrl === preset.path ? '#eee8f7' : 'white',
                              border:
                                previewUrl === preset.path
                                  ? '1px solid #7565aa'
                                  : '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            <img
                              src={preset.path}
                              alt=""
                              style={{ width: 16, height: 16, borderRadius: 3 }}
                            />
                            <span>{preset.label}</span>
                            {previewUrl === preset.path ? <Check size={11} color="#7565aa" /> : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT DETAILS GRID */}
              <div className="form-grid">
                <label>
                  اسم الحقيبة *
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="مثال: حقيبة ريما الأنيقة"
                    required
                  />
                </label>

                <label>
                  التصنيف *
                  <select
                    value={draft.categoryId}
                    onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                    required
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  سعر البيع ({settings.currency}) *
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                    required
                  />
                </label>

                <label>
                  السعر القديم قبل الخصم ({settings.currency})
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="مثال: 250"
                    value={draft.oldPrice || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, oldPrice: Number(e.target.value) || undefined })
                    }
                  />
                </label>

                <label>
                  شارة العرض (Badge)
                  <input
                    value={draft.badge || ''}
                    onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                    placeholder="مثال: الأكثر مبيعاً، وصل حديثاً، خصم 20%"
                  />
                </label>

                <label>
                  كمية المخزون *
                  <input
                    type="number"
                    min="0"
                    value={draft.stockQuantity}
                    onChange={(e) =>
                      setDraft({ ...draft, stockQuantity: Number(e.target.value) })
                    }
                    required
                  />
                </label>

                <label style={{ gridColumn: 'span 2' }}>
                  أكواد الألوان المتوفرة (مفصولة بفاصلة)
                  <input
                    dir="ltr"
                    value={draft.colors.join(', ')}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        colors: e.target.value
                          .split(',')
                          .map((v) => v.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="#deb0ad, #2d2b2d, #d8d1bd"
                  />
                </label>
              </div>

              <label style={{ marginTop: '12px', display: 'block' }}>
                وصف الحقيبة والمميزات
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="حقيبة كتف عملية مناسبة للدوام والمناسبات..."
                />
              </label>

              <div className="check-row" style={{ marginTop: '12px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />{' '}
                  حقيبة مميزة (تظهر في البانر)
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  />{' '}
                  ظاهرة في المتجر للعملاء
                </label>
              </div>

              <footer>
                <button
                  type="button"
                  className="outline-action"
                  onClick={() => setDraft(null)}
                >
                  إلغاء
                </button>
                <button className="primary-action" disabled={busy}>
                  {busy ? 'جارٍ الحفظ…' : 'حفظ الحقيبة'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
