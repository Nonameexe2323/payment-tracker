'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, Payment } from '@/lib/types'
import ReceiptModal from '@/app/components/ReceiptModal'
import CopyCodeBadge from '@/app/components/CopyCodeBadge'

type ModalType = 'edit' | 'default' | 'restore' | 'delete' | 'delete-confirm' | null

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Modal states
  const [modal, setModal] = useState<ModalType>(null)
  const [editName, setEditName] = useState('')
  const [editTotal, setEditTotal] = useState('')
  const [editAdminName, setEditAdminName] = useState('')
  const [editAdminNote, setEditAdminNote] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [modalMsg, setModalMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function loadData() {
    setLoading(true)
    const { data: cust } = await supabase.from('customers').select('*').eq('code', code).single()
    if (!cust) {
      setCustomer(null)
      setLoading(false)
      return
    }
    setCustomer(cust)
    const { data: pays } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', cust.id)
      .order('paid_at', { ascending: false })
    setPayments(pays || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [code])

  async function recordPayment() {
    if (!customer) return
    setMsg(null)
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setMsg({ type: 'err', text: 'กรุณาระบุจำนวนเงินที่รับชำระให้ถูกต้องนะ' })
      return
    }
    const { error } = await supabase.from('payments').insert({
      customer_id: customer.id,
      amount: amt,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'Admin'
    })
    if (error) {
      setMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง' })
      return
    }
    setMsg({ type: 'ok', text: 'บันทึกการรับชำระเงินเรียบร้อยแล้ว ✨' })
    setAmount('')
    loadData()
  }

  async function handleApprove(pId: string) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: 'Admin' })
      .eq('id', pId)
      .eq('status', 'pending')
      .select()

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
      return
    }
    if (!data || data.length === 0) {
      alert('⚠️ รายการนี้ถูกอนุมัติหรือจัดการไปแล้วโดยแอดมินท่านอื่น')
    }
    loadData()
  }

  async function handleReject(pId: string) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', pId)
      .eq('status', 'pending')
      .select()

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
      return
    }
    if (!data || data.length === 0) {
      alert('⚠️ รายการนี้ถูกจัดการไปแล้วโดยแอดมินท่านอื่น')
    }
    loadData()
  }

  // --- Modal handlers ---
  function openEditModal() {
    if (!customer) return
    setEditName(customer.name)
    setEditTotal(String(customer.total_amount))
    setEditAdminName(customer.admin_name || '')
    setEditAdminNote(customer.admin_note || '')
    setModalMsg(null)
    setModal('edit')
  }

  async function saveEdit() {
    if (!customer) return
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
          id: customer.id,
          name: editName.trim(),
          total_amount: Number(editTotal),
          admin_name: editAdminName.trim() || null,
          admin_note: editAdminNote.trim() || null
        })
      })
      const result = await res.json()
      if (!res.ok) {
        setModalMsg({ type: 'err', text: result.error || 'เกิดข้อผิดพลาดในการบันทึก' })
        return
      }
      setModal(null)
      loadData()
    } catch {
      setModalMsg({ type: 'err', text: 'เกิดข้อผิดพลาดในการบันทึก' })
    }
  }

  function openDefaultModal() {
    if (!customer) return
    setModal(customer.status === 'defaulted' ? 'restore' : 'default')
  }

  async function confirmDefault() {
    if (!customer) return
    const newStatus = customer.status === 'defaulted' ? 'active' : 'defaulted'
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, status: newStatus })
      })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      setModal(null)
      loadData()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  async function confirmDelete() {
    if (!customer) return
    try {
      const res = await fetch(`/api/customers?id=${customer.id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      if (!res.ok) {
        alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'))
        return
      }
      router.push('/admin')
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-3" />
          <p className="text-xs text-[var(--text-muted)] font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="panel p-8 text-center">
            <div className="empty-state-icon">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-5 font-medium">ไม่พบข้อมูลรหัสผ่อนนี้ในระบบ</p>
            <Link href="/admin" className="btn-outline inline-flex items-center gap-2 px-5 py-2 text-xs font-bold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับสู่หน้ารายการทั้งหมด
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const isDefaulted = customer.status === 'defaulted'
  const paid = payments.filter(p => p.status !== 'pending' && p.status !== 'rejected').reduce((s, p) => s + Number(p.amount), 0)
  const remain = Math.max(customer.total_amount - paid, 0)
  const pct = Math.min(100, Math.round((paid / customer.total_amount) * 100))
  const isComplete = pct >= 100

  return (
    <main className="min-h-screen px-4 py-8 relative">
      <div className="max-w-xl mx-auto">
        <div className="panel p-6 sm:p-8">
          {/* Top navigation */}
          <button
            onClick={() => router.push('/admin')}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] mb-6 inline-flex items-center gap-1.5 font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ย้อนกลับ
          </button>

          {/* Statement Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-[var(--border-soft)]">
            <div>
              <div className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-wider mb-1">รายละเอียดผ่อนชำระ</div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {customer.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)] flex-wrap">
                <CopyCodeBadge code={customer.code} />
                {customer.admin_name && (
                  <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-semibold flex items-center gap-1">
                    👤 แอดมินผู้ดูแล: {customer.admin_name}
                  </span>
                )}
              </div>
              {customer.admin_note && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    📝 หมายเหตุสัญญา / โน้ตแอดมิน:
                  </div>
                  <div className="whitespace-pre-wrap font-medium">{customer.admin_note}</div>
                </div>
              )}
            </div>
            {isDefaulted ? (
              <span className="badge badge-danger font-bold">🚫 หลุดผ่อน</span>
            ) : isComplete ? (
              <span className="badge badge-good font-bold">✓ ผ่อนครบแล้ว</span>
            ) : (
              <span className="badge badge-gold font-bold">กำลังผ่อน</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button onClick={openEditModal} className="btn-action btn-action-edit">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไข
            </button>
            <button onClick={openDefaultModal} className={`btn-action ${isDefaulted ? 'btn-action-restore' : 'btn-action-default'}`}>
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
            <button onClick={() => setModal('delete')} className="btn-action btn-action-delete">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              ลบ
            </button>
            <button onClick={() => setShowReceipt(true)} className="btn-action btn-action-edit border-sky-500/30 text-sky-400">
              🖼️ ออกใบเสร็จสรุปยอด
            </button>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)] mb-2">
              <span>ความคืบหน้าการผ่อน</span>
              <span className="font-bold text-[var(--accent-blue)]">{pct}%</span>
            </div>
            <div className="bar-track h-2.5">
              <div className="bar-fill h-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="stat-box p-3.5 text-center">
              <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ยอดผ่อนทั้งหมด</div>
              <div className="text-base font-extrabold text-[var(--text-primary)]">{customer.total_amount.toLocaleString('th-TH')} ฿</div>
            </div>
            <div className="stat-box p-3.5 text-center">
              <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ชำระแล้ว</div>
              <div className="text-base font-extrabold text-[var(--accent-blue)]">{paid.toLocaleString('th-TH')} ฿</div>
            </div>
            <div className="stat-box p-3.5 text-center col-span-2">
              <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ยอดคงเหลือ</div>
              <div className="text-base font-extrabold text-[var(--danger)]">{remain.toLocaleString('th-TH')} ฿</div>
            </div>
          </div>

          {/* Payment Form */}
          {!isComplete && !isDefaulted && (
            <div className="mb-8 p-4 rounded-2xl bg-[var(--bg-panel-soft)] border border-[var(--border-soft)]">
              <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                บันทึกการรับชำระเงินใหม่ (บาท)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input-field flex-1 px-3.5 py-2 text-sm"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') recordPayment() }}
                />
                <button onClick={recordPayment} className="btn-primary px-6 text-sm font-bold whitespace-nowrap">
                  บันทึกรายการ
                </button>
              </div>
              {msg && (
                <div className={`text-xs mt-3 px-3.5 py-2.5 flex items-center gap-2 font-medium ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'
                  }`}>
                  {msg.text}
                </div>
              )}
            </div>
          )}

          {/* Defaulted notice */}
          {isDefaulted && (
            <div className="mb-8 p-4 rounded-2xl bg-[var(--danger-soft)] border border-[rgba(239,68,68,0.3)]">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--danger)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                ลูกค้ารายนี้หลุดผ่อนแล้ว
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">ไม่สามารถบันทึกการรับชำระเงินได้ กรุณาคืนสถานะก่อน</p>
            </div>
          )}

          {/* Payment History */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-soft)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">ประวัติการชำระเงิน</span>
              <span className="text-xs text-[var(--text-muted)] font-medium">รวม {payments.length} งวด</span>
            </div>

            {payments.length === 0 ? (
              <div className="empty-state py-6">
                <p className="text-xs text-[var(--text-muted)] font-medium">ยังไม่มีประวัติการบันทึกการชำระเงิน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p, idx) => {
                  const isPending = p.status === 'pending'
                  const isRejected = p.status === 'rejected'
                  const isApproved = p.status === 'approved' || (!isPending && !isRejected)

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${isPending
                          ? 'bg-[var(--gold-soft)]/20 border-amber-500/30 dark:border-amber-500/40 shadow-sm'
                          : isRejected
                            ? 'bg-red-500/5 border-red-500/20 opacity-75'
                            : 'bg-[var(--bg-panel-soft)] border-[var(--border-soft)] hover:border-[var(--border-hover)]'
                        }`}
                    >
                      {/* Top bar: Status Badge + Date/Time */}
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[var(--border-soft)]">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--stat-bg)] px-2 py-0.5 rounded-md border border-[var(--border-soft)] font-mono">
                            งวดที่ {payments.length - idx}
                          </span>
                          {isPending && (
                            <span className="badge badge-gold text-xs font-bold animate-pulse">
                              ⏳ รอตรวจสอบสลิป
                            </span>
                          )}
                          {isApproved && (
                            <span className="badge badge-good text-xs font-bold">
                              ✓ อนุมัติแล้ว
                            </span>
                          )}
                          {isRejected && (
                            <span className="badge badge-danger text-xs font-bold">
                              ❌ ไม่อนุมัติ
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-[var(--text-muted)] font-medium">
                          {new Date(p.paid_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })} น.
                        </span>
                      </div>

                      {/* Main info row: Amount + Slip Button */}
                      <div className="flex items-center justify-between gap-3 my-1">
                        <div>
                          <div className="text-xs text-[var(--text-muted)] font-medium mb-0.5">จำนวนเงิน</div>
                          <div
                            className={`text-xl font-extrabold tracking-tight ${isPending
                                ? 'text-[var(--gold)]'
                                : isRejected
                                  ? 'text-[var(--danger)] line-through'
                                  : 'text-[var(--good)]'
                              }`}
                          >
                            +{Number(p.amount).toLocaleString('th-TH')}{' '}
                            <span className="text-xs font-normal text-[var(--text-muted)]">บาท</span>
                          </div>
                        </div>

                        {p.slip_url && (
                          <a
                            href={p.slip_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline px-3.5 py-1.5 text-xs font-semibold gap-1.5 min-h-0 h-9 hover:border-[var(--accent-blue)]"
                          >
                            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            ดูรูปสลิป
                          </a>
                        )}
                      </div>

                      {/* Pending Action Buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-500/20">
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="btn-primary flex-1 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 min-h-0 h-10 shadow-md shadow-green-500/20"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            อนุมัติรายการ
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="btn-danger flex-1 py-2 text-xs font-bold min-h-0 h-10"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ EDIT MODAL ═══ */}
      {modal === 'edit' && customer && (
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
              แก้ไขข้อมูลลูกค้า
            </h3>
            <div className="space-y-4">
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
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold flex items-center justify-between">
                  <span>แอดมินผู้ดูแล</span>
                  <span className="text-[10px] text-[var(--accent-blue)] font-normal">🔒 เห็นเฉพาะฝั่งแอดมิน</span>
                </label>
                <input
                  className="input-field w-full px-3.5 py-2 text-sm"
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                  placeholder="เช่น แอดมิน A"
                />
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
      {(modal === 'default' || modal === 'restore') && customer && (
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
                  ? `ต้องการมาร์ก "${customer.name}" เป็นหลุดผ่อนใช่ไหม? สามารถคืนสถานะได้ภายหลัง`
                  : `ต้องการคืนสถานะ "${customer.name}" กลับเป็นผ่อนชำระปกติใช่ไหม?`
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
      {modal === 'delete' && customer && (
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
                ต้องการลบ &quot;{customer.name}&quot; และข้อมูลการชำระเงินทั้งหมดใช่ไหม?<br />
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
      {modal === 'delete-confirm' && customer && (
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
                ข้อมูลทั้งหมดของ &quot;{customer.name}&quot; จะถูกลบถาวร รวมถึงประวัติการชำระเงินทั้งหมด
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

      {/* Receipt Modal */}
      {showReceipt && customer && (
        <ReceiptModal
          customer={customer}
          payments={payments}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </main>
  )
}