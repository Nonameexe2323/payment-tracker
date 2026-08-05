'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IdSale } from '@/lib/types'
import PageLoading from '@/app/components/PageLoading'

type ModalType = 'edit' | 'delete' | 'delete-confirm' | 'delete-month' | 'delete-month-confirm' | null

export default function IdSalesPanel() {
  const [sales, setSales] = useState<IdSale[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all')
  const [adminRole, setAdminRole] = useState<'owner' | 'staff'>('owner')
  const [adminProfileName, setAdminProfileName] = useState<string>('')

  // Form states
  const [gameId, setGameId] = useState('')
  const [gameName, setGameName] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [adminName, setAdminName] = useState('')
  const [soldAt, setSoldAt] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 10)
  })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Modal states
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedSale, setSelectedSale] = useState<IdSale | null>(null)
  const [editGameId, setEditGameId] = useState('')
  const [editGameName, setEditGameName] = useState('')
  const [editBuyPrice, setEditBuyPrice] = useState('')
  const [editSellPrice, setEditSellPrice] = useState('')
  const [editAdminName, setEditAdminName] = useState('')
  const [editSoldAt, setEditSoldAt] = useState('')
  const [modalMsg, setModalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [deleteMonthKey, setDeleteMonthKey] = useState<string | null>(null)

  async function loadSales() {
    try {
      const res = await fetch('/api/id-sales')
      const result = await res.json()
      setSales(result.data || [])
    } catch {
      console.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
          // default
        }
      }
    }
    fetchAdminRole()

    loadSales()

    // Supabase Realtime subscription
    const channel = supabase
      .channel('id-sales-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'id_sales' }, () => {
        loadSales()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function addSale() {
    setMsg(null)
    if (!gameId.trim() || !buyPrice || !sellPrice) {
      setMsg({ type: 'err', text: 'กรุณากรอกเลขไอดี, ราคารับมา และราคาขายออกให้ครบ' })
      return
    }
    if (Number(buyPrice) < 0 || Number(sellPrice) < 0) {
      setMsg({ type: 'err', text: 'ราคาต้องไม่ต่ำกว่า 0 บาท' })
      return
    }

    try {
      const res = await fetch('/api/id-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId.trim(),
          game_name: gameName.trim() || null,
          buy_price: Number(buyPrice),
          sell_price: Number(sellPrice),
          admin_name: adminName.trim() || null,
          sold_at: soldAt ? new Date(soldAt).toISOString() : new Date().toISOString(),
          actor_admin_name: adminProfileName,
          actor_admin_role: adminRole,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาด' })
        return
      }
      const profit = Number(sellPrice) - Number(buyPrice)
      setMsg({ type: 'ok', text: `บันทึกยอดขายเรียบร้อย! กำไร: ${profit.toLocaleString('th-TH')} ฿` })
      setGameId('')
      setGameName('')
      setBuyPrice('')
      setSellPrice('')
      setAdminName('')
      setSoldAt(new Date().toISOString().slice(0, 10))
      loadSales()
    } catch {
      setMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  function openEditModal(s: IdSale) {
    setSelectedSale(s)
    setEditGameId(s.game_id)
    setEditGameName(s.game_name || '')
    setEditBuyPrice(String(s.buy_price))
    setEditSellPrice(String(s.sell_price))
    setEditAdminName(s.admin_name || '')
    setEditSoldAt(new Date(s.sold_at).toISOString().slice(0, 10))
    setModalMsg(null)
    setModal('edit')
  }

  async function saveEdit() {
    if (!selectedSale) return
    setModalMsg(null)
    if (!editGameId.trim() || !editBuyPrice || !editSellPrice) {
      setModalMsg({ type: 'err', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
      return
    }
    try {
      const res = await fetch('/api/id-sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSale.id,
          game_id: editGameId.trim(),
          game_name: editGameName.trim() || null,
          buy_price: Number(editBuyPrice),
          sell_price: Number(editSellPrice),
          admin_name: editAdminName.trim() || null,
          sold_at: editSoldAt ? new Date(editSoldAt).toISOString() : undefined,
          actor_admin_name: adminProfileName,
          actor_admin_role: adminRole,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setModalMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาด' })
        return
      }
      setModal(null)
      loadSales()
    } catch {
      setModalMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการบันทึก' })
    }
  }

  function openDeleteModal(s: IdSale) {
    setSelectedSale(s)
    setModal('delete')
  }

  async function confirmDelete() {
    if (!selectedSale) return
    try {
      const res = await fetch(`/api/id-sales?id=${selectedSale.id}&actor_admin_name=${encodeURIComponent(adminProfileName)}&actor_admin_role=${encodeURIComponent(adminRole)}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      setModal(null)
      loadSales()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // Month delete
  function openDeleteMonthModal(monthKey: string) {
    setDeleteMonthKey(monthKey)
    setModal('delete-month')
  }

  async function confirmDeleteMonth() {
    if (!deleteMonthKey) return
    const [year, month] = deleteMonthKey.split('-').map(Number)
    const monthStart = new Date(year, month - 1, 1).toISOString()
    const monthEnd = new Date(year, month, 1).toISOString()
    try {
      const res = await fetch(`/api/id-sales?month_start=${encodeURIComponent(monthStart)}&month_end=${encodeURIComponent(monthEnd)}&actor_admin_name=${encodeURIComponent(adminProfileName)}&actor_admin_role=${encodeURIComponent(adminRole)}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      setModal(null)
      setDeleteMonthKey(null)
      loadSales()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // Computed values
  const liveProfit = buyPrice && sellPrice ? Number(sellPrice) - Number(buyPrice) : null
  const editLiveProfit = editBuyPrice && editSellPrice ? Number(editSellPrice) - Number(editBuyPrice) : null

  // Extract list of unique admin names
  const adminOptions = Array.from(new Set(sales.map(s => s.admin_name).filter(Boolean))) as string[]

  const filtered = sales
    .filter((s) => {
      if (selectedAdmin !== 'all') {
        return s.admin_name === selectedAdmin
      }
      return true
    })
    .filter(
      (s) =>
        s.game_id.toLowerCase().includes(search.toLowerCase()) ||
        (s.game_name && s.game_name.toLowerCase().includes(search.toLowerCase())) ||
        (s.admin_name && s.admin_name.toLowerCase().includes(search.toLowerCase()))
    )

  // Group by month
  const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

  function getMonthKey(dateStr: string) {
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  function getMonthLabel(monthKey: string) {
    const [year, month] = monthKey.split('-').map(Number)
    return `${THAI_MONTHS[month - 1]} ${year + 543}`
  }

  const groupedByMonth: Record<string, IdSale[]> = {}
  filtered.forEach((s) => {
    const key = getMonthKey(s.sold_at)
    if (!groupedByMonth[key]) groupedByMonth[key] = []
    groupedByMonth[key].push(s)
  })

  const sortedMonthKeys = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a))

  const deleteMonthLabel = deleteMonthKey ? getMonthLabel(deleteMonthKey) : ''
  const deleteMonthCount = deleteMonthKey && groupedByMonth[deleteMonthKey] ? groupedByMonth[deleteMonthKey].length : 0

  const totalSellAmount = sales.reduce((acc, s) => acc + Number(s.sell_price || 0), 0)
  const totalBuyAmount = sales.reduce((acc, s) => acc + Number(s.buy_price || 0), 0)
  const totalProfit = sales.reduce((acc, s) => acc + Number(s.profit || 0), 0)

  if (loading) {
    return (
      <div className="py-16">
        <PageLoading message="กำลังโหลดข้อมูลยอดขายไอดี..." />
      </div>
    )
  }

  return (
    <>
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>🎮</span> ไอดีที่ขาย
          </div>
          <div className="text-lg font-extrabold text-[var(--accent-blue)]">
            {sales.length} <span className="text-xs font-normal text-[var(--text-muted)]">ไอดี</span>
          </div>
        </div>

        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>💰</span> ยอดขายรวม
          </div>
          <div className="text-lg font-extrabold text-[var(--text-primary)]">
            {totalSellAmount.toLocaleString('th-TH')} <span className="text-xs font-normal text-[var(--text-muted)]">฿</span>
          </div>
        </div>

        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>💵</span> ต้นทุนรวม
          </div>
          <div className="text-lg font-extrabold text-[var(--danger)]">
            {totalBuyAmount.toLocaleString('th-TH')} <span className="text-xs font-normal text-[var(--text-muted)]">฿</span>
          </div>
        </div>

        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>📈</span> กำไรรวม
          </div>
          <div className={`text-lg font-extrabold ${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('th-TH')} <span className="text-xs font-normal text-[var(--text-muted)]">฿</span>
          </div>
        </div>
      </div>

      {/* Add ID Sale Form */}
      <div className="panel p-6 mb-6">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2 text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-3">
          <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          บันทึกยอดขายไอดีใหม่
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">เลขไอดีโพต ถ้าไม่มีเลขไอดีให้ใส่ เสนอขาย</label>
              <input
                className="input-field w-full px-3.5 py-2 text-sm"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="เช่น ID 0400 , เสนอขาย"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">เกม</label>
              <input
                className="input-field w-full px-3.5 py-2 text-sm"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="เช่น FreeFire, Roblox"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">💵 ราคารับมา (บาท) *</label>
              <input
                type="number"
                className="input-field w-full px-3.5 py-2 text-sm"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">💰 ราคาขายออก (บาท) *</label>
              <input
                type="number"
                className="input-field w-full px-3.5 py-2 text-sm"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">📈 กำไร (คำนวณอัตโนมัติ)</label>
              <div className={`input-field w-full px-3.5 py-2 text-sm flex items-center font-bold ${liveProfit !== null
                ? liveProfit >= 0
                  ? 'profit-positive'
                  : 'profit-negative'
                : 'text-[var(--text-muted)]'
                }`} style={{ cursor: 'default', opacity: 0.9 }}>
                {liveProfit !== null ? (
                  <>
                    {liveProfit >= 0 ? '+' : ''}{liveProfit.toLocaleString('th-TH')} ฿
                  </>
                ) : (
                  <span className="text-[var(--text-muted)] font-normal opacity-60">กรอกราคาด้านบน</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between">
                <span>ชื่อแอดมิน</span>
                <span className="text-[10px] text-[var(--accent-blue)] font-normal">🔒 เห็นเฉพาะฝั่งแอดมิน</span>
              </label>
              <input
                className="input-field w-full px-3.5 py-2 text-sm"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="เช่น หัวเพจ ไอหนวด"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">📅 วันที่ขาย</label>
              <input
                type="date"
                className="input-field w-full px-3.5 py-2 text-sm"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button onClick={addSale} className="btn-primary w-full py-3 text-sm mt-5 font-bold">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            บันทึกยอดขายไอดี
          </span>
        </button>

        {msg && (
          <div className={`text-xs mt-4 px-3.5 py-2.5 flex items-center gap-2 font-medium ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'}`}>
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

      {/* Sales List */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--border-soft)] pb-3">
          <h2 className="font-bold text-sm flex items-center gap-2 text-[var(--text-primary)]">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            รายการขายไอดีทั้งหมด
          </h2>
          <span className="badge badge-cyan font-bold">{sales.length} รายการ</span>
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
                <option value="all">แอดมินทุกคน ({sales.length})</option>
                {adminOptions.map((admin) => (
                  <option key={admin} value={admin}>
                    👤 {admin} ({sales.filter((s) => s.admin_name === admin).length} รายการ)
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
              placeholder="ค้นหาตามเลขไอดี, ชื่อเกม หรือ ชื่อแอดมิน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Month-grouped List */}
        <div className="space-y-5">
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-medium">{sales.length === 0 ? 'ยังไม่มีรายการขายไอดี' : 'ไม่พบรายการที่ค้นหา'}</p>
            </div>
          )}

          {sortedMonthKeys.map((monthKey) => {
            const monthSales = groupedByMonth[monthKey]
            const monthProfit = monthSales.reduce((acc, s) => acc + Number(s.profit || 0), 0)
            const monthSell = monthSales.reduce((acc, s) => acc + Number(s.sell_price || 0), 0)
            const monthBuy = monthSales.reduce((acc, s) => acc + Number(s.buy_price || 0), 0)
            const monthProfitPositive = monthProfit >= 0

            return (
              <div key={monthKey} className="month-group">
                {/* Month Header */}
                <div className="month-header">
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    <span className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                      📅 {getMonthLabel(monthKey)}
                    </span>
                    <span className="badge badge-cyan text-[10px] py-0.5 px-2">{monthSales.length} ไอดี</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium hidden sm:inline">
                      ขาย {monthSell.toLocaleString('th-TH')}฿ • ทุน {monthBuy.toLocaleString('th-TH')}฿
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-sm font-extrabold ${monthProfitPositive ? 'profit-positive' : 'profit-negative'}`}>
                      {monthProfitPositive ? '+' : ''}{monthProfit.toLocaleString('th-TH')}฿
                    </span>
                    <button
                      onClick={() => openDeleteMonthModal(monthKey)}
                      className="btn-action btn-action-delete text-[10px] py-1 px-2"
                      title={`ลบทั้งเดือน ${getMonthLabel(monthKey)}`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ลบทั้งเดือน
                    </button>
                  </div>
                </div>

                {/* Month Items */}
                <div className="space-y-2">
                  {monthSales.map((s, i) => {
                    const profit = Number(s.profit || 0)
                    const isPositive = profit >= 0
                    return (
                      <div
                        key={s.id}
                        className="list-item px-4 py-3"
                        style={{ animation: `fadeInUp 0.3s ease-out ${0.03 * i}s both` }}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1.5">
                                🎮 <span className="font-mono">{s.game_id}</span>
                              </span>
                              {s.game_name && (
                                <span className="text-[10px] bg-[var(--accent-sky-soft)] text-[var(--accent-sky)] px-2 py-0.5 rounded-full border border-[var(--accent-sky)]/20 font-semibold">
                                  {s.game_name}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1">
                                💵 รับมา: <strong className="text-[var(--text-primary)]">{Number(s.buy_price).toLocaleString('th-TH')}฿</strong>
                              </span>
                              <span className="text-[var(--border-soft)]">→</span>
                              <span className="flex items-center gap-1">
                                💰 ขายออก: <strong className="text-[var(--text-primary)]">{Number(s.sell_price).toLocaleString('th-TH')}฿</strong>
                              </span>
                              {s.admin_name && (
                                <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-semibold flex items-center gap-1">
                                  👤 {s.admin_name}
                                </span>
                              )}
                              <span className="text-[10px] text-[var(--text-muted)] opacity-70">
                                📅 {new Date(s.sold_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-sm font-extrabold ${isPositive ? 'profit-positive' : 'profit-negative'}`}>
                              {isPositive ? '+' : ''}{profit.toLocaleString('th-TH')} ฿
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">กำไร</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-[var(--border-soft)]">
                          <button onClick={() => openEditModal(s)} className="btn-action btn-action-edit">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            แก้ไข
                          </button>
                          <button onClick={() => openDeleteModal(s)} className="btn-action btn-action-delete">
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
            )
          })}
        </div>
      </div>

      {/* ═══ EDIT MODAL ═══ */}
      {modal === 'edit' && selectedSale && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(null)} className="modal-close">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="modal-title">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไขรายการขายไอดี
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">เลขไอดีเกม *</label>
                <input
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={editGameId}
                  onChange={(e) => setEditGameId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ชื่อเกม / หมายเหตุ</label>
                <input
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={editGameName}
                  onChange={(e) => setEditGameName(e.target.value)}
                  placeholder="เช่น FreeFire, Roblox"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">💵 ราคารับมา *</label>
                  <input
                    type="number"
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editBuyPrice}
                    onChange={(e) => setEditBuyPrice(e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">💰 ราคาขายออก *</label>
                  <input
                    type="number"
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editSellPrice}
                    onChange={(e) => setEditSellPrice(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              {/* Live profit preview */}
              {editLiveProfit !== null && (
                <div className={`text-sm font-bold text-center px-3 py-2 rounded-xl border ${editLiveProfit >= 0
                  ? 'bg-[var(--good-soft)] text-[var(--badge-good-text)] border-[rgba(16,185,129,0.3)]'
                  : 'bg-[var(--danger-soft)] text-[var(--danger)] border-[rgba(239,68,68,0.3)]'
                  }`}>
                  📈 กำไร: {editLiveProfit >= 0 ? '+' : ''}{editLiveProfit.toLocaleString('th-TH')} ฿
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">แอดมินผู้บันทึก</label>
                  <input
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    placeholder="เช่น แอดมิน A"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">📅 วันที่ขาย</label>
                  <input
                    type="date"
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editSoldAt}
                    onChange={(e) => setEditSoldAt(e.target.value)}
                  />
                </div>
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

      {/* ═══ DELETE CONFIRM (Step 1) ═══ */}
      {modal === 'delete' && selectedSale && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-icon confirm-icon-danger">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="confirm-title">ลบรายการขายไอดี?</h3>
              <p className="confirm-desc">
                ต้องการลบรายการ &quot;{selectedSale.game_id}&quot;{selectedSale.game_name ? ` (${selectedSale.game_name})` : ''} ใช่ไหม?<br />
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
      {modal === 'delete-confirm' && selectedSale && (
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
                ข้อมูลรายการขาย &quot;{selectedSale.game_id}&quot; จะถูกลบถาวร
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

      {/* ═══ DELETE MONTH (Step 1) ═══ */}
      {modal === 'delete-month' && deleteMonthKey && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-icon confirm-icon-danger">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="confirm-title">ลบรายการทั้งเดือน?</h3>
              <p className="confirm-desc">
                ต้องการลบรายการขายไอดี <strong>ทั้งหมด {deleteMonthCount} รายการ</strong> ของเดือน <strong>{deleteMonthLabel}</strong> ใช่ไหม?<br />
                <strong style={{ color: 'var(--danger)' }}>⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้</strong>
              </p>
              <div className="confirm-actions">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm font-bold">
                  ยกเลิก
                </button>
                <button onClick={() => setModal('delete-month-confirm')} className="btn-danger py-2.5 text-sm font-bold">
                  ยืนยันลบทั้งเดือน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE MONTH (Step 2) ═══ */}
      {modal === 'delete-month-confirm' && deleteMonthKey && (
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
                ข้อมูลขายไอดี <strong>ทั้งหมด {deleteMonthCount} รายการ</strong> ของเดือน <strong>{deleteMonthLabel}</strong> จะถูกลบถาวร
              </p>
              <div className="confirm-actions">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm font-bold">
                  ยกเลิก
                </button>
                <button onClick={confirmDeleteMonth} className="btn-danger py-2.5 text-sm font-bold">
                  🗑️ ลบถาวรทั้งเดือน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
