import Link from 'next/link'

export default function Home() {
  const tickerItems = [
    { text: '💬 มีปัญหาติดต่อได้เลยที่เพจ JiksawShop', color: 'text-pink-400 font-extrabold' },
    { text: '⚡ ระบบบันทึกกำไร & ยอดผ่อนชำระ Realtime', color: 'text-cyan-300 font-bold' },
    { text: '☁️ Supabase Cloud Database Realtime', color: 'text-purple-300 font-semibold' },
    { text: '💖 Credit Created By Sakchawit Jiksaw Shop', color: 'text-amber-300 font-bold' },
    { text: '🎮 Jiksaw Shop • บริการขายไอดีเกม & รับผ่อนชำระอันดับ 1', color: 'text-emerald-400 font-semibold' },
  ]

  return (
    <main className="min-h-screen flex flex-col justify-between px-4 pt-6 pb-14 relative overflow-hidden">
      <div className="max-w-6xl w-full mx-auto my-auto py-4" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Showcase Hero Panel (Seamless Floating Layout like reference site) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-2 sm:p-4">
            <div>
              {/* Top Badge */}
              <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 shadow-lg backdrop-blur-md">
                <span className="text-xs">🔥</span>
                <span className="text-xs sm:text-sm font-extrabold text-purple-200 tracking-wide">
                  ระบบจัดการรายรับ & ยอดผ่อนอันดับ 1
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-[1.1] mb-3">
                PROFIT &<br />
                INSTALLMENT<br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                  TRACKER
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-semibold max-w-xl mb-6">
                ระบบบริหารจัดการสรุปกำไรขายออก สรุปยอดขายประจำเดือน และติดตามยอดค้างผ่อนของลูกค้าแบบเรียลไทม์
              </p>

              {/* 4 Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
                {/* Card 1 */}
                <div className="p-4 rounded-2xl bg-[#0e1120]/80 border border-slate-800/80 hover:border-emerald-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 ease-out group backdrop-blur-md transform-gpu">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5">
                    คำนวณกำไรเรียลไทม์
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    สรุปกำไรสุทธิและต้นทุนแยกตามหมวดหมู่
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-4 rounded-2xl bg-[#0e1120]/80 border border-slate-800/80 hover:border-purple-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 ease-out group backdrop-blur-md transform-gpu">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2.5 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5">
                    วิเคราะห์กราฟยอดขาย
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    คำนวณกราฟเส้นและกราฟวงกลมประจำเดือน
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-4 rounded-2xl bg-[#0e1120]/80 border border-slate-800/80 hover:border-indigo-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 ease-out group backdrop-blur-md transform-gpu">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2.5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5">
                    ทักหาลูกค้าใน 1 คลิก
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    ปุ่มทักหาลูกค้าทาง Line / Facebook ได้ทันที
                  </p>
                </div>

                {/* Card 4 */}
                <div className="p-4 rounded-2xl bg-[#0e1120]/80 border border-slate-800/80 hover:border-pink-400/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 ease-out group backdrop-blur-md transform-gpu">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-2.5 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white mb-0.5">
                    แยกข้อมูลรายบัญชี
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    สมัครใหม่รับกระดานเปล่า ไม่ปะปนกับผู้อื่น
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Banner Bar */}
            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-pink-950/60 border border-purple-500/40 flex items-center gap-3.5 backdrop-blur-md hover:border-purple-400/80 transition-all duration-300 group/banner shadow-lg shadow-purple-950/50">
              {/* Animated Mascot Logo Box */}
              <div className="relative shrink-0 group/mascot">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-xl blur-sm opacity-75 group-hover/mascot:opacity-100 group-hover/banner:scale-105 transition-all duration-500 animate-pulse" />

                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border-2 border-purple-200/90 shadow-lg bg-slate-900 flex items-center justify-center transform group-hover/mascot:scale-105 group-hover/banner:rotate-2 transition-transform duration-300 ease-out will-change-transform">
                  <img
                    src="/logo.jpg"
                    alt="Jiksaw Shop Mascot Logo"
                    className="w-full h-full object-cover will-change-transform"
                    style={{ animation: 'smoothFloat 4s ease-in-out infinite' }}
                  />
                </div>

                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md text-[9px] animate-bounce z-10 border border-white/60">
                  ✨
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-purple-100 flex items-center gap-1 group-hover/banner:text-pink-300 transition-colors">
                  🚀 พร้อมใช้งานทันที
                </div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">
                  เข้าสู่ระบบเพื่อเริ่มยอดกำไรและผ่อนสินค้าของคุณ
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Neon Glowing Card Panel (Reference Style from user image) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#0a0c18]/90 border-2 border-purple-500/70 hover:border-pink-500/80 p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.35)] backdrop-blur-xl transition-all duration-500">
            {/* Top animated rainbow glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse" />

            <div>
              {/* Glowing Mascot Avatar with Rotating Neon Ring */}
              <div className="inline-flex items-center justify-center mb-6 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                <div className="absolute -inset-1.5 rounded-3xl border-2 border-transparent border-t-cyan-400 border-r-pink-500 animate-spin" style={{ animationDuration: '3s' }} />

                <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/90 bg-slate-900 z-10 transform transition-all duration-300 group-hover:scale-105 will-change-transform transform-gpu">
                  <img
                    src="/logo.jpg"
                    alt="Jiksaw Shop Logo"
                    className="w-full h-full object-cover will-change-transform"
                    style={{ animation: 'smoothFloat 4s ease-in-out infinite' }}
                  />
                </div>

                <div className="absolute -bottom-2.5 z-20 bg-black/90 backdrop-blur-md text-[10px] font-black text-cyan-300 px-3 py-0.5 rounded-full border border-cyan-400/50 shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>เปิดบริการ 24 ชม.</span>
                </div>
              </div>

              {/* Shimmer Title Header */}
              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight flex items-center justify-center gap-2">
                <span>🧩</span>
                <span className="shimmer-text">Jiksaw Shop</span>
              </h2>

              <p className="text-xs sm:text-sm mb-4 text-[var(--text-muted)] leading-relaxed font-semibold">
                🧾 ระบบเช็คยอดผ่อนชำระสินค้า & คลังไอดีเกมแท้
                <span className="block text-xs font-bold text-[var(--accent-blue)] mt-1 tracking-wide flex items-center justify-center gap-1">
                  <span>✨</span> สะดวก รวดเร็ว ปลอดภัย มีประกัน 100%
                </span>
              </p>

              {/* Feature highlights badge row */}
              <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
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
                  className="btn-primary py-3.5 text-base font-extrabold flex items-center justify-center gap-2.5 group shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out transform-gpu"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  👤 สำหรับลูกค้า (เช็คยอดผ่อน)
                </Link>

                <Link
                  href="/catalog"
                  className="btn-outline py-3.5 text-base font-extrabold flex items-center justify-center gap-2.5 !bg-[var(--accent-blue-soft)] !text-[var(--accent-blue)] !border-[var(--accent-blue)]/40 hover:!bg-[var(--accent-blue)] hover:!text-white group transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-md transform-gpu"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  🎮 ดูไอดีเพิ่มเติม (เลือกดูสินค้า)
                </Link>

                <Link
                  href="/admin"
                  className="btn-outline py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-300 ease-out transform-gpu"
                >
                  <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  🏪 สำหรับร้านค้า (ระบบแอดมิน)
                </Link>
              </div>
            </div>

            {/* Contact Channels */}
            <div className="mt-6 pt-4 border-t border-[var(--border-soft)] text-left">
              <h3 className="text-[11px] font-extrabold text-pink-400 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
                <span>💬</span>
                มีปัญหาติดต่อได้เลยที่เพจ JiksawShop
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=100089517474962"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 hover:-translate-y-0.5 transition-all duration-300 ease-out group shadow-sm transform-gpu"
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
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-pink-500/10 hover:border-pink-500/50 hover:-translate-y-0.5 transition-all duration-300 ease-out group shadow-sm transform-gpu"
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
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 hover:-translate-y-0.5 transition-all duration-300 ease-out group shadow-sm transform-gpu"
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
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[var(--border-soft)] bg-[var(--stat-bg)] hover:bg-[#00B900]/10 hover:border-[#00B900]/50 hover:-translate-y-0.5 transition-all duration-300 ease-out group shadow-sm transform-gpu"
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
          </div>

        </div>
      </div>

      {/* Fixed Bottom Scrolling Marquee Ticker Bar (Exact reference style from profit-installment.vercel.app) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#060814]/90 backdrop-blur-md border-t border-purple-500/30 py-2 overflow-hidden shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap px-4">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className={`text-xs flex items-center gap-2 ${item.color}`}>
              {item.text}
            </span>
          ))}
        </div>
      </footer>
    </main>
  )
}


