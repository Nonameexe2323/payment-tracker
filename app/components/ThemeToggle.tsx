'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'เปลี่ยนเป็นโหมดกลางวัน (Light Mode)' : 'เปลี่ยนเป็นโหมดกลางคืน (Dark Mode)'}
      className={`fixed bottom-4 right-4 z-40 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md border shadow-xl flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-900/90 text-cyan-200 border-cyan-500/50 shadow-cyan-950/50 hover:border-cyan-400'
          : 'bg-amber-100/90 text-amber-900 border-amber-400 shadow-amber-500/30 hover:border-amber-600'
      }`}
    >
      <span className="text-sm">
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="hidden sm:inline font-bold">
        {isDark ? 'โหมดมืด' : 'โหมดสว่าง'}
      </span>
      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
        isDark
          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
          : 'bg-amber-500/20 text-amber-800 border border-amber-500/40'
      }`}>
        {isDark ? 'กลางคืน [ON]' : 'กลางวัน [ON]'}
      </span>
    </button>
  )
}
