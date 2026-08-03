'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, Payment } from '@/lib/types'
import { checkInstallmentStatus, getThaiDayName, cleanImageUrl } from '@/lib/installmentUtils'
import CopyCodeBadge from '@/app/components/CopyCodeBadge'
import IdSalesPanel from '@/app/components/IdSalesPanel'
import StockIdsPanel from '@/app/components/StockIdsPanel'
import ImageModal from '@/app/components/ImageModal'
import AdminLogsPanel from '@/app/components/AdminLogsPanel'

async function genUniqueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 20; attempt++) {
    let s = ''
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)]
    const { data } = await supabase.from('customers').select('id').eq('code', s).maybeSingle()
    if (!data) return s
  }
  // Fallback 6 chars if 5-char space somehow collides repeatedly
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

type FilterType = 'all' | 'active' | 'defaulted'
type ModalType = 'edit' | 'default' | 'restore' | 'delete' | 'delete-confirm' | null
type AdminTab = 'installments' | 'id-sales' | 'stock-ids' | 'logs'

export default function AdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paidMap, setPaidMap] = useState<Record<string, number>>({})
  const [pendingMap, setPendingMap] = useState<Record<string, number>>({})
  const [custPaymentsMap, setCustPaymentsMap] = useState<Record<string, Payment[]>>({})
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [total, setTotal] = useState('')
  const [planType, setPlanType] = useState<'daily' | 'weekly'>('daily')
  const [dueDate, setDueDate] = useState('')
  const [weeklyDay, setWeeklyDay] = useState<number>(1) // 1 = Monday
  const [maxUnpaidDays, setMaxUnpaidDays] = useState<number>(3)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<AdminTab>('installments')

  // Modal states
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editName, setEditName] = useState('')
  const [editTotal, setEditTotal] = useState('')
  const [editPlanType, setEditPlanType] = useState<'daily' | 'weekly'>('daily')
  const [editDueDate, setEditDueDate] = useState('')
  const [editWeeklyDay, setEditWeeklyDay] = useState<number>(1)
  const [editMaxUnpaidDays, setEditMaxUnpaidDays] = useState<number>(3)
  const [adminName, setAdminName] = useState('')
  const [editAdminName, setEditAdminName] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [editAdminNote, setEditAdminNote] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [adminRole, setAdminRole] = useState<'owner' | 'staff'>('owner')
  const [adminProfileName, setAdminProfileName] = useState<string>('')
  const [viewImg, setViewImg] = useState<{ src: string; title: string } | null>(null)
  const [modalMsg, setModalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function loadCustomers() {
    const { data: custs } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    setCustomers(custs || [])

    const { data: payments } = await supabase.from('payments').select('*')
    const map: Record<string, number> = {}
    const pMap: Record<string, number> = {}
    const pListMap: Record<string, Payment[]> = {}

    payments?.forEach((p: Payment) => {
      if (!pListMap[p.customer_id]) pListMap[p.customer_id] = []
      pListMap[p.customer_id].push(p)

      if (p.status !== 'pending' && p.status !== 'rejected') {
        map[p.customer_id] = (map[p.customer_id] || 0) + Number(p.amount)
      }
      if (p.status === 'pending') {
        pMap[p.customer_id] = (pMap[p.customer_id] || 0) + 1
      }
    })
    setPaidMap(map)
    setPendingMap(pMap)
    setCustPaymentsMap(pListMap)
  }

  useEffect(() => {
    loadCustomers()

    async function fetchAdminRole() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session?.user) {
        const u = sessionData.session.user
        try {
          const res = await fetch(`/api/admin-profile?email=${encodeURIComponent(u.email || '')}&userId=${encodeURIComponent(u.id)}`)
          const result = await res.json()
          if (result?.profile) {
            setAdminRole(result.profile.role || 'owner')
            setAdminProfileName(result.profile.name || u.email?.split('@')[0] || '')
          }
        } catch {
          // Default to owner if fetch fails
        }
      }
    }
    fetchAdminRole()

    // Supabase Realtime subscription
    const channel = supabase
      .channel('admin-page-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        loadCustomers()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        loadCustomers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function addCustomer() {
    setMsg(null)
    if (!name.trim() || !total || Number(total) <= 0) {
      setMsg({ type: 'err', text: 'กรุณากรอกชื่อลูกค้าและยอดผ่อนรวมให้เรียบร้อยนะ' })
      return
    }
    const code = await genUniqueCode()
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name: name.trim(),
          total_amount: Number(total),
          plan_type: planType,
          due_date: dueDate || null,
          weekly_day: planType === 'weekly' ? weeklyDay : null,
          max_unpaid_days: Number(maxUnpaidDays) || 3,
          admin_name: adminName.trim() || null,
          admin_note: adminNote.trim() || null,
          image_url: imageUrl.trim() || null,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' })
        return
      }
      setMsg({ type: 'ok', text: `เพิ่มลูกค้าเรียบร้อยแล้ว! รหัสผ่อนคือ: ${code}` })
      setName('')
      setTotal('')
      setPlanType('daily')
      setDueDate('')
      setWeeklyDay(1)
      setMaxUnpaidDays(3)
      setAdminName('')
      setAdminNote('')
      setImageUrl('')
      loadCustomers()
    } catch {
      setMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  // --- Action handlers ---
  function openEditModal(c: Customer) {
    setSelectedCustomer(c)
    setEditName(c.name)
    setEditTotal(String(c.total_amount))
    setEditPlanType(c.plan_type || 'daily')
    setEditDueDate(c.due_date || '')
    setEditWeeklyDay(c.weekly_day ?? 1)
    setEditMaxUnpaidDays(c.max_unpaid_days ?? 3)
    setEditAdminName(c.admin_name || '')
    setEditAdminNote(c.admin_note || '')
    setEditImageUrl(c.image_url || '')
    setModalMsg(null)
    setModal('edit')
  }

  async function saveEdit() {
    if (!selectedCustomer) return
    setModalMsg(null)
    if (!editName.trim() || !editTotal || Number(editTotal) <= 0) {
      setModalMsg({ type: 'err', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
      return
    }
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCustomer.id,
          name: editName.trim(),
          total_amount: Number(editTotal),
          plan_type: editPlanType,
          due_date: editDueDate || null,
          weekly_day: editPlanType === 'weekly' ? editWeeklyDay : null,
          max_unpaid_days: Number(editMaxUnpaidDays) || 3,
          admin_name: editAdminName.trim() || null,
          admin_note: editAdminNote.trim() || null,
          image_url: editImageUrl.trim() || null,
        })
      })
      const result = await res.json()
      if (!res.ok) {
        setModalMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาดในการบันทึก' })
        return
      }
      setModal(null)
      loadCustomers()
    } catch {
      setModalMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการบันทึก' })
    }
  }

  function openDefaultModal(c: Customer) {
    setSelectedCustomer(c)
    setModal(c.status === 'defaulted' ? 'restore' : 'default')
  }

  async function confirmDefault() {
    if (!selectedCustomer) return
    const newStatus = selectedCustomer.status === 'defaulted' ? 'active' : 'defaulted'
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCustomer.id, status: newStatus })
      })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      setModal(null)
      loadCustomers()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  function openDeleteModal(c: Customer) {
    setSelectedCustomer(c)
    setModal('delete')
  }

  async function confirmDelete() {
    if (!selectedCustomer) return
    try {
      const res = await fetch(`/api/customers?id=${selectedCustomer.id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      setModal(null)
      loadCustomers()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // Extract list of unique admin names
  const adminOptions = Array.from(new Set(customers.map(c => c.admin_name).filter(Boolean))) as string[]

  // --- Filtering ---
  const filtered = customers
    .filter((c) => {
      if (filter === 'active') return c.status !== 'defaulted'
      if (filter === 'defaulted') return c.status === 'defaulted'
      return true
    })
    .filter((c) => {
      if (selectedAdmin !== 'all') {
        return c.admin_name === selectedAdmin
      }
      return true
    })
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.admin_name && c.admin_name.toLowerCase().includes(search.toLowerCase()))
    )

  const activeCustomers = customers.filter(c => c.status !== 'defaulted')
  const defaultedCustomers = customers.filter(c => c.status === 'defaulted')

  const totalActiveCustomersCount = activeCustomers.length
  const totalDefaultedCustomersCount = defaultedCustomers.length

  const grandTotalAmount = activeCustomers.reduce((acc, c) => acc + Number(c.total_amount || 0), 0)
  const grandPaidAmount = activeCustomers.reduce((acc, c) => acc + Number(paidMap[c.id] || 0), 0)
  const grandRemainingAmount = Math.max(0, grandTotalAmount - grandPaidAmount)

  return (
    <main className="min-h-screen px-4 py-8 relative">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>ระบบจัดการร้านค้า Jiksaw Shop</span>
              {adminRole === 'owner' ? (
                <span className="badge text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/20 py-0.5 px-2.5 rounded-full">
                  👑 ยศหัวเพจ (Owner)
                </span>
              ) : (
                <span className="badge text-xs bg-slate-500/10 text-slate-400 font-bold border border-slate-500/20 py-0.5 px-2.5 rounded-full">
                  🛡️ แอดมินทั่วไป (Staff)
                </span>
              )}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">จัดการรายการผ่อนชำระ และบันทึกยอดขายไอดี</p>
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

        {/* ═══ ADMIN TAB NAVIGATION ═══ */}
        <div className="nav-tabs mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('installments')}
            className={`nav-tab ${activeTab === 'installments' ? 'nav-tab-active' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            📋 ระบบผ่อนชำระ
          </button>
          <button
            onClick={() => setActiveTab('id-sales')}
            className={`nav-tab ${activeTab === 'id-sales' ? 'nav-tab-active' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            🎮 ยอดขายไอดี
          </button>
          <button
            onClick={() => setActiveTab('stock-ids')}
            className={`nav-tab ${activeTab === 'stock-ids' ? 'nav-tab-active' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            🛒 ลงไอดีพร้อมขาย
          </button>
          {adminRole === 'owner' && (
            <button
              onClick={() => setActiveTab('logs')}
              className={`nav-tab ${activeTab === 'logs' ? 'nav-tab-active' : ''}`}
            >
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📜 ประวัติการทำงาน
            </button>
          )}
        </div>

        {/* ═══ TAB: ระบบผ่อนชำระ ═══ */}
        {activeTab === 'installments' && (<>

        {/* Dashboard Overall Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Active Customers */}
          <div className="stat-box p-3.5 text-center">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
              <span>👤</span> คนที่กำลังผ่อน
            </div>
            <div className="text-lg font-extrabold text-[var(--accent-blue)]">
              {totalActiveCustomersCount} <span className="text-xs font-normal text-[var(--text-muted)]">คน</span>
            </div>
          </div>

          {/* Grand Total Amount */}
          <div className="stat-box p-3.5 text-center">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
              <span>💰</span> ยอดผ่อนรวม
            </div>
            <div className="text-lg font-extrabold text-[var(--text-primary)]">
              {grandTotalAmount.toLocaleString('th-TH')} <span className="text-xs font-normal text-[var(--text-muted)]">฿</span>
            </div>
          </div>

          {/* Grand Paid Amount */}
          <div className="stat-box p-3.5 text-center">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
              <span>💵</span> ยอดจ่ายแล้ว
            </div>
            <div className="text-lg font-extrabold text-[var(--good)]">
              {grandPaidAmount.toLocaleString('th-TH')} <span className="text-xs font-normal text-[var(--text-muted)]">฿</span>
            </div>
          </div>

          {/* Grand Remaining Amount */}
          <div className="stat-box p-3.5 text-center">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
              <span>📉</span> ยอดคงเหลือ
            </div>
            <div className="text-lg font-extrabold text-[var(--danger)]">
              {grandRemainingAmount.toLocaleString('th-TH')} <span className="text-xs font-normal text-[var(--text-muted)]">฿</span>
            </div>
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
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ชื่อเฟสลูกค้า *</label>
                <input
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Hodoro"
                />
              </div>
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
            </div>

            {/* Installment Plan Selection & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">รอบการผ่อนชำระ *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanType('daily')}
                    className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all ${
                      planType === 'daily'
                        ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                        : 'border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/50'
                    }`}
                  >
                    ☀️ ผ่อนรายวัน
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType('weekly')}
                    className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all ${
                      planType === 'weekly'
                        ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                        : 'border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/50'
                    }`}
                  >
                    📅 ผ่อนรายอาทิตย์
                  </button>
                </div>
              </div>

              {planType === 'weekly' ? (
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">วันส่งยอดประจำสัปดาห์</label>
                  <select
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={weeklyDay}
                    onChange={(e) => setWeeklyDay(Number(e.target.value))}
                  >
                    <option value={1}>วันจันทร์</option>
                    <option value={2}>วันอังคาร</option>
                    <option value={3}>วันพุธ</option>
                    <option value={4}>วันพฤหัสบดี</option>
                    <option value={5}>วันศุกร์</option>
                    <option value={6}>วันเสาร์</option>
                    <option value={0}>วันอาทิตย์</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
                    ขาดส่งกี่วันถึงหลุดผ่อน? (วัน)
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="input-field w-full px-3 py-1.5 text-sm font-bold text-center"
                      value={maxUnpaidDays}
                      onChange={(e) => setMaxUnpaidDays(Math.max(1, Number(e.target.value)))}
                    />
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap font-medium">วัน</span>
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {[3, 4, 5, 7].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setMaxUnpaidDays(d)}
                        className={`px-2 py-0.5 text-[10px] rounded-md border font-semibold transition-all ${
                          maxUnpaidDays === d
                            ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                            : 'border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/50'
                        }`}
                      >
                        {d} วัน {d === 3 ? '(มาตรฐาน)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
                  ⏳ วันครบกำหนดผ่อนสิ้นสุด
                </label>
                <input
                  type="date"
                  className="input-field w-full max-w-full min-w-0 box-border px-3.5 py-2 text-sm"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1">หากเกินกำหนดจะถือว่าหลุดผ่อน</p>
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between flex-wrap gap-1">
                  <span>👤 แอดมินผู้ดูแล</span>
                  <span className="text-[10px] text-[var(--accent-blue)] font-normal shrink-0">🔒 แอดมินเท่านั้น</span>
                </label>
                <input
                  className="input-field w-full max-w-full min-w-0 box-border px-3.5 py-2 text-sm"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="เช่น หัวเพจ ไอหนวด"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between flex-wrap gap-1">
                <span>📝 หมายเหตุสัญญา / โน้ตแอดมิน (ลูกค้าจะไม่เห็นส่วนนี้)</span>
                <span className="text-[10px] text-[var(--accent-blue)] font-normal shrink-0">🔒 เห็นเฉพาะฝั่งแอดมิน</span>
              </label>
              <textarea
                className="input-field w-full px-3.5 py-2 text-sm min-h-[70px] resize-y py-2.5"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="ไอดีFreeFire Roblox ผ่อนสุดวันที่ 1 เดือน 8"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between flex-wrap gap-1">
                <span>🖼️ ลิงก์รูปภาพไอดี/สินค้าผ่อน (Image URL)</span>
                <span className="text-[11px] font-normal flex items-center gap-1.5">
                  <span>🌐 เว็บฝากรูปฟรี:</span>
                  <a href="https://imgbb.com/upload" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] font-bold hover:underline inline-flex items-center gap-0.5">
                    ImgBB (แนะนำ) ↗
                  </a>
                  <span className="opacity-40">|</span>
                  <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] font-bold hover:underline inline-flex items-center gap-0.5">
                    Postimages ↗
                  </a>
                </span>
              </label>
              <input
                type="text"
                className="input-field w-full px-3.5 py-2 text-sm"
                value={imageUrl}
                onChange={(e) => setImageUrl(cleanImageUrl(e.target.value))}
                placeholder="https://... (คัดลอกจากเว็บฝากรูป'ลิงก์' ใน ImgBB)"
              />

              {imageUrl && imageUrl.includes('ibb.co/') && !imageUrl.includes('i.ibb.co/') && (
                <div className="text-[11px] text-[var(--accent-gold)] mt-2 p-2.5 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/30 font-medium leading-relaxed">
                  ⚠️ ลิงก์ที่วางเป็นลิงก์หน้าเว็บ (<code className="font-mono text-xs">ibb.co/...</code>) รูปจึงไม่ขึ้นครับ<br />
                  👉 <strong>วิธีแก้:</strong> คลิกขวาที่รูปบนเว็บ ImgBB แล้วกด <strong>&quot;คัดลอกที่อยู่อิเมจ&quot; (Copy image address)</strong> นำมาวางแทนครับ (ลิงก์ที่ถูกต้องจะเป็น <code className="font-mono text-xs">https://i.ibb.co/...</code>)
                </div>
              )}

              {imageUrl && (
                <div className="mt-2 p-2 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)] flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border-soft)] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-bold block text-[var(--text-primary)]">🖼️ ตัวอย่างรูปภาพ (Live Preview)</span>
                    <span className="text-[10px] text-[var(--text-muted)] block truncate">{imageUrl}</span>
                  </div>
                </div>
              )}
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
            <div className={`text-xs mt-4 px-3.5 py-2.5 flex items-center gap-2 font-medium ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'
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

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <span
              onClick={() => setFilter('all')}
              className={`filter-tab ${filter === 'all' ? 'filter-tab-active' : ''}`}
            >
              ทั้งหมด ({customers.length})
            </span>
            <span
              onClick={() => setFilter('active')}
              className={`filter-tab ${filter === 'active' ? 'filter-tab-active' : ''}`}
            >
              กำลังผ่อน ({totalActiveCustomersCount})
            </span>
            <span
              onClick={() => setFilter('defaulted')}
              className={`filter-tab ${filter === 'defaulted' ? 'filter-tab-active' : ''}`}
            >
              หลุดผ่อน ({totalDefaultedCustomersCount})
            </span>
          </div>

          {/* Admin Filter Dropdown & Search Input */}
          <div className="space-y-3 mb-4">
            {adminOptions.length > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)]">
                <label className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5 shrink-0">
                  <svg className="w-3.5 h-3.5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  กรองแอดมินผู้ดูแล:
                </label>
                <select
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                  className="input-field text-xs py-1.5 px-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] font-bold text-[var(--accent-blue)] cursor-pointer outline-none max-w-[210px] truncate"
                >
                  <option value="all">แอดมินทุกคน ({customers.length})</option>
                  {adminOptions.map((admin) => (
                    <option key={admin} value={admin}>
                      👤 {admin} ({customers.filter((c) => c.admin_name === admin).length} รายการ)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="input-field w-full pl-10 pr-3.5 py-2 text-sm"
                placeholder="ค้นหาตามชื่อลูกค้า, รหัสผ่อน หรือ ชื่อแอดมินผู้ดูแล..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
              const analysis = checkInstallmentStatus(c, custPaymentsMap[c.id] || [])
              const isDefaulted = analysis.isDefaulted || c.status === 'defaulted'
              return (
                <div
                  key={c.id}
                  className={`list-item px-4 py-3 ${isDefaulted ? 'list-item-defaulted' : ''}`}
                  style={{ animation: `fadeInUp 0.3s ease-out ${0.03 * i}s both` }}
                >
                  <div className="flex justify-between items-center gap-3">
                    {/* Small Image Thumbnail */}
                    {c.image_url && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setViewImg({ src: c.image_url!, title: c.name })
                        }}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--stat-bg)] border border-[var(--border-soft)] shrink-0 flex items-center justify-center relative group cursor-pointer hover:border-[var(--accent-blue)] transition-all shadow-sm"
                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]">
                          🔍
                        </div>
                      </div>
                    )}

                    <Link href={`/admin/${c.code}`} className="min-w-0 pr-2 group flex-1">
                      <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap group-hover:text-[var(--accent-blue)] transition-colors">
                        <span className="truncate max-w-[220px]">{c.name}</span>
                        {isDefaulted && (
                          <span className="badge badge-danger text-[10px] py-0.5 px-2 font-bold shrink-0" title={analysis.reason}>
                            🔴 {analysis.statusLabel}
                          </span>
                        )}
                        {!isDefaulted && analysis.isWarning && (
                          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm shrink-0">
                            ⚠️ ขาดส่ง {analysis.daysSinceLastPayment} วัน (ใกล้หลุดผ่อน)
                          </span>
                        )}
                        {!isDefaulted && pendingMap[c.id] > 0 && (
                          <span className="text-[10px] bg-[var(--gold)] text-white px-2 py-0.5 rounded-full shadow-sm shrink-0">รอตรวจ {pendingMap[c.id]}</span>
                        )}
                        {!isDefaulted && cPct >= 100 && (
                          <span className="badge badge-good text-[10px] py-0.5 px-2 shrink-0">✓ ครบแล้ว</span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-1 flex-wrap">
                        <CopyCodeBadge code={c.code} />
                        <span className="font-medium text-[11px] bg-[var(--stat-bg)] px-2 py-0.5 rounded-md border border-[var(--border-soft)]">
                          {c.plan_type === 'weekly' ? `📅 ผ่อนรายอาทิตย์ (วัน${getThaiDayName(c.weekly_day)})` : '☀️ ผ่อนรายวัน'}
                        </span>
                        {c.due_date && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                            analysis.daysUntilDueDate !== null && analysis.daysUntilDueDate < 0
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            ⏳ {analysis.daysUntilDueDate !== null && analysis.daysUntilDueDate >= 0 ? `เหลือ ${analysis.daysUntilDueDate} วัน` : 'เกินกำหนดเวลา'}
                          </span>
                        )}
                        {c.admin_name && (
                          <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-semibold flex items-center gap-1">
                            👤 {c.admin_name}
                          </span>
                        )}
                        {c.admin_note && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium flex items-center gap-1 max-w-[200px] truncate" title={c.admin_note}>
                            📝 {c.admin_note}
                          </span>
                        )}
                      </div>

                      {!isDefaulted && analysis.isWarning && (
                        <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 leading-relaxed whitespace-normal break-words">
                          <span>{analysis.warningMessage}</span>
                        </div>
                      )}
                    </Link>
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-[var(--border-soft)]">
                    <button onClick={() => openEditModal(c)} className="btn-action btn-action-edit">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      แก้ไข
                    </button>
                    <button onClick={() => openDefaultModal(c)} className={`btn-action ${isDefaulted ? 'btn-action-restore' : 'btn-action-default'}`}>
                      {isDefaulted ? (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          คืนสถานะ
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          หลุดผ่อน
                        </>
                      )}
                    </button>
                    <button onClick={() => openDeleteModal(c)} className="btn-action btn-action-delete">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ลบ
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </>)}

      {/* ═══ TAB: ยอดขายไอดี ═══ */}
      {activeTab === 'id-sales' && (
        <IdSalesPanel />
      )}

      {/* ═══ TAB: คลังไอดีพร้อมขาย ═══ */}
      {activeTab === 'stock-ids' && (
        <StockIdsPanel />
      )}

      {/* ═══ TAB: ประวัติการทำงาน ═══ */}
      {activeTab === 'logs' && (
        <AdminLogsPanel />
      )}

      </div>

      {/* ═══ EDIT MODAL ═══ */}
      {modal === 'edit' && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(null)} className="modal-close">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="modal-title">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไขข้อมูลลูกค้า
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ชื่อ-นามสกุล *</label>
                  <input
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ยอดผ่อนทั้งหมด (บาท) *</label>
                  <input
                    type="number"
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
                  />
                </div>
              </div>

              {/* Installment Plan Edit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">รอบการผ่อนชำระ *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPlanType('daily')}
                      className={`py-2 px-2 text-xs rounded-xl font-bold border transition-all ${
                        editPlanType === 'daily'
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                          : 'border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/50'
                      }`}
                    >
                      ☀️ รายวัน
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPlanType('weekly')}
                      className={`py-2 px-2 text-xs rounded-xl font-bold border transition-all ${
                        editPlanType === 'weekly'
                          ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                          : 'border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/50'
                      }`}
                    >
                      📅 รายอาทิตย์
                    </button>
                  </div>
                </div>

                {editPlanType === 'weekly' ? (
                  <div>
                    <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">วันส่งยอดประจำสัปดาห์</label>
                    <select
                      className="input-field w-full px-3.5 py-2 text-sm"
                      value={editWeeklyDay}
                      onChange={(e) => setEditWeeklyDay(Number(e.target.value))}
                    >
                      <option value={1}>วันจันทร์</option>
                      <option value={2}>วันอังคาร</option>
                      <option value={3}>วันพุธ</option>
                      <option value={4}>วันพฤหัสบดี</option>
                      <option value={5}>วันศุกร์</option>
                      <option value={6}>วันเสาร์</option>
                      <option value={0}>วันอาทิตย์</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
                      ขาดส่งกี่วันถึงหลุดผ่อน? (วัน)
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="input-field w-full px-3 py-1.5 text-sm font-bold text-center"
                        value={editMaxUnpaidDays}
                        onChange={(e) => setEditMaxUnpaidDays(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap font-medium">วัน</span>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[3, 4, 5, 7].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setEditMaxUnpaidDays(d)}
                          className={`px-2 py-0.5 text-[10px] rounded-md border font-semibold transition-all ${
                            editMaxUnpaidDays === d
                              ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                              : 'border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/50'
                          }`}
                        >
                          {d} วัน {d === 3 ? '(มาตรฐาน)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
                    ⏳ วันครบกำหนดผ่อนสิ้นสุด
                  </label>
                  <input
                    type="date"
                    className="input-field w-full max-w-full min-w-0 box-border px-3.5 py-2 text-sm"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between">
                    <span>แอดมินผู้ดูแล</span>
                    <span className="text-[10px] text-[var(--accent-blue)] font-normal">🔒 แอดมินเท่านั้น</span>
                  </label>
                  <input
                    className="input-field w-full max-w-full min-w-0 box-border px-3.5 py-2 text-sm"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    placeholder="เช่น แอดมิน A"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between">
                  <span>หมายเหตุสัญญา / โน้ตแอดมิน</span>
                  <span className="text-[10px] text-[var(--accent-blue)] font-normal">🔒 เห็นเฉพาะฝั่งแอดมิน</span>
                </label>
                <textarea
                  className="input-field w-full px-3.5 py-2 text-sm min-h-[70px] resize-y py-2.5"
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  placeholder="เช่น ผ่อนไอดี Roblox / ขอนัดโอนทุกวันที่ 5"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between flex-wrap gap-1">
                  <span>🔗 ลิงก์รูปภาพประกอบ (Image URL)</span>
                  <span className="text-[11px] font-normal flex items-center gap-1.5">
                    <span>🌐 เว็บฝากรูปฟรี:</span>
                    <a href="https://imgbb.com/upload" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] font-bold hover:underline inline-flex items-center gap-0.5">
                      ImgBB ↗
                    </a>
                    <span className="opacity-40">|</span>
                    <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] font-bold hover:underline inline-flex items-center gap-0.5">
                      Postimages ↗
                    </a>
                  </span>
                </label>
                <input
                  type="text"
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(cleanImageUrl(e.target.value))}
                  placeholder="https://... (คัดลอกจาก Facebook เพจ หรือเลือก 'ลิงก์' ใน ImgBB)"
                />

                {editImageUrl && editImageUrl.includes('ibb.co/') && !editImageUrl.includes('i.ibb.co/') && (
                  <div className="text-[11px] text-[var(--accent-gold)] mt-2 p-2.5 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/30 font-medium leading-relaxed">
                    ⚠️ ลิงก์ที่วางเป็นลิงก์หน้าเว็บ (<code className="font-mono text-xs">ibb.co/...</code>) รูปจึงไม่ขึ้นครับ<br />
                    👉 <strong>วิธีแก้:</strong> คลิกขวาที่รูปบนเว็บ ImgBB แล้วกด <strong>&quot;คัดลอกที่อยู่อิเมจ&quot; (Copy image address)</strong> นำมาวางแทนครับ (ลิงก์ที่ถูกต้องจะเป็น <code className="font-mono text-xs">https://i.ibb.co/...</code>)
                  </div>
                )}

                {editImageUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)] flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border-soft)] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editImageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                      />
                    </div>
                    <div className="text-xs min-w-0">
                      <span className="font-bold block text-[var(--text-primary)]">🖼️ ตัวอย่างรูปภาพ (Live Preview)</span>
                      <span className="text-[10px] text-[var(--text-muted)] block truncate">{editImageUrl}</span>
                    </div>
                  </div>
                )}
              </div>
              {modalMsg && (
                <div className={`text-xs px-3.5 py-2.5 flex items-center gap-2 font-medium ${modalMsg.type === 'ok' ? 'alert-ok' : 'alert-err'}`}>
                  {modalMsg.text}
                </div>
              )}
              <button onClick={saveEdit} className="btn-primary w-full py-2.5 text-sm font-bold">
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DEFAULT / RESTORE CONFIRM ═══ */}
      {(modal === 'default' || modal === 'restore') && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className={`confirm-icon ${modal === 'default' ? 'confirm-icon-warning' : 'confirm-icon-danger'}`}>
                {modal === 'default' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>
              <h3 className="confirm-title">
                {modal === 'default' ? 'ยืนยันหลุดผ่อน?' : 'คืนสถานะผ่อนชำระ?'}
              </h3>
              <p className="confirm-desc">
                {modal === 'default'
                  ? `ต้องการมาร์ก "${selectedCustomer.name}" เป็นหลุดผ่อนใช่ไหม? สามารถคืนสถานะได้ภายหลัง`
                  : `ต้องการคืนสถานะ "${selectedCustomer.name}" กลับเป็นผ่อนชำระปกติใช่ไหม?`
                }
              </p>
              <div className="confirm-actions">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm font-bold">
                  ยกเลิก
                </button>
                <button onClick={confirmDefault} className={`${modal === 'default' ? 'btn-warning' : 'btn-primary'} py-2.5 text-sm font-bold`}>
                  {modal === 'default' ? 'ยืนยันหลุดผ่อน' : 'คืนสถานะ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM (Step 1) ═══ */}
      {modal === 'delete' && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-icon confirm-icon-danger">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="confirm-title">ลบข้อมูลลูกค้า?</h3>
              <p className="confirm-desc">
                ต้องการลบ &quot;{selectedCustomer.name}&quot; และข้อมูลการชำระเงินทั้งหมดใช่ไหม?<br />
                <strong style={{ color: 'var(--danger)' }}>⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้</strong>
              </p>
              <div className="confirm-actions">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm font-bold">
                  ยกเลิก
                </button>
                <button onClick={() => setModal('delete-confirm')} className="btn-danger py-2.5 text-sm font-bold">
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM (Step 2) ═══ */}
      {modal === 'delete-confirm' && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-icon confirm-icon-danger">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="confirm-title" style={{ color: 'var(--danger)' }}>ยืนยันอีกครั้ง!</h3>
              <p className="confirm-desc">
                ข้อมูลทั้งหมดของ &quot;{selectedCustomer.name}&quot; จะถูกลบถาวร รวมถึงประวัติการชำระเงินทั้งหมด
              </p>
              <div className="confirm-actions">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm font-bold">
                  ยกเลิก
                </button>
                <button onClick={confirmDelete} className="btn-danger py-2.5 text-sm font-bold">
                  🗑️ ลบถาวร
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {viewImg && (
        <ImageModal
          src={viewImg.src}
          alt={viewImg.title}
          onClose={() => setViewImg(null)}
        />
      )}
    </main>
  )
}
