import React, { useState, useEffect } from 'react';

interface CountdownSectionProps {
  lang: 'VIE' | 'ENG';
  targetDate?: string;
  bgUrl?: string;
  brideName?: string;
  groomName?: string;
  titleEng?: string;
  titleVie?: string;
  endTitleEng?: string;
  endTitleVie?: string;
  loc1City?: string;
  loc1Country?: string;
  loc2City?: string;
  loc2Country?: string;
  loc3City?: string;
  loc3Country?: string;
  sinceText?: string;
  countdownHeight?: string;
}

export default function CountdownSection({ 
  lang, 
  targetDate, 
  bgUrl,
  brideName, 
  groomName,
  titleEng,
  titleVie,
  endTitleEng,
  endTitleVie,
  loc1City,
  loc1Country,
  loc2City,
  loc2Country,
  loc3City,
  loc3Country,
  sinceText,
  countdownHeight
}: CountdownSectionProps) {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Target Date from CMS, with default fallback
    const targetDateStr = targetDate || "2027-10-10T17:00:00";
    const targetTimeMs = new Date(targetDateStr).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetTimeMs - now;

      if (difference <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    };

    // Calculate immediately on mount
    calculateTimeLeft();

    const intervalId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  const dateObj = targetDate ? new Date(targetDate) : new Date("2027-10-10T17:00:00");
  const monthNamesEng = ["MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER", "JANUARY", "FEBRUARY"];
  const monthNamesVie = ["THÁNG 3", "THÁNG 4", "THÁNG 5", "THÁNG 6", "THÁNG 7", "THÁNG 8", "THÁNG 9", "THÁNG 10", "THÁNG 11", "THÁNG 12", "THÁNG 1", "THÁNG 2"];
  
  const displayMonth = isNaN(dateObj.getTime()) 
    ? (lang === 'VIE' ? "THÁNG 3" : "MARCH") 
    : (lang === 'VIE' ? monthNamesVie[dateObj.getMonth()] : monthNamesEng[dateObj.getMonth()]);
    
  const displayYear = isNaN(dateObj.getTime()) ? "2027" : String(dateObj.getFullYear());

  const coupleNames = (brideName && groomName) 
    ? `${brideName} & ${groomName}` 
    : (lang === 'VIE' ? "BẢO & JON" : "BAO & JON");

  const t = {
    ENG: {
      days: "DAYS",
      hours: "HOURS",
      minutes: "MINUTES",
      seconds: "SECONDS",
    },
    VIE: {
      days: "NGÀY",
      hours: "GIỜ",
      minutes: "PHÚT",
      seconds: "GIÂY",
    }
  }[lang];

  const heightVal = countdownHeight 
    ? (countdownHeight.endsWith('px') || countdownHeight.endsWith('%') || countdownHeight.endsWith('vh') || countdownHeight.endsWith('rem') ? countdownHeight : `${countdownHeight}px`)
    : '800px';

  return (
    <section 
      id="countdown"
      className="w-full relative overflow-hidden flex flex-col items-center justify-center py-12 sm:py-28 md:py-32 px-6 sm:px-12 text-[#362223] transition-all duration-500 bg-[radial-gradient(circle_at_center,_#FCFBFA_10%,_#EAE4E5_42%,_#C6B2B5_72%,_#9B8084_100%)] select-none h-auto min-h-[100dvh] sm:h-[var(--countdown-height)]"
      style={{ 
        '--countdown-height': heightVal, 
        paddingLeft: '20px', 
        paddingRight: '20px' 
      } as React.CSSProperties}
    >
      {bgUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={bgUrl} 
            alt="Countdown Background" 
            className="w-full h-full object-cover pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 4. Fine Organic Paper Texture overlay */}
      <div className="absolute inset-0 bg-white/[0.015] opacity-35 pointer-events-none mix-blend-overlay" />

      {/* Corners - Top Left & Top Right */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#362223]/75 uppercase">
        {displayMonth}
      </div>
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#362223]/75 uppercase">
        {displayYear}
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full flex-1 max-w-full mx-auto flex flex-col items-center justify-between py-6 sm:py-0">
        
        {/* Calligraphic Script Title */}
        <h2 
          className="font-luxurious text-[#362223] font-light leading-[80px] sm:leading-none capitalize tracking-normal text-center select-none mt-0 mb-10 pt-0 whitespace-normal break-words px-4 w-full text-[103px] sm:text-[clamp(100px,_15.6vw,_300px)]"
          style={{ width: '100%', maxWidth: '100%', height: '200px' }}
        >
          {lang === 'VIE' ? (titleVie || "Cùng đếm ngược") : (titleEng || "Let's the countdown")}
        </h2>

        {/* Center Group: Timer & Location */}
        <div className="flex flex-col items-center gap-6 sm:gap-9 md:gap-12 w-full">
          {/* Timer Block */}
          <div className="flex items-center justify-center gap-[4.8px] sm:gap-[7.2px] md:gap-3 lg:gap-[16.8px] max-w-2xl mx-auto w-full mb-[10px]">
            {/* DAYS */}
            <div className="flex flex-col items-center min-w-[28px] sm:min-w-[40px] md:min-w-[50px] mr-0 sm:ml-0 sm:mr-[10px]">
              <span className="font-serif italic font-light text-[40px] sm:text-[70px] md:text-[70px] lg:text-[70px] leading-none text-[#362223] tracking-tight">
                {isMounted ? days : "00"}
              </span>
              <span className="font-crimson text-[10px] sm:text-[12px] tracking-[0.2em] text-[#362223]/65 uppercase mt-0.5">
                {t.days}
              </span>
            </div>

            {/* HOURS */}
            <div className="flex flex-col items-center min-w-[28px] sm:min-w-[40px] md:min-w-[50px] mr-0 sm:mr-[10px]">
              <span className="font-serif italic font-light text-[40px] sm:text-[70px] md:text-[70px] lg:text-[70px] leading-none text-[#362223] tracking-tight">
                {isMounted ? String(hours).padStart(2, '0') : "00"}
              </span>
              <span className="font-crimson text-[10px] sm:text-[12px] tracking-[0.2em] text-[#362223]/65 uppercase mt-0.5">
                {t.hours}
              </span>
            </div>

            {/* MINUTES */}
            <div className="flex flex-col items-center min-w-[28px] sm:min-w-[40px] md:min-w-[50px] mr-0 sm:mr-[10px] pl-[1px] sm:pl-0">
              <span className="font-serif italic font-light text-[40px] sm:text-[70px] md:text-[70px] lg:text-[70px] leading-none text-[#362223] tracking-tight">
                {isMounted ? String(minutes).padStart(2, '0') : "00"}
              </span>
              <span className="font-crimson text-[10px] sm:text-[12px] tracking-[0.2em] text-[#362223]/65 uppercase mt-0.5">
                {t.minutes}
              </span>
            </div>

            {/* SECONDS */}
            <div className="flex flex-col items-center min-w-[28px] sm:min-w-[40px] md:min-w-[50px]">
              <span className="font-serif italic font-light text-[40px] sm:text-[70px] md:text-[70px] lg:text-[70px] leading-none text-[#362223] tracking-tight">
                {isMounted ? String(seconds).padStart(2, '0') : "00"}
              </span>
              <span className="font-crimson text-[10px] sm:text-[12px] tracking-[0.2em] text-[#362223]/65 uppercase mt-0.5">
                {t.seconds}
              </span>
            </div>
          </div>

          {/* Location Columns */}
          <div className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-1 sm:gap-2 text-center text-[#362223]/75 font-mono text-[8px] sm:text-[9.5px] tracking-[0.22em] uppercase leading-relaxed pt-0">
            <div className="space-y-0 sm:space-y-0.5">
              <p className="font-crimson font-normal text-[10px] sm:text-[12px] text-[#362223] leading-none">{loc1City || "DANANG"}</p>
              <p className="font-crimson text-[10px] sm:text-[12px] text-[#362223]/50 leading-none">{loc1Country || "VIETNAM"}</p>
            </div>
            <div className="space-y-0 sm:space-y-0.5">
              <p className="font-crimson font-normal text-[10px] sm:text-[12px] text-[#362223] leading-none">{loc2City || "TOKYO"}</p>
              <p className="font-crimson text-[10px] sm:text-[12px] text-[#362223]/50 leading-none">{loc2Country || "JAPAN"}</p>
            </div>
            <div className="space-y-0 sm:space-y-0.5">
              <p className="font-crimson font-normal text-[10px] sm:text-[12px] text-[#362223] leading-none">{loc3City || "CITY"}</p>
              <p className="font-crimson text-[10px] sm:text-[12px] text-[#362223]/50 leading-none">{loc3Country || "ENGLAND"}</p>
            </div>
          </div>
        </div>

        {/* Calligraphic Script Bottom Line */}
        <h2 
          className="font-luxurious text-[#362223] font-light leading-none lowercase tracking-normal text-center select-none mt-10 mb-0 pb-0 whitespace-normal break-words px-4 w-full text-[103px] sm:text-[clamp(100px,_15.6vw,_300px)]"
          style={{ width: '100%', maxWidth: '100%', height: '200px' }}
        >
          {lang === 'VIE' ? (endTitleVie || "bắt đầu") : (endTitleEng || "begin")}
        </h2>

      </div>

      {/* Corners - Bottom Left & Bottom Right */}
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#362223]/75 uppercase w-[120px] sm:w-auto">
        {coupleNames}
      </div>
      <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#362223]/75 uppercase">
        {sinceText || "SINCE 2022"}
      </div>
    </section>
  );
}
