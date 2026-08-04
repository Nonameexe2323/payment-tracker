'use client'

import { useState, useEffect } from 'react'
import { Review } from '@/lib/types'

const COLOR_OPTIONS = [
  { label: 'ชมพู (Pink)', value: 'bg-pink-950/80 text-pink-300 border-pink-500/40' },
  { label: 'ม่วง (Purple)', value: 'bg-purple-950/80 text-purple-300 border-purple-500/40' },
  { label: 'ฟ้า (Cyan)', value: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' },
  { label: 'เขียว (Emerald)', value: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' },
  { label: 'ส้ม/ทอง (Amber)', value: 'bg-amber-950/80 text-amber-300 border-amber-500/40' },
  { label: 'กุหลาบ (Rose)', value: 'bg-rose-950/80 text-rose-300 border-rose-500/40' },
  { label: 'ฟ้าคราม (Sky)', value: 'bg-sky-950/80 text-sky-300 border-sky-500/40' },
]

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [search, setSearch] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [badge, setBadge] = useState('💖 แนะนำ Jiksaw shop')
  const [badgeColor, setBadgeColor] = useState(COLOR_OPTIONS[0].value)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [imageUrl, setImageUrl] = useState('/logo.jpg')

  async function loadReviews() {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews')
      const result = await res.json()
      if (result.data) {
        setReviews(result.data)
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      setMsg({ type: 'err', text: 'กรุณากรอกชื่อผู้รีวิวและข้อความรีวิวให้ครบถ้วน' })
      return
    }

    try {
      setSaving(true)
      setMsg(null)
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          badge: badge.trim() || '💖 แนะนำ Jiksaw shop',
          badge_color: badgeColor,
          rating,
          comment: comment.trim(),
          image_url: imageUrl.trim() || '/logo.jpg'
        })
      })

      const result = await res.json()
      if (result.error) {
        setMsg({ type: 'err', text: result.error })
      } else {
        setMsg({ type: 'ok', text: 'เพิ่มรีวิวเรียบร้อยแล้ว!' })
        setName('')
        setComment('')
        setImageUrl('/logo.jpg')
        // Optimistic append if needed
        if (result.data) {
          setReviews(prev => [result.data, ...prev])
        } else {
          loadReviews()
        }
      }
    } catch (err) {
      setMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการบันทึกรีวิว' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ยืนยันลบรีวิวนี้ใช่หรือไม่?')) return

    try {
      setReviews(prev => prev.filter(r => r.id !== id))
      await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
      setMsg({ type: 'ok', text: 'ลบรีวิวเรียบร้อยแล้ว' })
    } catch (err) {
      setMsg({ type: 'err', text: 'ไม่สามารถลบรีวิวได้' })
      loadReviews()
    }
  }

  const filteredReviews = reviews.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    r.badge.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="panel p-5 rounded-3xl border-2 border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-indigo-950/60 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
              <span>⭐</span>
              <span>ระบบจัดการรีวิวหน้าเว็บ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>💬</span> เพิ่ม & จัดการรีวิวเพจ Jiksaw Shop
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              เพิ่มรีวิวลูกค้าจากเฟซบุ๊ก ปรับยศ/ป้าย และแสดงผลหน้าหลักอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black">
              ทั้งหมด {reviews.length} รีวิว
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          msg.type === 'ok'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          <span>{msg.type === 'ok' ? '✅' : '⚠️'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid Layout: Add Review Form (Left) & Reviews List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Form: Add New Review */}
        <div className="lg:col-span-5 panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#090b16]/90 shadow-xl">
          <h3 className="text-base font-black text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-purple-400">✨</span>
            <span>เพิ่มรีวิวใหม่</span>
          </h3>

          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ชื่อลูกค้า / ชื่อเฟซบุ๊ก <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น Sahapab Punyasaikunkphut"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ป้ายกำกับ / ยศหัวเพจ
                </label>
                <input
                  type="text"
                  placeholder="เช่น 💖 แนะนำ Jiksaw shop"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  โทนสีป้าย
                </label>
                <select
                  value={badgeColor}
                  onChange={e => setBadgeColor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                >
                  {COLOR_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  คะแนนเรตติ้ง (1 - 5 ดาว)
                </label>
                <select
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-400 font-bold focus:border-purple-500 outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 ดาว)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 ดาว)</option>
                  <option value={3}>⭐⭐⭐ (3 ดาว)</option>
                  <option value={2}>⭐⭐ (2 ดาว)</option>
                  <option value={1}>⭐ (1 ดาว)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ลิงก์รูปโปรไฟล์ / รูปรีวิว
                </label>
                <input
                  type="text"
                  placeholder="/logo.jpg หรือลิงก์รูปภาพ"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ข้อความรีวิวจากลูกค้า <span className="text-pink-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="เช่น ร้านนี้ไม่โกงงงง ขายรหัสถูกด้วย..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : '➕ บันทึกรีวิวใหม่ลงหน้าเว็บ'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-7 panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#090b16]/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="text-amber-400">⭐</span>
              <span>รายการรีวิวทั้งหมด</span>
            </h3>

            <input
              type="text"
              placeholder="🔍 ค้นหารีวิว/ชื่อลูกค้า..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              กำลังโหลดข้อมูลรีวิว...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              ยังไม่มีข้อมูลรีวิวในระบบ
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 bg-slate-950">
                      <img
                        src={rev.image_url || '/logo.jpg'}
                        alt={rev.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-black text-white truncate">
                          {rev.name}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${rev.badge_color || 'bg-pink-950/80 text-pink-300 border-pink-500/40'}`}>
                          {rev.badge}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {"⭐".repeat(rev.rating)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="shrink-0 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold"
                    title="ลบรีวิวนี้"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
