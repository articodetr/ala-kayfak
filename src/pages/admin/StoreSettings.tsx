import { useEffect, useState, type FormEvent } from 'react'
import { Save, Store, Coins, Truck } from 'lucide-react'
import { useStore } from '../../context'
import type { StoreSettings as StoreSettingsType } from '../../types'

export default function StoreSettings() {
  const { settings, saveSettings } = useStore()
  const [draft, setDraft] = useState<StoreSettingsType>(settings)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => setDraft(settings), [settings])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await saveSettings(draft)
      setMessage('تم حفظ إعدادات المتجر والعملة بنجاح.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر حفظ الإعدادات.')
    } finally {
      setBusy(false)
    }
  }

  const update = <K extends keyof StoreSettingsType>(key: K, value: StoreSettingsType[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  return (
    <div className="admin-page">
      <div className="admin-page-title">
        <div>
          <small>التخصيص والإعدادات</small>
          <h1>إعدادات المتجر والعملة</h1>
          <p>تحديد العملة الأساسية (ريال سعودي / ريال يمني)، بيانات التواصل والشحن.</p>
        </div>
      </div>

      {message ? <div className="admin-notice">{message}</div> : null}

      <form className="settings-form" onSubmit={submit}>
        {/* Currency & Exchange Rate Section */}
        <section className="admin-panel">
          <div className="settings-section-title">
            <span>
              <Coins />
            </span>
            <div>
              <h2>العملة والأسعار</h2>
              <p>اختاري عملة المتجر الأساسية وسعر الصرف بين الريال السعودي واليمني.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              العملة الأساسية للمتجر *
              <select
                value={draft.currency}
                onChange={(e) => update('currency', e.target.value)}
                style={{ fontWeight: 700 }}
              >
                <option value="ر.ي">🇾🇪 ريال يمني (ر.ي) — الافتراضي</option>
                <option value="ر.س">🇸🇦 ريال سعودي (ر.س)</option>
                <option value="$">🇺🇸 دولار أمريكي ($ / USD)</option>
              </select>
            </label>

            <label>
              سعر صرف الريال السعودي (1 ر.س مقابل الريال اليمني)
              <input
                type="number"
                min="1"
                step="1"
                value={draft.exchangeRateYer || 430}
                onChange={(e) => update('exchangeRateYer', Number(e.target.value))}
                placeholder="430"
              />
            </label>

            <label>
              سعر صرف الدولار (1 $ مقابل الريال اليمني)
              <input
                type="number"
                min="1"
                step="1"
                value={draft.exchangeRateUsdYer || 1650}
                onChange={(e) => update('exchangeRateUsdYer', Number(e.target.value))}
                placeholder="1650"
              />
            </label>

            <label>
              سعر صرف الدولار مقابل السعودي (1 $ = ر.س)
              <input
                type="number"
                min="1"
                step="0.01"
                value={draft.exchangeRateUsdSar || 3.75}
                onChange={(e) => update('exchangeRateUsdSar', Number(e.target.value))}
                placeholder="3.75"
              />
            </label>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--admin-muted)' }}>
            💡 تتيح هذه الإعدادات للمتجر والعملاء الاختيار والتحويل الفوري بين <strong>الريال اليمني 🇾🇪</strong> (الافتراضي)،{' '}
            <strong>الريال السعودي 🇸🇦</strong>، و<strong>الدولار الأمريكي 🇺🇸</strong> مع تحويل الأسعار بدقة.
          </p>
        </section>

        {/* Store Basic Information */}
        <section className="admin-panel">
          <div className="settings-section-title">
            <span>
              <Store />
            </span>
            <div>
              <h2>بيانات المتجر والتواصل</h2>
              <p>المعلومات الأساسية التي تظهر للعملاء في الهيدر والفوتر.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              اسم المتجر
              <input
                value={draft.storeName}
                onChange={(e) => update('storeName', e.target.value)}
                required
              />
            </label>
            <label>
              البريد الإلكتروني
              <input
                type="email"
                dir="ltr"
                value={draft.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </label>
            <label>
              رقم الهاتف
              <input
                dir="ltr"
                value={draft.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </label>
            <label>
              رقم واتساب
              <input
                dir="ltr"
                value={draft.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
              />
            </label>
            <label>
              رابط إنستغرام
              <input
                dir="ltr"
                value={draft.instagram}
                onChange={(e) => update('instagram', e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* Shipping & Promo Offers */}
        <section className="admin-panel">
          <div className="settings-section-title">
            <span>
              <Truck />
            </span>
            <div>
              <h2>الشحن والعروض</h2>
              <p>تحكم في تكلفة الشحن وشريط العرض الترويجي.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              رسوم الشحن ({draft.currency})
              <input
                type="number"
                min="0"
                value={draft.shippingFee}
                onChange={(e) => update('shippingFee', Number(e.target.value))}
              />
            </label>
            <label>
              حد الشحن المجاني ({draft.currency})
              <input
                type="number"
                min="0"
                value={draft.freeShippingThreshold}
                onChange={(e) => update('freeShippingThreshold', Number(e.target.value))}
              />
            </label>
            <label>
              نص الخصم بالبانر
              <input
                value={draft.bannerDiscount}
                onChange={(e) => update('bannerDiscount', e.target.value)}
              />
            </label>
            <label>
              عنوان العرض الرئيسي
              <input
                value={draft.bannerTitle}
                onChange={(e) => update('bannerTitle', e.target.value)}
              />
            </label>
          </div>
        </section>

        <button className="primary-action save-settings" disabled={busy}>
          <Save size={18} /> {busy ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  )
}
