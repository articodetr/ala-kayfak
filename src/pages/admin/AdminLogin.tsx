import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail, ShoppingBag, UserPlus, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import '../../styles/admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@alakayfak.com')
  const [password, setPassword] = useState('123456789')
  const [name, setName] = useState('مدير المتجر')
  const [showPassword, setShowPassword] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const [message, setMessage] = useState('')
  const { login, registerFirstAdmin, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    const result = setupMode ? await registerFirstAdmin(email, password, name) : await login(email, password)
    if (result) {
      setMessage(result)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <main className="admin-login-page" dir="rtl">
      <section className="admin-login-card">
        <div className="login-logo">
          <span>
            <ShoppingBag />
          </span>
          <h1>إدارة «على كيفك»</h1>
          <p>{setupMode ? 'إنشاء حساب مالك المتجر لأول مرة' : 'سجّلي دخولك لإدارة المنتجات والأسعار'}</p>
        </div>

        {/* Credentials reminder badge */}
        <div
          style={{
            background: '#f4f0f8',
            border: '1px solid #e2d9ec',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#554271',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#7565aa" />
          <span>
            بيانات الدخول: <strong>admin@alakayfak.com</strong> / <strong>123456789</strong>
          </span>
        </div>

        {message ? (
          <div className="form-alert">
            <AlertCircle size={18} />
            <span>{message}</span>
          </div>
        ) : null}

        <form onSubmit={submit}>
          {setupMode ? (
            <label>
              اسم المدير
              <div className="field-with-icon">
                <UserPlus size={18} />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </label>
          ) : null}

          <label>
            البريد الإلكتروني
            <div className="field-with-icon">
              <Mail size={18} />
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            كلمة المرور
            <div className="field-with-icon">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="إظهار كلمة المرور"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="admin-submit" disabled={isLoading}>
            {isLoading ? 'يرجى الانتظار…' : setupMode ? 'إنشاء حساب المدير' : 'تسجيل الدخول'}
          </button>
        </form>

        <button
          className="setup-toggle"
          onClick={() => {
            setSetupMode((value) => !value)
            setMessage('')
          }}
        >
          {setupMode ? 'لدي حساب بالفعل' : 'تهيئة المدير لأول مرة'}
        </button>

        <Link className="back-store" to="/">
          <ArrowLeft size={16} /> العودة إلى المتجر
        </Link>
      </section>
    </main>
  )
}
