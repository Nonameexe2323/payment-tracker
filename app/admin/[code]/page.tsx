'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, Payment } from '@/lib/types'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

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
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                <span className="font-mono bg-[var(--bg-panel-soft)] text-[var(--text-primary)] px-2 py-0.5 rounded-full border border-[var(--border-soft)] font-bold">
                  {customer.code}
                </span>
                {customer.phone && <span>โทร: {customer.phone}</span>}
              </div>
            </div>
            {isComplete ? (
              <span className="badge badge-good font-bold">✓ ชำระครบถ้วนแล้ว</span>
            ) : (
              <span className="badge badge-gold font-bold">กำลังผ่อนชำระ</span>
            )}
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
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="stat-box p-3.5 text-center">
              <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ยอดผ่อนทั้งหมด</div>
              <div className="text-base font-extrabold text-[var(--text-primary)]">{customer.total_amount.toLocaleString('th-TH')} ฿</div>
            </div>
            <div className="stat-box p-3.5 text-center">
              <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ชำระแล้ว</div>
              <div className="text-base font-extrabold text-[var(--accent-blue)]">{paid.toLocaleString('th-TH')} ฿</div>
            </div>
            <div className="stat-box p-3.5 text-center">
              <div className="text-xs text-[var(--text-muted)] font-medium mb-1">ยอดคงเหลือ</div>
              <div className="text-base font-extrabold text-[var(--danger)]">{remain.toLocaleString('th-TH')} ฿</div>
            </div>
          </div>

          {/* Payment Form */}
          {!isComplete && (
            <div className="mb-8 p-4 rounded-2xl bg-[var(--bg-panel-soft)] border border-[var(--border-soft)]">
              <label className="text-xs font-bold text-[var(--text-primary)] block mb-2">
                บันทึกการรับชำระเงินใหม่ (บาท)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input-field flex-1 px-3.5 py-2 text-sm"
                  placeholder={customer.monthly_amount ? `ค่างวดปกติ ${customer.monthly_amount.toLocaleString('th-TH')} บาท` : '0.00'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') recordPayment() }}
                />
                <button onClick={recordPayment} className="btn-primary px-6 text-sm font-bold whitespace-nowrap">
                  บันทึกรายการ
                </button>
              </div>
              {msg && (
                <div className={`text-xs mt-3 px-3.5 py-2.5 flex items-center gap-2 font-medium ${
                  msg.type === 'ok' ? 'alert-ok' : 'alert-err'
                }`}>
                  {msg.text}
                </div>
              )}
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
              <div className="divide-y divide-[var(--border-soft)]">
                {payments.map((p) => (
                  <div key={p.id} className="payment-row flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${p.status === 'pending' ? 'bg-[var(--gold-soft)] text-[var(--gold)]' : p.status === 'rejected' ? 'bg-red-100 text-[var(--danger)]' : 'bg-[var(--accent-blue-soft)] text-[var(--accent-blue)]'}`}>
                        {p.status === 'pending' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : p.status === 'rejected' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[var(--text-primary)]">
                          {new Date(p.paid_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {p.status === 'pending' && <span className="text-[10px] text-[var(--gold)] font-bold">รอตรวจสอบสลิป</span>}
                        {p.status === 'rejected' && <span className="text-[10px] text-[var(--danger)] font-bold">ไม่อนุมัติ</span>}
                        {p.slip_url && (
                          <a href={p.slip_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--accent-blue)] underline mt-0.5 inline-block">
                            ดูรูปสลิป
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <span className={`font-bold text-sm ${p.status === 'pending' ? 'text-[var(--text-muted)]' : p.status === 'rejected' ? 'text-[var(--danger)] line-through' : 'text-[var(--accent-blue)]'}`}>
                        +{Number(p.amount).toLocaleString('th-TH')} ฿
                      </span>
                      
                      {p.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(p.id)} className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-colors">
                            อนุมัติ
                          </button>
                          <button onClick={() => handleReject(p.id)} className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-colors">
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}