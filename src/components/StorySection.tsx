import { useEffect, useRef } from 'react';

interface StorySectionProps {
  lang: 'ENG' | 'VIE';
  leftPortraitUrl?: string;
  rightPortraitUrl?: string;
  storyThreeUrl?: string;
  storyFourUrl?: string;
  storyFiveUrl?: string;
  storyTextBgUrl?: string;
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
  storyTextBgUrl,
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

      // Match responsive breakpoint: Move it above the images on screens narrower than 768px
      if (window.innerWidth < 768) {
        const availableWidth = window.innerWidth - 40; // 20px padding on each side of the story section
        // Calculate scale to fit a design width of 355px, capped at 1.2
        const scaleFactor = Math.min(1.2, availableWidth / 355);
        const widthPercent = (100 / scaleFactor).toFixed(2) + '%';

        textWrapper.style.position = 'relative';
        textWrapper.style.top = '';
        textWrapper.style.bottom = '';
        textWrapper.style.left = '';
        textWrapper.style.transform = `scale(${scaleFactor})`;
        textWrapper.style.width = widthPercent;
        textWrapper.style.maxWidth = widthPercent;
        textWrapper.style.opacity = '1';
        textWrapper.style.pointerEvents = 'auto';
        
        textWrapper.style.setProperty('--mobile-scale', `${scaleFactor}`);
        textWrapper.style.setProperty('--mobile-width', widthPercent);
        return;
      } else {
        textWrapper.style.width = '';
        textWrapper.style.maxWidth = '';
        textWrapper.style.removeProperty('--mobile-scale');
        textWrapper.style.removeProperty('--mobile-width');
      }

      const rect = section.getBoundingClientRect();
      const isSectionInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const sectionStart = rect.top + scrollTop;
      const sectionHeight = rect.height;
      const sectionEnd = sectionStart + sectionHeight;
      const scrollPos = scrollTop + window.innerHeight / 2;

      // Spacing buffers for active content visibility
      const activeStartBuffer = sectionStart + 350;
      const activeEndBuffer = sectionEnd - 400;

      if (isSectionInViewport) {
        textWrapper.style.position = 'fixed';
        textWrapper.style.top = '50%';
        textWrapper.style.bottom = '';
        textWrapper.style.left = '50%';

        if (scrollPos > activeStartBuffer && scrollPos < activeEndBuffer) {
          textWrapper.style.opacity = '1';
          textWrapper.style.transform = 'translate(-50%, -50%) scale(1)';
          textWrapper.style.pointerEvents = 'auto';
        } else {
          textWrapper.style.opacity = '0';
          textWrapper.style.transform = 'translate(-50%, -50%) scale(0.95)';
          textWrapper.style.pointerEvents = 'none';
        }
      } else {
        // Safe fallback when section is completely offscreen
        textWrapper.style.position = 'absolute';
        textWrapper.style.top = '220px';
        textWrapper.style.bottom = '';
        textWrapper.style.left = '50%';
        textWrapper.style.transform = 'translate(-50%, 0) scale(0.95)';
        textWrapper.style.opacity = '0';
        textWrapper.style.pointerEvents = 'none';
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
      className="story-section w-full relative overflow-hidden transition-colors duration-500 py-12 md:py-0 md:h-[2200px]"
      style={{ backgroundColor: '#e7cbd0' }}
    >
      <div className="story-content w-full max-w-7xl mx-auto relative px-4 sm:px-6 md:px-12">
        
        {/* STICKY TEXT WRAPPER - JavaScript-driven fixed coordinates */}
        <div 
          ref={stickyTextRef} 
          className="text-wrapper text-center select-none w-full max-w-full md:max-w-xl mx-auto" 
          id="stickyText"
          style={{ zIndex: 0 }} // Sits in the background
        >
          <div 
            className="flex flex-col items-center justify-center text-center mx-auto rounded-none relative w-full max-w-full md:max-w-[560px] sticky-text-inner" 
            style={{ 
              color: '#362223',
              padding: '10px',
              boxSizing: 'border-box',
              transform: 'scale(0.9)'
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
                  {/* Background image (responsive & editable in CMS) */}
                  <div 
                    className="absolute pointer-events-none select-none story-bg-layer"
                    style={{
                      zIndex: 0,
                      backgroundImage: `url("${storyTextBgUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200'}")`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      opacity: 1,
                      mixBlendMode: 'multiply'
                    }}
                  />
                  {/* Two Column Names Layout exactly mirroring the screenshot */}
                  <div className="flex flex-row items-center justify-center w-full select-none text-[#362223] relative z-10 gap-1 sm:gap-[10px] translate-y-[10px] responsive-names-container">
                    {/* Left Column (Bride) */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-luxurious tracking-tight text-[6vw] xs:text-[5.5vw] sm:text-5xl md:text-[70px] leading-tight md:leading-[52px] w-full max-w-[42%] sm:max-w-[220px] md:max-w-[248px] inline-block responsive-name-span">
                        {brideFormatted.line2 ? (
                          <>
                            {brideFormatted.line1}
                            <br className="block sm:hidden" />
                            <span className="hidden sm:inline"> </span>
                            {brideFormatted.line2}
                          </>
                        ) : (
                          brideFormatted.line1
                        )}
                      </span>
                    </div>
                    
                    {/* Center Ampersand */}
                    <span className="font-luxurious text-[#362223] px-1 select-none flex items-center justify-center h-full text-[5vw] sm:text-4xl md:text-[60px] md:leading-[60px] sm:translate-x-[10px] translate-x-0">
                      &
                    </span>
                    
                    {/* Right Column (Groom) */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-luxurious tracking-tight text-[6vw] xs:text-[5.5vw] sm:text-5xl md:text-[70px] leading-tight md:leading-[52px] w-full max-w-[42%] sm:max-w-[220px] md:max-w-[248px] inline-block responsive-name-span">
                        {groomFormatted.line2 ? (
                          <>
                            {groomFormatted.line1}
                            <br className="block sm:hidden" />
                            <span className="hidden sm:inline"> </span>
                            {groomFormatted.line2}
                          </>
                        ) : (
                          groomFormatted.line1
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Sub-label */}
                  <div className="font-luxurious text-[#362223] lowercase leading-tight select-none relative z-10 text-[5.5vw] sm:text-2xl md:text-[40px] mt-[-10px] md:mt-[-10px] translate-y-[10px]">
                    {lang === 'VIE' ? "sẽ về chung một nhà" : "are getting married"}
                  </div>

                  {/* First separator line */}
                  <div 
                    className="h-px bg-[#362223]/20 mx-auto relative z-10 w-full max-w-[90%] md:max-w-[554px] my-2 md:my-[10px]" 
                    style={{ width: '100%', maxWidth: '530px' }}
                  />

                  {/* Central paragraph with monospace uppercase letter spacing */}
                  <p 
                    className="font-mono tracking-[0.16em] uppercase text-[#362223]/90 max-w-[280px] sm:max-w-sm md:max-w-md mx-auto text-center px-2 select-none relative z-10 text-[9px] sm:text-[10px] leading-relaxed"
                    style={{ lineHeight: '14px' }}
                  >
                    {invitationText || (lang === 'VIE' ? (
                       "TRÂN TRỌNG KÍNH MỜI BẠN GHÉ THĂM MỘT NGÀY ẤM ÁP ĐẦY TIẾNG CƯỜI, HOA CỎ VÀ LỜI THỀ ƯỚC CHUNG ĐÔI."
                    ) : (
                       "INVITE YOU TO SHARE IN A QUIET WEEKEND OF WOODFIRE, FOREST WALKS, AND THE COMMITMENT OF VOWS."
                    ))}
                  </p>

                  {/* Second separator line */}
                  <div 
                    className="h-px bg-[#362223]/20 mx-auto relative z-10 w-full max-w-[90%] md:max-w-[554px] my-2 md:my-[10px]" 
                    style={{ width: '100%', maxWidth: '530px' }}
                  />

                  {/* Three columns footer exactly like screenshot */}
                  <div className="grid grid-cols-3 w-full items-start text-center text-[#362223] select-none relative z-10 gap-px">
                    {/* Column 1: Date */}
                    <div className="flex flex-col items-center justify-center p-0 m-0 h-10 md:h-[48px]">
                      <span style={{ fontFamily: 'Crimson Pro, serif', height: '24px' }} className="italic font-light text-[#362223] mb-0 text-center text-[15px] sm:text-lg md:text-xl leading-tight inline-block w-full">
                        {dayPart}
                      </span>
                      <span style={{ fontFamily: 'Crimson Pro, serif' }} className="tracking-[0.12em] text-[#362223]/90 uppercase font-medium text-center text-[8px] sm:text-xs md:text-[18px] leading-tight inline-block w-full">
                        {monthYearPart}
                      </span>
                    </div>

                    {/* Column 2: Location */}
                    <div className="flex flex-col items-center justify-center border-x border-[#362223]/15 p-0 m-0 h-10 md:h-[48px]">
                      <span style={{ fontFamily: 'Luxurious Script, cursive', height: '24px' }} className="text-[#362223] mb-0 text-center text-[14px] sm:text-xl md:text-[32px] leading-none inline-block w-full">
                        {locTop}
                      </span>
                      <span style={{ fontFamily: 'Crimson Pro, serif' }} className="tracking-[0.12em] text-[#362223]/90 uppercase font-medium text-center text-[8px] sm:text-xs md:text-[18px] leading-tight inline-block w-full">
                        {locBottom}
                      </span>
                    </div>

                    {/* Column 3: Time */}
                    <div className="flex flex-col items-center justify-center p-0 m-0 h-10 md:h-[48px]">
                      <span style={{ fontFamily: 'Crimson Pro, serif', height: '24px', width: '100%' }} className="italic font-light text-[#362223] mb-0 text-center text-[15px] sm:text-lg md:text-xl leading-tight inline-block w-full">
                        {timeTop}
                      </span>
                      <span style={{ fontFamily: 'Crimson Pro, serif' }} className="tracking-[0.12em] text-[#362223]/90 uppercase font-medium text-center text-[8px] sm:text-xs md:text-[18px] leading-tight inline-block w-full">
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
          className="hidden md:block w-full relative z-10 animate-fadeIn"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '26 / 25'
          }}
        >
          
          {/* IMAGE 1: Upper Right (Block ba6e4fb) */}
          {rightPortraitUrl && (
            <div 
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm story-collage-img-1"
              style={{ 
                left: '80.8%', 
                top: '1%', 
                width: '19.2%', 
                zIndex: 2,
                aspectRatio: '1280 / 1920',
                transform: 'translateY(200px)'
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
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm story-collage-img-2"
              style={{ 
                left: '3.8%', 
                top: '16.7%', 
                width: '23.1%', 
                zIndex: 1,
                aspectRatio: '1280 / 1920',
                transform: 'translateY(200px)'
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
              className="group absolute overflow-hidden bg-stone-50 shadow-md transition-all duration-300 story-collage-img-3"
              style={{ 
                left: '61.5%', 
                top: '42.9%', 
                width: '360px', 
                height: '240px', 
                zIndex: 5,
                transform: 'translateY(500px)'
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
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm story-collage-img-4"
              style={{ 
                left: 'calc(19.2% - 200px)', 
                top: '57.1%', 
                width: '300px', 
                height: '260px', 
                zIndex: 3,
                transform: 'translateY(800px)'
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
              className="group absolute overflow-hidden bg-stone-50 transition-all duration-300 shadow-sm story-collage-img-5"
              style={{ 
                left: '73.1%', 
                top: '81%', 
                width: '19.2%', 
                zIndex: 4,
                aspectRatio: '1280 / 1920',
                transform: 'translateY(900px)'
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
              <div className="w-[47%] aspect-[4/3] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm">
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
