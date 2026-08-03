'use client'

import { useEffect } from 'react'

interface ImageModalProps {
  src: string
  alt?: string
  onClose: () => void
}

export default function ImageModal({ src, alt = 'รูปภาพ', onClose }: ImageModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!src) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      {/* Container */}
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-1 text-white">
          <span className="text-xs font-semibold opacity-80 truncate max-w-[70%]">
            🖼️ {alt}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-colors font-medium flex items-center gap-1"
            >
              <span>↗</span> เปิดรูปในแท็บใหม่
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20 text-sm font-bold"
              title="ปิด (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Full Image Box */}
        <div className="relative max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.alt = 'ไม่สามารถโหลดรูปภาพได้'
            }}
          />
        </div>
      </div>
    </div>
  )
}
