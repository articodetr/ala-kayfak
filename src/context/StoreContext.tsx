import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialCategories, initialProducts, initialSettings } from '../data/initialData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { CartItem, Category, CategoryInput, CustomerInfo, Order, OrderStatus, Product, ProductInput, StoreSettings } from '../types'
import { StoreContext } from './StoreContextDefinition'

type DbCategory = { id: string; slug: string; label: string; subtitle: string | null; image_url: string | null; sort_order: number; is_active: boolean }
type DbProduct = { id: string; name: string; slug: string; category_id: string; price: number | string; compare_at_price: number | string | null; image_url: string | null; badge: string | null; colors: string[] | null; description: string | null; stock_quantity: number; sales_count: number; featured: boolean; is_active: boolean; created_at: string }

const STORAGE_KEYS = {
  ALL_PRODUCTS: 'alakayfak_products_cache_v4',
  CUSTOM_PRODUCTS: 'alakayfak_custom_products_v4',
  ORDERS: 'alakayfak_orders_cache_v4',
  SETTINGS: 'alakayfak_settings_cache_v4',
}

const BROADCAST_CHANNEL_NAME = 'alakayfak_store_sync_channel'

const mapCategory = (row: DbCategory): Category => ({
  id: row.id,
  slug: row.slug,
  label: row.label,
  subtitle: row.subtitle || '',
  image: row.image_url || '/products/bag-blush.png',
  sortOrder: row.sort_order,
  isActive: row.is_active,
})

const mapProduct = (row: DbProduct, categories: Category[]): Product => {
  const category = categories.find((item) => item.id === row.category_id || item.slug === row.category_id)
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    category: category?.slug || 'handbags',
    categoryLabel: category?.label || 'حقائب يد',
    price: Number(row.price),
    oldPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
    image: row.image_url || '/products/bag-blush.png',
    badge: row.badge || undefined,
    colors: row.colors?.length ? row.colors : ['#deb0ad', '#2d2b2d'],
    description: row.description || '',
    inStock: row.stock_quantity > 0,
    stockQuantity: row.stock_quantity,
    salesCount: row.sales_count || 0,
    featured: row.featured,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

const mapOrder = (row: Record<string, unknown>): Order => ({
  id: String(row.id),
  orderNumber: String(row.order_number),
  customer: {
    fullName: String(row.customer_name),
    phone: String(row.customer_phone),
    email: String(row.customer_email || ''),
    city: String(row.city || ''),
    district: String(row.district || ''),
    address: String(row.address || ''),
  },
  items: ((row.order_items as Record<string, unknown>[] | null) || []).map((item) => ({
    id: String(item.id),
    productId: item.product_id ? String(item.product_id) : undefined,
    productName: String(item.product_name),
    productImage: String(item.product_image || ''),
    unitPrice: Number(item.unit_price),
    quantity: Number(item.quantity),
    color: String(item.color || ''),
  })),
  subtotal: Number(row.subtotal),
  shipping: Number(row.shipping),
  total: Number(row.total),
  status: row.status as OrderStatus,
  createdAt: String(row.created_at),
  notes: row.notes ? String(row.notes) : undefined,
})

const getCustomProductsFromStorage = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS) || localStorage.getItem('alakayfak_custom_products_v3')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveCustomProductsToStorage = (customs: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(customs))
  } catch (e) {
    console.error('Failed saving custom products', e)
  }
}

const uploadProductImage = async (file: File): Promise<string> => {
  // If Supabase is available, attempt bucket upload
  if (isSupabaseConfigured) {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${crypto.randomUUID()}.${extension}`
      const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (!error && data) {
        return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      }
    } catch (err) {
      console.warn('Supabase storage upload error, falling back to base64 Data URL', err)
    }
  }

  // Guaranteed fallback: read as base64 Data URL so the image always loads!
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const customs = getCustomProductsFromStorage()
      const cachedAll = localStorage.getItem(STORAGE_KEYS.ALL_PRODUCTS)
      if (cachedAll) {
        const parsed: Product[] = JSON.parse(cachedAll)
        // Ensure any custom products are present
        const merged = [...customs, ...parsed.filter((p) => !customs.some((c) => c.id === p.id))]
        return merged
      }
      return [...customs, ...initialProducts]
    } catch {
      return initialProducts
    }
  })

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ORDERS)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (cached) {
        return { ...initialSettings, ...JSON.parse(cached) }
      }
    } catch {}
    return initialSettings
  })
  const [loading, setLoading] = useState(true)
  const [usingFallbackData, setUsingFallbackData] = useState(!isSupabaseConfigured)

  // Broadcast sync helper
  const notifyCatalogChanged = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('alakayfak_catalog_sync'))
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
          channel.postMessage({ type: 'CATALOG_SYNC', timestamp: Date.now() })
          channel.close()
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist products whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_PRODUCTS, JSON.stringify(products))
    } catch (e) {
      console.error('Failed saving all products cache', e)
    }
  }, [products])

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    } catch (e) {
      console.error('Failed saving orders cache', e)
    }
  }, [orders])

  const refreshCatalog = useCallback(async () => {
    const customs = getCustomProductsFromStorage()

    if (!isSupabaseConfigured) {
      setLoading(false)
      setUsingFallbackData(true)
      const merged = [...customs, ...initialProducts.filter((p) => !customs.some((c) => c.id === p.id))]
      setProducts(merged)
      return
    }

    try {
      const [categoriesResult, productsResult, settingsResult] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
      ])

      let remoteCategories = initialCategories
      if (categoriesResult.data?.length) {
        remoteCategories = (categoriesResult.data as DbCategory[]).map(mapCategory)
        setCategories(remoteCategories)
      }

      if (productsResult.data?.length) {
        const remoteProducts = (productsResult.data as DbProduct[]).map((row) => mapProduct(row, remoteCategories))
        // MERGE: custom local products always take precedence and are NEVER removed!
        const merged = [
          ...customs,
          ...remoteProducts.filter((p) => !customs.some((c) => c.id === p.id)),
        ]
        setProducts(merged)
      } else {
        const merged = [...customs, ...initialProducts.filter((p) => !customs.some((c) => c.id === p.id))]
        setProducts(merged)
      }

      if (settingsResult.data) {
        const row = settingsResult.data
        const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS)
        const local = cached ? JSON.parse(cached) : null
        setSettings({
          storeName: local?.storeName || row.store_name,
          phone: local?.phone || row.phone,
          whatsapp: local?.whatsapp || row.whatsapp,
          email: local?.email || row.email,
          instagram: local?.instagram || row.instagram,
          currency: local?.currency || 'ر.ي',
          exchangeRateYer: local?.exchangeRateYer || 430,
          exchangeRateUsdYer: local?.exchangeRateUsdYer || 1650,
          exchangeRateUsdSar: local?.exchangeRateUsdSar || 3.75,
          shippingFee: Number(local?.shippingFee ?? row.shipping_fee ?? 3000),
          freeShippingThreshold: Number(local?.freeShippingThreshold ?? row.free_shipping_threshold ?? 50000),
          bannerDiscount: local?.bannerDiscount || row.banner_discount,
          bannerTitle: local?.bannerTitle || row.banner_title,
        })
      }
      setUsingFallbackData(false)
    } catch (e) {
      console.warn('Network error fetching catalog, keeping local and cached products', e)
      const merged = [...customs, ...initialProducts.filter((p) => !customs.some((c) => c.id === p.id))]
      setProducts(merged)
      setUsingFallbackData(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Listen to cross-tab updates
  useEffect(() => {
    const handleSync = () => {
      const customs = getCustomProductsFromStorage()
      setProducts((current) => {
        const nonCustoms = current.filter((p) => !p.id.startsWith('prod_') && !customs.some((c) => c.id === p.id))
        return [...customs, ...nonCustoms]
      })
    }

    window.addEventListener('alakayfak_catalog_sync', handleSync)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.CUSTOM_PRODUCTS || e.key === STORAGE_KEYS.ALL_PRODUCTS) {
        handleSync()
      }
    })

    let broadcastChannel: BroadcastChannel | null = null
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
      broadcastChannel.onmessage = (msg) => {
        if (msg.data?.type === 'CATALOG_SYNC') {
          handleSync()
        }
      }
    }

    return () => {
      window.removeEventListener('alakayfak_catalog_sync', handleSync)
      if (broadcastChannel) broadcastChannel.close()
    }
  }, [])

  useEffect(() => {
    void refreshCatalog()
  }, [refreshCatalog])

  const refreshOrders = useCallback(async () => {
    if (!isSupabaseConfigured) return
    try {
      const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
      if (!error && data) {
        setOrders(data.map((row) => mapOrder(row)))
      }
    } catch (e) {
      console.warn('Error refreshing orders', e)
    }
  }, [])

  const saveProduct = useCallback(async (input: ProductInput, imageFile?: File) => {
    const image = imageFile ? await uploadProductImage(imageFile) : input.image || '/products/bag-blush.png'
    const categoryObj = categories.find((c) => c.id === input.categoryId || c.slug === input.categoryId)
    const categoryLabel = categoryObj?.label || 'حقائب يد'
    const categorySlug = categoryObj?.slug || 'handbags'
    const categoryId = categoryObj?.id || input.categoryId || categories[0]?.id || '10000000-0000-4000-8000-000000000001'

    // Fix compare_at_price to satisfy database check: compare_at_price >= price
    let compareAtPrice = input.oldPrice
    if (compareAtPrice != null && Number(compareAtPrice) < Number(input.price)) {
      compareAtPrice = undefined
    }

    const productId = input.id || `prod_${Date.now()}`
    const finalColors = input.colors?.length ? input.colors : ['#deb0ad', '#2d2b2d']

    const productRecord: Product = {
      id: productId,
      name: input.name,
      slug: input.slug || input.name.trim().toLowerCase().replace(/\s+/g, '-'),
      categoryId,
      category: categorySlug,
      categoryLabel,
      price: Number(input.price),
      oldPrice: input.oldPrice ? Number(input.oldPrice) : undefined,
      image,
      badge: input.badge || undefined,
      colors: finalColors,
      description: input.description || '',
      inStock: input.stockQuantity > 0,
      stockQuantity: Number(input.stockQuantity),
      salesCount: 0,
      featured: Boolean(input.featured),
      isActive: input.isActive !== false,
      createdAt: new Date().toISOString(),
    }

    // 1. Immediately save to Local Custom Products Storage
    const customs = getCustomProductsFromStorage()
    const existingIndex = customs.findIndex((c) => c.id === productId)
    let updatedCustoms: Product[]
    if (existingIndex >= 0) {
      updatedCustoms = customs.map((c, i) => (i === existingIndex ? productRecord : c))
    } else {
      updatedCustoms = [productRecord, ...customs]
    }
    saveCustomProductsToStorage(updatedCustoms)

    // 2. Immediately update state
    setProducts((current) => {
      const exists = current.some((p) => p.id === productId)
      if (exists) {
        return current.map((p) => (p.id === productId ? productRecord : p))
      }
      return [productRecord, ...current]
    })

    // 3. Broadcast to all open tabs immediately!
    notifyCatalogChanged()

    // 4. Try saving to Supabase if configured (without blocking UI)
    if (isSupabaseConfigured) {
      try {
        const payload = {
          name: productRecord.name,
          slug: productRecord.slug,
          category_id: categoryId,
          price: productRecord.price,
          compare_at_price: compareAtPrice || null,
          image_url: image,
          badge: productRecord.badge || null,
          colors: productRecord.colors,
          description: productRecord.description,
          stock_quantity: productRecord.stockQuantity,
          featured: productRecord.featured,
          is_active: productRecord.isActive,
        }
        if (input.id && !input.id.startsWith('prod_')) {
          await supabase.from('products').update(payload).eq('id', input.id)
        } else {
          await supabase.from('products').insert(payload)
        }
      } catch (err) {
        console.warn('Supabase sync notice: product saved locally', err)
      }
    }
  }, [categories, notifyCatalogChanged])

  const updateProductPrice = useCallback(async (id: string, price: number, oldPrice?: number) => {
    // 1. Update in Custom Products storage
    const customs = getCustomProductsFromStorage()
    const existing = customs.find((c) => c.id === id)
    if (existing) {
      const updated = customs.map((c) => (c.id === id ? { ...c, price, oldPrice } : c))
      saveCustomProductsToStorage(updated)
    }

    // 2. Update state
    setProducts((current) => {
      const updated = current.map((p) => (p.id === id ? { ...p, price, oldPrice } : p))
      return updated
    })

    // 3. Broadcast to all tabs
    notifyCatalogChanged()

    // 4. Try updating in Supabase
    if (isSupabaseConfigured && !id.startsWith('prod_')) {
      try {
        const compareAtPrice = oldPrice && oldPrice >= price ? oldPrice : null
        await supabase.from('products').update({ price, compare_at_price: compareAtPrice }).eq('id', id)
      } catch (err) {
        console.warn('Supabase price update error, updated locally', err)
      }
    }
  }, [notifyCatalogChanged])

  const deleteProduct = useCallback(async (id: string) => {
    // 1. Remove from custom storage
    const customs = getCustomProductsFromStorage()
    const updatedCustoms = customs.filter((c) => c.id !== id)
    saveCustomProductsToStorage(updatedCustoms)

    // 2. Remove from state
    setProducts((current) => current.filter((p) => p.id !== id))

    // 3. Broadcast
    notifyCatalogChanged()

    // 4. Delete from Supabase
    if (isSupabaseConfigured && !id.startsWith('prod_')) {
      try {
        await supabase.from('products').delete().eq('id', id)
      } catch (err) {
        console.warn('Could not delete in Supabase', err)
      }
    }
  }, [notifyCatalogChanged])

  const saveCategory = useCallback(async (input: CategoryInput) => {
    const newCat: Category = {
      id: input.id || `cat_${Date.now()}`,
      slug: input.slug,
      label: input.label,
      subtitle: input.subtitle,
      image: input.image,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    }

    setCategories((current) => {
      if (input.id) {
        return current.map((c) => (c.id === input.id ? newCat : c))
      }
      return [...current, newCat]
    })

    if (isSupabaseConfigured) {
      try {
        const payload = {
          slug: input.slug,
          label: input.label,
          subtitle: input.subtitle,
          image_url: input.image,
          sort_order: input.sortOrder,
          is_active: input.isActive,
        }
        if (input.id && !input.id.startsWith('cat_')) {
          await supabase.from('categories').update(payload).eq('id', input.id)
        } else {
          await supabase.from('categories').insert(payload)
        }
      } catch (err) {
        console.warn('Could not save category to Supabase', err)
      }
    }
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((current) => current.filter((c) => c.id !== id))
    if (isSupabaseConfigured && !id.startsWith('cat_')) {
      try {
        await supabase.from('categories').delete().eq('id', id)
      } catch (err) {
        console.warn('Could not delete category in Supabase', err)
      }
    }
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)))
    if (isSupabaseConfigured && !id.startsWith('ord_')) {
      try {
        await supabase.from('orders').update({ status }).eq('id', id)
      } catch (err) {
        console.warn('Could not update status in Supabase', err)
      }
    }
  }, [])

  const saveSettings = useCallback(async (value: StoreSettings) => {
    setSettings(value)
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(value))
    } catch {
      // ignore
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('store_settings')
          .update({
            store_name: value.storeName,
            phone: value.phone,
            whatsapp: value.whatsapp,
            email: value.email,
            instagram: value.instagram,
            currency: value.currency,
            shipping_fee: value.shippingFee,
            free_shipping_threshold: value.freeShippingThreshold,
            banner_discount: value.bannerDiscount,
            banner_title: value.bannerTitle,
          })
          .eq('id', 1)
      } catch (err) {
        console.warn('Could not update settings in Supabase', err)
      }
    }
  }, [])

  const createOrder = useCallback(
    async (customer: CustomerInfo, items: CartItem[], notes = '') => {
      const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee
      const total = subtotal + shipping
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const orderNumber = `AK-${randomNum}`

      if (isSupabaseConfigured && !usingFallbackData) {
        try {
          const { data, error } = await supabase.rpc('create_order', {
            p_customer: {
              full_name: customer.fullName,
              phone: customer.phone,
              email: customer.email,
              city: customer.city,
              district: customer.district,
              address: customer.address,
            },
            p_items: items.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
              color: item.color,
            })),
            p_notes: notes,
          })
          if (!error && data) {
            void refreshOrders()
            return (data as { order_number: string }).order_number
          }
        } catch (err) {
          console.warn('Supabase create_order error, saving local order', err)
        }
      }

      // Local order creation
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        orderNumber,
        customer,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          unitPrice: item.product.price,
          quantity: item.quantity,
          color: item.color,
        })),
        subtotal,
        shipping,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes,
      }

      setOrders((prev) => [newOrder, ...prev])
      return orderNumber
    },
    [usingFallbackData, settings, refreshOrders]
  )

  const value = useMemo(
    () => ({
      products,
      categories,
      orders,
      settings,
      loading,
      usingFallbackData,
      refreshCatalog,
      refreshOrders,
      saveProduct,
      updateProductPrice,
      deleteProduct,
      saveCategory,
      deleteCategory,
      updateOrderStatus,
      saveSettings,
      createOrder,
    }),
    [
      products,
      categories,
      orders,
      settings,
      loading,
      usingFallbackData,
      refreshCatalog,
      refreshOrders,
      saveProduct,
      updateProductPrice,
      deleteProduct,
      saveCategory,
      deleteCategory,
      updateOrderStatus,
      saveSettings,
      createOrder,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
