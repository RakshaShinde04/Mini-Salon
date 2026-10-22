'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ServiceItem {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  serviceName: string;
  priceNote: string;
}

interface LuxeServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const LuxeServices: React.FC<LuxeServicesProps> = ({ onSelectService }) => {
  const serviceCards: ServiceItem[] = [
    {
      key: 'cut',
      title: 'CUT',
      subtitle: 'Precision cuts that define you.',
      image: '/images/cut.jpg',
      serviceName: 'Haircut',
      priceNote: 'Haircut ₹200 • Beard Trim ₹100',
    },
    {
      key: 'color',
      title: 'COLOR',
      subtitle: 'Rich, radiant color that turns heads.',
      image: '/images/color.jpg',
      serviceName: 'Hair Spa',
      priceNote: 'Hair Spa & Glaze from ₹800',
    },
    {
      key: 'style',
      title: 'STYLE',
      subtitle: 'Blowouts, waves & effortless styling.',
      image: '/images/style.jpg',
      serviceName: 'Bridal Makeup',
      priceNote: 'Facial ₹500 • Bridal Glam ₹5000',
    },
  ];

  return (
    <section id="services-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3E5E8] text-[#D4708A] text-xs font-bold tracking-wider uppercase border border-[#E8C5CC]">
          <span>Our Services</span>
          <span className="text-sm font-semibold">+</span>
        </div>
      </div>

      {/* 3 Photo Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceCards.map((card) => (
          <div
            key={card.key}
            onClick={() => onSelectService(card.serviceName)}
            className="group relative h-96 sm:h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#E8DDD4]"
          >
            {/* Background Image */}
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Top Database Price Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold border border-white/20">
                {card.priceNote}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between">
              <div>
                <h3 className="text-4xl font-extrabold text-white tracking-wider uppercase drop-shadow-md">
                  {card.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 max-w-[200px] font-medium leading-relaxed">
                  {card.subtitle}
                </p>
              </div>

              {/* Pink Round Arrow Button */}
              <div className="w-10 h-10 rounded-full bg-[#E892A2] group-hover:bg-[#d87588] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-[-45deg] transition-all shadow-lg">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
