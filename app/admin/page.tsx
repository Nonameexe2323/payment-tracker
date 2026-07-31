'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/lib/types'

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export default function AdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paidMap, setPaidMap] = useState<Record<string, number>>({})
  const [pendingMap, setPendingMap] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [total, setTotal] = useState('')
  const [monthly, setMonthly] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function loadCustomers() {
    const { data: custs } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    setCustomers(custs || [])

    const { data: payments } = await supabase.from('payments').select('customer_id, amount, status')
    const map: Record<string, number> = {}
    const pMap: Record<string, number> = {}
    payments?.forEach((p: { customer_id: string; amount: number; status: string }) => {
      if (p.status !== 'pending' && p.status !== 'rejected') {
        map[p.customer_id] = (map[p.customer_id] || 0) + Number(p.amount)
      }
      if (p.status === 'pending') {
        pMap[p.customer_id] = (pMap[p.customer_id] || 0) + 1
      }
    })
    setPaidMap(map)
    setPendingMap(pMap)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  async function addCustomer() {
    setMsg(null)
    if (!name.trim() || !total || Number(total) <= 0) {
      setMsg({ type: 'err', text: 'กรุณากรอกชื่อลูกค้าและยอดผ่อนรวมให้เรียบร้อยนะ' })
      return
    }
    const code = genCode()
    const { error } = await supabase.from('customers').insert({
      code,
      name: name.trim(),
      phone: phone.trim() || null,
      total_amount: Number(total),
      monthly_amount: Number(monthly) || 0,
    })
    if (error) {
      setMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง' })
      return
    }
    setMsg({ type: 'ok', text: `เพิ่มลูกค้าเรียบร้อยแล้ว! รหัสผ่อนคือ: ${code}` })
    setName('')
    setPhone('')
    setTotal('')
    setMonthly('')
    loadCustomers()
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen px-4 py-8 relative">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ระบบจัดการร้านค้า Jiksaw Shop
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">จัดการรายการผ่อนและเพิ่มลูกค้าผ่อนชำระ</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors inline-flex items-center gap-1 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              หน้าหลัก
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin/login' }}
              className="text-xs text-[var(--danger)] hover:underline transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Add Customer Form */}
        <div className="panel p-6 mb-6">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2 text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-3">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            เพิ่มลูกค้าผ่อนใหม่
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ชื่อ-นามสกุล ลูกค้า *</label>
                <input
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น คุณสมชาย ใจดี"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">เบอร์โทรศัพท์ติดต่อ</label>
                <input
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ยอดผ่อนทั้งหมด (บาท) *</label>
                <input
                  type="number"
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ค่างวดต่อเดือน (บาท)</label>
                <input
                  type="number"
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <button onClick={addCustomer} className="btn-primary w-full py-3 text-sm mt-5 font-bold">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              บันทึกข้อมูลลูกค้า และสร้างรหัสผ่อน
            </span>
          </button>

          {msg && (
            <div className={`text-xs mt-4 px-3.5 py-2.5 flex items-center gap-2 font-medium ${
              msg.type === 'ok' ? 'alert-ok' : 'alert-err'
            }`}>
              {msg.type === 'ok' ? (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {msg.text}
            </div>
          )}
        </div>

        {/* Customer List */}
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-soft)] pb-3">
            <h2 className="font-bold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              รายการผ่อนชำระทั้งหมด
            </h2>
            <span className="badge badge-cyan font-bold">{customers.length} รายการ</span>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input-field w-full pl-10 pr-3.5 py-2 text-sm"
              placeholder="ค้นหาตามชื่อลูกค้า หรือ รหัสผ่อน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium">{customers.length === 0 ? 'ยังไม่มีข้อมูลลูกค้าผ่อนชำระ' : 'ไม่พบรายการที่ค้นหา'}</p>
              </div>
            )}
            {filtered.map((c, i) => {
              const cPaid = paidMap[c.id] || 0
              const cPct = Math.min(100, Math.round((cPaid / c.total_amount) * 100))
              return (
                <Link
                  key={c.id}
                  href={`/admin/${c.code}`}
                  className="list-item flex justify-between items-center px-4 py-3 group"
                  style={{ animation: `fadeInUp 0.3s ease-out ${0.03 * i}s both` }}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-sm truncate text-[var(--text-primary)] flex items-center gap-2">
                      {c.name}
                      {pendingMap[c.id] > 0 && (
                        <span className="text-[10px] bg-[var(--gold)] text-white px-2 py-0.5 rounded-full shadow-sm">รอตรวจ {pendingMap[c.id]}</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-1">
                      <span className="font-mono bg-[var(--bg-panel-soft)] text-[var(--accent-blue)] px-2 py-0.5 rounded-full border border-[var(--border-soft)] font-bold text-[0.7rem]">{c.code}</span>
                      <span>ผ่อนแล้ว {cPct}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">
                      <span className="text-[var(--accent-blue)]">{cPaid.toLocaleString('th-TH')}</span>
                      <span className="text-xs text-[var(--text-muted)] font-normal"> / {c.total_amount.toLocaleString('th-TH')} ฿</span>
                    </div>
                    <div className="w-24 h-2 rounded-full bg-[var(--bar-bg)] mt-1.5 ml-auto overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-blue)] transition-all duration-500"
                        style={{ width: `${cPct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
