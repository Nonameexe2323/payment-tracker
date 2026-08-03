import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="max-w-lg w-full" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="panel p-8 sm:p-11 text-center relative overflow-hidden border-2 border-[var(--border-soft)] hover:border-cyan-400/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Top animated rainbow glow bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse" />

          {/* Glowing Mascot Avatar with Rotating Neon Ring */}
          <div className="inline-flex items-center justify-center mb-6 relative group">
            {/* Ambient background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            
            {/* Outer rotating neon border */}
            <div className="absolute -inset-1.5 rounded-3xl border-2 border-transparent border-t-cyan-400 border-r-purple-500 animate-spin" style={{ animationDuration: '3s' }} />

            {/* Mascot Image Box */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 dark:border-slate-800 bg-slate-900 z-10 transform transition-all duration-300 group-hover:scale-105">
              <img
                src="/logo.jpg"
                alt="Jiksaw Shop Logo"
                className="w-full h-full object-cover animate-scalePulse"
              />
            </div>

            {/* Live badge overlay */}
            <div className="absolute -bottom-2.5 z-20 bg-black/80 backdrop-blur-md text-[10px] font-black text-cyan-300 px-3 py-0.5 rounded-full border border-cyan-400/40 shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>เปิดบริการ 24 ชม.</span>
            </div>
          </div>

          {/* Shimmer Title Header */}
          <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight flex items-center justify-center gap-2">
            <span>🧩</span>
            <span className="shimmer-text">Jiksaw Shop</span>
          </h1>

          <p className="text-sm mb-6 text-[var(--text-muted)] leading-relaxed font-semibold">
            🧾 ระบบเช็คยอดผ่อนชำระสินค้า & คลังไอดีเกมแท้
            <span className="block text-xs font-bold text-[var(--accent-blue)] mt-1.5 tracking-wide flex items-center justify-center gap-1">
              <span>✨</span> สะดวก รวดเร็ว ปลอดภัย มีประกัน 100%
            </span>
          </p>

          {/* Feature highlights badge row */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 shadow-sm">
              🎮 ไอดีเกมแท้
            </span>
            <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 shadow-sm">
              ⚡ อนุมัติไว
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
              🛡️ ปลอดภัย 100%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3.5">
            <Link
              href="/customer"
              className="btn-primary py-4 text-base font-extrabold flex items-center justify-center gap-2.5 group shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              👤 สำหรับลูกค้า (เช็คยอดผ่อน)
            </Link>

            <Link
              href="/catalog"
              className="btn-outline py-4 text-base font-extrabold flex items-center justify-center gap-2.5 !bg-[var(--accent-blue-soft)] !text-[var(--accent-blue)] !border-[var(--accent-blue)]/40 hover:!bg-[var(--accent-blue)] hover:!text-white group transition-all duration-300 hover:-translate-y-0.5 shadow-md"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              🎮 ดูไอดีเพิ่มเติม (เลือกดูสินค้า)
            </Link>

            <Link
              href="/admin"
              className="btn-outline py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-300"
            >
              <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              🏪 สำหรับร้านค้า (ระบบแอดมิน)
            </Link>
          </div>

          {/* Contact Channels */}
          <div className="mt-9 pt-6 border-t border-[var(--border-soft)] text-left">
            <h2 className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              ช่องทางการติดต่อร้านค้า
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=100089517474962"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-[#1877F2] transition-colors truncate">Facebook</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate font-medium">เพจหลักร้านค้า</div>
                </div>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@jiksawshop33"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-pink-500/10 hover:border-pink-500/50 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md border border-white/20">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003.01 15.6a6.34 6.34 0 0010.86 4.47V12.1a8.3 8.3 0 005.72 2.26V10.9a4.83 4.83 0 01-3.77-1.42 4.78 4.78 0 01-1.23-2.79z" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-pink-400 transition-colors truncate">TikTok</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate font-medium">ติดตามผลงาน</div>
                </div>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/2N3VYEcCK"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-[#5865F2] transition-colors truncate">Discord</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate font-medium">ชุมชนดิสคอร์ด</div>
                </div>
              </a>

              {/* LINE */}
              <a
                href="https://lin.ee/VjBjIVjU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#00B900]/10 hover:border-[#00B900]/50 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#00B900] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.34 10.03c0-4.43-4.52-8.03-10.09-8.03S-.84 5.6-.84 10.03c0 3.97 3.58 7.3 8.42 7.92.33.07.78.22.9.5.1.25.07.64.03.9-.06.4-.3 1.55-.35 1.88-.08.48-.37 1.88 1.63 1.03 2-1.03 5.4-3.18 7.37-5.44 1.43-1.63 2.18-3.38 2.18-5.79zm-13.4-1.34h-1.22c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4h-.82v-.8h.82c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4zm2.74 0c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h.4c.22 0 .4-.18.4-.4v-3.2c0-.22-.18-.4-.4-.4h-.4zm3.92 0h-1.22c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h.4c.22 0 .4-.18.4-.4v-1.6l1.02 1.76c.1.18.3.24.48.14.07-.04.12-.09.15-.15v-3.35c0-.22-.18-.4-.4-.4h-.43zm3.7.8h-1.22v.8h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4zm-1.22 1.6h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4h-1.22c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4h-1.22v-.8z" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-[#00B900] transition-colors truncate">LINE</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate font-medium">ติดต่อแอดมิน</div>
                </div>
              </a>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-5 border-t border-[var(--border-soft)] text-center">
            <p className="text-xs text-[var(--text-muted)] font-semibold flex items-center justify-center gap-1.5">
              <span>💖</span> Jiksaw Shop • บริการขายไอดีเกม & รับผ่อนชำระอันดับ 1
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
