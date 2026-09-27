import { createContext } from 'react'
import type { CartItem, Category, CategoryInput, CustomerInfo, Order, OrderStatus, Product, ProductInput, StoreSettings } from '../types'

export type StoreContextValue = { products: Product[]; categories: Category[]; orders: Order[]; settings: StoreSettings; loading: boolean; usingFallbackData: boolean; refreshCatalog: () => Promise<void>; refreshOrders: () => Promise<void>; saveProduct: (product: ProductInput, imageFile?: File) => Promise<void>; deleteProduct: (id: string) => Promise<void>; saveCategory: (category: CategoryInput) => Promise<void>; deleteCategory: (id: string) => Promise<void>; updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>; saveSettings: (settings: StoreSettings) => Promise<void>; createOrder: (customer: CustomerInfo, items: CartItem[], notes?: string) => Promise<string> }
export const StoreContext = createContext<StoreContextValue | undefined>(undefined)
