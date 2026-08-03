'use client'

interface PageLoadingProps {
  message?: string
  fullScreen?: boolean
}

export default function PageLoading({ message = 'กำลังโหลดข้อมูล...', fullScreen = false }: PageLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      {/* Logo Avatar with Neon Pulse Ring */}
      <div className="relative mb-5 group">
        {/* Outer glowing blur */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 rounded-full blur-md opacity-70 group-hover:opacity-100 animate-pulse" />
        
        {/* Rotating ring */}
        <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-cyan-400 border-r-sky-500 animate-spin" style={{ animationDuration: '1.2s' }} />

        {/* Mascot Logo Avatar Container */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/80 dark:border-slate-800 shadow-2xl bg-slate-900 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Jiksaw Shop Logo"
            className="w-full h-full object-cover animate-scalePulse"
            onError={(e) => {
              // Fallback to png if jpg fails
              const target = e.target as HTMLImageElement
              if (!target.src.endsWith('.png')) {
                target.src = '/logo.png'
              }
            }}
          />
        </div>
      </div>

      {/* Brand & Loading Text */}
      <div className="space-y-1">
        <div className="text-sm font-extrabold text-[var(--accent-blue)] tracking-wide flex items-center justify-center gap-1.5">
          <span>🧩</span> Jiksaw Shop
        </div>
        <p className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
          {message}
        </p>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
        {content}
      </main>
    )
  }

  return content
}
