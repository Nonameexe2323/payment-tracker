import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 lg:py-14 relative overflow-hidden">
      <div className="max-w-7xl w-full mx-auto" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

          {/* Left Column: Showcase Hero Panel (Reference Design from image) */}
          <div className="lg:col-span-7 flex flex-col justify-between panel p-6 sm:p-9 relative overflow-hidden border-2 border-[var(--border-soft)] hover:border-purple-500/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Top animated glowing gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse" />

            <div>
              {/* Top Badge */}
              <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-purple-400">
                <span className="text-sm">🔥</span>
                <span className="text-xs sm:text-sm font-extrabold text-purple-200 tracking-wide">
                  ระบบติดตามการผ่อน & ไอดีฟีฟายเพิ่มเติม
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-[1.1] mb-4">
                PAYMENT &<br />
                TRACKER<br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                  BY JIKSAW SHOP
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-semibold max-w-xl mb-6">
                ระบบบริหารจัดการสรุปยอดชำระผ่อนสินค้า คลังไอดีเกมแท้ และติดตามยอดค้างชำระของลูกค้าแบบเรียลไทม์
              </p>

              {/* 4 Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
                {/* Card 1 */}
                <div className="p-4.5 rounded-2xl bg-[var(--stat-bg)] border border-[var(--border-soft)] hover:border-emerald-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 ease-out group flex flex-col justify-between transform-gpu">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-1">
                      เช็คยอดผ่อนเรียลไทม์
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                      สรุปงวดชำระ ยอดคงเหลือ และประวัติการผ่อนสินค้าทันใจ
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-4.5 rounded-2xl bg-[var(--stat-bg)] border border-[var(--border-soft)] hover:border-purple-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 ease-out group flex flex-col justify-between transform-gpu">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-1">
                      คลังไอดีเกมแท้
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                      คัดสรรไอดีคุณภาพ พร้อมรายละเอียด
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-4.5 rounded-2xl bg-[var(--stat-bg)] border border-[var(--border-soft)] hover:border-indigo-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 ease-out group flex flex-col justify-between transform-gpu">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-1">
                      ทักหาแอดมิน 1 คลิก
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                      ปุ่มทักหาแอดมินทาง Line / Facebook / Discord ได้ทันที
                    </p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-4.5 rounded-2xl bg-[var(--stat-bg)] border border-[var(--border-soft)] hover:border-pink-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 ease-out group flex flex-col justify-between transform-gpu">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-1">
                      ระบบปลอดภัย 100%
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                      มีประกันไอดี อนุมัติไว ข้อมูลแยกชัดเจน ไม่ปะปนกับผู้อื่น
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Banner Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-pink-950/60 border border-purple-500/40 flex items-center gap-4 backdrop-blur-md hover:border-purple-400/80 transition-all duration-300 group/banner shadow-xl shadow-purple-950/50">
              {/* Animated Mascot Logo Box with Glow Aura & Bounce Sparkle Badge */}
              <div className="relative shrink-0 group/mascot">
                {/* Ambient glowing aura */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-2xl blur-md opacity-75 group-hover/mascot:opacity-100 group-hover/banner:scale-110 transition-all duration-500 animate-pulse" />

                {/* Animated Mascot Frame */}
                <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden border-2 border-purple-200/90 shadow-2xl bg-slate-900 flex items-center justify-center transform group-hover/mascot:scale-110 group-hover/banner:rotate-3 transition-transform duration-300 ease-out will-change-transform">
                  <img
                    src="/logo.jpg"
                    alt="Jiksaw Shop Mascot Logo"
                    className="w-full h-full object-cover will-change-transform"
                    style={{ animation: 'smoothFloat 4s ease-in-out infinite' }}
                  />
                </div>

                {/* Floating Animated Sparkle Badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg text-[10px] animate-bounce z-10 border border-white/60">
                  ✨
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-purple-100 flex items-center gap-1.5 group-hover/banner:text-pink-300 transition-colors">
                  🚀 พร้อมใช้งานทันที
                </div>
                <div className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
                  เข้าสู่ระบบเพื่อเช็คยอดผ่อน หรือเลือกชมคลังไอดีของคุณ
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Main Action & Contact Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between panel p-6 sm:p-9 text-center relative overflow-hidden border-2 border-[var(--border-soft)] hover:border-cyan-400/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Top animated rainbow glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse" />

            <div>
              {/* Glowing Mascot Avatar with Rotating Neon Ring */}
              <div className="inline-flex items-center justify-center mb-6 relative group">
                {/* Ambient background glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                {/* Outer rotating neon border */}
                <div className="absolute -inset-1.5 rounded-3xl border-2 border-transparent border-t-cyan-400 border-r-purple-500 animate-spin" style={{ animationDuration: '3s' }} />

                {/* Mascot Image Box */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 dark:border-slate-800 bg-slate-900 z-10 transform transition-all duration-300 group-hover:scale-105 will-change-transform transform-gpu">
                  <img
                    src="/logo.jpg"
                    alt="Jiksaw Shop Logo"
                    className="w-full h-full object-cover will-change-transform"
                    style={{ animation: 'smoothFloat 4s ease-in-out infinite' }}
                  />
                </div>

                {/* Live badge overlay */}
                <div className="absolute -bottom-2.5 z-20 bg-black/80 backdrop-blur-md text-[10px] font-black text-cyan-300 px-3 py-0.5 rounded-full border border-cyan-400/40 shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>เปิดบริการ 24 ชม.</span>
                </div>
              </div>

              {/* Shimmer Title Header */}
              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight flex items-center justify-center gap-2">
                <span>🧩</span>
                <span className="shimmer-text">Jiksaw Shop</span>
              </h2>

              <p className="text-xs sm:text-sm mb-5 text-[var(--text-muted)] leading-relaxed font-semibold">
                🧾 ระบบเช็คยอดผ่อนชำระสินค้า & คลังไอดีเกมแท้
                <span className="block text-xs font-bold text-[var(--accent-blue)] mt-1 tracking-wide flex items-center justify-center gap-1">
                  <span>✨</span> สะดวก รวดเร็ว ปลอดภัย มีประกัน 100%
                </span>
              </p>

              {/* Feature highlights badge row */}
              <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 shadow-sm transition-transform hover:scale-105">
                  🎮 ไอดีเกมแท้
                </span>
                <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 shadow-sm transition-transform hover:scale-105">
                  ⚡ อนุมัติไว
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm transition-transform hover:scale-105">
                  🛡️ ปลอดภัย 100%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/customer"
                  className="btn-primary py-3.5 text-base font-extrabold flex items-center justify-center gap-2.5 group shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-out transform-gpu"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  👤 สำหรับลูกค้า (เช็คยอดผ่อน)
                </Link>

                <Link
                  href="/catalog"
                  className="btn-outline py-3.5 text-base font-extrabold flex items-center justify-center gap-2.5 !bg-[var(--accent-blue-soft)] !text-[var(--accent-blue)] !border-[var(--accent-blue)]/40 hover:!bg-[var(--accent-blue)] hover:!text-white group transition-all duration-300 ease-out hover:-translate-y-1 shadow-md transform-gpu"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  🎮 ดูไอดีเพิ่มเติม (เลือกดูสินค้า)
                </Link>

                <Link
                  href="/admin"
                  className="btn-outline py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all duration-300 ease-out transform-gpu"
                >
                  <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  🏪 สำหรับร้านค้า (ระบบแอดมิน)
                </Link>
              </div>
            </div>

            {/* Contact Channels */}
            <div className="mt-7 pt-5 border-t border-[var(--border-soft)] text-left">
              <h3 className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                ช่องทางการติดต่อร้านค้า
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=100089517474962"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 hover:-translate-y-1 transition-all duration-300 ease-out group shadow-sm transform-gpu"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-[#1877F2] transition-colors truncate">Facebook</div>
                    <div className="text-[9px] text-[var(--text-muted)] truncate font-medium">เพจหลักร้านค้า</div>
                  </div>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@jiksawshop33"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-pink-500/10 hover:border-pink-500/50 hover:-translate-y-1 transition-all duration-300 ease-out group shadow-sm transform-gpu"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md border border-white/20">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003.01 15.6a6.34 6.34 0 0010.86 4.47V12.1a8.3 8.3 0 005.72 2.26V10.9a4.83 4.83 0 01-3.77-1.42 4.78 4.78 0 01-1.23-2.79z" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-pink-400 transition-colors truncate">TikTok</div>
                    <div className="text-[9px] text-[var(--text-muted)] truncate font-medium">ติดตามผลงาน</div>
                  </div>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.gg/2N3VYEcCK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 hover:-translate-y-1 transition-all duration-300 ease-out group shadow-sm transform-gpu"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-[#5865F2] transition-colors truncate">Discord</div>
                    <div className="text-[9px] text-[var(--text-muted)] truncate font-medium">ชุมชนดิสคอร์ด</div>
                  </div>
                </a>

                {/* LINE */}
                <a
                  href="https://lin.ee/VjBjIVjU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#00B900]/10 hover:border-[#00B900]/50 hover:-translate-y-1 transition-all duration-300 ease-out group shadow-sm transform-gpu"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#00B900] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.34 10.03c0-4.43-4.52-8.03-10.09-8.03S-.84 5.6-.84 10.03c0 3.97 3.58 7.3 8.42 7.92.33.07.78.22.9.5.1.25.07.64.03.9-.06.4-.3 1.55-.35 1.88-.08.48-.37 1.88 1.63 1.03 2-1.03 5.4-3.18 7.37-5.44 1.43-1.63 2.18-3.38 2.18-5.79zm-13.4-1.34h-1.22c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4h-.82v-.8h.82c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4zm2.74 0c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h.4c.22 0 .4-.18.4-.4v-3.2c0-.22-.18-.4-.4-.4h-.4zm3.92 0h-1.22c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h.4c.22 0 .4-.18.4-.4v-1.6l1.02 1.76c.1.18.3.24.48.14.07-.04.12-.09.15-.15v-3.35c0-.22-.18-.4-.4-.4h-.43zm3.7.8h-1.22v.8h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4zm-1.22 1.6h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4h-1.22c-.22 0-.4.18-.4.4v3.2c0 .22.18.4.4.4h1.22c.22 0 .4-.18.4-.4v-.4c0-.22-.18-.4-.4-.4h-1.22v-.8z" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-[#00B900] transition-colors truncate">LINE</div>
                    <div className="text-[9px] text-[var(--text-muted)] truncate font-medium">ติดต่อแอดมิน</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-5 pt-4 border-t border-[var(--border-soft)] text-center">
              <p className="text-[11px] text-[var(--text-muted)] font-semibold flex items-center justify-center gap-1.5">
                <span>💖</span> Jiksaw Shop • บริการขายไอดีเกม & รับผ่อนชำระอันดับ 1
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

