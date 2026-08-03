import { Customer, Payment } from './types'

export type InstallmentAnalysis = {
  isDefaulted: boolean
  isCompleted: boolean
  isWarning: boolean
  statusLabel: string
  reason?: string
  daysSinceLastPayment: number
  lastPaymentDate: Date | null
  daysUntilDueDate: number | null
  totalPaid: number
  remainingAmount: number
  progressPercent: number
  warningMessage?: string
}

export function cleanImageUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  const imgMatch = trimmed.match(/src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) return imgMatch[1]
  const bbMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i)
  if (bbMatch && bbMatch[1]) return bbMatch[1]
  return trimmed
}

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

export function getThaiDayName(dayIndex?: number | null): string {
  if (dayIndex === undefined || dayIndex === null || dayIndex < 0 || dayIndex > 6) return 'จันทร์'
  return THAI_DAYS[dayIndex]
}

export function checkInstallmentStatus(
  customer: Customer,
  payments: Payment[] = []
): InstallmentAnalysis {
  const approvedPayments = payments.filter(p => p.status === 'approved')
  const totalPaid = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const remainingAmount = Math.max(0, Number(customer.total_amount) - totalPaid)
  const progressPercent = customer.total_amount > 0 
    ? Math.min(100, Math.round((totalPaid / customer.total_amount) * 100)) 
    : 0

  const isCompleted = remainingAmount <= 0

  // Determine last payment timestamp or customer creation timestamp
  let lastPaymentDate: Date = new Date(customer.created_at)
  if (approvedPayments.length > 0) {
    const latestPayment = [...approvedPayments].sort(
      (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
    )[0]
    lastPaymentDate = new Date(latestPayment.paid_at)
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastPaymentStart = new Date(
    lastPaymentDate.getFullYear(),
    lastPaymentDate.getMonth(),
    lastPaymentDate.getDate()
  )

  // Difference in calendar days
  const msPerDay = 24 * 60 * 60 * 1000
  const daysSinceLastPayment = Math.max(
    0,
    Math.floor((todayStart.getTime() - lastPaymentStart.getTime()) / msPerDay)
  )

  // Target due date check
  let daysUntilDueDate: number | null = null
  let isDueDatePassed = false
  if (customer.due_date) {
    const due = new Date(customer.due_date)
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    daysUntilDueDate = Math.ceil((dueStart.getTime() - todayStart.getTime()) / msPerDay)
    if (daysUntilDueDate < 0) {
      isDueDatePassed = true
    }
  }

  // Check rules if not fully paid
  let isDefaulted = customer.status === 'defaulted'
  let isWarning = false
  let statusLabel = isCompleted ? 'ชำระครบแล้ว' : isDefaulted ? 'หลุดผ่อน' : 'ปกติ (กำลังผ่อน)'
  let reason: string | undefined = undefined
  let warningMessage: string | undefined = undefined

  if (!isCompleted) {
    // Rule 3: Final Due Date Exceeded -> Default Immediately
    if (isDueDatePassed) {
      isDefaulted = true
      reason = 'ส่งยอดไม่ทันภายในวันที่ตกลงกันไว้ตอนผ่อน (หลุดผ่อนทันที)'
      statusLabel = 'หลุดผ่อน (เกินวันที่ตกลงไว้)'
    }
    // Rule 1: Daily Plan -> Missing max_unpaid_days (default: 3)
    else if (customer.plan_type === 'daily' || !customer.plan_type) {
      const maxDays = Number(customer.max_unpaid_days) > 0 ? Number(customer.max_unpaid_days) : 3
      if (daysSinceLastPayment >= maxDays) {
        isDefaulted = true
        reason = `ไม่ได้ส่งยอดผ่อนติดต่อกันครบ ${maxDays} วัน`
        statusLabel = `หลุดผ่อน (ไม่ส่งยอด ${maxDays} วัน)`
      } else if (daysSinceLastPayment >= maxDays - 1 && maxDays > 1) {
        isWarning = true
        warningMessage = `⚠️ ไม่ได้ส่งยอด ${daysSinceLastPayment} วันติดต่อกันแล้ว (หากขาดส่งอีก ${maxDays - daysSinceLastPayment} วันจะหลุดผ่อนทันที)`
      }
    }
    // Rule 2: Weekly Plan -> Missing weekly schedule
    else if (customer.plan_type === 'weekly') {
      const targetWeeklyDay = customer.weekly_day ?? 1 // default Monday
      
      // Calculate days since last payment
      if (daysSinceLastPayment >= 7) {
        isDefaulted = true
        reason = `ไม่ได้ส่งยอดตามวันที่กำหนดประจำสัปดาห์ (วัน${getThaiDayName(targetWeeklyDay)})`
        statusLabel = 'หลุดผ่อน (เกินกำหนดประจำสัปดาห์)'
      } else if (daysSinceLastPayment >= 5) {
        isWarning = true
        warningMessage = `⚠️ เกือบถึงกำหนดวันส่งยอดประจำสัปดาห์ (กำหนดวัน${getThaiDayName(targetWeeklyDay)})`
      }
    }

    // Manual admin default flag overrides status label if needed
    if (customer.status === 'defaulted' && !reason) {
      isDefaulted = true
      reason = 'แอดมินปรับสถานะเป็นหลุดผ่อน'
      statusLabel = 'หลุดผ่อน'
    }
  }

  return {
    isDefaulted,
    isCompleted,
    isWarning,
    statusLabel,
    reason,
    daysSinceLastPayment,
    lastPaymentDate: approvedPayments.length > 0 ? lastPaymentDate : null,
    daysUntilDueDate,
    totalPaid,
    remainingAmount,
    progressPercent,
    warningMessage,
  }
}
