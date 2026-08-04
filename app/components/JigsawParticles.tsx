'use client'

import { useState, useEffect } from 'react'

type Particle = {
  id: number
  x: number // percentage 0 - 100
  size: number // px font-size
  duration: number // seconds (5 - 12s)
  delay: number // seconds
  rotation: number // start angle
  sway: number // px side sway
  opacity: number
}

export default function JigsawParticles() {
  const [enabled, setEnabled] = useState<boolean>(true)
  const [particles, setParticles] = useState<Particle[]>([])

  // Load preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jigsaw_particles_enabled')
      if (saved !== null) {
        setEnabled(saved === 'true')
      }
    } catch {
      // Default enabled if localStorage unaccessible
    }
  }, [])

  // Generate particles list on mount
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const count = isMobile ? 12 : 22
    const items: Particle[] = []

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 95, // 0% to 95% left offset
        size: Math.floor(Math.random() * 16) + 16, // 16px to 32px
        duration: Math.random() * 7 + 6, // 6s to 13s
        delay: Math.random() * 8, // 0s to 8s initial delay
        rotation: Math.floor(Math.random() * 360),
        sway: (Math.random() - 0.5) * 60, // -30px to +30px sway
        opacity: Math.random() * 0.45 + 0.35, // 0.35 to 0.8
      })
    }
    setParticles(items)
  }, [])

  function toggleParticles() {
    const next = !enabled
    setEnabled(next)
    try {
      localStorage.setItem('jigsaw_particles_enabled', String(next))
    } catch {
      // Ignore
    }
  }

  return (
    <>
      {/* 🧩 Floating Toggle Control Button (Fixed at Bottom Right above footer) */}
      <button
        onClick={toggleParticles}
        title={enabled ? 'ปิดเอฟเฟกต์ชิ้นส่วนจิ๊กซอว์' : 'เปิดเอฟเฟกต์ชิ้นส่วนจิ๊กซอว์'}
        className={`fixed bottom-14 right-4 z-40 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md border shadow-xl flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 ${
          enabled
            ? 'bg-purple-950/85 text-purple-200 border-purple-500/60 shadow-purple-950/50 hover:border-pink-400'
            : 'bg-slate-900/80 text-slate-400 border-slate-700/80 hover:text-white'
        }`}
      >
        <span className={enabled ? 'animate-bounce text-sm' : 'text-sm opacity-60'}>🧩</span>
        <span className="hidden sm:inline font-bold">เอฟเฟกต์จิ๊กซอว์</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
          enabled ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' : 'bg-slate-800 text-slate-500'
        }`}>
          {enabled ? 'เปิด [ON]' : 'ปิด [OFF]'}
        </span>
      </button>

      {/* 🧩 Falling Jigsaw Particles Container */}
      {enabled && (
        <div
          className="fixed inset-0 overflow-hidden pointer-events-none z-10 contain-strict"
          aria-hidden="true"
        >
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute top-[-40px] will-change-transform select-none"
              style={{
                left: `${p.x}%`,
                fontSize: `${p.size}px`,
                opacity: p.opacity,
                filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))',
                animation: `jigsawFall ${p.duration}s linear ${p.delay}s infinite`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            >
              🧩
            </div>
          ))}

          {/* CSS Animation Keyframes for Falling & Swaying */}
          <style jsx global>{`
            @keyframes jigsawFall {
              0% {
                transform: translate3d(0, -50px, 0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 0.8;
              }
              50% {
                transform: translate3d(25px, 50vh, 0) rotate(180deg);
              }
              90% {
                opacity: 0.8;
              }
              100% {
                transform: translate3d(-15px, 105vh, 0) rotate(360deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
