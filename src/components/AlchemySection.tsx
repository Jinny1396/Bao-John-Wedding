import { motion } from 'motion/react';

const NautilusShell = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
    whileInView={{ opacity: 0.4, scale: 1, rotate: 0 }}
    whileHover={{ rotate: 15, scale: 1.1, opacity: 0.6 }}
    transition={{ duration: 1.5, delay }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full text-white mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M50 95 C 20 95, 5 70, 5 45 C 5 20, 30 5, 55 5 C 80 5, 95 25, 95 45 C 95 60, 85 75, 70 80 C 55 85, 40 75, 35 60 C 30 45, 40 30, 55 25 C 65 20, 75 25, 78 35 C 80 45, 75 55, 65 58 C 55 60, 48 55, 45 48 C 42 40, 45 35, 50 33" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        strokeLinecap="round"
      />
      {/* Internal spiral lines */}
      <path d="M50 95 L 50 85" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M30 90 L 35 80" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M15 75 L 25 70" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M8 55 L 20 55" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M10 35 L 22 40" fill="none" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  </motion.div>
);

const BAStamp = ({ className }: { className?: string }) => (
  <motion.div
    drag
    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
    whileDrag={{ scale: 1.1, rotate: 5, zIndex: 50, boxShadow: "0px 20px 40px rgba(0,0,0,0.5)" }}
    initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
    whileInView={{ opacity: 1, rotate: 12, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    className={`relative cursor-grab active:cursor-grabbing w-48 h-48 ${className}`}
  >
    <svg viewBox="0 0 200 200" className="w-full h-full text-white/60 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
      {/* Perforated Edge for the square stamp */}
      <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      
      {/* Inner Decorative Frame */}
      <rect x="25" y="25" width="150" height="150" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <rect x="30" y="30" width="140" height="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Corner Leaves */}
      <path d="M35 35 L 55 55 M 35 55 L 55 35" stroke="currentColor" strokeWidth="0.5" />
      <path d="M145 35 L 165 55 M 145 55 L 165 35" stroke="currentColor" strokeWidth="0.5" />
      
      {/* Central Circle */}
      <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
      
      {/* BA Monogram */}
      <text 
        x="100" 
        y="115" 
        textAnchor="middle" 
        className="font-serif text-6xl fill-current italic"
        style={{ letterSpacing: '-0.05em' }}
      >
        BA
      </text>
      
      {/* Stamp Numbers */}
      <text x="40" y="165" className="font-mono text-[10px] fill-current opacity-70">No. 024</text>
      <text x="135" y="170" className="font-mono text-[14px] fill-current">30 <tspan dy="-5" fontSize="8">5/1</tspan></text>
      
      {/* Decorative Lines */}
      <path d="M100 30 V 45 M 100 155 V 170" stroke="currentColor" strokeWidth="0.5" />
      <path d="M30 100 H 45 M 155 100 H 170" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  </motion.div>
);

export const AlchemySection = () => {
  return (
    <section id="alchemy" className="relative py-64 px-8 md:px-24 bg-[#2D2B22] overflow-hidden min-h-screen flex flex-col items-center justify-center">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }} />
      
      {/* Floating Shells */}
      <NautilusShell className="absolute bottom-1/4 left-1/4 w-32 h-32" delay={0.2} />
      <NautilusShell className="absolute top-1/3 right-1/4 w-24 h-24 rotate-45" delay={0.5} />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
        
        <div className="relative mb-24 flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Polaroid Photo with Postage Stamp Edge */}
          <motion.div
            drag
            dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
            whileDrag={{ scale: 1.05, rotate: -2, zIndex: 50, boxShadow: "0px 30px 60px rgba(0,0,0,0.6)" }}
            initial={{ y: 100, opacity: 0, rotate: -5 }}
            whileInView={{ y: 0, opacity: 1, rotate: -2 }}
            transition={{ type: "spring", stiffness: 80, damping: 12 }}
            className="relative w-64 md:w-80 p-2 bg-[#E8E4D9] shadow-2xl cursor-grab active:cursor-grabbing group"
            style={{
              maskImage: 'radial-gradient(circle at 4px 4px, transparent 4px, black 4.5px)',
              maskSize: '12px 12px',
              WebkitMaskImage: 'radial-gradient(circle at 4px 4px, transparent 4px, black 4.5px)',
              WebkitMaskSize: '12px 12px',
            }}
          >
            <div className="aspect-[4/5] bg-ink/10 overflow-hidden relative m-2">
              <img 
                src="https://picsum.photos/seed/alchemy-couple-beach/800/1000?grayscale" 
                alt="Our Journey" 
                className="object-cover w-full h-full opacity-70 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#2D2B22]/20 mix-blend-overlay" />
            </div>
          </motion.div>

          {/* BA Stamp */}
          <BAStamp className="md:-ml-20 md:-mt-10" />
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-center space-y-4 max-w-lg"
        >
          <p className="font-mono text-[10px] md:text-xs text-white/40 leading-relaxed tracking-[0.4em] uppercase mix-blend-screen">
            Alchemy is the sacred <br />
            dance between surrender <br />
            and creation.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
