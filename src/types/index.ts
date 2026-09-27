export type Product = {
  id: string
  name: string
  slug: string
  categoryId: string
  category: string
  categoryLabel: string
  price: number
  oldPrice?: number
  image: string
  badge?: string
  colors: string[]
  description: string
  inStock: boolean
  stockQuantity: number
  salesCount: number
  featured: boolean
  isActive: boolean
  createdAt?: string
}

export type ProductInput = Omit<Product, 'id' | 'category' | 'categoryLabel' | 'inStock' | 'salesCount' | 'createdAt'> & { id?: string }

export type Category = { id: string; slug: string; label: string; subtitle: string; image: string; sortOrder: number; isActive: boolean }
export type CategoryInput = Omit<Category, 'id'> & { id?: string }
export type CartItem = { product: Product; quantity: number; color: string }
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type CustomerInfo = { fullName: string; phone: string; email: string; city: string; district: string; address: string }
export type OrderItem = { id?: string; productId?: string; productName: string; productImage: string; unitPrice: number; quantity: number; color: string }
export type Order = { id: string; orderNumber: string; customer: CustomerInfo; items: OrderItem[]; subtotal: number; shipping: number; total: number; status: OrderStatus; createdAt: string; notes?: string }
export type StoreSettings = { storeName: string; phone: string; whatsapp: string; email: string; instagram: string; currency: 'ر.س' | 'ر.ي' | string; exchangeRateYer?: number; shippingFee: number; freeShippingThreshold: number; bannerDiscount: string; bannerTitle: string }
export type AdminUser = { id: string; email: string; name: string; role: 'owner' | 'admin' }
