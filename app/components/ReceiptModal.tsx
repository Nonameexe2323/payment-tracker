'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Customer, Payment } from '@/lib/types'

interface ReceiptModalProps {
  customer: Customer
  payments: Payment[]
  onClose: () => void
}

export default function ReceiptModal({ customer, payments, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const approvedPayments = payments.filter((p) => p.status === 'approved' || (p.status !== 'pending' && p.status !== 'rejected'))
  const paid = approvedPayments.reduce((s, p) => s + Number(p.amount), 0)
  const remain = Math.max(customer.total_amount - paid, 0)
  const pct = Math.min(100, Math.round((paid / customer.total_amount) * 100))
  const isComplete = pct >= 100

  async function downloadImage() {
    if (!receiptRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `JiksawShop_Receipt_${customer.code}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate receipt image:', err)
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="modal-close">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span>🖼️</span> ใบเสร็จดิจิทัลสรุปยอดผ่อน
        </h3>

        {/* ═══ RECEIPT CARD CONTAINER TO CONVERT TO IMAGE ═══ */}
        <div
          ref={receiptRef}
          className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden text-left"
          style={{ fontFamily: 'sans-serif' }}
        >
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-500" />

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4 mt-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                <span className="text-xl font-black tracking-tight text-white">Jiksaw Shop</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ใบเสร็จรับเงินสรุปการผ่อนชำระดิจิทัล</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">CODE</span>
              <span className="text-sm font-black font-mono text-sky-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 inline-block">
                {customer.code}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-4 flex items-center gap-3">
            {customer.image_url && (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customer.image_url}
                  alt={customer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">ชื่อลูกค้า</span>
              <div className="text-lg font-bold text-white flex items-center gap-2 truncate">
                {customer.name}
              </div>
            </div>
          </div>

          {/* Summary Stat Grid */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 mb-4">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">ยอดผ่อนรวม</span>
              <span className="text-sm font-bold text-white">{customer.total_amount.toLocaleString('th-TH')} ฿</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">ผ่อนชำระแล้ว</span>
              <span className="text-sm font-bold text-sky-400">+{paid.toLocaleString('th-TH')} ฿</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">ยอดคงเหลือ</span>
              <span className="text-sm font-bold text-rose-400">{remain.toLocaleString('th-TH')} ฿</span>
            </div>
          </div>

          {/* Progress Bar & Stamp */}
          <div className="mb-5 relative">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
              <span>ความคืบหน้าการผ่อน</span>
              <span className="text-sky-400 font-bold">{pct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>

            {/* Complete Stamp Badge */}
            <div className="mt-3 text-center">
              {isComplete ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  ✓ ชำระครบถ้วนสมบูรณ์แล้ว
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  ⏳ อยู่ระหว่างการผ่อนชำระ
                </span>
              )}
            </div>
          </div>

          {/* Payment History List Table */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>ประวัติการโอนชำระเงิน</span>
              <span>รวม {approvedPayments.length} งวด</span>
            </div>

            {approvedPayments.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-3">ยังไม่มีประวัติการโอนชำระเงิน</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {approvedPayments.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">งวดที่ {approvedPayments.length - idx}</span>
                      <span className="text-slate-300 text-[11px]">
                        {new Date(p.paid_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                    <span className="font-bold text-sky-400">+{Number(p.amount).toLocaleString('th-TH')} ฿</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer watermark */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>💖 Jiksaw Shop • บริการขายไอดีเกมอันดับ 1</span>
            <span>ออกเมื่อ: {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-xs font-bold">
            ปิดหน้าต่าง
          </button>
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="btn-primary flex-1 py-2.5 text-xs font-bold disabled:opacity-50"
          >
            {downloading ? (
              <span>กำลังสร้างรูปภาพ...</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                เซฟรูปใบเสร็จลงเครื่อง
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
