'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, Payment } from '@/lib/types'

export default function CustomerPage() {
  const [method, setMethod] = useState<'code' | 'name'>('code')
  const [codeInput, setCodeInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameResults, setNameResults] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  async function loadReceipt(customer: Customer) {
    setLoading(true)
    setError('')
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customer.id)
      .order('paid_at', { ascending: false })
    setPayments(data || [])
    setSelected(customer)
    setLoading(false)
  }

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

  async function searchByName(q: string) {
    setNameInput(q)
    setSelected(null)
    if (!q.trim()) {
      setNameResults([])
      return
    }
    const { data } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', `%${q.trim()}%`)
      .limit(10)
    setNameResults(data || [])
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

  // Count only approved or older payments (where status is null or not pending/rejected)
  const paid = payments.filter(p => p.status !== 'pending' && p.status !== 'rejected').reduce((s, p) => s + Number(p.amount), 0)
  const remain = selected ? Math.max(selected.total_amount - paid, 0) : 0
  const pct = selected ? Math.min(100, Math.round((paid / selected.total_amount) * 100)) : 0
  const isComplete = pct >= 100

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
        <div className="panel p-6 mb-6">
          {/* Method Toggle */}
          <div className="flex gap-2 mb-5">
            <span
              onClick={() => { setMethod('code'); setSelected(null); setError('') }}
              className={`pill-tab flex-1 ${method === 'code' ? 'pill-tab-active' : ''}`}
            >
              ค้นหาด้วยรหัสผ่อน
            </span>
            <span
              onClick={() => { setMethod('name'); setSelected(null); setError('') }}
              className={`pill-tab flex-1 ${method === 'name' ? 'pill-tab-active' : ''}`}
            >
              ค้นหาด้วยชื่อ
            </span>
          </div>

          {method === 'code' ? (
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-semibold">รหัสผ่อนชำระ</label>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 px-3.5 py-2.5 text-sm uppercase font-mono tracking-wider"
                  placeholder="เช่น A7K2M"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchByCode() }}
                />
                <button onClick={searchByCode} className="btn-primary px-5 text-sm font-bold whitespace-nowrap">
                  ค้นหา
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-semibold">ชื่อลูกค้า</label>
              <input
                className="input-field w-full px-3.5 py-2.5 text-sm mb-3"
                placeholder="พิมพ์ชื่อลูกค้า..."
                value={nameInput}
                onChange={(e) => searchByName(e.target.value)}
              />
              <div className="space-y-1.5">
                {nameResults.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => loadReceipt(c)}
                    className="list-item flex justify-between items-center px-3.5 py-2.5 cursor-pointer"
                  >
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{c.name}</span>
                    <span className="font-mono text-xs font-bold text-[var(--accent-blue)] bg-[var(--bg-panel-soft)] px-2.5 py-1 rounded-full border border-[var(--border-soft)]">{c.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="alert-err text-xs mt-4 px-3.5 py-2.5 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="loading-spinner mb-3" />
            <p className="text-xs text-[var(--text-muted)] font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Receipt View */}
        {selected && !loading && (
          <div className="panel p-6 sm:p-7">
            {/* Header info */}
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-[var(--border-soft)]">
              <div>
                <span className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-wider block mb-1">สรุปรายการผ่อนชำระ</span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {selected.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                  รหัสผ่อน: <span className="font-bold text-[var(--text-primary)]">{selected.code}</span>
                </p>
              </div>
              {isComplete ? (
                <span className="badge badge-good font-bold">✓ ชำระครบแล้ว</span>
              ) : (
                <span className="badge badge-gold font-bold">กำลังผ่อนชำระ</span>
              )}
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
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-box p-3.5">
                <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ยอดคงเหลือ</div>
                <div className="text-base font-bold text-[var(--danger)]">{remain.toLocaleString('th-TH')} ฿</div>
              </div>
              <div className="stat-box p-3.5">
                <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ค่างวดต่อเดือน</div>
                <div className="text-base font-bold text-[var(--text-primary)]">{selected.monthly_amount ? `${selected.monthly_amount.toLocaleString('th-TH')} ฿` : '-'}</div>
              </div>
            </div>

            {/* Slip Upload Section */}
            {!isComplete && (
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
                <div className="divide-y divide-[var(--border-soft)]">
                  {payments.map((p) => (
                    <div key={p.id} className="payment-row flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[var(--text-muted)]">
                          {new Date(p.paid_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {p.status === 'pending' && <span className="text-[10px] text-[var(--gold)] font-bold">⏳ รอตรวจสอบ</span>}
                        {p.status === 'rejected' && <span className="text-[10px] text-[var(--danger)] font-bold">❌ ไม่อนุมัติ</span>}
                      </div>
                      <span className={`font-bold text-sm ${p.status === 'pending' ? 'text-[var(--text-muted)]' : p.status === 'rejected' ? 'text-[var(--danger)] line-through' : 'text-[var(--accent-blue)]'}`}>
                        +{Number(p.amount).toLocaleString('th-TH')} ฿
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
