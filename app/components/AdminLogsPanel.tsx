'use client'

import { useEffect, useState } from 'react'
import { AdminLog } from '@/lib/types'
import PageLoading from './PageLoading'

export default function AdminLogsPanel() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await fetch(`/api/logs?search=${encodeURIComponent(search)}`)
      const result = await res.json()
      setLogs(result.logs || [])
    } catch {
      console.error('Failed to load admin logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    loadLogs()
  }

  function getActionBadge(action: string) {
    if (action.startsWith('CREATE')) {
      return <span className="badge badge-good text-[10px]">🟢 เพิ่มข้อมูล</span>
    }
    if (action.startsWith('UPDATE') || action.startsWith('APPROVE')) {
      return <span className="badge badge-gold text-[10px]">🔵 อัปเดต/อนุมัติ</span>
    }
    if (action.startsWith('DELETE') || action.startsWith('REJECT')) {
      return <span className="badge badge-danger text-[10px]">🔴 ลบ/ปฏิเสธ</span>
    }
    return <span className="badge text-[10px] bg-slate-500/10 text-slate-400">⚪ อื่นๆ</span>
  }

  return (
    <div>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-[var(--stat-bg)] border border-[var(--border-soft)]">
        <div>
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <span>📜</span> ประวัติการทำงานทั้งหมด (Admin Activity Logs)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
            บันทึกประวัติการกระทำสำคัญของแอดมินทุกคน เพื่อความโปร่งใสและปลอดภัย (สำหรับยศหัวเพจ)
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="btn-outline text-xs py-2 px-3 shrink-0 flex items-center gap-1.5 self-start sm:self-auto font-bold"
        >
          <span>🔄</span> รีเฟรชข้อมูล
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          className="input-field flex-1 text-xs py-2.5 px-3.5"
          placeholder="ค้นหาตามชื่อแอดมิน, รายละเอียด หรือ ประเภทกิจกรรม..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-primary text-xs px-4 py-2.5 font-bold shrink-0">
          🔍 ค้นหา
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="py-12">
          <PageLoading message="กำลังโหลดประวัติการทำงาน..." />
        </div>
      )}

      {/* Logs Table */}
      {!loading && (
        <div className="panel p-0 overflow-hidden border border-[var(--border-soft)]">
          {logs.length === 0 ? (
            <div className="p-10 text-center text-xs text-[var(--text-muted)] font-medium">
              ยังไม่มีประวัติการทำงานในขณะนี้
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-soft)] bg-[var(--stat-bg)] text-[var(--text-muted)] font-bold">
                    <th className="py-3 px-4 w-40">วัน-เวลา</th>
                    <th className="py-3 px-4 w-36">ผู้ทำรายการ</th>
                    <th className="py-3 px-4 w-32">กิจกรรม</th>
                    <th className="py-3 px-4">รายละเอียดกิจกรรม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]">
                  {logs.map((log) => {
                    const isOwner = log.admin_role === 'owner'
                    const dateFormatted = new Date(log.created_at).toLocaleString('th-TH', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })

                    return (
                      <tr key={log.id} className="hover:bg-[var(--accent-blue-soft)]/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[110px]">{log.admin_name}</span>
                            {isOwner ? (
                              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-extrabold border border-amber-500/20">
                                👑 Owner
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-500/20">
                                🛡️ Staff
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getActionBadge(log.action_type)}
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-primary)] font-medium leading-relaxed">
                          {log.details}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
