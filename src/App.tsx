import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { RSVPForm } from './components/RSVPForm';
import { GuestNotes } from './components/GuestNotes';
import { AdminPanel } from './components/AdminPanel';
import { VolumeX, Volume2, Music } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

interface CollageGuestNote {
  id: string;
  guestName: string;
  noteText: string;
  createdAt: Timestamp | null;
}

// Reusable elegant Oval Monogram SVG Component
const OvalMonogram = ({ className = 'w-16 h-16' }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full text-current" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer elegant vertical oval */}
      <ellipse cx="50" cy="50" rx="30" ry="46" stroke="currentColor" strokeWidth="1.2" />
      {/* Inner subtle decorative ellipse */}
      <ellipse cx="50" cy="50" rx="27" ry="43" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
      {/* Intersection initials */}
      <text 
        x="50" 
        y="58" 
        textAnchor="middle" 
        className="font-serif text-3xl font-light tracking-tight fill-current"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        <tspan dx="-2" dy="-5" fontSize="26">S</tspan>
        <tspan dx="-8" dy="8" fontSize="23" opacity="0.8">A</tspan>
      </text>
    </svg>
  </div>
);

// High-fidelity luxurious Embossed Sealing Stamp (Heart and Swans)
const EmbossedSeal = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <div className={`relative rounded-full select-none shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.7),_2px_4px_12px_rgba(0,0,0,0.06),_0px_1px_3px_rgba(0,0,0,0.04)] bg-[#E4E2DC] border border-[#DDDCD6]/50 flex items-center justify-center ${className}`}>
    {/* Exquisite letterpress paper texture with embossed heart & swans SVG lines */}
    <svg viewBox="0 0 100 100" className="w-[84%] h-[84%] text-[#AA9082]/35" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Heart border with elegant dots/notches */}
      <path 
        d="M50 81C50 81 22 61 22 39.5C22 24.5 34.5 17 44 25.5L50 31.5L56 25.5C65.5 17 78 24.5 78 39.5C78 61 50 81 50 81Z" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeDasharray="1.5 1.5" 
      />
      <path 
        d="M50 78C50 78 24 59 24 38.5C24 25 35.5 18 44 26L50 32L56 26C64.5 18 76 25 76 38.5C76 59 50 78 50 78Z" 
        stroke="currentColor" 
        strokeWidth="0.6" 
      />
      {/* Two intertwined kissing swans in center */}
      <g transform="translate(0, -1)">
        {/* Left Swan */}
        <path 
          d="M44 54C42.5 49 44.5 44 47 42C49.5 40 50.5 37 49 34C50 36 48 39.5 45.5 41.5C42.5 43.5 39 47.5 40 52.5C41 55 44 55 45 55C43 55 42 54 44 54ZM34 54.5C36 53 40.5 52 44 53.5C45.5 54 47 53 47 51" 
          stroke="currentColor" 
          strokeWidth="0.8" 
          strokeLinecap="round" 
        />
        {/* Right Swan */}
        <path 
          d="M56 54C57.5 49 55.5 44 53 42C50.5 40 49.5 37 51 34C50 36 52 39.5 54.5 41.5C57.5 43.5 61 47.5 60 52.5C59 55 56 55 55 55C57 55 58 54 56 54ZM66 54.5C64 53 59.5 52 56 53.5C54.5 54 53 53 53 51" 
          stroke="currentColor" 
          strokeWidth="0.8" 
          strokeLinecap="round" 
        />
        {/* Kissing central dot */}
        <circle cx="50" cy="40.5" r="1.2" fill="currentColor" opacity="0.8" />
        {/* Swan Crown details */}
        <path d="M48.5 32.5L49 31L50 32.5C49.5 32 49 32 48.5 32.5Z" fill="currentColor" opacity="0.6" />
        <path d="M51.5 32.5L51 31L50 32.5C50.5 32 51 32 51.5 32.5Z" fill="currentColor" opacity="0.6" />
      </g>
    </svg>
    {/* Letterpress ambient paper relief overlay */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none mix-blend-overlay" />
  </div>
);

// Gallery Photos Data matching the high-fidelity cinematic wedding template
const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=1200&q=80', // Silhouette doorway wedding
    category: 'wedding',
    title: 'Silent Devotion',
    location: 'Lakeside Pavilion',
    date: 'OCTOBER 2027',
    camera: 'HASSELBLAD 500C'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80', // Forest House / Cabin
    category: 'nature',
    title: 'Woodland Lodge',
    location: 'Forest Echoes',
    date: 'OCTOBER 2027',
    camera: 'LEICA M6 / 50MM'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80', // Couple Dancing B&W
    category: 'wedding',
    title: 'The First Dance',
    location: 'Acoustic Ballroom',
    date: 'OCTOBER 2027',
    camera: 'CONTAX T2'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80', // Forest Trees / Nature pathway
    category: 'nature',
    title: 'Forest Pathway',
    location: 'Deep Woods, Japan',
    date: 'OCTOBER 2027',
    camera: 'PENTAX 67 / 90MM'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', // Bride outside
    category: 'wedding',
    title: 'Ethereal Grace',
    location: 'Botanical Gardens',
    date: 'OCTOBER 2027',
    camera: 'HASSELBLAD 500C'
  }
];

// Ambient wedding piano synthesizer for a zero-failure client-side audio experience
class AmbientPianoSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: any = null;
  private nextNoteTime = 0;
  private noteIndex = 0;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Romantic chord progression (Canon in D / Wedding ambient theme)
  private chords = [
    [130.81, 196.00, 329.63, 392.00, 523.25], // C Major
    [146.83, 196.00, 293.66, 392.00, 587.33], // G Major
    [110.00, 164.81, 261.63, 329.63, 523.25], // A Minor
    [164.81, 246.94, 329.63, 392.00, 493.88], // E Minor
    [174.61, 220.00, 349.23, 440.00, 523.25], // F Major
    [130.81, 196.00, 261.63, 329.63, 392.00], // C Major fallback
    [174.61, 220.00, 349.23, 440.00, 523.25], // F Major
    [146.83, 196.00, 293.66, 392.00, 493.88]  // G Major
  ];

  constructor() {}

  public start() {
    if (this.isPlaying) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    try {
      this.ctx = new AudioContextClass();
      this.isPlaying = true;
      this.noteIndex = 0;
      this.nextNoteTime = this.ctx.currentTime;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.0);
      this.masterGain.connect(this.ctx.destination);

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(950, this.ctx.currentTime);
      this.filterNode.connect(this.masterGain);

      this.delayNode = this.ctx.createDelay(2.0);
      this.delayNode.delayTime.setValueAtTime(0.65, this.ctx.currentTime);
      
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.42, this.ctx.currentTime);

      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.filterNode.connect(this.delayNode);
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);

      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.masterGain);

      this.scheduler();
    } catch (e) {
      console.error('Failed to start Web Audio Synth:', e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        const ctxCloser = this.ctx;
        setTimeout(() => {
          ctxCloser.close().catch(() => {});
        }, 550);
      } catch (e) {}
    }
    this.ctx = null;
  }

  private scheduler() {
    if (!this.isPlaying || !this.ctx) return;

    try {
      while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
        this.scheduleNote(this.noteIndex, this.nextNoteTime);
        this.advanceNote();
      }
      this.timerId = setTimeout(() => this.scheduler(), 25);
    } catch (e) {
      console.warn('Synth scheduler error:', e);
    }
  }

  private advanceNote() {
    this.nextNoteTime += 0.42;
    this.noteIndex++;
  }

  private scheduleNote(index: number, time: number) {
    if (!this.ctx || !this.filterNode) return;

    const chordIndex = Math.floor(index / 8) % this.chords.length;
    const chord = this.chords[chordIndex];

    const pattern = [0, 2, 4, 3, 1, 3, 2, 4];
    const patternStep = index % pattern.length;
    const notePos = pattern[patternStep];
    const baseFreq = chord[notePos];
    
    if (!baseFreq) return;

    const isBaseBeat = patternStep === 0;
    const frequency = isBaseBeat ? baseFreq / 2 : baseFreq;

    const osc = this.ctx.createOscillator();
    const voiceGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, time);

    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'lowpass';
    voiceFilter.frequency.setValueAtTime(1200, time);
    voiceFilter.frequency.exponentialRampToValueAtTime(320, time + 2.0);

    voiceGain.gain.setValueAtTime(0, time);
    voiceGain.gain.linearRampToValueAtTime(isBaseBeat ? 0.28 : 0.16, time + 0.05);
    voiceGain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);

    osc.connect(voiceFilter);
    voiceFilter.connect(voiceGain);
    voiceGain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 2.5);
  }
}

export default function App() {
  const [lang, setLang] = useState<'VIE' | 'ENG'>('VIE');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredSidebarIndex, setHoveredSidebarIndex] = useState<number | null>(null);
  const [isPastHero, setIsPastHero] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // States for interactive collage guest notes
  const [collageNoteText, setCollageNoteText] = useState('');
  const [collageGuestName, setCollageGuestName] = useState('');
  const [isCollageSubmitting, setIsCollageSubmitting] = useState(false);
  const [isCollageSubmitted, setIsCollageSubmitted] = useState(false);
  const [collageSubmitError, setCollageSubmitError] = useState<string | null>(null);
  const [collageNotes, setCollageNotes] = useState<CollageGuestNote[]>([]);

  // Real-time synchronization of guest notes
  useEffect(() => {
    const notesQuery = query(
      collection(db, 'guestNotes'),
      orderBy('createdAt', 'desc'),
      limit(24)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const fetchedNotes: CollageGuestNote[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedNotes.push({
            id: doc.id,
            guestName: data.guestName || 'Anonymous',
            noteText: data.noteText || '',
            createdAt: data.createdAt || null,
          });
        });
        setCollageNotes(fetchedNotes);
      },
      (error) => {
        console.error('Error listening to guest notes:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCollageSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collageNoteText.trim()) {
      setCollageSubmitError(lang === 'VIE' ? 'Vui lòng viết lời chúc mừng nhé.' : 'Please write your message.');
      return;
    }
    if (!collageGuestName.trim()) {
      setCollageSubmitError(lang === 'VIE' ? 'Vui lòng ký tên của bạn.' : 'Please sign your name.');
      return;
    }

    setIsCollageSubmitting(true);
    setCollageSubmitError(null);

    const notePayload = {
      guestName: collageGuestName.trim(),
      noteText: collageNoteText.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'guestNotes'), notePayload);
      setIsCollageSubmitted(true);
      setCollageNoteText('');
      setCollageGuestName('');
      setTimeout(() => setIsCollageSubmitted(false), 5000);
    } catch (err) {
      console.error('Error adding guest note:', err);
      setCollageSubmitError(lang === 'VIE' ? 'Gửi lời chúc không thành công. Hãy thử lại.' : 'Failed to pin note. Please try again.');
      try {
        handleFirestoreError(err, OperationType.CREATE, 'guestNotes');
      } catch (e) {
        // Handled format
      }
    } finally {
      setIsCollageSubmitting(false);
    }
  };

  const appTranslations = {
    ENG: {
      home: "HOME",
      date: "THE DATE",
      events: "EVENTS",
      rsvp: "RSVP",
      heroBtn: "RSVP NOW",
      heroDate: "22 JUNE 2026, FRIDAY",
      gettingMarried: "are getting married",
      invitationText: "Invite you to share in a quiet weekend of woodfire, forest walks, and the commitment of vows.",
      tokyoJapan: "TOKYO, JAPAN",
      october2027: "OCT, 2027",
      closeEsc: "CLOSE (ESC)",
      frameInfo: "FRAME INFO",
      locationLabel: "LOCATION:",
      dateTimeLabel: "DATE TIME:",
      cameraLabel: "CAMERA:",
      photoQuote: "A quiet instant captured on analogue medium, celebrating the silent beauty of modern devotion.",
      prevBtn: "PREV",
      nextBtn: "NEXT",
      itinerary: "Itinerary",
      attire: "Attire",
      attireDesc: "Cocktail Attire. Black tie optional.",
      sage: "Sage",
      sand: "Sand",
      clay: "Clay",
      detailsTitle: "The Details",
      registry: "REGISTRY",
      registryParagraph: "We are so grateful to have you as a part of our lives, and your presence at our wedding is the greatest gift of all. If you would like to celebrate this joyous occasion with a gift, we have created a wedding registry to make it easier for you.",
      registryBtn: "View Our Wedding Registry",
      respondBy: "Kindly respond by March 23, 2026.",
      writeNoteTitle: "WRITE US A NOTE",
      writeNoteSubtitle: "Leave a memory, wish, or guidance on our wedding board.",
      musicPopup: "♫ TURN SOUND ON FOR AMBIENCE",
      musicToggleTitleMute: "Mute Background Music",
      musicToggleTitlePlay: "Play Wedding Song",
      
      itineraryItems: [
        ['3:00 PM', 'Welcome Drinks'],
        ['4:00 PM', 'Seated Ceremony'],
        ['5:00 PM', 'Cocktail Hour'],
        ['5:30 PM', 'Reception Banquet'],
        ['6:00 PM', 'Dinner Service & Toasts'],
        ['7:00 PM', 'Dancing and Celebration'],
        ['8:30 PM', 'Cake Cutting'],
        ['10:00 PM', 'Final Farewell'],
      ]
    },
    VIE: {
      home: "TRANG CHỦ",
      date: "NGÀY CƯỚI",
      events: "SỰ KIỆN",
      rsvp: "XÁC NHẬN",
      heroBtn: "PHẢN HỒI NGAY",
      heroDate: "THỨ SÁU, 22 THÁNG 6, 2026",
      gettingMarried: "sẽ về chung một nhà",
      invitationText: "Trân trọng kính mời bạn ghé thăm một ngày ấm áp đầy tiếng cười, hoa cỏ và lời thề ước chung đôi.",
      tokyoJapan: "TOKYO, NHẬT BẢN",
      october2027: "TH.10, 2027",
      closeEsc: "ĐÓNG (ESC)",
      frameInfo: "THÔNG TIN ẢNH",
      locationLabel: "ĐỊA ĐIỂM:",
      dateTimeLabel: "THỜI GIAN:",
      cameraLabel: "MÁY ẢNH:",
      photoQuote: "Khoảnh khắc an yên ghi dấu qua thước phim màu, mừng ngày hạnh phúc đơm hoa.",
      prevBtn: "TRƯỚC",
      nextBtn: "SAU",
      itinerary: "Lịch trình",
      attire: "Trang phục",
      attireDesc: "Trang phục bán trang trọng (Cocktail). Nam có thể thắt nơ.",
      sage: "Màu Xanh",
      sand: "Màu Cát",
      clay: "Màu Đất sét",
      detailsTitle: "Chi tiết ngày vui",
      registry: "HỘP QUÀ",
      registryParagraph: "Sự hiện diện của bạn là niềm hạnh phúc lớn nhất của chúng mình. Nếu bạn muốn gửi chúc mừng, chúng mình đã chuẩn bị danh sách quà cưới nhỏ xinh dưới đây để bạn dễ dàng lựa chọn.",
      registryBtn: "Xem Hộp Quà Chúc Mừng",
      respondBy: "Vui lòng cho tụi mình biết phản hồi trước ngày 23 tháng 3, 2026.",
      writeNoteTitle: "GỬI LỜI CHÚC MỪNG",
      writeNoteSubtitle: "Ghi lại kỷ niệm hoặc lời nhắn nhủ dành cho ngày hạnh phúc của chúng mình.",
      musicPopup: "♫ BẬT ÂM THANH ĐỂ CẢM NHẬN KHÔNG GIAN",
      musicToggleTitleMute: "Tắt nhạc nền",
      musicToggleTitlePlay: "Bật nhạc đám cưới",
      
      itineraryItems: [
        ['15:00', 'Đón khách & Tiệc trà đầu giờ'],
        ['16:00', 'Hành lễ chánh điện đầy trang nghiêm'],
        ['17:00', 'Tiệc Cocktail thân mật'],
        ['17:30', 'Khai tiệc mừng đám cưới'],
        ['18:00', 'Dùng tiệc chính & Chúc rượu'],
        ['19:00', 'Giao lưu khiêu vũ đầy tiếng cười'],
        ['20:30', 'Cắt bánh kem hạnh phúc'],
        ['22:00', 'Chào tiễn khách ra về'],
      ]
    }
  };

  const t = appTranslations[lang];

  // Background classical music system (Soft wedding ambient piano)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<AmbientPianoSynth | null>(null);
  const isUsingSynthRef = useRef(false);

  // Ambient noise/sound features removed per user request

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        // Since hero is bg-stone-950 and the background becomes bright after it,
        // we'll toggle isPastHero as soon as the hero finishes passing the top part of viewport
        setIsPastHero(rect.bottom <= 60);
      } else {
        setIsPastHero(window.scrollY > 500);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sidebarItems = [
    { num: "01", label: t.home, target: "hero" },
    { num: "02", label: t.date, target: "gallery" },
    { num: "03", label: t.events, target: "events" },
    { num: "04", label: t.rsvp, target: "rsvp" },
  ];

  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"]
  });

  const ySlow1 = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const ySlow2 = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const yMed1  = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const yMed2  = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const yFast1 = useTransform(scrollYProgress, [0, 1], [-130, 130]);
  const yFast2 = useTransform(scrollYProgress, [0, 1], [-160, 160]);

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openLightbox = (id: number) => {
    const index = galleryImages.findIndex(img => img.id === id);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
    }
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  const isAdminPath = currentPath === '/admin' || currentPath === '/admin/' || window.location.hash === '#/admin' || window.location.search.includes('admin=true');

  if (isAdminPath) {
    return <AdminPanel onBackToHome={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-forest/10 selection:text-ink font-sans transition-colors duration-500 overflow-x-hidden relative">
      
      {/* Top Floating Header with Language Selector Toggle */}
      <header className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <div className="bg-white/40 hover:bg-white/70 backdrop-blur-md border border-black/10 hover:border-black/25 rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300">
          <button
            onClick={() => setLang('ENG')}
            className={`font-mono text-[9px] tracking-[0.2em] transition-all cursor-pointer font-bold ${
              lang === 'ENG' 
                ? 'text-[#3A2220] scale-105' 
                : 'text-neutral-400 hover:text-[#3A2220]'
            }`}
          >
            ENG
          </button>
          <span className="text-[9px] text-neutral-300 select-none">|</span>
          <button
            onClick={() => setLang('VIE')}
            className={`font-mono text-[9px] tracking-[0.2em] transition-all cursor-pointer font-bold ${
              lang === 'VIE' 
                ? 'text-[#3A2220] scale-105' 
                : 'text-neutral-400 hover:text-[#3A2220]'
            }`}
          >
            VIE
          </button>
        </div>
      </header>
      
      {/* High-End Floating Navigation Sidebar */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 bg-transparent shadow-none border-none pointer-events-auto hidden md:block select-none">
        <div className="group/sidebar flex flex-col gap-6 items-start">
          {sidebarItems.map((item, index) => {
            const isHovered = hoveredSidebarIndex === index;
            return (
              <button
                key={index}
                onMouseEnter={() => setHoveredSidebarIndex(index)}
                onMouseLeave={() => setHoveredSidebarIndex(null)}
                onClick={() => handleScrollTo(item.target)}
                className="relative flex items-center justify-start w-28 h-8 focus:outline-none cursor-pointer bg-transparent border-none text-left group/item transition-all duration-300 ease-out"
              >
                {/* Micro hover indicator dot on the very left with adaptive color */}
                <span 
                  className={`w-1 h-1 rounded-full transition-all duration-300 ease-out ${
                    isPastHero ? 'bg-[#3A2220]' : 'bg-white'
                  } ${
                    isHovered ? 'scale-[2.5] opacity-100' : 'scale-100 opacity-40'
                  }`}
                  style={{
                    mixBlendMode: isPastHero ? 'normal' : 'difference'
                  }}
                />

                {/* Number shown by default, fades out/translates-x on hover */}
                <span
                  className={`absolute left-6 font-mono text-sm tracking-wider transition-all duration-300 ease-out ${
                    isHovered
                      ? 'opacity-0 -translate-x-4 pointer-events-none'
                      : `opacity-65 ${isPastHero ? 'text-[#3A2220]' : 'text-white'}`
                  }`}
                  style={{
                    mixBlendMode: isPastHero ? 'normal' : 'difference'
                  }}
                >
                  {item.num}
                </span>

                {/* Text description shown on hover, fades in/translates-x from inside */}
                <span
                  className={`absolute left-6 font-mono text-xs tracking-[0.25em] font-medium transition-all duration-300 ease-out whitespace-nowrap uppercase ${
                    isHovered
                      ? `opacity-100 translate-x-0 ${isPastHero ? 'text-[#3A2220]' : 'text-white'}`
                      : 'opacity-0 translate-x-4 pointer-events-none text-transparent'
                  }`}
                  style={{
                    mixBlendMode: isPastHero ? 'normal' : 'difference'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Style Reference Hero Section with full-background image and darken overlay */}
      <section id="hero" className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-950 px-6 py-24 md:py-36">
        {/* Full-background image with darken overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80" 
            alt="Warm mystical forest wedding" 
            className="w-full h-full object-cover grayscale contrast-[105%] brightness-[0.80]" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/55" /> {/* Darken overlay */}
        </div>

        {/* Center Typography & Emblem */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="space-y-8"
          >
            <div className="flex justify-center">
              <OvalMonogram className="w-16 h-16 text-bg/90" />
            </div>
            
            <div className="space-y-4">
              <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] text-white uppercase">
                SARAH &<br />ALDERSON
              </h2>
            </div>

            <div className="space-y-6">
              <p className="font-mono text-[10px] tracking-[0.35em] text-white/75 uppercase">
                {t.heroDate}
              </p>
              
              <div className="flex justify-center pt-2">
                <button 
                  onClick={() => handleScrollTo('rsvp')}
                  className="font-mono text-[9px] tracking-[0.3em] uppercase border border-white/25 text-white bg-white/10 backdrop-blur-md py-2.5 px-8 rounded-full hover:bg-white/20 hover:border-white/45 transition-all duration-300 transform active:scale-95 ease-out cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                >
                  {t.heroBtn}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pristine Interactive Gallery Section ("Weaved Journeys") */}
      <section id="gallery" ref={galleryRef} className="py-24 md:py-36 bg-[#F4F3EF] px-6 md:px-12 relative overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Fallback Beautiful Stack Layout for Mobile Devices (Fully responsive) */}
          <div className="block md:hidden space-y-12 pt-6">
            
            {/* Center card first on mobile so it's readable */}
            <div className="py-6 px-2 bg-white/40 rounded-sm border border-[#3A2220]/5 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Two columns layout for names on mobile too! */}
                  <div className="flex items-center justify-center gap-4 w-full text-[#3A2220]">
                    <div className="text-right">
                      <p className="font-serif italic font-light text-2xl leading-tight">Bảo Eve</p>
                      <p className="font-serif italic font-light text-lg leading-none opacity-85">& Johnathan</p>
                    </div>
                    <span className="font-serif text-sm text-[#3A2220]/60 italic font-light">&</span>
                    <div className="text-left">
                      <p className="font-serif italic font-light text-2xl leading-tight">Bảo Eve</p>
                      <p className="font-serif italic font-light text-lg leading-none opacity-85">& Johnathan</p>
                    </div>
                  </div>

                  <p className="font-serif italic text-sm text-[#3A2220]/80 mt-1">{t.gettingMarried}</p>
                  
                  <div className="h-px w-24 bg-[#3A2220]/15" />
                  
                  <p className="font-serif text-[11px] leading-relaxed text-[#3A2220]/75 max-w-xs italic text-center px-4">
                    {t.invitationText}
                  </p>
                  
                  <div className="h-px w-24 bg-[#3A2220]/15" />
                  
                  <div className="grid grid-cols-3 w-full font-mono text-[8px] tracking-widest text-[#3A2220]/65 uppercase px-4">
                    <div>
                      <span className="block font-serif text-sm font-light text-[#3A2220]">10</span>
                      <span className="block text-[7px] mt-0.5">{t.october2027}</span>
                    </div>
                    <div className="border-l border-r border-[#3A2220]/10 px-1 py-0.5">
                      <span className="block">TOKYO,</span>
                      <span className="block font-light">{lang === 'VIE' ? 'NHẬT BẢN' : 'JAPAN'}</span>
                    </div>
                    <div>
                      <span className="block font-serif text-sm font-light text-[#3A2220]">10</span>
                      <span className="block text-[7px] mt-0.5">{t.october2027}</span>
                    </div>
                  </div>
                </div>
            </div>

            {/* List the pictures as gorgeous polaroids with occasional elegant seals */}
            <div className="space-y-16">
              {galleryImages.map((img, index) => (
                <div key={img.id} className="relative">
                  {/* Decorative seal for certain mobile images to maintain the luxurious feel of the mockup */}
                  {index === 0 && (
                    <div className="absolute -top-6 -right-4 z-20 scale-75">
                      <EmbossedSeal className="w-20 h-20" />
                    </div>
                  )}
                  {index === 4 && (
                    <div className="absolute -top-6 -left-4 z-20 scale-75">
                      <EmbossedSeal className="w-20 h-20" />
                    </div>
                  )}
                  
                  <div 
                    onClick={() => openLightbox(img.id)} 
                    className="bg-white p-4 pb-12 shadow-md border border-neutral-100 rounded-sm cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className={`overflow-hidden grayscale ${img.id === 1 || img.id === 5 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Masterpiece Scrumptuous Collage Layout with Differential Parallax Speed */}
          <div className="hidden md:block relative w-full h-[1420px] overflow-hidden select-none">
            
            {/* Centerpiece Text Card */}
            <motion.div 
              style={{ y: ySlow2 }}
              className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[42%] z-10 flex flex-col items-center text-center"
            >
              <div className="flex flex-col items-center justify-center text-center w-full">
                {/* Two Column Names Layout exactly mirroring the screenshot */}
                <div className="flex items-center justify-center gap-10 lg:gap-14 w-full text-[#3A2220]">
                  {/* Left Column */}
                  <div className="text-right">
                    <p className="font-serif italic font-light text-3xl lg:text-4xl leading-tight">Bảo Eve</p>
                    <p className="font-serif italic font-light text-2xl lg:text-3xl leading-none opacity-85">& Johnathan</p>
                  </div>
                  
                  {/* Center & */}
                  <span className="font-serif text-lg lg:text-xl text-[#3A2220]/50 italic font-light">&</span>
                  
                  {/* Right Column */}
                  <div className="text-left">
                    <p className="font-serif italic font-light text-3xl lg:text-4xl leading-tight">Bảo Eve</p>
                    <p className="font-serif italic font-light text-2xl lg:text-3xl leading-none opacity-85">& Johnathan</p>
                  </div>
                </div>
                
                <h3 className="font-serif italic text-base lg:text-lg text-[#3A2220]/80 mt-4">
                  {t.gettingMarried}
                </h3>
                
                <div className="w-full h-px bg-[#3A2220]/15 my-5" />
                
                <p className="font-serif text-[11.5px] lg:text-[12.5px] leading-relaxed text-[#3A2220]/75 max-w-lg italic font-light px-4">
                  {t.invitationText}
                </p>
                
                <div className="w-full h-px bg-[#3A2220]/15 my-5" />
                
                <div className="grid grid-cols-3 w-full max-w-md mx-auto items-center text-center font-mono text-[9px] tracking-[0.25em] text-[#3A2220]/70 uppercase">
                  <div>
                    <span className="block font-serif text-2xl font-light text-[#3A2220] leading-none">10</span>
                    <span className="block text-[8px] mt-1.5 text-muted">{t.october2027}</span>
                  </div>
                  <div className="border-l border-r border-[#3A2220]/12 py-1 px-4">
                    <span className="block text-[9.5px] leading-tight font-medium">TOKYO,</span>
                    <span className="block text-[9.5px] leading-tight font-light">{lang === 'VIE' ? 'NHẬT BẢN' : 'JAPAN'}</span>
                  </div>
                  <div>
                    <span className="block font-serif text-2xl font-light text-[#3A2220] leading-none">10</span>
                    <span className="block text-[8px] mt-1.5 text-muted">{t.october2027}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Photo 1: Left Vertical (silhouette doorway) - Slow Parallax */}
            <motion.div 
              style={{ y: ySlow1 }}
              onClick={() => openLightbox(1)}
              className="absolute top-[18%] left-[4%] w-[23%] bg-white p-4 pb-14 shadow-[2px_12px_24px_rgba(0,0,0,0.06),_0_2px_4px_rgba(0,0,0,0.02)] border border-neutral-100/50 rounded-sm cursor-pointer group hover:shadow-2xl transition-all duration-500 z-20 hover:z-30 rotate-[-1.5deg]"
            >
              <div className="aspect-[3/4] overflow-hidden grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700">
                <img src={galleryImages[0].url} alt={galleryImages[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </motion.div>

            {/* Embossed Seal Top Left: Overlapping top-right of left photo */}
            <motion.div
              style={{ y: ySlow1 }}
              className="absolute top-[12%] left-[21%] z-30 pointer-events-none rotate-[4deg]"
            >
              <EmbossedSeal className="w-28 h-28" />
            </motion.div>

            {/* Photo 2: Top-Right (forest cabin) - Med Parallax */}
            <motion.div 
              style={{ y: yMed1 }}
              onClick={() => openLightbox(2)}
              className="absolute top-[5%] right-[11%] w-[26%] bg-white p-4 pb-14 shadow-[2px_12px_24px_rgba(0,0,0,0.06),_0_2px_4px_rgba(0,0,0,0.02)] border border-neutral-100/50 rounded-sm cursor-pointer group hover:shadow-2xl transition-all duration-500 z-20 hover:z-30 rotate-[1.2deg]"
            >
              <div className="aspect-[4/3] overflow-hidden grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700">
                <img src={galleryImages[1].url} alt={galleryImages[1].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </motion.div>

            {/* Photo 3: Middle-Right (couple dancing B&W) - Slow Parallax */}
            <motion.div 
              style={{ y: ySlow2 }}
              onClick={() => openLightbox(3)}
              className="absolute top-[31%] right-[2%] w-[24%] bg-white p-4 pb-14 shadow-[2px_12px_24px_rgba(0,0,0,0.06),_0_2px_4px_rgba(0,0,0,0.02)] border border-neutral-100/50 rounded-sm cursor-pointer group hover:shadow-2xl transition-all duration-500 z-20 hover:z-30 rotate-[-1deg]"
            >
              <div className="aspect-[4/3] overflow-hidden grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700">
                <img src={galleryImages[2].url} alt={galleryImages[2].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </motion.div>

            {/* Photo 4: Bottom-Center (forest trees pathway) - Med Parallax */}
            <motion.div 
              style={{ y: yMed2 }}
              onClick={() => openLightbox(4)}
              className="absolute top-[57%] left-[25%] w-[26%] bg-white p-4 pb-14 shadow-[px_12px_24px_rgba(0,0,0,0.06),_0_2px_4px_rgba(0,0,0,0.02)] border border-neutral-100/50 rounded-sm cursor-pointer group hover:shadow-2xl transition-all duration-500 z-20 hover:z-30 rotate-[1.5deg]"
            >
              <div className="aspect-[4/3] overflow-hidden grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700">
                <img src={galleryImages[3].url} alt={galleryImages[3].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </motion.div>

            {/* Photo 5: Bottom-Right Portrait (bride outside) - Fast Parallax */}
            <motion.div 
              style={{ y: yFast2 }}
              onClick={() => openLightbox(5)}
              className="absolute top-[72%] right-[10%] w-[20%] bg-white p-4 pb-14 shadow-[2px_12px_24px_rgba(0,0,0,0.06),_0_2px_4px_rgba(0,0,0,0.02)] border border-neutral-100/50 rounded-sm cursor-pointer group hover:shadow-2xl transition-all duration-500 z-20 hover:z-30 rotate-[2.5deg]"
            >
              <div className="aspect-[3/4] overflow-hidden grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700">
                <img src={galleryImages[4].url} alt={galleryImages[4].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </motion.div>

            {/* Embossed Seal Bottom Right: Overlapping top-left of bottom-right photo */}
            <motion.div
              style={{ y: yFast2 }}
              className="absolute top-[66%] right-[24%] z-30 pointer-events-none rotate-[-6deg]"
            >
              <EmbossedSeal className="w-28 h-28" />
            </motion.div>

          </div>

        </div>
      </section>

      {/* Style Reference Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 bg-[#1A1A1AC0] backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
          >
            {/* Close Button element */}
            <button 
              onClick={closeLightbox}
              className="absolute top-6 right-6 font-mono text-[9px] tracking-widest uppercase text-white/90 hover:bg-white/20 border border-white/25 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full transition-all z-50 cursor-pointer shadow-sm"
            >
              {t.closeEsc}
            </button>

            {/* Left/Right navigation info */}
            <div className="hidden md:flex absolute inset-x-8 top-1/2 -translate-y-1/2 justify-between pointer-events-none">
              <button 
                onClick={prevLightbox} 
                className="pointer-events-auto w-12 h-12 flex items-center justify-center border border-white/25 hover:border-white/45 bg-black/30 hover:bg-black/45 backdrop-blur-md rounded-full text-white/90 transition-all cursor-pointer shadow-md"
              >
                ←
              </button>
              <button 
                onClick={nextLightbox} 
                className="pointer-events-auto w-12 h-12 flex items-center justify-center border border-white/25 hover:border-white/45 bg-black/30 hover:bg-black/45 backdrop-blur-md rounded-full text-white/90 transition-all cursor-pointer shadow-md"
              >
                →
              </button>
            </div>

            {/* Modal Image Display Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-bg rounded-sm overflow-hidden border border-black/10 shadow-2xl p-4 md:p-6 cursor-default"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Photo portion */}
                <div className="md:col-span-8 aspect-[4/5] md:aspect-auto md:h-[70vh] bg-neutral-100 overflow-hidden rounded-sm relative">
                  <img 
                    src={galleryImages[lightboxIndex].url} 
                    alt={galleryImages[lightboxIndex].title}
                    className="w-full h-full object-cover grayscale"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-forest/5 mix-blend-overlay" />
                </div>

                {/* Info sidebar portion */}
                <div className="md:col-span-4 flex flex-col justify-between py-2 space-y-8 font-mono">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <span className="text-[7.5px] uppercase tracking-[0.4em] text-muted">{t.frameInfo}</span>
                      <h3 className="font-serif text-3xl font-normal leading-tight tracking-tight uppercase text-ink pt-1">
                        {galleryImages[lightboxIndex].title}
                      </h3>
                    </div>

                    <div className="space-y-4 text-[9px] uppercase tracking-widest text-ink leading-loose border-t border-b border-black/5 py-4">
                      <p className="flex justify-between">
                        <span className="text-muted">{t.locationLabel}</span>
                        <span className="text-right">{galleryImages[lightboxIndex].location}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted">{t.dateTimeLabel}</span>
                        <span className="text-right">{galleryImages[lightboxIndex].date}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted">{t.cameraLabel}</span>
                        <span className="text-right">{galleryImages[lightboxIndex].camera}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[8px] leading-relaxed text-muted uppercase">
                      "{t.photoQuote}"
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={prevLightbox} 
                        className="text-[9px] font-mono tracking-widest uppercase text-ink hover:bg-[#3A2220]/10 bg-white/40 backdrop-blur-sm border border-black/10 rounded-full px-3 py-1 transition-all"
                      >
                        {t.prevBtn}
                      </button>
                      <p className="text-[9px] text-[#A2BCA0]">0{lightboxIndex + 1} / 0{galleryImages.length}</p>
                      <button 
                        onClick={nextLightbox} 
                        className="text-[9px] font-mono tracking-widest uppercase text-ink hover:bg-[#3A2220]/10 bg-white/40 backdrop-blur-sm border border-black/10 rounded-full px-3 py-1 transition-all"
                      >
                        {t.nextBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details / Events Section */}
      <section id="events" className="py-24 md:py-36 border-t border-ink/5 bg-[#FAF9F6] px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-7 space-y-32">
            {/* Itinerary */}
            <div className="grid grid-cols-3 gap-4 font-mono text-[9px] tracking-[0.2em] uppercase">
              <p className="text-muted">{t.itinerary}</p>
              <div className="col-span-2 space-y-3">
                {t.itineraryItems.map(([time, event]) => (
                  <div key={time} className="flex justify-between border-b border-black/5 pb-1">
                    <span>{time}</span>
                    <span className="text-muted opacity-30">........</span>
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attire */}
            <div className="grid grid-cols-3 gap-4 font-mono text-[9px] tracking-[0.2em] uppercase">
              <p className="text-muted">{t.attire}</p>
              <div className="col-span-2 space-y-2 leading-relaxed">
                <p>{t.attireDesc}</p>
                <div className="flex gap-4 pt-3 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.06)] bg-[#7D8E73] transition-transform hover:scale-110 duration-300" title={t.sage} />
                    <span className="text-[7px] text-muted leading-none tracking-normal regular">{t.sage}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.06)] bg-[#E3D5C3] transition-transform hover:scale-110 duration-300" title={t.sand} />
                    <span className="text-[7px] text-muted leading-none tracking-normal regular">{t.sand}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.06)] bg-[#B67E65] transition-transform hover:scale-110 duration-300" title={t.clay} />
                    <span className="text-[7px] text-muted leading-none tracking-normal regular">{t.clay}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Photo */}
          <div className="md:col-span-5 relative pt-16">
            <h2 className="font-serif text-5xl font-light absolute top-4 left-0 z-20 -rotate-3 text-ink">{t.detailsTitle}</h2>
            <div className="relative bg-white p-3 shadow-sm border border-black/5">
              {/* Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 tape -rotate-2 z-10 opacity-80" />
              <div className="aspect-square overflow-hidden grayscale contrast-125">
                <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80" 
                  alt="Details" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gifts Registry Section */}
      <section className="max-w-5xl mx-auto py-24 md:py-36 grid md:grid-cols-12 gap-16 items-center px-6">
        <div className="md:col-span-5 relative">
          <div className="relative bg-white p-3 shadow-sm border border-black/5">
            {/* Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 tape rotate-1 z-10 opacity-80" />
            <div className="aspect-square overflow-hidden grayscale contrast-125">
              <img 
                src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=500&q=80" 
                alt="Registry Gifts" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-10">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-4xl uppercase tracking-tight">{t.registry}</h2>
            <span className="text-2xl text-forest inline-block translate-y-1">♡</span>
          </div>
          <div className="space-y-8 max-w-md">
            <p className="font-mono text-[10px] leading-relaxed text-muted tracking-wide">
              {t.registryParagraph}
            </p>
            <div className="pt-4">
              <button className="font-mono text-[9px] tracking-[0.3em] uppercase border border-[#3A2220]/15 bg-white/40 backdrop-blur-md px-6 py-3 rounded-full hover:bg-white/75 text-ink transition-all shadow-sm active:scale-95 ease-out cursor-pointer">
                {t.registryBtn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Form Section */}
      <section id="rsvp" className="max-w-4xl mx-auto py-24 md:py-36 px-6">
        <div className="text-center mb-20 relative">
          <h2 className="font-serif text-[64px] md:text-[96px] leading-none uppercase tracking-tight">RSVP</h2>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted mt-6">
            {t.respondBy}
          </p>
        </div>
        <div className="bg-white p-8 md:p-16 border border-black/5 shadow-md">
          <RSVPForm lang={lang} />
        </div>
      </section>

      {/* Coastal Blue Elegant Visual Collage Section */}
      <section id="coastal-blue-collage" className="w-full relative py-16 md:py-24 overflow-hidden bg-stone-100 min-h-[500px] sm:min-h-[600px] md:min-h-[850px] flex flex-col items-center justify-center">
        {/* Background beach cliff photo with high-contrast grayscale feel */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=2000&q=80" 
            alt="Coastal rocks" 
            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette/shading overlay to match the image's artistic depth */}
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        </div>

        {/* Scaled stage for the paper collage to assure responsive alignment */}
        <div className="relative z-10 w-full max-w-4xl h-[420px] sm:h-[550px] md:h-[700px] flex items-center justify-center">
          <div className="scale-[0.8] xs:scale-[0.9] sm:scale-[0.95] md:scale-100 hover:scale-[1.01] transition-transform duration-700 ease-out relative w-full h-full flex items-center justify-center">
            
            {/* 1. Large Lined Notebook Paper Turned Interactive Notebook */}
            <form 
              onSubmit={handleCollageSubmitNote} 
              className="relative bg-[#FAF8F5] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-200/40 w-[280px] sm:w-[360px] md:w-[460px] h-[340px] sm:h-[450px] md:h-[570px] rounded-[1px] p-5 sm:p-8 md:p-12 flex flex-col justify-between"
            >
              {/* Notebook rule lines */}
              <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none rounded-[1px]"
                style={{
                  backgroundImage: 'linear-gradient(#A2BCA0 1.2px, transparent 1.2px)',
                  backgroundSize: '100% 25px',
                  backgroundPosition: '0 12px',
                }}
              />
              
              {/* Header inside paper */}
              <div className="relative z-10 text-center mt-1 sm:mt-4 pb-2 border-b border-stone-200">
                <h3 className="font-serif text-[18px] sm:text-[24px] md:text-[28px] text-[#3A2220] tracking-tight italic select-none">
                  {lang === 'VIE' ? "Gửi Lời Chúc Mừng" : "Write Us a Note..."}
                </h3>
                <p className="font-mono text-[6px] sm:text-[8px] md:text-[10px] tracking-[0.25em] text-[#3A2220]/50 uppercase leading-normal">
                  {lang === 'VIE' ? "SỔ LƯU BÚT KỶ NIỆM" : "WEDDING GUEST BOOK"}
                </p>
              </div>

              {/* Message text area */}
              <div className="relative z-10 flex-1 my-3 sm:my-4 md:my-6 min-h-[120px] overflow-hidden">
                <textarea
                  value={collageNoteText}
                  onChange={(e) => {
                    setCollageNoteText(e.target.value);
                    if (collageSubmitError) setCollageSubmitError(null);
                  }}
                  placeholder={lang === 'VIE' ? "Hãy viết một câu chúc, lời nhắn nhủ hay kỷ niệm ngọt ngào tại đây nhé..." : "Leave a warm wish, loving note, or advice for our journey..."}
                  required
                  maxLength={400}
                  className="w-full h-full bg-transparent border-none outline-none font-script text-[14px] sm:text-[18px] md:text-[21px] leading-[25px] text-[#3A2220]/90 placeholder-[#3A2220]/30 resize-none focus:ring-0 selection:bg-stone-200 py-1"
                  style={{ lineHeight: '25px' }}
                />
              </div>

              {/* Signature Input and Submit at the bottom */}
              <div className="relative z-10 space-y-3 sm:space-y-4 pt-2 border-t border-stone-300/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[7px] sm:text-[9px] tracking-widest text-[#3A2220]/60 uppercase whitespace-nowrap select-none">{lang === 'VIE' ? "THÂN THƯƠNG," : "WITH LOVE,"}</span>
                  <input
                    type="text"
                    value={collageGuestName}
                    onChange={(e) => {
                      setCollageGuestName(e.target.value);
                      if (collageSubmitError) setCollageSubmitError(null);
                    }}
                    placeholder={lang === 'VIE' ? "Tên của bạn..." : "Your Name(s)"}
                    required
                    maxLength={50}
                    className="bg-transparent border-b border-[#3A2220]/20 hover:border-[#3A2220]/40 focus:border-[#3A2220] focus:ring-0 outline-none font-script text-[14px] sm:text-[18px] text-[#3A2220] py-0.5 px-1 flex-1 min-w-0 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Error display inline inside paper */}
                  <span className="text-[9px] text-red-500 font-sans line-clamp-1">
                    {collageSubmitError}
                  </span>

                  <button
                    type="submit"
                    disabled={isCollageSubmitting}
                    className={`py-1.5 sm:py-2 px-4 sm:px-6 font-mono text-[6px] sm:text-[8px] md:text-[9px] tracking-[0.2em] uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none border whitespace-nowrap ${
                      isCollageSubmitted
                        ? 'bg-emerald-800 text-stone-100 border-emerald-800'
                        : 'bg-stone-900 border-stone-900 text-stone-100 hover:bg-stone-800'
                    } disabled:opacity-50`}
                  >
                    {isCollageSubmitting ? (
                      <span>{lang === 'VIE' ? "ĐANG GỬI..." : "SAVING..."}</span>
                    ) : isCollageSubmitted ? (
                      <span>✓ {lang === 'VIE' ? "ĐÃ GỬI!" : "PINNED!"}</span>
                    ) : (
                      <span>{lang === 'VIE' ? "GỬI CHÚC MỪNG" : "PIN TO BOARD"}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* 2. Kraft/Tan Textured Card (Tilted Left, overlapping) - Welcoming greeting from the couple */}
            <div className="absolute bottom-[10%] left-[8%] xs:left-[12%] sm:left-[16%] md:left-[14%] -rotate-[6deg] hover:-rotate-[4deg] bg-[#C1B7A4] shadow-[0_12px_30px_rgba(0,0,0,0.18)] border border-stone-300/40 w-[180px] sm:w-[220px] md:w-[280px] h-[90px] sm:h-[110px] md:h-[140px] p-4 sm:p-5 md:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing">
              {/* Kraft Paper fiber noise simulation */}
              <div className="absolute inset-0 bg-white/5 opacity-40 pointer-events-none mix-blend-overlay" />
              
              <p className="font-script text-[11px] sm:text-[13px] md:text-[16px] text-[#3A2220]/90 leading-tight font-medium text-left pr-4 leading-relaxed tracking-wide select-none">
                {lang === 'VIE' ? (
                  <>
                    Cảm ơn tất cả mọi người <br />
                    đã đồng hành & chia sẻ <br />
                    những khoảnh khắc tuyệt vời <br />
                    trong ngày hạnh phúc của tụi mình.
                  </>
                ) : (
                  <>
                    Thank you so much <br />
                    for celebrating with us! <br />
                    Your love, support and presence <br />
                    mean the entire world to us.
                  </>
                )}
              </p>
              
              {/* Vertical brand line on the right edge */}
              <div className="absolute right-[1px] md:right-[4px] top-1/2 -translate-y-1/2 rotate-90 origin-center text-[4px] sm:text-[5px] md:text-[6px] tracking-[0.3em] text-[#3a2220]/60 font-mono whitespace-nowrap">
                SARAH & MICHAEL • TOKYO 2026
              </div>
            </div>

            {/* 3. Charcoal Card (Tilted Right, overlapping) */}
            <div className="absolute top-[18%] right-[8%] xs:right-[12%] sm:right-[16%] md:right-[14%] rotate-[3deg] hover:rotate-[1deg] bg-[#2E2E2D] shadow-[0_15px_40px_rgba(0,0,0,0.25)] w-[140px] sm:w-[180px] md:w-[230px] h-[140px] sm:h-[180px] md:h-[230px] p-5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-grab active:cursor-grabbing z-20">
              {/* White mock punch hole at top center */}
              <div className="absolute top-3 sm:top-4 md:top-6 left-1/2 -translate-x-1/2 w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4 rounded-full bg-stone-100 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.35)]" />
              
              <div className="relative z-10 space-y-1 sm:space-y-1.5 md:space-y-2 pointer-events-none">
                {/* Custom cursive calligraphy text */}
                <h3 className="font-script text-lg sm:text-2xl md:text-3xl text-[#FAF8F5] leading-none select-none italic py-1">
                  S & M
                </h3>
                <div className="space-y-0.5">
                  <p className="font-mono text-[5px] sm:text-[6px] md:text-[8px] tracking-[0.35em] text-white/40 uppercase leading-none">
                    {lang === 'VIE' ? "XIN CẢM ƠN" : "THANK YOU"}
                  </p>
                  <p className="font-mono text-[4px] sm:text-[5px] md:text-[6px] tracking-[0.35em] text-white/40 uppercase leading-none">
                    {lang === 'VIE' ? "ƯỚC NGUYỆN TRỌN ĐỜI" : "FOREVER COLLAGE"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Guestbook Live Board - Sticky Cards Grid */}
        <AnimatePresence>
          {collageNotes.length > 0 && (
            <div className="w-full max-w-6xl mx-auto px-6 py-12 text-center space-y-8 relative z-10">
              <div className="space-y-2">
                <h4 className="font-serif text-xl sm:text-2xl uppercase tracking-wider text-[#3A2220]/80">
                  {lang === 'VIE' ? "Lời Chúc Từ Người Thân & Bạn Bè" : "Wishes from Friends & Family"}
                </h4>
                <p className="font-mono text-[8px] sm:text-[10px] tracking-widest text-[#3A2220]/50 uppercase">
                  {lang === 'VIE' ? "SỔ LƯU BÚT ĐIỆN TỬ THỜI GIAN THỰC" : "REALTIME GUEST LOG DESIGN"}
                </p>
              </div>

              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4"
              >
                <AnimatePresence mode="popLayout">
                  {collageNotes.map((note, index) => {
                    const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', '-rotate-1.5', 'rotate-1.5'];
                    const rotation = rotations[index % rotations.length];
                    const tints = [
                      'bg-[#FCFBF7] border-stone-200 shadow-sm',
                      'bg-[#FAF9F5] border-stone-200 shadow-sm',
                      'bg-[#FDFCF9] border-stone-200 shadow-sm',
                    ];
                    const tint = tints[index % tints.length];

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: -15 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ scale: 1.03, zIndex: 10 }}
                        className={`relative p-6 ${tint} ${rotation} border rounded-[1px] select-none transition-shadow duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.03)] min-h-[140px] flex flex-col justify-between`}
                      >
                        {/* Polaroid Tape Accent */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3.5 bg-white/50 backdrop-blur-[1px] border border-stone-200/40 shadow-[0_1px_2px_rgba(0,0,0,0.01)] rotate-[-1deg]" />
                        
                        <div className="space-y-4 text-left">
                          <p className="font-script text-[18px] text-[#3A2220] leading-relaxed break-words whitespace-pre-wrap selection:bg-[#3A2220]/10">
                            "{note.noteText}"
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-[#3A2220]/5">
                            <span className="font-script text-[15px] text-[#3A2220] font-medium leading-none">
                              — {note.guestName}
                            </span>
                            <span className="text-red-400 text-[10px]">♥</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>


      {/* Footer */}
      <footer className="max-w-6xl mx-auto py-24 border-t border-black/5 text-center font-mono text-[8px] tracking-[0.4em] uppercase text-muted px-6 space-y-4">
        <p>&copy; 2026 Sarah Williams & Michael Alderson. All rights reserved.</p>
        <div className="flex justify-center pt-2">
          <button 
            onClick={() => navigateTo('/admin')}
            className="opacity-20 hover:opacity-100 transition-all duration-300 text-[7px] tracking-[0.5em] focus:outline-none cursor-pointer bg-black/5 hover:bg-black/10 backdrop-blur-sm border border-black/5 hover:border-black/10 px-3 py-1.5 rounded-full"
            id="secret-admin-btn"
          >
            • ADMIN SUITE •
          </button>
        </div>
      </footer>
    </div>
  );
}
