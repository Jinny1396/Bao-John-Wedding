import React, { useState, useEffect } from 'react';

interface CountdownSectionProps {
  lang: 'VIE' | 'ENG';
  targetDate?: string;
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
    : (lang === 'VIE' ? "BẢO & JOHN" : "BAO & JOHN");

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
      className="w-full relative overflow-hidden flex flex-col items-center justify-center py-20 sm:py-28 md:py-32 px-6 sm:px-12 text-[#3A2220] transition-all duration-500 bg-[radial-gradient(circle_at_center,_#FCFBFA_10%,_#EAE4E5_42%,_#C6B2B5_72%,_#9B8084_100%)] select-none"
      style={{ height: heightVal }}
    >
      {/* 4. Fine Organic Paper Texture overlay */}
      <div className="absolute inset-0 bg-white/[0.015] opacity-35 pointer-events-none mix-blend-overlay" />

      {/* Corners - Top Left & Top Right */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#3A2220]/75 uppercase">
        {displayMonth}
      </div>
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#3A2220]/75 uppercase">
        {displayYear}
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center space-y-8 sm:space-y-12 md:space-y-14">
        
        {/* Calligraphic Script Title */}
        <h2 className="font-script-elegant text-[54px] sm:text-[76px] md:text-[96px] lg:text-[112px] xl:text-[124px] text-[#3A2220] font-light leading-none capitalize tracking-normal text-center select-none pt-4">
          {lang === 'VIE' ? (titleVie || "Cùng đếm ngược") : (titleEng || "Let's the countdown")}
        </h2>

        {/* Timer Block */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-10 lg:gap-14 max-w-2xl mx-auto w-full">
          {/* DAYS */}
          <div className="flex flex-col items-center min-w-[55px] sm:min-w-[80px] md:min-w-[100px]">
            <span className="font-serif italic font-light text-4xl sm:text-6xl md:text-7xl lg:text-[85px] leading-none text-[#3A2220] tracking-tight">
              {isMounted ? days : "00"}
            </span>
            <span className="font-mono text-[7px] sm:text-[8.5px] tracking-[0.2em] text-[#3A2220]/65 uppercase mt-3">
              {t.days}
            </span>
          </div>

          {/* DIVIDER 1 */}
          <div className="h-10 sm:h-16 md:h-20 w-[1px] bg-[#3A2220]/15 self-center -translate-y-3" />

          {/* HOURS */}
          <div className="flex flex-col items-center min-w-[55px] sm:min-w-[80px] md:min-w-[100px]">
            <span className="font-serif italic font-light text-4xl sm:text-6xl md:text-7xl lg:text-[85px] leading-none text-[#3A2220] tracking-tight">
              {isMounted ? String(hours).padStart(2, '0') : "00"}
            </span>
            <span className="font-mono text-[7px] sm:text-[8.5px] tracking-[0.2em] text-[#3A2220]/65 uppercase mt-3">
              {t.hours}
            </span>
          </div>

          {/* DIVIDER 2 */}
          <div className="h-10 sm:h-16 md:h-20 w-[1px] bg-[#3A2220]/15 self-center -translate-y-3" />

          {/* MINUTES */}
          <div className="flex flex-col items-center min-w-[55px] sm:min-w-[80px] md:min-w-[100px]">
            <span className="font-serif italic font-light text-4xl sm:text-6xl md:text-7xl lg:text-[85px] leading-none text-[#3A2220] tracking-tight">
              {isMounted ? String(minutes).padStart(2, '0') : "00"}
            </span>
            <span className="font-mono text-[7px] sm:text-[8.5px] tracking-[0.2em] text-[#3A2220]/65 uppercase mt-3">
              {t.minutes}
            </span>
          </div>

          {/* DIVIDER 3 */}
          <div className="h-10 sm:h-16 md:h-20 w-[1px] bg-[#3A2220]/15 self-center -translate-y-3" />

          {/* SECONDS */}
          <div className="flex flex-col items-center min-w-[55px] sm:min-w-[80px] md:min-w-[100px]">
            <span className="font-serif italic font-light text-4xl sm:text-6xl md:text-7xl lg:text-[85px] leading-none text-[#3A2220] tracking-tight">
              {isMounted ? String(seconds).padStart(2, '0') : "00"}
            </span>
            <span className="font-mono text-[7px] sm:text-[8.5px] tracking-[0.2em] text-[#3A2220]/65 uppercase mt-3">
              {t.seconds}
            </span>
          </div>
        </div>

        {/* Location Columns */}
        <div className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-4 text-center text-[#3A2220]/75 font-mono text-[8px] sm:text-[9.5px] tracking-[0.22em] uppercase leading-relaxed pt-6 sm:pt-10">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="font-semibold text-[#3A2220]">{loc1City || "DANANG"}</p>
            <p className="text-[#3A2220]/50 font-normal">{loc1Country || "VIETNAM"}</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="font-semibold text-[#3A2220]">{loc2City || "TOKYO"}</p>
            <p className="text-[#3A2220]/50 font-normal">{loc2Country || "JAPAN"}</p>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="font-semibold text-[#3A2220]">{loc3City || "CITY"}</p>
            <p className="text-[#3A2220]/50 font-normal">{loc3Country || "ENGLAND"}</p>
          </div>
        </div>

        {/* Calligraphic Script Bottom Line */}
        <h2 className="font-script-elegant text-[62px] sm:text-[82px] md:text-[102px] lg:text-[118px] xl:text-[132px] text-[#3A2220] font-light leading-none lowercase tracking-normal text-center select-none -mt-4">
          {lang === 'VIE' ? (endTitleVie || "bắt đầu") : (endTitleEng || "begin")}
        </h2>

      </div>

      {/* Corners - Bottom Left & Bottom Right */}
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#3A2220]/75 uppercase">
        {coupleNames}
      </div>
      <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 font-mono text-[8px] sm:text-[9.5px] tracking-[0.25em] text-[#3A2220]/75 uppercase">
        {sinceText || "SINCE 2022"}
      </div>
    </section>
  );
}
