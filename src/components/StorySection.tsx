import { useEffect, useRef } from 'react';

interface StorySectionProps {
  lang: 'ENG' | 'VIE';
  leftPortraitUrl?: string;
  rightPortraitUrl?: string;
  storyThreeUrl?: string;
  storyFourUrl?: string;
  storyFiveUrl?: string;
  brideName?: string;
  groomName?: string;
  invitationText?: string;
  venueName?: string;
  weddingDateShort?: string;
}

export const StorySection = ({ 
  lang, 
  leftPortraitUrl, 
  rightPortraitUrl,
  storyThreeUrl,
  storyFourUrl,
  storyFiveUrl,
  brideName,
  groomName,
  invitationText,
  venueName,
  weddingDateShort
}: StorySectionProps) => {
  const storySectionRef = useRef<HTMLDivElement>(null);
  const stickyTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStickyScroll = () => {
      const section = storySectionRef.current;
      const textWrapper = stickyTextRef.current;
      if (!section || !textWrapper) return;

      // Match responsive breakpoint: Disable sticky on screens narrower than 768px (iPad portrait and mobile)
      if (window.innerWidth < 768) {
        textWrapper.style.position = 'static';
        textWrapper.style.top = '';
        textWrapper.style.bottom = '';
        textWrapper.style.left = '';
        textWrapper.style.transform = 'none';
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const sectionStart = rect.top + scrollTop;
      const sectionHeight = rect.height;
      const sectionEnd = sectionStart + sectionHeight;
      const scrollPos = scrollTop + window.innerHeight / 2;

      // Spacing buffers for top/bottom margins
      const activeStartBuffer = sectionStart + 150;
      const activeEndBuffer = sectionEnd - 200;

      if (scrollPos > activeStartBuffer && scrollPos < activeEndBuffer) {
        // User is scrolling through the middle of the section: PIN the invitation text fixed in the center
        textWrapper.style.position = 'fixed';
        textWrapper.style.top = '50%';
        textWrapper.style.bottom = '';
        textWrapper.style.left = '50%';
        textWrapper.style.transform = 'translate(-50%, -50%)';
      } else if (scrollPos >= activeEndBuffer) {
        // User scrolled past: lock text absolute near the bottom of section
        textWrapper.style.position = 'absolute';
        textWrapper.style.top = 'auto';
        textWrapper.style.bottom = '180px'; // Matching the bottom padding
        textWrapper.style.left = '50%';
        textWrapper.style.transform = 'translate(-50%, 0)';
      } else {
        // User hasn't reached scrolling trigger zone: lock absolute at top of section
        textWrapper.style.position = 'absolute';
        textWrapper.style.top = '220px';
        textWrapper.style.bottom = '';
        textWrapper.style.left = '50%';
        textWrapper.style.transform = 'translate(-50%, 0)';
      }
    };

    window.addEventListener('scroll', handleStickyScroll, { passive: true });
    window.addEventListener('resize', handleStickyScroll);
    
    // Trigger layout pass initial offset
    const timer = setTimeout(handleStickyScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleStickyScroll);
      window.removeEventListener('resize', handleStickyScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section 
      id="story" 
      ref={storySectionRef} 
      className="story-section w-full relative overflow-hidden transition-colors duration-500 py-12 md:py-0 md:h-[1500px]"
      style={{ backgroundColor: '#F6E1E2' }}
    >
      <div className="story-content w-full max-w-7xl mx-auto relative px-4 sm:px-6 md:px-12">
        
        {/* STICKY TEXT WRAPPER - JavaScript-driven fixed coordinates */}
        <div 
          ref={stickyTextRef} 
          className="text-wrapper text-center select-none w-full max-w-lg md:max-w-xl mx-auto" 
          id="stickyText"
          style={{ zIndex: 1 }} // Sits in the background
        >
          <div 
            className="flex flex-col items-center justify-center text-center mx-auto rounded-none" 
            style={{ 
              width: '100%', 
              maxWidth: '560px',
              color: '#3A2220',
              padding: '10px',
              boxSizing: 'border-box'
            }}
          >
            {/* Helper to dynamically format names for left and right columns */}
            {(() => {
              const formatName = (name: string, defaultName: string) => {
                const activeName = (name || defaultName).trim();
                if (activeName.includes('\n')) {
                  const parts = activeName.split('\n');
                  return { line1: parts[0], line2: parts[1] || '' };
                }
                const parts = activeName.split(/\s+/);
                if (parts.length <= 1) {
                  return { line1: activeName, line2: '' };
                }
                if (parts.length === 2) {
                  return { line1: parts[0], line2: parts[1] };
                }
                if (parts.length === 3) {
                  return { line1: parts.slice(0, 2).join(' '), line2: parts[2] };
                }
                const mid = Math.ceil(parts.length / 2);
                return {
                  line1: parts.slice(0, mid).join(' '),
                  line2: parts.slice(mid).join(' ')
                };
              };

              const brideFormatted = formatName(brideName || '', "Bảo Eve\nHuỳnh Lê");
              const groomFormatted = formatName(groomName || '', "John\nJohnathan");

              // Dynamic values based on inputs
              let dayPart = "23rd";
              let monthYearPart = "MAR, 2027";
              if (lang === 'VIE') {
                dayPart = "23";
                monthYearPart = "TH.03, 2027";
              }
              if (weddingDateShort) {
                const matchDay = weddingDateShort.match(/^\d+(?:st|nd|rd|th)?/i);
                if (matchDay) {
                  dayPart = matchDay[0];
                  monthYearPart = weddingDateShort.replace(dayPart, '').trim().replace(/^,/, '').trim();
                } else {
                  const parts = weddingDateShort.split(/\s+/);
                  if (parts.length > 1) {
                    dayPart = parts[0];
                    monthYearPart = parts.slice(1).join(' ');
                  } else {
                    dayPart = weddingDateShort;
                    monthYearPart = "";
                  }
                }
              }

              let locTop = "Danang";
              let locBottom = "VIETNAM";
              if (venueName) {
                const parts = venueName.split(',');
                if (parts.length >= 2) {
                  locTop = parts[0].trim();
                  locBottom = parts.slice(1).join(',').trim();
                } else {
                  locTop = venueName;
                  locBottom = "";
                }
              } else if (lang === 'VIE') {
                locTop = "Đà Nẵng";
                locBottom = "VIỆT NAM";
              }

              let timeTop = "Five";
              let timeBottom = "O'CLOCK";
              if (lang === 'VIE') {
                timeTop = "Năm Giờ";
                timeBottom = "CHIỀU";
              }

              return (
                <>
                  {/* Two Column Names Layout exactly mirroring the screenshot */}
                  <div className="flex items-center justify-center w-full select-none text-[#3A2220]" style={{ gap: '10px' }}>
                    {/* Left Column (Bride) */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-luxurious tracking-tight" style={{ fontSize: '70px', lineHeight: '52px', width: '248px', display: 'inline-block' }}>
                        {(brideName || "Bảo Eve Huỳnh Lê").replace(/\n/g, ' ')}
                      </span>
                    </div>
                    
                    {/* Center Ampersand */}
                    <span className="font-luxurious text-[#3A2220] px-1 select-none flex items-center justify-center h-full" style={{ fontSize: '60px', lineHeight: '60px' }}>
                      &
                    </span>
                    
                    {/* Right Column (Groom) */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-luxurious tracking-tight" style={{ fontSize: '70px', lineHeight: '52px', width: '248px', display: 'inline-block' }}>
                        {(groomName || "John Johnathan").replace(/\n/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Sub-label */}
                  <div className="font-luxurious text-[#3A2220] lowercase leading-tight select-none" style={{ fontSize: '40px', marginTop: '10px' }}>
                    {lang === 'VIE' ? "sẽ về chung một nhà" : "are getting married"}
                  </div>

                  {/* First separator line */}
                  <div className="h-px bg-[#3A2220]/20 mx-auto" style={{ width: '554px', marginTop: '10px', marginBottom: '10px' }} />

                  {/* Central paragraph with monospace uppercase letter spacing */}
                  <p className="font-mono tracking-[0.16em] uppercase text-[#3A2220]/90 max-w-[280px] sm:max-w-sm md:max-w-md mx-auto text-center px-1 select-none" style={{ fontSize: '10px', lineHeight: '16px' }}>
                    {invitationText || (lang === 'VIE' ? (
                      "TRÂN TRỌNG KÍNH MỜI BẠN GHÉ THĂM MỘT NGÀY ẤM ÁP ĐẦY TIẾNG CƯỜI, HOA CỎ VÀ LỜI THỀ ƯỚC CHUNG ĐÔI."
                    ) : (
                      "INVITE YOU TO SHARE IN A QUIET WEEKEND OF WOODFIRE, FOREST WALKS, AND THE COMMITMENT OF VOWS."
                    ))}
                  </p>

                  {/* Second separator line */}
                  <div className="h-px bg-[#3A2220]/20 mx-auto" style={{ width: '554px', marginTop: '10px', marginBottom: '10px' }} />

                  {/* Three columns footer exactly like screenshot */}
                  <div className="grid grid-cols-3 w-full items-start text-center text-[#3A2220] select-none">
                    {/* Column 1: Date */}
                    <div className="flex flex-col items-center justify-center p-0 m-0" style={{ height: '48px' }}>
                      <span style={{ fontFamily: 'Crimson Pro, serif', fontSize: '18px', height: '20px', display: 'inline-block', textAlign: 'center' }} className="italic font-light text-[#3A2220] mb-0 text-center">
                        {dayPart}
                      </span>
                      <span style={{ fontFamily: 'Crimson Pro, serif', fontSize: '18px', height: '20px', display: 'inline-block', textAlign: 'center' }} className="tracking-[0.12em] text-[#3A2220]/90 uppercase font-medium text-center">
                        {monthYearPart}
                      </span>
                    </div>

                    {/* Column 2: Location */}
                    <div className="flex flex-col items-center justify-center border-x border-[#3A2220]/15 p-0 m-0" style={{ height: '48px' }}>
                      <span style={{ fontFamily: 'Luxurious Script, cursive', fontSize: '32px', height: '32px', display: 'inline-block', textAlign: 'center' }} className="text-[#3A2220] mb-0 text-center">
                        {locTop}
                      </span>
                      <span style={{ fontFamily: 'Crimson Pro, serif', fontSize: '18px', height: '20px', display: 'inline-block', textAlign: 'center' }} className="tracking-[0.12em] text-[#3A2220]/90 uppercase font-medium text-center">
                        {locBottom}
                      </span>
                    </div>

                    {/* Column 3: Time */}
                    <div className="flex flex-col items-center justify-center p-0 m-0" style={{ height: '48px' }}>
                      <span style={{ fontFamily: 'Crimson Pro, serif', fontSize: '18px', height: '20px', display: 'inline-block', textAlign: 'center' }} className="italic font-light text-[#3A2220] mb-0 text-center">
                        {timeTop}
                      </span>
                      <span style={{ fontFamily: 'Crimson Pro, serif', fontSize: '18px', height: '20px', display: 'inline-block', textAlign: 'center' }} className="tracking-[0.12em] text-[#3A2220]/90 uppercase font-medium text-center">
                        {timeBottom}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        
        {/* HIGH-FIDELITY ASYMMETRICAL EDITORIAL IMAGE COLLAGE (Chelsea Demo Theme matching) */}
        {/* Fully responsive proportional absolute canvas allowing easy sizing and fluid-engine style changes */}
        <div 
          className="hidden md:block w-full relative z-0 animate-fadeIn"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '26 / 25'
          }}
        >
          
          {/* IMAGE 1: Upper Right (Block ba6e4fb) */}
          {rightPortraitUrl && (
            <div 
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm"
              style={{ 
                left: '80.8%', 
                top: '1%', 
                width: '19.2%', 
                zIndex: 2,
                aspectRatio: '1280 / 1920'
              }}
            >
              <img 
                src={rightPortraitUrl} 
                className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
                alt="Chelsea Romance Path Portrait" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* IMAGE 2: Left Middle (Block b0e7250) */}
          {leftPortraitUrl && (
            <div 
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm"
              style={{ 
                left: '3.8%', 
                top: '16.7%', 
                width: '23.1%', 
                zIndex: 1,
                aspectRatio: '1280 / 1920'
              }}
            >
              <img 
                src={leftPortraitUrl} 
                className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
                alt="Chelsea Walking Together" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* IMAGE 3: Right Middle OVERLAY (Block 4b7f960) */}
          {/* This sits at zIndex 5 so it overlays above the sticky center text wrapping! */}
          {storyThreeUrl && (
            <div 
              className="group absolute overflow-hidden bg-stone-50 shadow-md transition-all duration-300"
              style={{ 
                left: '61.5%', 
                top: '42.9%', 
                width: '360px', 
                height: '240px', 
                zIndex: 5
              }}
            >
              <img 
                src={storyThreeUrl} 
                className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
                alt="Chelsea Forest Hug" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* IMAGE 4: Lower Left (Block afb2a1d) */}
          {storyFourUrl && (
            <div 
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm"
              style={{ 
                left: '19.2%', 
                top: '57.1%', 
                width: '15.4%', 
                zIndex: 3,
                aspectRatio: '1280 / 1920',
                transform: 'translateY(300px)'
              }}
            >
              <img 
                src={storyFourUrl} 
                className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
                alt="Chelsea Close-up holding hands" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* IMAGE 5: Bottom Right (Block f0bb467) */}
          {storyFiveUrl && (
            <div 
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm"
              style={{ 
                left: '73.1%', 
                top: '81%', 
                width: '19.2%', 
                zIndex: 4,
                aspectRatio: '1280 / 1920',
                transform: 'translateY(200px)'
              }}
            >
              <img 
                src={storyFiveUrl} 
                className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
                alt="Chelsea Soft Gaze" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

        </div>

        {/* MOBILE STACKED FLOW (< 768px Widths) – Stunning Asymmetric Editorial Mobile Collage */}
        {/* On mobile screens, simple stacked elegant content ensures responsive layout */}
        <div className="md:hidden flex flex-col space-y-10 mt-8 pb-12 px-1">
          
          {/* Row 1: Asymmetric split */}
          <div className="flex items-start justify-between w-full gap-4">
            {/* Image 1: Left & shifted down */}
            {rightPortraitUrl && (
              <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm mt-8">
                <img 
                  src={rightPortraitUrl} 
                  className="w-full h-full object-cover" 
                  alt="Chelsea Romance Path" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            {/* Image 2: Right */}
            {leftPortraitUrl && (
              <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm">
                <img 
                  src={leftPortraitUrl} 
                  className="w-full h-full object-cover" 
                  alt="Chelsea Walking Together" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Row 2: Wide horizontal landscape hero, reflecting the desktop overlay proportions */}
          {storyThreeUrl && (
            <div className="w-full aspect-[1.6/1] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm my-2">
              <img 
                src={storyThreeUrl} 
                className="w-full h-full object-cover object-center" 
                alt="Chelsea Forest Embrace" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Row 3: Asymmetric split */}
          <div className="flex items-start justify-between w-full gap-4">
            {/* Image 4: Left */}
            {storyFourUrl && (
              <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm">
                <img 
                  src={storyFourUrl} 
                  className="w-full h-full object-cover" 
                  alt="Chelsea Hands Detail" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            {/* Image 5: Right & shifted down */}
            {storyFiveUrl && (
              <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm mt-8">
                <img 
                  src={storyFiveUrl} 
                  className="w-full h-full object-cover pb-px" 
                  alt="Chelsea Soft Portrait" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

        </div>
        
      </div>
    </section>
  );
};
