'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LuxeBeforeAfterProps {
  onSeeMoreClick?: () => void;
}

export const LuxeBeforeAfter: React.FC<LuxeBeforeAfterProps> = ({ onSeeMoreClick }) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current || e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <section id="transformation-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F3EBE3] rounded-[2.5rem] p-6 sm:p-10 border border-[#E8DDD4]">
        {/* Left Column: Title & CTA (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDDD5] text-[#8C6D63] text-xs font-bold tracking-wider uppercase">
            <span>Before & After</span>
            <span className="text-sm font-semibold">+</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1412] tracking-tight uppercase leading-tight">
            BEFORE & AFTER<span className="text-[#E892A2]">+</span>
          </h2>

          <p className="text-sm text-[#5A4E49] font-medium leading-relaxed">
            Real transformations.
            <br />
            Real confidence.
          </p>

          <div className="pt-2">
            <button
              onClick={onSeeMoreClick}
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1A1412] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2E2522] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>See More Looks</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Comparison Slider (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div
            ref={containerRef}
            onMouseDown={() => {
              isDragging.current = true;
            }}
            onMouseUp={() => {
              isDragging.current = false;
            }}
            onMouseLeave={() => {
              isDragging.current = false;
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[2rem] overflow-hidden select-none cursor-ew-resize border-4 border-white shadow-xl bg-black"
          >
            {/* After Image (Background layer) */}
            <img
              src="/images/after.jpg"
              alt="After Luxe Hair Makeover"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* After Pill Tag */}
            <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#E892A2]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
              AFTER
            </span>

            {/* Before Image (Clipped layer) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src="/images/before.jpg"
                alt="Before Hair Makeover"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  width: containerRef.current ? containerRef.current.clientWidth : '100%',
                  maxWidth: 'none',
                }}
              />
              {/* Before Pill Tag */}
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow">
                BEFORE
              </span>
            </div>

            {/* Draggable Divider Handle Line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-lg pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Circular Divider Button */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#1A1412] shadow-xl flex items-center justify-center font-bold text-xs border border-[#E8DDD4]">
                <span>⬌</span>
              </div>
            </div>
          </div>

          {/* Slider Pagination indicator */}
          <div className="w-full flex items-center justify-between text-xs text-[#8C7A73] font-semibold mt-3 px-2">
            <span>← Drag slider to see full transformation →</span>
            <span className="font-mono">01 — 03</span>
          </div>
        </div>
      </div>
    </section>
  );
};
