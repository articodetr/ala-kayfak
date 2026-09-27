import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialCategories, initialProducts, initialSettings } from '../data/initialData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { CartItem, Category, CategoryInput, CustomerInfo, Order, OrderStatus, Product, ProductInput, StoreSettings } from '../types'
import { StoreContext } from './StoreContextDefinition'

type DbCategory = { id: string; slug: string; label: string; subtitle: string | null; image_url: string | null; sort_order: number; is_active: boolean }
type DbProduct = { id: string; name: string; slug: string; category_id: string; price: number | string; compare_at_price: number | string | null; image_url: string | null; badge: string | null; colors: string[] | null; description: string | null; stock_quantity: number; sales_count: number; featured: boolean; is_active: boolean; created_at: string }

const mapCategory = (row: DbCategory): Category => ({ id: row.id, slug: row.slug, label: row.label, subtitle: row.subtitle || '', image: row.image_url || '/products/bag-blush.png', sortOrder: row.sort_order, isActive: row.is_active })

const mapProduct = (row: DbProduct, categories: Category[]): Product => {
  const category = categories.find((item) => item.id === row.category_id)
  return { id: row.id, name: row.name, slug: row.slug, categoryId: row.category_id, category: category?.slug || '', categoryLabel: category?.label || 'غير مصنف', price: Number(row.price), oldPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price), image: row.image_url || '/products/bag-blush.png', badge: row.badge || undefined, colors: row.colors?.length ? row.colors : ['#d8a8a3'], description: row.description || '', inStock: row.stock_quantity > 0, stockQuantity: row.stock_quantity, salesCount: row.sales_count, featured: row.featured, isActive: row.is_active, createdAt: row.created_at }
}

const mapOrder = (row: Record<string, unknown>): Order => ({
  id: String(row.id), orderNumber: String(row.order_number),
  customer: { fullName: String(row.customer_name), phone: String(row.customer_phone), email: String(row.customer_email), city: String(row.city), district: String(row.district), address: String(row.address) },
  items: ((row.order_items as Record<string, unknown>[] | null) || []).map((item) => ({ id: String(item.id), productId: item.product_id ? String(item.product_id) : undefined, productName: String(item.product_name), productImage: String(item.product_image || ''), unitPrice: Number(item.unit_price), quantity: Number(item.quantity), color: String(item.color || '') })),
  subtotal: Number(row.subtotal), shipping: Number(row.shipping), total: Number(row.total), status: row.status as OrderStatus, createdAt: String(row.created_at), notes: row.notes ? String(row.notes) : undefined,
})

const uploadProductImage = async (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('product-images').upload(path, file)
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<StoreSettings>(initialSettings)
  const [loading, setLoading] = useState(true)
  const [usingFallbackData, setUsingFallbackData] = useState(!isSupabaseConfigured)

  const refreshCatalog = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); setUsingFallbackData(true); return }
    const [categoriesResult, productsResult, settingsResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
    ])
    if (categoriesResult.error || productsResult.error) {
      console.warn('Supabase catalog is not ready; using bundled data.', categoriesResult.error || productsResult.error)
      setUsingFallbackData(true); setLoading(false); return
    }
    const mappedCategories = (categoriesResult.data as DbCategory[]).map(mapCategory)
    setCategories(mappedCategories)
    setProducts((productsResult.data as DbProduct[]).map((row) => mapProduct(row, mappedCategories)))
    if (settingsResult.data) {
      const row = settingsResult.data
      setSettings({ storeName: row.store_name, phone: row.phone, whatsapp: row.whatsapp, email: row.email, instagram: row.instagram, currency: row.currency, shippingFee: Number(row.shipping_fee), freeShippingThreshold: Number(row.free_shipping_threshold), bannerDiscount: row.banner_discount, bannerTitle: row.banner_title })
    }
    setUsingFallbackData(false); setLoading(false)
  }, [])

  useEffect(() => { void refreshCatalog() }, [refreshCatalog])

  const refreshOrders = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    if (error) throw error
    setOrders((data || []).map((row) => mapOrder(row)))
  }, [])

  const saveProduct = useCallback(async (input: ProductInput, imageFile?: File) => {
    const image = imageFile ? await uploadProductImage(imageFile) : input.image
    const payload = { name: input.name, slug: input.slug, category_id: input.categoryId, price: input.price, compare_at_price: input.oldPrice || null, image_url: image, badge: input.badge || null, colors: input.colors, description: input.description, stock_quantity: input.stockQuantity, featured: input.featured, is_active: input.isActive }
    const { error } = input.id ? await supabase.from('products').update(payload).eq('id', input.id) : await supabase.from('products').insert(payload)
    if (error) throw error
    await refreshCatalog()
  }, [refreshCatalog])

  const deleteProduct = useCallback(async (id: string) => { const { error } = await supabase.from('products').delete().eq('id', id); if (error) throw error; await refreshCatalog() }, [refreshCatalog])
  const saveCategory = useCallback(async (input: CategoryInput) => {
    const payload = { slug: input.slug, label: input.label, subtitle: input.subtitle, image_url: input.image, sort_order: input.sortOrder, is_active: input.isActive }
    const { error } = input.id ? await supabase.from('categories').update(payload).eq('id', input.id) : await supabase.from('categories').insert(payload)
    if (error) throw error
    await refreshCatalog()
  }, [refreshCatalog])
  const deleteCategory = useCallback(async (id: string) => { const { error } = await supabase.from('categories').delete().eq('id', id); if (error) throw error; await refreshCatalog() }, [refreshCatalog])
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => { const { error } = await supabase.from('orders').update({ status }).eq('id', id); if (error) throw error; setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order)) }, [])
  const saveSettings = useCallback(async (value: StoreSettings) => {
    const { error } = await supabase.from('store_settings').update({ store_name: value.storeName, phone: value.phone, whatsapp: value.whatsapp, email: value.email, instagram: value.instagram, currency: value.currency, shipping_fee: value.shippingFee, free_shipping_threshold: value.freeShippingThreshold, banner_discount: value.bannerDiscount, banner_title: value.bannerTitle }).eq('id', 1)
    if (error) throw error
    setSettings(value)
  }, [])
  const createOrder = useCallback(async (customer: CustomerInfo, items: CartItem[], notes = '') => {
    if (usingFallbackData) throw new Error('قاعدة البيانات غير مهيأة بعد. شغّل ملف migration في Supabase أولاً.')
    const { data, error } = await supabase.rpc('create_order', { p_customer: { full_name: customer.fullName, phone: customer.phone, email: customer.email, city: customer.city, district: customer.district, address: customer.address }, p_items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity, color: item.color })), p_notes: notes })
    if (error) throw error
    return (data as { order_number: string }).order_number
  }, [usingFallbackData])

  const value = useMemo(() => ({ products, categories, orders, settings, loading, usingFallbackData, refreshCatalog, refreshOrders, saveProduct, deleteProduct, saveCategory, deleteCategory, updateOrderStatus, saveSettings, createOrder }), [products, categories, orders, settings, loading, usingFallbackData, refreshCatalog, refreshOrders, saveProduct, deleteProduct, saveCategory, deleteCategory, updateOrderStatus, saveSettings, createOrder])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
