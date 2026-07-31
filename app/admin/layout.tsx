'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data.session && !isLoginPage) {
        router.replace('/admin/login')
        return
      }
      if (data.session && isLoginPage) {
        router.replace('/admin')
        return
      }
      setChecking(false)
    }
    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) router.replace('/admin/login')
    })
    return () => listener.subscription.unsubscribe()
  }, [pathname])

  if (checking && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
          <div className="loading-spinner mb-3" />
          <p className="text-sm text-[var(--text-muted)]">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
