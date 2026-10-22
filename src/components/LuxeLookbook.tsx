'use client';

import React from 'react';
import { ArrowRight, Sparkles, Camera } from 'lucide-react';

interface LuxeLookbookProps {
  onBookClick?: () => void;
}

export const LuxeLookbook: React.FC<LuxeLookbookProps> = ({ onBookClick }) => {
  const looks = [
    { id: 1, image: '/images/updo.jpg', tag: 'TRENDING', title: 'Bridal Updo' },
    { id: 2, image: '/images/color.jpg', tag: 'NEW LOOK', title: 'Honey Balayage' },
    { id: 3, image: '/images/cut.jpg', tag: 'SIGNATURE', title: 'Textured Bob' },
    { id: 4, image: '/images/style.jpg', tag: 'POPULAR', title: 'Glamour Blowout' },
    { id: 5, image: '/images/hero.jpg', tag: 'SPOTLIGHT', title: 'Luxe Waves' },
  ];

  return (
    <section id="looks-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading & Instagram Link (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E5E8] text-[#D4708A] text-xs font-bold tracking-wider uppercase border border-[#E8C5CC]">
            <span>Insta Glam</span>
            <span className="text-sm font-semibold">+</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1412] tracking-tight uppercase leading-tight">
            INSTA GLAM<span className="text-[#E892A2]">+</span>
          </h2>

          <p className="text-sm text-[#5A4E49] font-medium leading-relaxed">
            Fresh looks from our studio.
            <br />
            Tag us to get featured in our seasonal gallery.
          </p>

          <div className="pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F3EBE3] hover:bg-[#EBDDD5] text-[#1A1412] text-xs font-bold uppercase tracking-wider border border-[#E8DDD4] transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#E892A2]"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>Follow @Luxe.Studio</span>
            </a>
          </div>
        </div>

        {/* Right Column: Lookbook Thumbnails Grid (8 cols) */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {looks.map((look) => (
              <div
                key={look.id}
                onClick={onBookClick}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-[#E8DDD4] bg-[#F3EBE3]"
              >
                <img
                  src={look.image}
                  alt={look.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Badge Tag */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-[#E892A2]/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
                    {look.tag}
                  </span>
                </div>

                {/* Title at bottom */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                  <span className="text-[11px] font-bold text-white block truncate">
                    {look.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
