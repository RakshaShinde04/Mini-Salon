'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LuxeHeroProps {
  onBookClick: () => void;
}

export const LuxeHero: React.FC<LuxeHeroProps> = ({ onBookClick }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Editorial Copy (7 cols) */}
        <div className="lg:col-span-6 space-y-6 lg:pr-4">
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3E5E8] text-[#D4708A] text-xs font-bold tracking-wider uppercase border border-[#E8C5CC]">
            <span>Welcome to Luxe</span>
            <span className="text-sm font-semibold">+</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#1A1412] leading-[1.05] uppercase">
            YOUR HAIR.
            <br />
            <span className="text-[#E892A2] block mt-1">YOUR ERA.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base font-semibold tracking-[0.25em] text-[#5A4E49] uppercase">
            Cut. Color. Confidence.
          </p>

          {/* CTA Button */}
          <div className="pt-2 flex items-center gap-4">
            <button
              id="hero-book-btn"
              onClick={onBookClick}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#1A1412] text-white font-bold text-sm tracking-wider uppercase hover:bg-[#2E2522] transition-all shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer"
            >
              <span>Book Your Look</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Hero Image with Circular Stamp Badge (6 cols) */}
        <div className="lg:col-span-6 relative">
          {/* Hero Portrait Container */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-[#F3EBE3]">
            <img
              src="/images/hero.jpg"
              alt="Luxe Hair Studio Model"
              className="w-full h-auto object-cover rounded-[2.5rem] aspect-[4/3] sm:aspect-[16/11] hover:scale-102 transition-transform duration-700"
            />
          </div>

          {/* Rotating Circular Stamp Badge */}
          <div className="absolute -bottom-6 -left-6 sm:bottom-4 sm:-left-8 z-20 pointer-events-none">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              {/* Rotating SVG Ring */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full animate-spin-slow text-[#1A1412]"
              >
                <path
                  id="textCircle"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="text-[7.5px] font-bold tracking-[0.22em] uppercase fill-[#1A1412]">
                  <textPath href="#textCircle" startOffset="0%">
                    ★ TRENDING ★ THIS SEASON ★ NEW LOOKS
                  </textPath>
                </text>
              </svg>

              {/* Center Pink Badge */}
              <div className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#E892A2] text-white flex flex-col items-center justify-center shadow-lg border-2 border-white">
                <span className="text-[9px] font-bold tracking-wider uppercase leading-none">
                  NEW
                </span>
                <span className="text-[11px] font-extrabold tracking-wider uppercase leading-none mt-0.5">
                  LOOKS
                </span>
                <Sparkles className="w-2.5 h-2.5 text-white/90 mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
