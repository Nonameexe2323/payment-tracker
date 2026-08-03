'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { StockId } from '@/lib/types'
import ImageModal from '@/app/components/ImageModal'
import PageLoading from '@/app/components/PageLoading'

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/profile.php?id=100089517474962'

export default function CatalogPage() {
  const [items, setItems] = useState<StockId[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedItem, setSelectedItem] = useState<StockId | null>(null)
  const [viewImg, setViewImg] = useState<{ src: string; title: string } | null>(null)

  async function loadCatalog() {
    try {
      const res = await fetch('/api/stock-ids')
      const result = await res.json()
      setItems(result.data || [])
    } catch {
      console.error('Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalog()

    // Realtime subscription
    const channel = supabase
      .channel('catalog-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_ids' }, () => {
        loadCatalog()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Extract unique games
  const gameOptions = Array.from(new Set(items.map((i) => i.game_name).filter(Boolean)))

  const filtered = items
    .filter((i) => {
      if (selectedGame !== 'all') return i.game_name === selectedGame
      return true
    })
    .filter(
      (i) =>
        i.code.toLowerCase().includes(search.toLowerCase()) ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.game_name.toLowerCase().includes(search.toLowerCase()) ||
        (i.details && i.details.toLowerCase().includes(search.toLowerCase()))
    )

  const availableCount = items.filter((i) => i.status === 'available').length

  return (
    <main className="min-h-screen px-4 py-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Jiksaw Shop — คลังไอดีเกมพร้อมขาย
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
              ไอดีเกมแท้ 100% ปลอดภัย มีประกัน มีทั้งราคาเงินสดและผ่อนชำระ
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              หน้าหลัก
            </Link>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="panel p-4 mb-6">
          {/* Game Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
            <button
              onClick={() => setSelectedGame('all')}
              className={`pill-tab text-xs shrink-0 py-1.5 px-3.5 ${selectedGame === 'all' ? 'pill-tab-active' : ''}`}
            >
              🎮 ทั้งหมด ({items.length})
            </button>
            {gameOptions.map((game) => {
              const count = items.filter((i) => i.game_name === game).length
              return (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`pill-tab text-xs shrink-0 py-1.5 px-3.5 ${selectedGame === game ? 'pill-tab-active' : ''}`}
                >
                  {game} ({count})
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input-field w-full pl-10 pr-3.5 py-2 text-sm"
              placeholder="ค้นหาตามรหัสไอดี (เช่น FF-001), ชื่อประกาศ หรือ สกิน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12">
            <PageLoading message="กำลังโหลดคลังไอดีสินค้า..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="panel p-10 text-center">
            <div className="empty-state-icon mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
              {items.length === 0 ? 'ยังไม่มีรายการไอดีในขณะนี้' : 'ไม่พบไอดีที่ตรงกับการค้นหา'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              ลองเปลี่ยนคำค้นหา หรือ ทักแอดมินสอบถามไอดีเพิ่มเติมได้ทางเพจ Facebook ครับ
            </p>
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => {
              const isAvailable = item.status === 'available'
              const isReserved = item.status === 'reserved'
              const isSold = item.status === 'sold'

              return (
                <div
                  key={item.id}
                  className="panel overflow-hidden flex flex-col group cursor-pointer hover:border-[var(--accent-blue)] transition-all duration-300"
                  onClick={() => setSelectedItem(item)}
                  style={{ animation: `fadeInUp 0.3s ease-out ${0.04 * i}s both` }}
                >
                  {/* Image Header / Thumbnail */}
                  <div
                    className={`h-44 w-full bg-[var(--stat-bg)] relative overflow-hidden flex items-center justify-center border-b border-[var(--border-soft)] ${
                      item.image_url ? 'cursor-pointer' : ''
                    }`}
                    onClick={(e) => {
                      if (item.image_url) {
                        e.stopPropagation()
                        setViewImg({ src: item.image_url, title: `${item.game_name} (${item.code})` })
                      }
                    }}
                  >
                    {item.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <span>🔍</span>
                          <span className="text-[10px]">คลิกดูรูปใหญ่</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-4xl block mb-1 transform group-hover:scale-110 transition-transform">🎮</span>
                        <span className="text-xs font-bold text-[var(--text-muted)]">{item.game_name}</span>
                      </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      {isAvailable && (
                        <span className="badge badge-good text-[10px] shadow-md backdrop-blur-md">
                          🟢 พร้อมขาย
                        </span>
                      )}
                      {isReserved && (
                        <span className="badge badge-gold text-[10px] shadow-md backdrop-blur-md">
                          🟡 ติดจอง
                        </span>
                      )}
                      {isSold && (
                        <span className="badge badge-danger text-[10px] shadow-md backdrop-blur-md">
                          🔴 ขายแล้ว
                        </span>
                      )}
                    </div>

                    {/* Code Badge Overlay */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="font-mono text-xs font-black bg-black/70 text-white px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-md">
                        {item.code}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                          🎮 {item.game_name}
                        </span>
                      </div>

                      {item.details ? (
                        <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-3 leading-relaxed mb-3">
                          {item.details}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] mb-3">
                          ไอดีเกม {item.game_name} (รหัส {item.code})
                        </p>
                      )}
                    </div>

                    {/* Pricing & Action */}
                    <div className="pt-3 border-t border-[var(--border-soft)] mt-2">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block font-medium">ราคาเงินสด</span>
                          <span className="text-base font-black text-[var(--accent-blue)]">
                            {item.price_cash.toLocaleString('th-TH')} <span className="text-xs font-normal">฿</span>
                          </span>
                        </div>
                        {item.price_installment && (
                          <div className="text-right">
                            <span className="text-[10px] text-[var(--text-muted)] block font-medium">ผ่อนรวม</span>
                            <span className="text-xs font-extrabold text-[var(--accent-gold)]">
                              {item.price_installment.toLocaleString('th-TH')} ฿
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contact Order Button */}
                      <a
                        href={FACEBOOK_PAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0052cc] hover:from-[#166fe5] hover:to-[#0047b3] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group border border-blue-400/30 min-h-[44px]"
                      >
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </div>
                        <span className="leading-tight text-center">
                          💬 สั่งซื้อ / ทักเพจร้าน <span className="opacity-90 font-semibold">({item.code})</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="modal-close z-20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Detail Image */}
            {selectedItem.image_url && (
              <div
                onClick={() => setViewImg({ src: selectedItem.image_url!, title: `${selectedItem.game_name} (${selectedItem.code})` })}
                className="w-full max-h-80 rounded-xl overflow-hidden mb-4 border border-[var(--border-soft)] bg-black relative group cursor-pointer"
                title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                  <span>🔍</span>
                  <span>คลิกเพื่อขยายดูรูปเต็ม</span>
                </div>
              </div>
            )}

            {/* Header info */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-sm font-black bg-[var(--accent-blue-soft)] text-[var(--accent-blue)] px-2.5 py-1 rounded-lg border border-[var(--accent-blue)]/20">
                รหัส: {selectedItem.code}
              </span>
              <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 font-bold">
                🎮 {selectedItem.game_name}
              </span>
              {selectedItem.status === 'available' && (
                <span className="badge badge-good text-xs py-1 px-3">🟢 พร้อมขาย</span>
              )}
              {selectedItem.status === 'reserved' && (
                <span className="badge badge-gold text-xs py-1 px-3">🟡 ติดจอง</span>
              )}
              {selectedItem.status === 'sold' && (
                <span className="badge badge-danger text-xs py-1 px-3">🔴 ขายแล้ว</span>
              )}
            </div>

            {selectedItem.details && (
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3 leading-relaxed">
                {selectedItem.details}
              </h2>
            )}

            {/* Price Box */}
            <div className="p-3.5 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)] mb-4 flex items-center justify-around text-center">
              <div>
                <span className="text-xs text-[var(--text-muted)] block font-medium">ราคาเงินสด</span>
                <span className="text-xl font-black text-[var(--accent-blue)]">
                  {selectedItem.price_cash.toLocaleString('th-TH')} ฿
                </span>
              </div>
              {selectedItem.price_installment && (
                <div className="border-l border-[var(--border-soft)] pl-4">
                  <span className="text-xs text-[var(--text-muted)] block font-medium">ราคารวมผ่อน</span>
                  <span className="text-lg font-black text-[var(--accent-gold)]">
                    {selectedItem.price_installment.toLocaleString('th-TH')} ฿
                  </span>
                </div>
              )}
            </div>

            {/* Details Description */}
            {selectedItem.details && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  รายละเอียดไอดีเพิ่มเติม
                </h3>
                <div className="p-3.5 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {selectedItem.details}
                </div>
              </div>
            )}

            {/* Contact Order Button */}
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0052cc] hover:from-[#166fe5] hover:to-[#0047b3] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group border border-blue-400/30 min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="leading-snug text-center">
                💬 ติดต่อสั่งซื้อไอดีนี้ทาง Facebook เพจร้าน <span className="opacity-90 font-semibold">({selectedItem.code})</span>
              </span>
            </a>
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
