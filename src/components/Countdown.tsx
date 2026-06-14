import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const toRoman = (num: number): string => {
  if (num === 0) return 'O';
  const lookup: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

export const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft: TimeLeft | null = null;

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-12 md:gap-20 justify-center items-start font-serif italic text-ink/40">
      <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-light mb-2 text-ink/80">{toRoman(timeLeft.days)}</span>
        <span className="small-caps opacity-50">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-light mb-2 text-ink/80">{toRoman(timeLeft.hours)}</span>
        <span className="small-caps opacity-50">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-light mb-2 text-ink/80">{toRoman(timeLeft.minutes)}</span>
        <span className="small-caps opacity-50">Mins</span>
      </div>
    </div>
  );
};
