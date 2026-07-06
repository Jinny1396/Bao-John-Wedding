import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Utensils, Info, Compass, ArrowRight } from 'lucide-react';

interface GatheringSectionProps {
  lang: 'VIE' | 'ENG';
  siteContent: {
    gatherHeadingEng?: string;
    gatherHeadingVie?: string;
    gatherSubtitleEng?: string;
    gatherSubtitleVie?: string;
    gatherDescEng?: string;
    gatherDescVie?: string;
    gatherCereTitleEng?: string;
    gatherCereTitleVie?: string;
    gatherCereDescEng?: string;
    gatherCereDescVie?: string;
    gatherFeastTitleEng?: string;
    gatherFeastTitleVie?: string;
    gatherFeastDescEng?: string;
    gatherFeastDescVie?: string;
    gatherNoteEng?: string;
    gatherNoteVie?: string;
    gatherMapPillEng?: string;
    gatherMapPillVie?: string;
    gatherLatitude?: string;
    gatherLongitude?: string;
    gatherDirectionsTextEng?: string;
    gatherDirectionsTextVie?: string;
    gatherDirectionsUrl?: string;
  };
}

export const GatheringSection = ({ lang, siteContent }: GatheringSectionProps) => {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  // Content fallbacks for localized display
  const title = lang === 'ENG' 
    ? siteContent.gatherHeadingEng || "Where the world slows down." 
    : siteContent.gatherHeadingVie || "Nơi thế giới ngừng trôi.";

  const subtitle = lang === 'ENG'
    ? siteContent.gatherSubtitleEng || "02 // The Gathering Grounds"
    : siteContent.gatherSubtitleVie || "02 // Địa Điểm Hội Tụ";

  const description = lang === 'ENG'
    ? siteContent.gatherDescEng || "The ceremony and celebratory feast will both be hosted at the Whispering Meadow Ranch. An isolated oasis wrapped in centuries-old fir pines, located thirty miles east of the Portland Gorge."
    : siteContent.gatherDescVie || "Lễ cưới và tiệc mừng hân hoan đều được tổ chức tại Whispering Meadow Ranch. Một ốc đảo bình yên ẩn mình giữa những hàng thông cổ thụ trăm tuổi, cách hẻm núi Portland ba mươi dặm về phía Đông.";

  const cereTitle = lang === 'ENG'
    ? siteContent.gatherCereTitleEng || "THE CEREMONY"
    : siteContent.gatherCereTitleVie || "LỄ THÀNH HÔN";

  const cereDesc = lang === 'ENG'
    ? siteContent.gatherCereDescEng || "Four P.M. Under the giant Oak on the West Ridge. Suitable footwear for mountain turf recommended."
    : siteContent.gatherCereDescVie || "Bốn giờ chiều. Dưới tán cây sồi cổ thụ tại West Ridge. Khách mời nên chọn trang phục và giày phù hợp với thảm cỏ tự nhiên.";

  const feastTitle = lang === 'ENG'
    ? siteContent.gatherFeastTitleEng || "THE GATHERING & FEAST"
    : siteContent.gatherFeastTitleVie || "TIỆC GIAO LƯU & CHIÊU ĐÃI";

  const feastDesc = lang === 'ENG'
    ? siteContent.gatherFeastDescEng || "To follow immediately within the wooden Glass Barn. Fine organic wines, locally-foraged culinary boards, clay ovens, forest breeze."
    : siteContent.gatherFeastDescVie || "Khai tiệc ngay sau đó tại Glass Barn gỗ ấm cúng. Trải nghiệm rượu vang hữu cơ thượng hạng, ẩm thực địa phương tinh túy và gió ngàn thông mát lành.";

  const noteText = lang === 'ENG'
    ? siteContent.gatherNoteEng || "Accommodation details & guidelines available upon request."
    : siteContent.gatherNoteVie || "Thông tin phòng lưu trú & hướng dẫn hành trình chi tiết luôn sẵn sàng khi bạn cần.";

  const mapPill = lang === 'ENG'
    ? siteContent.gatherMapPillEng || "INTERACTIVE MAP & TRAILS"
    : siteContent.gatherMapPillVie || "BẢN ĐỒ CHI TIẾT & LỐI ĐI";

  const latitude = siteContent.gatherLatitude || "Latitude: 45.4192° N";
  const longitude = siteContent.gatherLongitude || "Longitude: 122.1824° W";

  const directionsText = lang === 'ENG'
    ? siteContent.gatherDirectionsTextEng || "GET DIRECTIONS"
    : siteContent.gatherDirectionsTextVie || "CHỈ ĐƯỜNG CHI TIẾT";

  const directionsUrl = siteContent.gatherDirectionsUrl || "https://maps.google.com/?q=45.4192,-122.1824";

  return (
    <section 
      id="gathering-grounds" 
      className="w-full relative py-24 sm:py-32 md:py-36 bg-[#FAF9F5] text-[#3A2220] overflow-hidden px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 2xl:px-[240px] border-t border-black/5"
    >
      {/* Delicate paper grain overlay for textured aesthetic */}
      <div className="absolute inset-0 bg-white/[0.012] opacity-25 pointer-events-none mix-blend-overlay" />

      {/* Decorative leaf sketch backgrounds on outer boundaries */}
      <div className="absolute -left-12 top-10 w-44 h-72 opacity-[0.06] select-none pointer-events-none scale-x-[-1] rotate-12">
        <svg viewBox="0 0 100 200" fill="none" stroke="currentColor" className="w-full h-full text-[#3A2220]">
          <path d="M10 10 C 30 60, 10 130, 80 180 M 10 10 C 40 40, 60 90, 40 130 C 20 160, 40 180, 80 180" strokeWidth="0.8" strokeDasharray="3 3" />
          <path d="M30 60 C 15 80, 20 110, 35 115" strokeWidth="0.6" />
          <path d="M45 100 C 60 110, 50 130, 40 140" strokeWidth="0.6" />
        </svg>
      </div>

      <div className="absolute -right-16 bottom-16 w-52 h-80 opacity-[0.06] select-none pointer-events-none rotate-45">
        <svg viewBox="0 0 100 200" fill="none" stroke="currentColor" className="w-full h-full text-[#3A2220]">
          <path d="M10 10 C 30 60, 10 130, 80 180 M 10 10 C 40 40, 60 90, 40 130 C 20 160, 40 180, 80 180" strokeWidth="0.8" strokeDasharray="3 3" />
          <path d="M25 50 C 40 60, 35 80, 20 90" strokeWidth="0.6" />
          <path d="M50 110 C 65 125, 55 145, 45 155" strokeWidth="0.6" />
        </svg>
      </div>

      <div className="max-w-[1024px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left column: Text Information */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-5 space-y-8"
        >
          {/* Subtitle / Numbering Label */}
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] font-semibold text-stone-500 uppercase block">
              {subtitle}
            </span>
            <div className="w-8 h-[1px] bg-[#3A2220]/25 mt-1" />
          </div>

          {/* Large display elegant heading */}
          <h2 className="font-luxurious text-[100px] leading-[60px] font-light text-[#3A2220] tracking-tight">
            {title}
          </h2>

          {/* Description Paragraph */}
          <p className="font-crimson text-[12px] leading-[14px] text-stone-600 tracking-wide max-w-lg font-normal not-italic">
            {description}
          </p>

          {/* Location details split items */}
          <div className="space-y-6 pt-2">
            {/* The Ceremony block */}
            <div className="flex gap-4 items-start border-l border-[#3A2220]/15 pl-5 py-0.5 group">
              <div className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#3A2220]/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-[#3A2220]/75 group-hover:bg-[#3A2220]/5 transition-colors">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="font-crimson text-[12px] font-bold tracking-[0.18em] uppercase text-[#3A2220]">
                  {cereTitle}
                </h4>
                <p className="font-mono text-[9px] text-stone-600 leading-[12px] font-normal not-italic">
                  {cereDesc}
                </p>
              </div>
            </div>

            {/* The Feast block */}
            <div className="flex gap-4 items-start border-l border-[#3A2220]/15 pl-5 py-0.5 group">
              <div className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#3A2220]/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-[#3A2220]/75 group-hover:bg-[#3A2220]/5 transition-colors">
                <Utensils className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="font-crimson text-[12px] font-bold tracking-[0.18em] uppercase text-[#3A2220]">
                  {feastTitle}
                </h4>
                <p className="font-mono text-[9px] text-stone-600 leading-[12px] font-normal not-italic">
                  {feastDesc}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right column: Exquisite Interactive stylized map */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 w-full max-w-[600px] mx-auto"
        >
          <div 
            onClick={() => setHoveredPin(null)}
            className="relative rounded-[24px] border border-[#3A2220]/10 bg-[#FAF9F6] p-4 sm:p-5 shadow-sm overflow-hidden w-full aspect-[4/3] sm:aspect-auto sm:h-[430px] mx-auto flex flex-col justify-between"
          >
              {/* Fine grid/dots pattern overlay to enhance design details */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[radial-gradient(#3a2220_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Background Hand-Drawn Styled Vector Trail Map */}
              <svg 
                viewBox="0 0 600 450" 
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full text-stone-300 pointer-events-none select-none"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
              {/* Rivers / Curved Streams */}
              <path 
                d="M-50 350 C120 320, 250 180, 380 320 C450 380, 520 220, 650 180" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.3"
              />
              <path 
                d="M-50 356 C120 326, 250 186, 380 326 C450 386, 520 226, 650 186" 
                stroke="currentColor" 
                strokeWidth="0.6" 
                strokeDasharray="2 2"
                opacity="0.2"
              />

              {/* Trail / Paths */}
              <path 
                d="M100 50 L 500 400" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                opacity="0.45"
              />
              <path 
                d="M50 200 C 220 210, 320 180, 580 250" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                opacity="0.45"
              />
              <path 
                d="M320 -50 C 310 180, 350 300, 350 500" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                opacity="0.45"
              />

              {/* Minimal compass rose graphic at top-left quadrant */}
              <g transform="translate(85, 95)" opacity="0.6">
                <circle cx="0" cy="0" r="16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="currentColor" strokeWidth="0.6" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="currentColor" strokeWidth="0.6" />
                {/* Diamond Needle */}
                <polygon points="0,-18 3,0 0,3 -3,0" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" />
                <polygon points="0,18 3,0 0,-3 -3,0" fill="none" stroke="currentColor" strokeWidth="0.5" />
                {/* N indicator text */}
                <text x="0" y="-26" textAnchor="middle" className="font-mono text-[7px] font-bold fill-stone-500">N</text>
              </g>

              {/* Small direction pointers / trail arrows */}
              <g transform="translate(90, 160)" opacity="0.5">
                <path d="M0 12 L 10 0 L 20 12" stroke="currentColor" strokeWidth="0.8" />
                <line x1="10" y1="0" x2="10" y2="24" stroke="currentColor" strokeWidth="0.8" />
              </g>
              <g transform="translate(110, 175)" opacity="0.5">
                <line x1="0" y1="0" x2="0" y2="16" stroke="currentColor" strokeWidth="0.8" />
                <path d="M-4 6 L 0 0 L 4 6" stroke="currentColor" strokeWidth="0.8" />
              </g>

              <g transform="translate(460, 245)" opacity="0.5">
                <path d="M0 12 L 10 0 L 20 12" stroke="currentColor" strokeWidth="0.8" />
                <line x1="10" y1="0" x2="10" y2="24" stroke="currentColor" strokeWidth="0.8" />
              </g>

              {/* Text markings/landmarks */}
              <text x="510" y="160" textAnchor="middle" transform="rotate(32, 510, 160)" className="font-serif italic text-[7.5px] tracking-widest fill-stone-400 select-none">
                Whispering Forest Pass
              </text>
              <text x="495" y="115" textAnchor="middle" className="font-serif italic text-[7px] tracking-wide fill-stone-400 select-none">
                Siletz River Fork
              </text>
            </svg>

            {/* CARD TOP ROW: Interactive Map Badge Pill */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/95 border border-[#3A2220]/10 rounded-full py-1.5 px-3.5 flex items-center gap-2 text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-[#3A2220] shadow-[0_1.5px_4px_rgba(0,0,0,0.02)] select-none">
                <Compass className="w-3 h-3 text-[#3A2220]/80 animate-spin-slow" strokeWidth={1.5} />
                <span>{mapPill}</span>
              </div>
            </div>

            {/* CARD CENTRAL REGION: Floating Interactive Pin Nodes */}
            <div className="absolute inset-0 pointer-events-none">
              
              {/* Pin I: West Ridge (The Ceremony) */}
              <div 
                className="absolute pointer-events-auto cursor-pointer flex items-center justify-center w-10 h-10 -ml-5 -mt-5 z-20"
                style={{ left: '46%', top: '48%' }}
                onMouseEnter={() => setHoveredPin('ceremony')}
                onMouseLeave={() => setHoveredPin(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredPin(hoveredPin === 'ceremony' ? null : 'ceremony');
                }}
              >
                {/* Breathing Ripple Anchor dot */}
                <div className="relative w-2.5 h-2.5 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#3A2220] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3A2220]" />
                </div>

                {/* Info Tooltip Flag */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 transition-all duration-300 transform select-none ${
                  hoveredPin === 'ceremony' 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-1 opacity-0 scale-95 pointer-events-none'
                }`}>
                  <div className="relative bg-white/95 border border-[#3A2220]/10 py-1.5 px-2.5 rounded-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center flex flex-col pointer-events-none min-w-[130px] whitespace-nowrap">
                    <span className="font-mono text-[7px] font-bold tracking-[0.08em] uppercase text-[#3A2220]">
                      I. WEST RIDGE
                    </span>
                    <span className="font-serif italic text-[8.5px] text-stone-500 mt-0.5 leading-none">
                      {lang === 'ENG' ? "The Ceremony — 4:00 PM" : "Lễ cưới — 16:00"}
                    </span>
                    {/* Small downward triangle indicator */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border-r border-b border-[#3A2220]/10 rotate-45 -mt-[4px]" />
                  </div>
                </div>
              </div>

              {/* Pin II: The Glass Barn (The Feast) */}
              <div 
                className="absolute pointer-events-auto cursor-pointer flex items-center justify-center w-10 h-10 -ml-5 -mt-5 z-20"
                style={{ left: '55%', top: '28%' }}
                onMouseEnter={() => setHoveredPin('feast')}
                onMouseLeave={() => setHoveredPin(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredPin(hoveredPin === 'feast' ? null : 'feast');
                }}
              >
                {/* Breathing Ripple Anchor dot */}
                <div className="relative w-2.5 h-2.5 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#3A2220] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3A2220]" />
                </div>

                {/* Info Tooltip Flag */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 transition-all duration-300 transform select-none ${
                  hoveredPin === 'feast' 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-1 opacity-0 scale-95 pointer-events-none'
                }`}>
                  <div className="relative bg-white/95 border border-[#3A2220]/10 py-1.5 px-2.5 rounded-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center flex flex-col pointer-events-none min-w-[130px] whitespace-nowrap">
                    <span className="font-mono text-[7px] font-bold tracking-[0.08em] uppercase text-[#3A2220]">
                      II. THE GLASS BARN
                    </span>
                    <span className="font-serif italic text-[8.5px] text-stone-500 mt-0.5 leading-none">
                      {lang === 'ENG' ? "Feast & Hearth — 5:30 PM" : "Tiệc mừng — 17:30"}
                    </span>
                    {/* Small downward triangle indicator */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border-r border-b border-[#3A2220]/10 rotate-45 -mt-[4px]" />
                  </div>
                </div>
              </div>

            </div>

              {/* CARD BOTTOM ROW: Coordinates & Directions Button */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-[#3A2220]/5 mt-auto">
                {/* Dynamic GPS coordinate numbers label */}
                <div className="flex items-center gap-1.5 text-[#3A2220]/65 text-[8.5px] font-mono tracking-wider">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#3A2220]/80 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="uppercase">{latitude}, {longitude}</span>
                </div>

                {/* Action Get Directions CTA Link Button */}
                <a 
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[8.5px] font-mono tracking-[0.22em] text-[#3A2220] hover:text-[#3A2220]/75 transition-colors border-b border-[#3A2220]/35 hover:border-[#3A2220]/70 pb-0.5 cursor-pointer max-w-fit select-none font-bold"
                >
                  <span>{directionsText}</span>
                  <ArrowRight className="w-3 h-3 translate-y-[-0.5px]" strokeWidth={2} />
                </a>
              </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};
