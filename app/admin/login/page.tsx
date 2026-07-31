'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      return
    }
    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="max-w-sm w-full">
        <div className="panel p-8" style={{ animation: 'scaleIn 0.4s ease-out both' }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue-soft)] flex items-center justify-center mx-auto mb-3 border border-[var(--accent-blue-soft)]">
              <svg className="w-6 h-6 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Jiksaw Shop</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">ระบบเข้าสู่ระบบผู้ดูแลร้านค้า</p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs text-[var(--text-primary)] block mb-1.5 font-semibold">
              อีเมลบัญชีผู้ใช้
            </label>
            <input
              type="email"
              className="input-field w-full px-3.5 py-2.5 text-sm"
              placeholder="admin@jiksawshop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-xs text-[var(--text-primary)] block mb-1.5 font-semibold">
              รหัสผ่าน
            </label>
            <input
              type="password"
              className="input-field w-full px-3.5 py-2.5 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
            />
          </div>

          {/* Submit */}
          <div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="loading-spinner !w-4 !h-4" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-err text-xs mt-4 px-3.5 py-2.5 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors inline-flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  )
}
