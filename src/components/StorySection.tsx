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
      className="story-section w-full bg-white relative overflow-hidden transition-colors duration-500 py-12 md:py-0 md:h-[1500px]"
    >
      <div className="story-content w-full max-w-7xl mx-auto relative px-4 sm:px-6 md:px-12">
        
        {/* STICKY TEXT WRAPPER - JavaScript-driven fixed coordinates */}
        <div 
          ref={stickyTextRef} 
          className="text-wrapper text-center select-none w-full max-w-lg md:max-w-xl mx-auto" 
          id="stickyText"
          style={{ zIndex: 4 }} // Sits below Image 3 (z-index 5) but above general layout
        >
          <div className="flex flex-col items-center justify-center text-center mx-auto" style={{ width: 'min(500px, 100%)' }}>
            {/* Two Column Names Layout exactly mirroring the screenshot */}
            <div className="flex items-center justify-center gap-5 sm:gap-8 lg:gap-11 w-full text-[#3A2220]">
              {/* Left Column */}
              <div className="text-right">
                <p className="font-serif italic font-light text-xl sm:text-2xl lg:text-3xl leading-tight">
                  {brideName || "Bảo Eve"}
                </p>
                <p className="font-serif italic font-light text-xs sm:text-base lg:text-xl leading-none opacity-85">
                  & {groomName || "Johnathan"}
                </p>
              </div>
              
              {/* Center & */}
              <span className="font-serif text-sm sm:text-base lg:text-lg text-[#3A2220]/50 italic font-light">&</span>
              
              {/* Right Column */}
              <div className="text-left">
                <p className="font-serif italic font-light text-xl sm:text-2xl lg:text-3xl leading-tight">
                  {brideName || "Bảo Eve"}
                </p>
                <p className="font-serif italic font-light text-xs sm:text-base lg:text-xl leading-none opacity-85">
                  & {groomName || "Johnathan"}
                </p>
              </div>
            </div>
            
            <h2 className="story-heading font-script text-xl sm:text-2xl lg:text-3xl text-[#3A2220] py-2 md:py-3 mt-2 md:mt-3 lowercase select-none">
              {lang === 'VIE' ? "sẽ về chung một nhà" : "are getting married"}
            </h2>
            
            <div className="w-full h-px bg-[#3A2220]/15 my-3 sm:my-4 lg:my-5" />
            
            <p className="font-serif text-[11px] sm:text-[12px] lg:text-[13px] leading-relaxed text-[#3A2220]/80 max-w-[280px] sm:max-w-sm lg:max-w-md italic font-light px-2 sm:px-4 selection:bg-stone-200">
              {invitationText || (lang === 'VIE' ? (
                "Trân trọng kính mời bạn ghé thăm một ngày ấm áp đầy tiếng cười, hoa cỏ và lời thề ước chung đôi."
              ) : (
                "Invite you to share in a quiet weekend of woodfire, forest walks, and the commitment of vows."
              ))}
            </p>
            
            <div className="w-full h-px bg-[#3A2220]/15 my-3 sm:my-4 lg:my-5" />
            
            <div className="grid grid-cols-3 w-full max-w-[260px] sm:max-w-xs md:max-w-sm mx-auto items-center text-center font-mono text-[7px] sm:text-[8px] lg:text-[9.5px] tracking-[0.15em] sm:tracking-[0.2em] text-[#3A2220]/80 uppercase mt-1 sm:mt-2">
              <div className="text-center">
                <span className="block font-serif text-sm sm:text-base lg:text-lg font-light text-[#3A2220] leading-none mb-0.5">
                  {weddingDateShort ? (weddingDateShort.match(/\d+/) ? weddingDateShort.match(/\d+/)![0] : '10') : '10'}
                </span>
                <span className="block text-[6.5px] sm:text-[7.5px] tracking-wider sm:tracking-widest text-[#3A2220]/75 font-light">
                  {weddingDateShort || (lang === 'VIE' ? "TH.10, 2027" : "OCT, 2027")}
                </span>
              </div>
              <div className="text-center font-light">
                <span className="block text-[7.5px] sm:text-[8.5px] font-medium leading-normal">
                  {venueName ? (venueName.includes(',') ? venueName.split(',')[0].trim() : venueName) : "TOKYO"},
                </span>
                <span className="block text-[7.5px] sm:text-[8.5px] font-light leading-normal">
                  {venueName ? (venueName.includes(',') ? venueName.split(',')[1].trim() : (lang === 'VIE' ? 'NHẬT BẢN' : 'JAPAN')) : (lang === 'VIE' ? 'NHẬT BẢN' : 'JAPAN')}
                </span>
              </div>
              <div className="text-center">
                <span className="block font-serif text-sm sm:text-base lg:text-lg font-light text-[#3A2220] leading-none mb-0.5">
                  {weddingDateShort ? (weddingDateShort.match(/\d+/) ? weddingDateShort.match(/\d+/)![0] : '10') : '10'}
                </span>
                <span className="block text-[6.5px] sm:text-[7.5px] tracking-wider sm:tracking-widest text-[#3A2220]/75 font-light">
                  {weddingDateShort || (lang === 'VIE' ? "TH.10, 2027" : "OCT, 2027")}
                </span>
              </div>
            </div>
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
              src={rightPortraitUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469885-00IS12CZLY3SF6UFRHDE/pexels-vikkirillova-15102055.jpg"} 
              className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
              alt="Chelsea Romance Path Portrait" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* IMAGE 2: Left Middle (Block b0e7250) */}
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
              src={leftPortraitUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469897-765GLULNCOJ4LM48N3PK/pexels-vikkirillova-15266111.jpg"} 
              className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
              alt="Chelsea Walking Together" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* IMAGE 3: Right Middle OVERLAY (Block 4b7f960) */}
          {/* This sits at zIndex 5 so it overlays above the sticky center text wrapping! */}
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
              src={storyThreeUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469911-NVXD5WLOV689KNTRMOAR/pexels-vikkirillova-15280972.jpg"} 
              className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
              alt="Chelsea Forest Hug" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* IMAGE 4: Lower Left (Block afb2a1d) */}
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
              src={storyFourUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469921-AUZDKVU38IDB61BAJJ0W/pexels-vikkirillova-15266110.jpg"} 
              className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
              alt="Chelsea Close-up holding hands" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* IMAGE 5: Bottom Right (Block f0bb467) */}
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
              src={storyFiveUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469930-BPBK33AUJHSG9Y7BT6GL/pexels-vikkirillova-15280966.jpg"} 
              className="gallery-image w-full h-full object-cover select-none transition-all duration-700 hover:scale-105" 
              alt="Chelsea Soft Gaze" 
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

        {/* MOBILE STACKED FLOW (< 768px Widths) – Stunning Asymmetric Editorial Mobile Collage */}
        {/* On mobile screens, simple stacked elegant content ensures responsive layout */}
        <div className="md:hidden flex flex-col space-y-10 mt-8 pb-12 px-1">
          
          {/* Row 1: Asymmetric split */}
          <div className="flex items-start justify-between w-full gap-4">
            {/* Image 1: Left & shifted down */}
            <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm mt-8">
              <img 
                src={rightPortraitUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469885-00IS12CZLY3SF6UFRHDE/pexels-vikkirillova-15102055.jpg"} 
                className="w-full h-full object-cover" 
                alt="Chelsea Romance Path" 
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Image 2: Right */}
            <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm">
              <img 
                src={leftPortraitUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469897-765GLULNCOJ4LM48N3PK/pexels-vikkirillova-15266111.jpg"} 
                className="w-full h-full object-cover" 
                alt="Chelsea Walking Together" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Row 2: Wide horizontal landscape hero, reflecting the desktop overlay proportions */}
          <div className="w-full aspect-[1.6/1] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm my-2">
            <img 
              src={storyThreeUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469911-NVXD5WLOV689KNTRMOAR/pexels-vikkirillova-15280972.jpg"} 
              className="w-full h-full object-cover object-center" 
              alt="Chelsea Forest Embrace" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Row 3: Asymmetric split */}
          <div className="flex items-start justify-between w-full gap-4">
            {/* Image 4: Left */}
            <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm">
              <img 
                src={storyFourUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469921-AUZDKVU38IDB61BAJJ0W/pexels-vikkirillova-15266110.jpg"} 
                className="w-full h-full object-cover" 
                alt="Chelsea Hands Detail" 
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Image 5: Right & shifted down */}
            <div className="w-[47%] aspect-[3/4] overflow-hidden rounded-[1px] bg-stone-50 shadow-sm mt-8">
              <img 
                src={storyFiveUrl || "https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469930-BPBK33AUJHSG9Y7BT6GL/pexels-vikkirillova-15280966.jpg"} 
                className="w-full h-full object-cover pb-px" 
                alt="Chelsea Soft Portrait" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>
        
      </div>
    </section>
  );
};
