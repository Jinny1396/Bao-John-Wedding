import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface BotanicalIllustrationProps {
  className?: string;
  type?: 'eucalyptus' | 'olive' | 'floral' | 'branch';
  delay?: number;
  parallaxSpeed?: number;
}

export const BotanicalIllustration = ({ 
  className, 
  type = 'eucalyptus', 
  delay = 0,
  parallaxSpeed = 50 
}: BotanicalIllustrationProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed]);

  const renderPath = () => {
    switch (type) {
      case 'olive':
        return (
          <path
            d="M50 10C35 25 20 40 20 60C20 80 35 90 50 90C65 90 80 80 80 60C80 40 65 25 50 10ZM50 20C60 30 70 45 70 60C70 75 60 80 50 80C40 80 30 75 30 60C30 45 40 30 50 20Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            strokeDasharray="2 1"
          />
        );
      case 'branch':
        return (
          <path
            d="M20 80C40 70 60 50 80 20M35 65C30 55 25 50 20 50M55 45C60 35 65 30 70 30M45 55C40 45 35 40 30 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          />
        );
      case 'floral':
        return (
          <path
            d="M50 50C50 50 60 30 80 30C100 30 100 50 100 50C100 50 100 70 80 70C60 70 50 50 50 50ZM50 50C50 50 40 30 20 30C0 30 0 50 0 50C0 50 0 70 20 70C40 70 50 50 50 50Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            strokeDasharray="1 1"
          />
        );
      default: // eucalyptus
        return (
          <path
            d="M50 90C50 70 45 50 50 10M30 75C40 70 50 70 50 70M70 75C60 70 50 70 50 70M35 45C45 40 50 40 50 40M65 45C55 40 50 40 50 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
          />
        );
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5, delay }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full opacity-30 text-ink/40"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderPath()}
      </svg>
    </motion.div>
  );
};
