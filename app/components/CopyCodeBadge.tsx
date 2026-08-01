'use client'

import { useState } from 'react'

interface CopyCodeBadgeProps {
  code: string
  className?: string
}

export default function CopyCodeBadge({ code, className }: CopyCodeBadgeProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
    } else {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = code
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const defaultClasses = "font-mono bg-[var(--bg-panel-soft)] text-[var(--accent-blue)] px-2.5 py-0.5 rounded-full border border-[var(--border-soft)] font-bold text-[0.75rem] hover:border-[var(--accent-blue)] hover:bg-[var(--accent-blue-soft)] transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"

  return (
    <button
      onClick={handleCopy}
      title="คลิกเพื่อคัดลอกรหัสผ่อน"
      type="button"
      className={className || defaultClasses}
    >
      <span>{code}</span>
      {copied ? (
        <span className="text-[10px] text-emerald-400 font-sans font-normal ml-0.5">✓ คัดลอกแล้ว!</span>
      ) : (
        <svg className="w-3 h-3 text-[var(--text-muted)] transition-colors opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}
