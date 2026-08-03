'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, Payment } from '@/lib/types'
import { checkInstallmentStatus, getThaiDayName } from '@/lib/installmentUtils'
import ReceiptModal from '@/app/components/ReceiptModal'
import CopyCodeBadge from '@/app/components/CopyCodeBadge'
import ImageModal from '@/app/components/ImageModal'
import PageLoading from '@/app/components/PageLoading'

export default function CustomerPage() {
  const [codeInput, setCodeInput] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [viewImg, setViewImg] = useState<{ src: string; title: string } | null>(null)

  async function loadReceipt(customer: Customer) {
    setLoading(true)
    setError('')
    const { data: custData } = await supabase.from('customers').select('*').eq('id', customer.id).single()
    const currentCustomer = custData || customer

    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', currentCustomer.id)
      .order('paid_at', { ascending: false })
    setPayments(data || [])
    setSelected(currentCustomer)
    setLoading(false)
  }

  // Realtime subscription for customer page
  useEffect(() => {
    if (!selected) return

    const channel = supabase
      .channel(`customer-realtime-${selected.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `id=eq.${selected.id}` }, () => {
        loadReceipt(selected)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `customer_id=eq.${selected.id}` }, () => {
        loadReceipt(selected)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selected?.id])

  async function searchByCode() {
    setError('')
    setSelected(null)
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    const { data } = await supabase.from('customers').select('*').eq('code', code).single()
    setLoading(false)
    if (!data) {
      setError('ไม่พบรหัสผ่อนนี้ในระบบ กรุณาลองใหม่อีกครั้งนะ')
      return
    }
    loadReceipt(data)
  }

  async function handleUpload() {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      setError('กรุณาระบุจำนวนเงินให้ถูกต้อง')
      return
    }
    if (!slipFile) {
      setError('กรุณาอัปโหลดรูปสลิป')
      return
    }
    if (!selected) return

    setUploading(true)
    setError('')
    setUploadSuccess(false)

    try {
      const fileExt = slipFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(fileName, slipFile)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('slips')
        .getPublicUrl(fileName)

      const slipUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          customer_id: selected.id,
          amount: Number(payAmount),
          paid_at: new Date().toISOString(),
          status: 'pending',
          slip_url: slipUrl
        })

      if (insertError) throw insertError

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentCode: selected.code,
          customerName: selected.name,
          adminName: selected.admin_name,
          amount: Number(payAmount),
          slipUrl
        })
      })

      setUploadSuccess(true)
      setPayAmount('')
      setSlipFile(null)
      loadReceipt(selected)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setUploading(false)
    }
  }

  // Installment analysis calculation
  const analysis = selected ? checkInstallmentStatus(selected, payments) : null
  const paid = analysis ? analysis.totalPaid : 0
  const remain = analysis ? analysis.remainingAmount : 0
  const pct = analysis ? analysis.progressPercent : 0
  const isComplete = analysis ? analysis.isCompleted : false
  const isDefaulted = analysis ? (analysis.isDefaulted || selected?.status === 'defaulted') : false

  return (
    <main className="min-h-screen px-4 py-8 relative">
      <div className="max-w-md mx-auto">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              เช็คยอดผ่อนชำระ
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-semibold">Jiksaw Shop</p>
          </div>
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors inline-flex items-center gap-1 font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            หน้าหลัก
          </Link>
        </div>

        {/* Search Panel */}
        <div className="panel p-6 mb-6 overflow-hidden relative">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-2 font-semibold flex items-center justify-between">
              <span>กรอกรหัสผ่อน (Code) ที่ได้รับจากแอดมิน</span>
              <span className="text-[10px] text-[var(--accent-blue)] font-bold">✨ รหัส 5 หลัก</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <input
                  className="input-field w-full pl-10 pr-3.5 py-2.5 text-sm uppercase font-mono tracking-widest font-bold text-[var(--accent-blue)]"
                  placeholder="เช่น A7K2M"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchByCode() }}
                />
              </div>
              <button onClick={searchByCode} className="btn-primary px-5 text-sm font-bold whitespace-nowrap shadow-md shadow-sky-500/20">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ค้นหา
              </button>
            </div>
          </div>

          {/* Quick Feature Badges */}
          <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-[var(--border-soft)] text-[10px] font-semibold text-[var(--text-muted)]">
            <span className="flex items-center gap-1">⚡ เช็คได้ตลอด 24 ชม.</span>
            <span className="flex items-center gap-1">🧾 แนบสลิปง่าย</span>
            <span className="flex items-center gap-1">🔒 ระบบปลอดภัย</span>
          </div>

          {error && (
            <div className="alert-err text-xs mt-4 px-3.5 py-2.5 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Welcome Guidance Card (Shown before search) */}
        {!selected && !loading && (
          <div className="panel p-6 text-center" style={{ animation: 'fadeInUp 0.3s ease-out both' }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-blue-soft)] to-indigo-500/10 border border-[var(--border-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--accent-blue)]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1">
              ยินดีต้อนรับสู่ระบบเช็คยอดผ่อน
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5 font-medium">
              กรอกรหัสผ่อน 5 หลักในช่องด้านบนเพื่อเริ่มต้นใช้งาน
            </p>

            <div className="grid grid-cols-3 gap-2 text-left">
              <div className="p-3 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)]">
                <div className="text-base mb-1">🔑</div>
                <div className="text-[11px] font-bold text-[var(--text-primary)] mb-0.5">1. ใส่รหัสผ่อน</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight">รหัส 5 หลักที่ได้จากแอดมิน</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)]">
                <div className="text-base mb-1">📊</div>
                <div className="text-[11px] font-bold text-[var(--text-primary)] mb-0.5">2. เช็คยอดผ่อน</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight">ดูยอดที่จ่ายแล้วและคงเหลือ</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--stat-bg)] border border-[var(--border-soft)]">
                <div className="text-base mb-1">📸</div>
                <div className="text-[11px] font-bold text-[var(--text-primary)] mb-0.5">3. แนบรูปสลิป</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight">แจ้งโอนเงินให้แอดมินตรวจ</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-6">
            <PageLoading message="กำลังค้นหาข้อมูลยอดผ่อน..." />
          </div>
        )}

        {/* Receipt View */}
        {selected && !loading && (
          <div className="panel p-6 sm:p-7">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 pb-4 border-b border-[var(--border-soft)]">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {selected.image_url && (
                  <div
                    onClick={() => setViewImg({ src: selected.image_url!, title: selected.name })}
                    className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--stat-bg)] border border-[var(--border-soft)] shrink-0 flex items-center justify-center relative group cursor-pointer hover:border-[var(--accent-blue)] transition-all shadow-sm"
                    title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.image_url}
                      alt={selected.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <span>🔍</span>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-wider block mb-1">สรุปรายการผ่อนชำระ</span>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] break-words">
                    {selected.name}
                  </h2>
                  <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5 font-mono">
                    <span>รหัสผ่อน:</span>
                    <CopyCodeBadge code={selected.code} />
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-auto">
                {isDefaulted ? (
                  <span className="badge badge-danger font-bold text-xs py-1.5 px-3.5 whitespace-nowrap shrink-0 inline-flex items-center justify-center text-center" title={analysis?.reason}>
                    🔴 {analysis?.statusLabel || 'หลุดผ่อน'}
                  </span>
                ) : isComplete ? (
                  <span className="badge badge-good font-bold text-xs py-1.5 px-3.5 whitespace-nowrap shrink-0 inline-flex items-center justify-center text-center">✓ ชำระครบแล้ว</span>
                ) : analysis?.isWarning ? (
                  <span className="bg-amber-500 text-white font-bold text-xs py-1.5 px-3.5 rounded-full shadow-sm whitespace-nowrap shrink-0 inline-flex items-center justify-center text-center">
                    ⚠️ ใกล้หลุดผ่อน
                  </span>
                ) : (
                  <span className="badge badge-gold font-bold text-xs py-1.5 px-3.5 whitespace-nowrap shrink-0 inline-flex items-center justify-center text-center">🟢 กำลังผ่อนชำระ</span>
                )}
              </div>
            </div>

            {/* Installment Plan Rules & Policy Banner */}
            <div className="mb-5 p-4 rounded-2xl bg-[var(--stat-bg)] border border-[var(--border-soft)] space-y-2 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-1 font-semibold">
                <span className="text-[var(--text-primary)] flex items-center gap-1">
                  {selected.plan_type === 'weekly' ? '📅 รอบการผ่อนรายอาทิตย์' : '☀️ รอบการผ่อนรายวัน'}
                </span>
                <span className="text-[var(--accent-blue)] font-bold">
                  {selected.plan_type === 'weekly'
                    ? `ส่งยอดทุกวัน${getThaiDayName(selected.weekly_day)}`
                    : `ไม่ส่งยอดผ่อนครบ ${selected.max_unpaid_days ?? 3} วันถือว่าหลุดผ่อน`}
                </span>
              </div>

              {selected.due_date && (
                <div className="flex items-center justify-between border-t border-[var(--border-soft)] pt-2 mt-2 flex-wrap gap-1">
                  <span className="text-[var(--text-muted)]">⏳ วันครบกำหนดผ่อนสุดท้าย:</span>
                  <span className={`font-bold ${
                    analysis?.daysUntilDueDate !== null && analysis?.daysUntilDueDate !== undefined && analysis.daysUntilDueDate < 0
                      ? 'text-red-500'
                      : 'text-[var(--accent-blue)]'
                  }`}>
                    {selected.due_date} {analysis?.daysUntilDueDate !== null && analysis?.daysUntilDueDate !== undefined && (
                      analysis.daysUntilDueDate >= 0 ? `(เหลืออีก ${analysis.daysUntilDueDate} วัน)` : '(เกินกำหนดเวลา)'
                    )}
                  </span>
                </div>
              )}

              {/* Rules hint */}
              <div className="text-[11px] text-[var(--text-muted)] border-t border-[var(--border-soft)] pt-2 mt-2 leading-relaxed">
                📌 <strong>กฎการผ่อนชำระของเพจ:</strong>{' '}
                {selected.plan_type === 'weekly'
                  ? `ต้องส่งยอดภายในวัน${getThaiDayName(selected.weekly_day)}ของทุกสัปดาห์`
                  : `ต้องส่งยอดชำระอย่างน้อย 1 ครั้งภายในทุกๆ ${selected.max_unpaid_days ?? 3} วัน`}{' '}
                {selected.due_date ? `และต้องผ่อนยอดครบทั้งหมดภายในวันที่ ${selected.due_date}` : ''}
              </div>
            </div>

            {/* Total Balance highlight */}
            <div className="mb-5 bg-[var(--bg-panel-soft)] p-4 rounded-2xl border border-[var(--border-soft)]">
              <div className="text-xs text-[var(--text-muted)] font-semibold mb-1">จ่ายแล้วทั้งหมด</div>
              <div className="text-3xl font-extrabold text-[var(--accent-blue)] tabular-nums">
                {paid.toLocaleString('th-TH')} <span className="text-xs text-[var(--text-muted)] font-normal">บาท</span>
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                จากยอดทั้งหมด {selected.total_amount.toLocaleString('th-TH')} บาท
              </div>

              <div className="bar-track h-2.5 mt-3">
                <div className="bar-fill h-full" style={{ width: `${pct}%` }} />
              </div>

              {/* Download Receipt Button */}
              <button
                onClick={() => setShowReceipt(true)}
                className="btn-outline w-full py-2.5 text-xs font-bold mt-4 flex items-center justify-center gap-2 hover:border-[var(--accent-blue)]"
              >
                <span>🖼️</span> ออกใบเสร็จสรุปยอดผ่อนดิจิทัล (เซฟรูปลงเครื่อง)
              </button>
            </div>

            {/* Breakdown grid */}
            <div className="mb-6">
              <div className="stat-box p-3.5">
                <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ยอดคงเหลือ</div>
                <div className="text-base font-bold text-[var(--danger)]">{remain.toLocaleString('th-TH')} ฿</div>
              </div>
            </div>

            {/* Defaulted Notice */}
            {isDefaulted && (
              <div className="mb-6 p-4 rounded-xl bg-[var(--danger-soft)] border border-[rgba(239,68,68,0.3)]">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--danger)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  รายการนี้หลุดผ่อนแล้ว
                </div>
                <p className="text-xs text-red-500 font-semibold mt-1">
                  สาเหตุ: {analysis?.reason || 'หลุดผ่อนตามเงื่อนไขข้อตกลง'}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">กรุณาติดต่อเพจร้านค้าเพื่อสอบถามข้อมูลเพิ่มเติม</p>
              </div>
            )}

            {/* Warning Notice */}
            {!isDefaulted && analysis?.isWarning && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>{analysis.warningMessage}</span>
                </div>
              </div>
            )}

            {/* Slip Upload Section */}
            {!isComplete && selected.status !== 'defaulted' && (
              <div className="mb-6 p-4 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel-soft)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">แจ้งชำระเงิน</h3>

                {uploadSuccess && (
                  <div className="alert-good text-xs mb-4 px-3.5 py-2.5 flex items-center gap-2 font-medium">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    ส่งสลิปเรียบร้อยแล้ว รอแอดมินตรวจสอบยอดครับ
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">ยอดเงินที่โอน (บาท)</label>
                    <input
                      type="number"
                      className="input-field w-full px-3 py-2 text-sm"
                      placeholder="เช่น 1000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">อัปโหลดสลิป</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs text-[var(--text-muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-blue)] file:text-white hover:file:bg-blue-600 cursor-pointer"
                      onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-primary w-full py-2 text-sm mt-2 disabled:opacity-50"
                  >
                    {uploading ? 'กำลังส่งข้อมูล...' : 'ส่งสลิปแจ้งโอน'}
                  </button>
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-soft)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">ประวัติการชำระเงิน</span>
                <span className="text-xs text-[var(--text-muted)] font-medium">{payments.length} รายการ</span>
              </div>

              {payments.length === 0 ? (
                <div className="empty-state py-4">
                  <p className="text-xs text-[var(--text-muted)] font-medium">ยังไม่มีประวัติการชำระเงิน</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {payments.map((p, idx) => {
                    const isPending = p.status === 'pending'
                    const isRejected = p.status === 'rejected'
                    const isApproved = p.status === 'approved' || (!isPending && !isRejected)

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isPending
                            ? 'bg-[var(--gold-soft)]/20 border-amber-500/30'
                            : isRejected
                            ? 'bg-red-500/5 border-red-500/20 opacity-75'
                            : 'bg-[var(--bg-panel-soft)] border-[var(--border-soft)]'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--stat-bg)] px-1.5 py-0.5 rounded border border-[var(--border-soft)] font-mono">
                              งวดที่ {payments.length - idx}
                            </span>
                            {isPending && <span className="badge badge-gold text-[10px] py-0.5 px-2">⏳ รอตรวจสอบ</span>}
                            {isApproved && <span className="badge badge-good text-[10px] py-0.5 px-2">✓ อนุมัติแล้ว</span>}
                            {isRejected && <span className="badge badge-danger text-[10px] py-0.5 px-2">❌ ไม่อนุมัติ</span>}
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] font-medium">
                            {new Date(p.paid_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} น.
                          </span>
                        </div>

                        <span
                          className={`font-extrabold text-base tracking-tight ${
                            isPending
                              ? 'text-[var(--gold)]'
                              : isRejected
                              ? 'text-[var(--danger)] line-through'
                              : 'text-[var(--accent-blue)]'
                          }`}
                        >
                          +{Number(p.amount).toLocaleString('th-TH')} ฿
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Receipt Modal */}
        {showReceipt && selected && (
          <ReceiptModal
            customer={selected}
            payments={payments}
            onClose={() => setShowReceipt(false)}
          />
        )}
        {/* Image Lightbox Modal */}
        {viewImg && (
          <ImageModal
            src={viewImg.src}
            alt={viewImg.title}
            onClose={() => setViewImg(null)}
          />
        )}
      </div>
    </main>
  )
}
