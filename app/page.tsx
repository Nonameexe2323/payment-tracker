import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="max-w-md w-full" style={{ animation: 'fadeInUp 0.4s ease-out both' }}>
        <div className="panel p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle top accent gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Brand Icon */}
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] via-[var(--accent-sky)] to-pink-500 flex items-center justify-center shadow-lg shadow-[var(--accent-blue-glow)] border border-white/30 relative z-10 transform transition-transform hover:scale-105 duration-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black mb-3 text-[var(--text-primary)] tracking-tight">
            🧩 Jiksaw Shop
          </h1>
          <p className="text-sm mb-8 text-[var(--text-muted)] leading-relaxed font-medium">
            🧾 ระบบเช็คยอดผ่อนชำระสินค้า
            <span className="block text-xs font-bold text-[var(--accent-blue)] mt-1.5 tracking-wide">
              ✨ เช็คง่าย สะดวก รวดเร็ว ตลอด 24 ชั่วโมง
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Link href="/customer" className="btn-primary py-4 text-base font-bold flex items-center justify-center gap-2.5 group">
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              👤 สำหรับลูกค้า (เช็คยอดผ่อน)
            </Link>
            <Link href="/admin" className="btn-outline py-4 text-base font-semibold flex items-center justify-center gap-2.5">
              <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              🏪 สำหรับร้านค้า (จัดการยอดผ่อน)
            </Link>
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-[var(--border-soft)] text-center">
            <p className="text-xs text-[var(--text-muted)] font-medium flex items-center justify-center gap-1.5">
              <span>💖</span> Jiksaw Shop • บริการด้วยใจ สะดวกรวดเร็ว
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
