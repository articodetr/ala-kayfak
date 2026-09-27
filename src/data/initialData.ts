import type { Category, Product, StoreSettings } from '../types'

export const initialCategories: Category[] = [
  { id: '10000000-0000-4000-8000-000000000001', slug: 'handbags', label: 'حقائب يد', subtitle: 'عملية وأنيقة', image: '/products/bag-blush.png', sortOrder: 1, isActive: true },
  { id: '10000000-0000-4000-8000-000000000002', slug: 'shoulder', label: 'حقائب كتف', subtitle: 'لإطلالة يومية', image: '/products/bag-lavender.png', sortOrder: 2, isActive: true },
  { id: '10000000-0000-4000-8000-000000000003', slug: 'crossbody', label: 'حقائب كروس', subtitle: 'خفيفة ومريحة', image: '/products/bag-sage.png', sortOrder: 3, isActive: true },
  { id: '10000000-0000-4000-8000-000000000004', slug: 'evening', label: 'حقائب مناسبات', subtitle: 'للحظات الخاصة', image: '/products/bag-evening.png', sortOrder: 4, isActive: true },
]

const baseProduct = { inStock: true, featured: false, isActive: true }
export const initialProducts: Product[] = [
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000001', slug: 'noor-handbag', name: 'حقيبة نُور العملية', categoryId: initialCategories[0].id, category: 'handbags', categoryLabel: 'حقائب يد', price: 75000, oldPrice: 89000, image: '/products/bag-blush.png', badge: 'الأكثر مبيعاً', colors: ['#deb0ad', '#2d2b2d', '#d8d1bd'], description: 'حقيبة يد أنيقة بمساحة عملية وحزام كتف قابل للإزالة، تناسب يومك من الصباح للمساء.', stockQuantity: 18, salesCount: 34, featured: true },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000002', slug: 'lavender-shoulder', name: 'حقيبة لافندر الناعمة', categoryId: initialCategories[1].id, category: 'shoulder', categoryLabel: 'حقائب كتف', price: 62000, image: '/products/bag-lavender.png', badge: 'وصل حديثاً', colors: ['#b5a2cd', '#d5b8bd', '#25262b'], description: 'حقيبة كتف ناعمة بخطوط منحنية وقفل ذهبي هادئ، خفيفة وسهلة التنسيق.', stockQuantity: 15, salesCount: 20, featured: true },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000003', slug: 'ruba-crossbody', name: 'حقيبة رُبى كروس', categoryId: initialCategories[2].id, category: 'crossbody', categoryLabel: 'حقائب كروس', price: 55000, image: '/products/bag-sage.png', colors: ['#adb99d', '#d0b9a6', '#28323a'], description: 'حقيبة كروس مدمجة بحزام قابل للتعديل، تمنحك حرية الحركة وتحفظ أساسياتك بأناقة.', stockQuantity: 22, salesCount: 18 },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000004', slug: 'sahaba-evening', name: 'حقيبة سَحابة للمناسبات', categoryId: initialCategories[3].id, category: 'evening', categoryLabel: 'حقائب مناسبات', price: 65000, oldPrice: 78000, image: '/products/bag-evening.png', badge: 'خصم 15%', colors: ['#ece5d9', '#d7acae', '#b7b3a5'], description: 'حقيبة مناسبات بتصميم هلالي وسلسلة ذهبية رقيقة، تكمل إطلالتك بلمسة ناعمة.', stockQuantity: 9, salesCount: 29, featured: true },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000005', slug: 'rawaa-daily', name: 'حقيبة رَواء اليومية', categoryId: initialCategories[0].id, category: 'handbags', categoryLabel: 'حقائب يد', price: 80000, image: '/products/bag-blush.png', badge: 'اختيارنا لكِ', colors: ['#d8a8a3', '#6b463d', '#e9dfd3'], description: 'حقيبة يومية رحبة بجيوب منظمة وإغلاق آمن، مصممة لترافقك في العمل والمشاوير.', stockQuantity: 11, salesCount: 14 },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000006', slug: 'ons-mini', name: 'حقيبة أُنس الصغيرة', categoryId: initialCategories[1].id, category: 'shoulder', categoryLabel: 'حقائب كتف', price: 49000, oldPrice: 59000, image: '/products/bag-lavender.png', colors: ['#aa95c1', '#e6c6ca', '#23262b'], description: 'تصميم صغير وخفيف مع حزام كتف مريح ومساحة كافية لكل أساسياتك اليومية.', stockQuantity: 24, salesCount: 11 },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000007', slug: 'mada-crossbody', name: 'حقيبة مَدى المرنة', categoryId: initialCategories[2].id, category: 'crossbody', categoryLabel: 'حقائب كروس', price: 59000, image: '/products/bag-sage.png', badge: 'شحن مجاني', colors: ['#9ba98e', '#c9ad94', '#1f3035'], description: 'حقيبة كروس مرنة للاستخدام اليومي بحزام طويل قابل للتعديل وتفاصيل عملية.', stockQuantity: 16, salesCount: 17 },
  { ...baseProduct, id: '20000000-0000-4000-8000-000000000008', slug: 'lujain-evening', name: 'حقيبة لُجين المسائية', categoryId: initialCategories[3].id, category: 'evening', categoryLabel: 'حقائب مناسبات', price: 70000, oldPrice: 85000, image: '/products/bag-evening.png', badge: 'كمية محدودة', colors: ['#e5ded1', '#c89b9e', '#aaa596'], description: 'حقيبة مسائية رقيقة بلمعة هادئة وسلسلة أنيقة، مثالية للدعوات والمناسبات.', stockQuantity: 6, salesCount: 9 },
]

export const initialSettings: StoreSettings = {
  storeName: 'على كيفك',
  phone: '+967 77 000 0000',
  whatsapp: '967770000000',
  email: 'hello@alakayfak.com',
  instagram: 'https://instagram.com',
  currency: 'ر.ي',
  exchangeRateYer: 430,
  exchangeRateUsdYer: 1650,
  exchangeRateUsdSar: 3.75,
  shippingFee: 3000,
  freeShippingThreshold: 50000,
  bannerDiscount: 'خصم 25%',
  bannerTitle: 'على مختارات هذا الأسبوع',
}
