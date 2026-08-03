'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StockId } from '@/lib/types'
import ImageModal from '@/app/components/ImageModal'
import PageLoading from '@/app/components/PageLoading'

type ModalType = 'edit' | 'delete' | null
type StatusFilter = 'all' | 'available' | 'reserved' | 'sold'

const COMMON_GAMES = ['FreeFire', 'Roblox', 'RoV', 'FC Mobile', 'PUBG', 'อื่นๆ']

function cleanImageUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  const imgMatch = trimmed.match(/src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) return imgMatch[1]
  const bbMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i)
  if (bbMatch && bbMatch[1]) return bbMatch[1]
  return trimmed
}

export default function StockIdsPanel() {
  const [items, setItems] = useState<StockId[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [viewImg, setViewImg] = useState<{ src: string; title: string } | null>(null)

  // Form states
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [gameName, setGameName] = useState('FreeFire')
  const [customGameName, setCustomGameName] = useState('')
  const [priceCash, setPriceCash] = useState('')
  const [priceInstallment, setPriceInstallment] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [details, setDetails] = useState('')
  const [adminName, setAdminName] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Modal states
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedItem, setSelectedItem] = useState<StockId | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editGameName, setEditGameName] = useState('')
  const [editPriceCash, setEditPriceCash] = useState('')
  const [editPriceInstallment, setEditPriceInstallment] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editDetails, setEditDetails] = useState('')
  const [editAdminName, setEditAdminName] = useState('')
  const [editStatus, setEditStatus] = useState<'available' | 'reserved' | 'sold'>('available')
  const [modalMsg, setModalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function loadStockIds() {
    try {
      const res = await fetch('/api/stock-ids')
      const result = await res.json()
      setItems(result.data || [])
    } catch {
      console.error('Failed to load stock_ids')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStockIds()

    // Realtime subscription
    const channel = supabase
      .channel('stock-ids-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_ids' }, () => {
        loadStockIds()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function genCode() {
    const selectedG = gameName === 'อื่นๆ' ? (customGameName || 'GAME') : gameName
    const prefix = selectedG.substring(0, 3).toUpperCase()
    const num = Math.floor(100 + Math.random() * 900)
    setCode(`${prefix}-${num}`)
  }

  async function addItem() {
    setMsg(null)
    const finalGame = gameName === 'อื่นๆ' ? customGameName.trim() : gameName

    if (!code.trim() || !finalGame || !priceCash) {
      setMsg({ type: 'err', text: 'กรุณากรอก รหัสสินค้า, เกม และ ราคาเงินสด ให้ครบ' })
      return
    }

    try {
      const res = await fetch('/api/stock-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          title: code.trim(),
          game_name: finalGame,
          price_cash: Number(priceCash),
          price_installment: priceInstallment ? Number(priceInstallment) : null,
          image_url: imageUrl.trim() || null,
          details: details.trim() || null,
          status: 'available',
          admin_name: adminName.trim() || null,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาด' })
        return
      }

      setMsg({ type: 'ok', text: `ลงไอดีพร้อมขายเรียบร้อย! (รหัส: ${code.trim()})` })
      setCode('')
      setTitle('')
      setPriceCash('')
      setPriceInstallment('')
      setImageUrl('')
      setDetails('')
      setAdminName('')
      loadStockIds()
    } catch {
      setMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  async function updateStatus(id: string, newStatus: 'available' | 'reserved' | 'sold') {
    try {
      const res = await fetch('/api/stock-ids', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) loadStockIds()
    } catch {
      console.error('Failed to update status')
    }
  }

  function openEditModal(item: StockId) {
    setSelectedItem(item)
    setEditCode(item.code)
    setEditTitle(item.title)
    setEditGameName(item.game_name)
    setEditPriceCash(String(item.price_cash))
    setEditPriceInstallment(item.price_installment ? String(item.price_installment) : '')
    setEditImageUrl(item.image_url || '')
    setEditDetails(item.details || '')
    setEditAdminName(item.admin_name || '')
    setEditStatus(item.status)
    setModalMsg(null)
    setModal('edit')
  }

  async function saveEdit() {
    if (!selectedItem) return
    setModalMsg(null)
    if (!editCode.trim() || !editGameName.trim() || !editPriceCash) {
      setModalMsg({ type: 'err', text: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' })
      return
    }

    try {
      const res = await fetch('/api/stock-ids', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          code: editCode.trim(),
          title: editCode.trim(),
          game_name: editGameName.trim(),
          price_cash: Number(editPriceCash),
          price_installment: editPriceInstallment ? Number(editPriceInstallment) : null,
          image_url: editImageUrl.trim() || null,
          details: editDetails.trim() || null,
          status: editStatus,
          admin_name: editAdminName.trim() || null,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setModalMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาดในการบันทึก' })
        return
      }

      setModal(null)
      loadStockIds()
    } catch {
      setModalMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  function openDeleteModal(item: StockId) {
    setSelectedItem(item)
    setModal('delete')
  }

  async function confirmDelete() {
    if (!selectedItem) return
    try {
      const res = await fetch(`/api/stock-ids?id=${selectedItem.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      setModal(null)
      loadStockIds()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // Extract unique games for filter
  const gameOptions = Array.from(new Set(items.map((i) => i.game_name).filter(Boolean)))

  const filtered = items
    .filter((i) => {
      if (statusFilter !== 'all') return i.status === statusFilter
      return true
    })
    .filter((i) => {
      if (gameFilter !== 'all') return i.game_name === gameFilter
      return true
    })
    .filter((i) =>
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.game_name.toLowerCase().includes(search.toLowerCase()) ||
      (i.details && i.details.toLowerCase().includes(search.toLowerCase()))
    )

  const availableCount = items.filter((i) => i.status === 'available').length
  const reservedCount = items.filter((i) => i.status === 'reserved').length
  const soldCount = items.filter((i) => i.status === 'sold').length

  if (loading) {
    return (
      <div className="py-16">
        <PageLoading message="กำลังโหลดข้อมูลคลังไอดี..." />
      </div>
    )
  }

  return (
    <>
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>📦</span> สินค้าทั้งหมด
          </div>
          <div className="text-lg font-extrabold text-[var(--text-primary)]">
            {items.length} <span className="text-xs font-normal text-[var(--text-muted)]">ไอดี</span>
          </div>
        </div>

        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>🟢</span> พร้อมขาย
          </div>
          <div className="text-lg font-extrabold text-[var(--good)]">
            {availableCount} <span className="text-xs font-normal text-[var(--text-muted)]">ไอดี</span>
          </div>
        </div>

        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>🟡</span> ติดจอง
          </div>
          <div className="text-lg font-extrabold text-[var(--accent-gold)]">
            {reservedCount} <span className="text-xs font-normal text-[var(--text-muted)]">ไอดี</span>
          </div>
        </div>

        <div className="stat-box p-3.5 text-center">
          <div className="text-[11px] text-[var(--text-muted)] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>🔴</span> ขายแล้ว
          </div>
          <div className="text-lg font-extrabold text-[var(--danger)]">
            {soldCount} <span className="text-xs font-normal text-[var(--text-muted)]">ไอดี</span>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <div className="panel p-6 mb-6">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2 text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-3">
          <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          ลงประกาศไอดีพร้อมขายใหม่
        </h2>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
                เลขไอดี + อิโมจิ *
              </label>
              <input
                className="input-field w-full px-3.5 py-2 text-sm font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น FF-0454🐳"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">หมวดหมู่เกม *</label>
              <select
                className="input-field w-full px-3.5 py-2 text-sm"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              >
                {COMMON_GAMES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {gameName === 'อื่นๆ' && (
                <input
                  className="input-field w-full px-3.5 py-2 text-sm mt-2"
                  value={customGameName}
                  onChange={(e) => setCustomGameName(e.target.value)}
                  placeholder="ระบุชื่อเกม..."
                />
              )}
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">💵 ราคาเงินสด (บาท) *</label>
              <input
                type="number"
                className="input-field w-full px-3.5 py-2 text-sm"
                value={priceCash}
                onChange={(e) => setPriceCash(e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">📝 ราคารวมผ่อน (บาท)</label>
              <input
                type="number"
                className="input-field w-full px-3.5 py-2 text-sm"
                value={priceInstallment}
                onChange={(e) => setPriceInstallment(e.target.value)}
                placeholder="ปล่อยผ่านถ้าไม่มีผ่อน"
                min="0"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between">
                <span>👤 ชื่อแอดมิน</span>
                <span className="text-[10px] text-[var(--accent-blue)] font-normal">🔒 เห็นเฉพาะฝั่งแอดมิน</span>
              </label>
              <input
                className="input-field w-full px-3.5 py-2 text-sm"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="เช่น หัวเพจ, ไอหนวด..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between flex-wrap gap-1">
              <span>🔗 ลิงก์รูปภาพประกอบ (Image URL)</span>
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
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border-soft)] flex items-center justify-center">
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

          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
              📄 รายละเอียดไอดีเพิ่มเติม (สกิน, ปืน) จะใส่หรือไม่ใส่ก็ได้นะ❌
            </label>
            <textarea
              className="input-field w-full px-3.5 py-2 text-sm min-h-[70px] resize-y py-2.5"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="เช่น 7/7 ชุด500+ ปืน600+ Vip8"
            />
          </div>
        </div>

        <button onClick={addItem} className="btn-primary w-full py-3 text-sm mt-5 font-bold">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            ลงประกาศไอดีพร้อมขาย
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

      {/* List Panel */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--border-soft)] pb-3">
          <h2 className="font-bold text-sm flex items-center gap-2 text-[var(--text-primary)]">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            รายการคลังไอดีทั้งหมด
          </h2>
          <span className="badge badge-cyan font-bold">{filtered.length} รายการ</span>
        </div>

        {/* Status Filter Tabs */}
        <div className="filter-tabs mb-4">
          <span
            onClick={() => setStatusFilter('all')}
            className={`filter-tab ${statusFilter === 'all' ? 'filter-tab-active' : ''}`}
          >
            ทั้งหมด ({items.length})
          </span>
          <span
            onClick={() => setStatusFilter('available')}
            className={`filter-tab ${statusFilter === 'available' ? 'filter-tab-active' : ''}`}
          >
            🟢 พร้อมขาย ({availableCount})
          </span>
          <span
            onClick={() => setStatusFilter('reserved')}
            className={`filter-tab ${statusFilter === 'reserved' ? 'filter-tab-active' : ''}`}
          >
            🟡 ติดจอง ({reservedCount})
          </span>
          <span
            onClick={() => setStatusFilter('sold')}
            className={`filter-tab ${statusFilter === 'sold' ? 'filter-tab-active' : ''}`}
          >
            🔴 ขายแล้ว ({soldCount})
          </span>
        </div>

        {/* Game Filter & Search */}
        <div className="space-y-3 mb-4">
          {gameOptions.length > 0 && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)]">
              <label className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5 shrink-0">
                <svg className="w-3.5 h-3.5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                กรองตามเกม:
              </label>
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="input-field text-xs py-1.5 px-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel-soft)] font-bold text-[var(--accent-blue)] cursor-pointer outline-none max-w-[210px] truncate"
              >
                <option value="all">ทุกเกม ({items.length})</option>
                {gameOptions.map((g) => (
                  <option key={g} value={g}>
                    🎮 {g} ({items.filter((i) => i.game_name === g).length} รายการ)
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
              placeholder="ค้นหาตามรหัสไอดี, ชื่อประกาศ หรือ รายละเอียด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List Items */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="font-medium">{items.length === 0 ? 'ยังไม่มีประกาศไอดีพร้อมขาย' : 'ไม่พบรายการที่ค้นหา'}</p>
            </div>
          )}

          {filtered.map((item, i) => {
            return (
              <div
                key={item.id}
                className="list-item p-3.5 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center"
                style={{ animation: `fadeInUp 0.3s ease-out ${0.03 * i}s both` }}
              >
                {/* Thumbnail Image */}
                <div
                  className={`w-full sm:w-20 h-28 sm:h-20 rounded-xl overflow-hidden bg-[var(--stat-bg)] border border-[var(--border-soft)] shrink-0 flex items-center justify-center relative group ${
                    item.image_url ? 'cursor-pointer hover:border-[var(--accent-blue)] transition-all' : ''
                  }`}
                  onClick={() => {
                    if (item.image_url) setViewImg({ src: item.image_url, title: `${item.game_name} (${item.code})` })
                  }}
                  title={item.image_url ? 'คลิกเพื่อดูรูปภาพขนาดใหญ่' : undefined}
                >
                  {item.image_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <span>🔍</span>
                        <span className="text-[10px]">ดูรูป</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-2xl block">🎮</span>
                      <span className="text-[9px] text-[var(--text-muted)]">{item.game_name}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-extrabold bg-[var(--accent-blue-soft)] text-[var(--accent-blue)] px-2 py-0.5 rounded-md border border-[var(--accent-blue)]/20">
                      {item.code}
                    </span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                      🎮 {item.game_name}
                    </span>
                    {item.status === 'available' && (
                      <span className="badge badge-good text-[10px] py-0.5 px-2">🟢 พร้อมขาย</span>
                    )}
                    {item.status === 'reserved' && (
                      <span className="badge badge-gold text-[10px] py-0.5 px-2">🟡 ติดจอง</span>
                    )}
                    {item.status === 'sold' && (
                      <span className="badge badge-danger text-[10px] py-0.5 px-2">🔴 ขายแล้ว</span>
                    )}
                    {item.admin_name && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-semibold flex items-center gap-1">
                        👤 {item.admin_name}
                      </span>
                    )}
                  </div>

                  {item.details ? (
                    <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 mt-0.5 leading-snug" title={item.details}>
                      {item.details}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                      ไอดีเกม {item.game_name} (รหัส {item.code})
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                    <span className="font-bold text-[var(--accent-blue)]">
                      💵 สด: {item.price_cash.toLocaleString('th-TH')} ฿
                    </span>
                    {item.price_installment && (
                      <span className="text-[var(--text-muted)] font-medium">
                        📝 ผ่อน: {item.price_installment.toLocaleString('th-TH')} ฿
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Toggle & Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border-soft)] gap-2 shrink-0">
                  {/* Status Select Switch */}
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as 'available' | 'reserved' | 'sold')}
                    className="text-[11px] font-bold py-1 px-2 rounded-lg border border-[var(--border-soft)] bg-[var(--stat-bg)] cursor-pointer outline-none"
                  >
                    <option value="available">🟢 พร้อมขาย</option>
                    <option value="reserved">🟡 ติดจอง</option>
                    <option value="sold">🔴 ขายแล้ว</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditModal(item)} className="btn-action btn-action-edit">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      แก้ไข
                    </button>
                    <button onClick={() => openDeleteModal(item)} className="btn-action btn-action-delete">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {modal === 'edit' && selectedItem && (
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
              แก้ไขประกาศไอดี
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">รหัสสินค้า *</label>
                  <input
                    className="input-field w-full px-3.5 py-2 text-sm font-mono"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">หมวดหมู่เกม *</label>
                  <input
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editGameName}
                    onChange={(e) => setEditGameName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">💵 ราคาเงินสด *</label>
                  <input
                    type="number"
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editPriceCash}
                    onChange={(e) => setEditPriceCash(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">📝 ราคารวมผ่อน</label>
                  <input
                    type="number"
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editPriceInstallment}
                    onChange={(e) => setEditPriceInstallment(e.target.value)}
                    placeholder="ไม่มีผ่อน"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">สถานะสินค้า</label>
                  <select
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'available' | 'reserved' | 'sold')}
                  >
                    <option value="available">🟢 พร้อมขาย</option>
                    <option value="reserved">🟡 ติดจอง</option>
                    <option value="sold">🔴 ขายแล้ว</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between">
                    <span>แอดมินผู้ลงประกาศ</span>
                    <span className="text-[10px] text-[var(--accent-blue)] font-normal">🔒 เห็นเฉพาะฝั่งแอดมิน</span>
                  </label>
                  <input
                    className="input-field w-full px-3.5 py-2 text-sm"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    placeholder="เช่น หัวเพจ ไอหนวด"
                  />
                </div>
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
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border-soft)] flex items-center justify-center">
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
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">📄 รายละเอียดเพิ่มเติม</label>
                <textarea
                  className="input-field w-full px-3.5 py-2 text-sm min-h-[70px] resize-y py-2.5"
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                />
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

      {/* Delete Modal */}
      {modal === 'delete' && selectedItem && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-icon confirm-icon-danger">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="confirm-title">ลบประกาศไอดี?</h3>
              <p className="confirm-desc">
                ต้องการลบไอดี &quot;{selectedItem.code}&quot; ({selectedItem.title}) ใช่ไหม?<br />
                <strong style={{ color: 'var(--danger)' }}>⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้</strong>
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
    </>
  )
}
