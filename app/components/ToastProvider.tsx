'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastItem = {
  id: string
  type: ToastType
  title: string
  message?: string
}

type ToastContextType = {
  showToast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6)
    const newToast: ToastItem = { id, type, title, message }

    setToasts((prev) => [newToast, ...prev].slice(0, 5)) // Max 5 toasts visible

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 🔔 TOP-RIGHT FLOATING TOAST NOTIFICATION CONTAINER */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-xs sm:max-w-sm w-full pointer-events-none px-2 sm:px-0"
        aria-live="assertive"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 transform transition-all duration-300 animate-slide-in ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-emerald-950/50'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-200 shadow-rose-950/50'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-amber-950/50'
                : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-cyan-950/50'
            }`}
            style={{ animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-inner ${
                t.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                  : t.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40'
                  : t.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40'
              }`}>
                {t.type === 'success' && '✅'}
                {t.type === 'error' && '❌'}
                {t.type === 'warning' && '⚠️'}
                {t.type === 'info' && '⚡'}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
                  {t.title}
                </h4>
                {t.message && (
                  <p className="text-[11px] font-medium opacity-90 mt-0.5 leading-snug break-words">
                    {t.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translate3d(60px, -10px, 0) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
