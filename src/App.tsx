import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { RSVPForm } from './components/RSVPForm';
import { AdminPanel } from './components/AdminPanel';
import { StorySection } from './components/StorySection';
import CountdownSection from './components/CountdownSection';
import { GatheringSection } from './components/GatheringSection';
import { VolumeX, Volume2, Music, Menu, X } from 'lucide-react';
import { onSnapshot, doc, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

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
  const [lang, setLang] = useState<'VIE' | 'ENG'>('ENG');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredSidebarIndex, setHoveredSidebarIndex] = useState<number | null>(null);
  const [isPastHero, setIsPastHero] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Section drag constraints and local notes state for collage
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [localNoteText, setLocalNoteText] = useState('');
  const [localGuestName, setLocalGuestName] = useState('');
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'rsvp' | 'note'>('rsvp');
  const [localNotes, setLocalNotes] = useState<Array<{name: string, text: string, id: number}>>(() => {
    try {
      const saved = localStorage.getItem('wedding_local_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLocalSubmitted, setIsLocalSubmitted] = useState(false);
  const [dbNotes, setDbNotes] = useState<Array<{name: string, text: string, id: string}>>([]);

  // States for live dynamic Cloudinary images and CMS text content
  const [siteContent, setSiteContent] = useState<{
    imageUrl?: string;
    leftPortraitUrl?: string;
    rightPortraitUrl?: string;
    mapImageUrl?: string;
    storyThreeUrl?: string;
    storyFourUrl?: string;
    storyFiveUrl?: string;
    collageBgUrl?: string;
    collageLaceBgUrl?: string;
    collagePinkStampUrl?: string;
    collageSageStampUrl?: string;
    brideName?: string;
    groomName?: string;
    heroTitle?: string;
    heroDateEng?: string;
    heroDateVie?: string;
    invitationTextEng?: string;
    invitationTextVie?: string;
    venueNameEng?: string;
    venueNameVie?: string;
    weddingDateShortEng?: string;
    weddingDateShortVie?: string;
    photoQuoteEng?: string;
    photoQuoteVie?: string;
    attireDescEng?: string;
    attireDescVie?: string;
    registryTextEng?: string;
    registryTextVie?: string;
    countdownTargetDate?: string;
    countdownHeight?: string;
    countdownTitleEng?: string;
    countdownTitleVie?: string;
    countdownEndTitleEng?: string;
    countdownEndTitleVie?: string;
    countdownLoc1City?: string;
    countdownLoc1Country?: string;
    countdownLoc2City?: string;
    countdownLoc2Country?: string;
    countdownLoc3City?: string;
    countdownLoc3Country?: string;
    countdownSinceText?: string;
    sidebarHomeEng?: string;
    sidebarHomeVie?: string;
    sidebarStoryEng?: string;
    sidebarStoryVie?: string;
    sidebarEventsEng?: string;
    sidebarEventsVie?: string;
    sidebarGatherEng?: string;
    sidebarGatherVie?: string;
    sidebarRsvpEng?: string;
    sidebarRsvpVie?: string;
    heroBtnEng?: string;
    heroBtnVie?: string;
    registryBtnEng?: string;
    registryBtnVie?: string;
    respondByEng?: string;
    respondByVie?: string;
    writeNoteTitleEng?: string;
    writeNoteTitleVie?: string;
    writeNoteSubtitleEng?: string;
    writeNoteSubtitleVie?: string;
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
  }>({});

  // Real-time synchronization of custom website images and text content
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'site_content', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteContent({
          imageUrl: data.imageUrl || '',
          leftPortraitUrl: data.leftPortraitUrl || '',
          rightPortraitUrl: data.rightPortraitUrl || '',
          mapImageUrl: data.mapImageUrl || '',
          storyThreeUrl: data.storyThreeUrl || '',
          storyFourUrl: data.storyFourUrl || '',
          storyFiveUrl: data.storyFiveUrl || '',
          collageBgUrl: data.collageBgUrl || '',
          collageLaceBgUrl: data.collageLaceBgUrl || '',
          collagePinkStampUrl: data.collagePinkStampUrl || '',
          collageSageStampUrl: data.collageSageStampUrl || '',
          brideName: data.brideName || '',
          groomName: data.groomName || '',
          heroTitle: data.heroTitle || '',
          heroDateEng: data.heroDateEng || '',
          heroDateVie: data.heroDateVie || '',
          invitationTextEng: data.invitationTextEng || '',
          invitationTextVie: data.invitationTextVie || '',
          venueNameEng: data.venueNameEng || '',
          venueNameVie: data.venueNameVie || '',
          weddingDateShortEng: data.weddingDateShortEng || '',
          weddingDateShortVie: data.weddingDateShortVie || '',
          photoQuoteEng: data.photoQuoteEng || '',
          photoQuoteVie: data.photoQuoteVie || '',
          attireDescEng: data.attireDescEng || '',
          attireDescVie: data.attireDescVie || '',
          registryTextEng: data.registryTextEng || '',
          registryTextVie: data.registryTextVie || '',
          countdownTargetDate: data.countdownTargetDate || '',
          countdownHeight: data.countdownHeight || '',
          countdownTitleEng: data.countdownTitleEng || '',
          countdownTitleVie: data.countdownTitleVie || '',
          countdownEndTitleEng: data.countdownEndTitleEng || '',
          countdownEndTitleVie: data.countdownEndTitleVie || '',
          countdownLoc1City: data.countdownLoc1City || '',
          countdownLoc1Country: data.countdownLoc1Country || '',
          countdownLoc2City: data.countdownLoc2City || '',
          countdownLoc2Country: data.countdownLoc2Country || '',
          countdownLoc3City: data.countdownLoc3City || '',
          countdownLoc3Country: data.countdownLoc3Country || '',
          countdownSinceText: data.countdownSinceText || '',
          sidebarHomeEng: data.sidebarHomeEng || '',
          sidebarHomeVie: data.sidebarHomeVie || '',
          sidebarStoryEng: data.sidebarStoryEng || '',
          sidebarStoryVie: data.sidebarStoryVie || '',
          sidebarEventsEng: data.sidebarEventsEng || '',
          sidebarEventsVie: data.sidebarEventsVie || '',
          sidebarGatherEng: data.sidebarGatherEng || '',
          sidebarGatherVie: data.sidebarGatherVie || '',
          sidebarRsvpEng: data.sidebarRsvpEng || '',
          sidebarRsvpVie: data.sidebarRsvpVie || '',
          heroBtnEng: data.heroBtnEng || '',
          heroBtnVie: data.heroBtnVie || '',
          registryBtnEng: data.registryBtnEng || '',
          registryBtnVie: data.registryBtnVie || '',
          respondByEng: data.respondByEng || '',
          respondByVie: data.respondByVie || '',
          writeNoteTitleEng: data.writeNoteTitleEng || '',
          writeNoteTitleVie: data.writeNoteTitleVie || '',
          writeNoteSubtitleEng: data.writeNoteSubtitleEng || '',
          writeNoteSubtitleVie: data.writeNoteSubtitleVie || '',
          gatherHeadingEng: data.gatherHeadingEng || '',
          gatherHeadingVie: data.gatherHeadingVie || '',
          gatherSubtitleEng: data.gatherSubtitleEng || '',
          gatherSubtitleVie: data.gatherSubtitleVie || '',
          gatherDescEng: data.gatherDescEng || '',
          gatherDescVie: data.gatherDescVie || '',
          gatherCereTitleEng: data.gatherCereTitleEng || '',
          gatherCereTitleVie: data.gatherCereTitleVie || '',
          gatherCereDescEng: data.gatherCereDescEng || '',
          gatherCereDescVie: data.gatherCereDescVie || '',
          gatherFeastTitleEng: data.gatherFeastTitleEng || '',
          gatherFeastTitleVie: data.gatherFeastTitleVie || '',
          gatherFeastDescEng: data.gatherFeastDescEng || '',
          gatherFeastDescVie: data.gatherFeastDescVie || '',
          gatherNoteEng: data.gatherNoteEng || '',
          gatherNoteVie: data.gatherNoteVie || '',
          gatherMapPillEng: data.gatherMapPillEng || '',
          gatherMapPillVie: data.gatherMapPillVie || '',
          gatherLatitude: data.gatherLatitude || '',
          gatherLongitude: data.gatherLongitude || '',
          gatherDirectionsTextEng: data.gatherDirectionsTextEng || '',
          gatherDirectionsTextVie: data.gatherDirectionsTextVie || '',
          gatherDirectionsUrl: data.gatherDirectionsUrl || '',
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of guestbook database notes
  useEffect(() => {
    const q = query(collection(db, 'guest_notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList: Array<{name: string, text: string, id: string}> = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notesList.push({
          id: docSnap.id,
          name: data.name || '',
          text: data.text || ''
        });
      });
      setDbNotes(notesList);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'guest_notes');
      } catch (err) {
        console.error("Failed to load guestbook notes:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  const appTranslations = {
    ENG: {
      home: siteContent.sidebarHomeEng || "HOME",
      story: siteContent.sidebarStoryEng || "OUR STORY",
      gathering: siteContent.sidebarGatherEng || "VENUE",
      date: "THE DATE",
      events: siteContent.sidebarEventsEng || "EVENTS",
      rsvp: siteContent.sidebarRsvpEng || "RSVP",
      heroBtn: siteContent.heroBtnEng || "RSVP NOW",
      heroDate: siteContent.heroDateEng || "22 JUNE 2026, FRIDAY",
      gettingMarried: "are getting married",
      invitationText: siteContent.invitationTextEng || "Invite you to share in a quiet weekend of woodfire, forest walks, and the commitment of vows.",
      tokyoJapan: siteContent.venueNameEng || "TOKYO, JAPAN",
      october2027: siteContent.weddingDateShortEng || "OCT, 2027",
      closeEsc: "CLOSE (ESC)",
      frameInfo: "FRAME INFO",
      locationLabel: "LOCATION:",
      dateTimeLabel: "DATE TIME:",
      cameraLabel: "CAMERA:",
      photoQuote: siteContent.photoQuoteEng || "A quiet instant captured on analogue medium, celebrating the silent beauty of modern devotion.",
      prevBtn: "PREV",
      nextBtn: "NEXT",
      itinerary: "Itinerary",
      attire: "Attire",
      attireDesc: siteContent.attireDescEng || "Cocktail Attire. Black tie optional.",
      sage: "Sage",
      sand: "Sand",
      clay: "Clay",
      detailsTitle: "The Details",
      registry: "REGISTRY",
      registryParagraph: siteContent.registryTextEng || "We are so grateful to have you as a part of our lives, and your presence at our wedding is the greatest gift of all. If you would like to celebrate this joyous occasion with a gift, we have created a wedding registry to make it easier for you.",
      registryBtn: siteContent.registryBtnEng || "View Our Wedding Registry",
      respondBy: siteContent.respondByEng || "Kindly respond by March 23, 2026.",
      writeNoteTitle: siteContent.writeNoteTitleEng || "WRITE US A NOTE",
      writeNoteSubtitle: siteContent.writeNoteSubtitleEng || "Leave a memory, wish, or guidance on our wedding board.",
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
      home: siteContent.sidebarHomeVie || "TRANG CHỦ",
      story: siteContent.sidebarStoryVie || "CÂU CHUYỆN",
      gathering: siteContent.sidebarGatherVie || "ĐỊA ĐIỂM",
      date: "NGÀY CƯỚI",
      events: siteContent.sidebarEventsVie || "SỰ KIỆN",
      rsvp: siteContent.sidebarRsvpVie || "XÁC NHẬN",
      heroBtn: siteContent.heroBtnVie || "PHẢN HỒI NGAY",
      heroDate: siteContent.heroDateVie || "THƯ SÁU, 22 THÁNG 6, 2026",
      gettingMarried: "sẽ về chung một nhà",
      invitationText: siteContent.invitationTextVie || "Trân trọng kính mời bạn ghé thăm một ngày ấm áp đầy tiếng cười, hoa cỏ và lời thề ước chung đôi.",
      tokyoJapan: siteContent.venueNameVie || "TOKYO, NHẬT BẢN",
      october2027: siteContent.weddingDateShortVie || "TH.10, 2027",
      closeEsc: "ĐÓNG (ESC)",
      frameInfo: "THÔNG TIN ẢNH",
      locationLabel: "ĐỊA ĐIỂM:",
      dateTimeLabel: "THỜI GIAN:",
      cameraLabel: "MÁY ẢNH:",
      photoQuote: siteContent.photoQuoteVie || "Khoảnh khắc an yên ghi dấu qua thước phim màu, mừng ngày hạnh phúc đơm hoa.",
      prevBtn: "TRƯỚC",
      nextBtn: "SAU",
      itinerary: "Lịch trình",
      attire: "Trang phục",
      attireDesc: siteContent.attireDescVie || "Trang phục bán trang trọng (Cocktail). Nam có thể thắt nơ.",
      sage: "Màu Xanh",
      sand: "Màu Cát",
      clay: "Màu Đất sét",
      detailsTitle: "Chi tiết ngày vui",
      registry: "HỘP QUÀ",
      registryParagraph: siteContent.registryTextVie || "Sự hiện diện của bạn là niềm hạnh phúc lớn nhất của chúng mình. Nếu bạn muốn gửi chúc mừng, chúng mình đã chuẩn bị danh sách quà cưới nhỏ xinh dưới đây để bạn dễ dàng lựa chọn.",
      registryBtn: siteContent.registryBtnVie || "Xem Hộp Quà Chúc Mừng",
      respondBy: siteContent.respondByVie || "Vui lòng cho tụi mình biết phản hồi trước ngày 23 tháng 3, 2026.",
      writeNoteTitle: siteContent.writeNoteTitleVie || "GỬI LỜI CHÚC MỪNG",
      writeNoteSubtitle: siteContent.writeNoteSubtitleVie || "Ghi lại kỷ niệm hoặc lời nhắn nhủ dành cho ngày hạnh phúc của chúng mình.",
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

  // Background classical music system via highly robust native HTML5 Audio + Web Audio Synth fallback
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showMusicTooltip, setShowMusicTooltip] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<AmbientPianoSynth | null>(null);
  const isUsingSynthRef = useRef<boolean>(false);

  useEffect(() => {
    // Auto-dismiss music tooltip after 8s
    const timer = setTimeout(() => {
      setShowMusicTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize native HTML5 audio with classical piano recording & Web Audio synth fallback
  useEffect(() => {
    // Setup beautiful Satie Gymnopedie No 1 from Wikimedia Commons (100% stable, royalty-free classical piano recording)
    const audio = new Audio("https://upload.wikimedia.org/wikipedia/commons/e/e2/Erik_Satie_-_Gymnop%C3%A9die_No._1_-_Kevin_MacLeod.mp3");
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    // Instantiate fallback synth (zero network dependency)
    synthRef.current = new AmbientPianoSynth();

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
        audioRef.current = null;
      }
      if (synthRef.current) {
        try {
          synthRef.current.stop();
        } catch {}
        synthRef.current = null;
      }
    };
  }, []);

  // Dynamic play audio logic supporting first touch/click gestures & fallbacks
  const playAudio = async () => {
    if (isUsingSynthRef.current) {
      if (synthRef.current) {
        synthRef.current.start();
        setIsMusicPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      } catch (err) {
        console.warn("HTML5 background audio play failed or blocked, falling back to real-time Web Audio Synthesizer:", err);
        // Instant fallback to the pre-written C/G/Am/Em classical synth
        isUsingSynthRef.current = true;
        if (synthRef.current) {
          synthRef.current.start();
          setIsMusicPlaying(true);
        }
      }
    } else {
      // Fallback if audio element not initialized
      if (synthRef.current) {
        synthRef.current.start();
        setIsMusicPlaying(true);
      }
    }
  };

  const pauseAudio = () => {
    setIsMusicPlaying(false);
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
    if (synthRef.current) {
      try {
        synthRef.current.stop();
      } catch {}
    }
  };

  // Sync state hook for external state updates
  useEffect(() => {
    if (isMusicPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isMusicPlaying]);

  // Autoplay trigger on first physical user gesture (Safari, Chrome, iOS strict requirement)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        setIsMusicPlaying(true);
      }
    };

    const interactionEvents = ['mousemove', 'touchstart', 'click'];
    
    interactionEvents.forEach(event => {
      window.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      interactionEvents.forEach(event => {
        window.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [hasInteracted]);

  const toggleMusic = () => {
    setShowMusicTooltip(false);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    setIsMusicPlaying(prev => !prev);
  };

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
    { num: "02", label: t.story, target: "story" },
    { num: "03", label: t.events, target: "events" },
    { num: "04", label: t.gathering, target: "gathering-grounds" },
    { num: "05", label: t.rsvp, target: "rsvp" },
  ];

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
      
      {/* Top Floating Header with Language Selector and Sound Button */}
      <header className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Sound Button & Ambient Popup */}
        <div className="relative flex items-center">
          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? t.musicToggleTitleMute : t.musicToggleTitlePlay}
            className="bg-white/40 hover:bg-white/70 backdrop-blur-md border border-black/10 hover:border-black/25 rounded-full p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 flex items-center justify-center cursor-pointer relative"
          >
            {isMusicPlaying ? (
              <div className="flex items-end gap-[2px] h-4 w-4 px-0.5 justify-center pb-[2px]">
                <span className="w-0.5 h-3 bg-[#3A2220] rounded-sm animate-audio-bounce-1" />
                <span className="w-0.5 h-3 bg-[#3A2220] rounded-sm animate-audio-bounce-2" />
                <span className="w-0.5 h-3 bg-[#3A2220] rounded-sm animate-audio-bounce-3" />
                <span className="w-0.5 h-3 bg-[#3A2220] rounded-sm animate-audio-bounce-4" />
              </div>
            ) : (
              <VolumeX className="w-4 h-4 text-[#3A2220]" strokeWidth={1.5} />
            )}
          </button>

          {/* Elegant Tooltip / Popup Speech Bubble */}
          <AnimatePresence>
            {showMusicTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute right-0 top-12 whitespace-nowrap bg-white/90 backdrop-blur-md border border-black/10 text-[#3A2220] text-[10px] tracking-[0.08em] font-mono px-3 py-1.5 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2 select-none"
              >
                <span>{t.musicPopup}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMusicTooltip(false); }} 
                  className="hover:opacity-70 text-neutral-400 hover:text-black cursor-pointer font-bold text-[9px] ml-1"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language selector toggle */}
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
      
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-6 left-6 z-50 md:hidden bg-white/40 hover:bg-white/70 active:bg-white/80 backdrop-blur-md border border-black/10 active:border-black/25 rounded-full p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 flex items-center justify-center cursor-pointer"
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-4 h-4 text-[#3A2220]" strokeWidth={1.5} />
        ) : (
          <Menu className="w-4 h-4 text-[#3A2220]" strokeWidth={1.5} />
        )}
      </button>

      {/* Mobile Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-[#FAF9F5] flex flex-col justify-center items-center md:hidden"
          >
            {/* Delicate paper grain overlay for textured aesthetic */}
            <div className="absolute inset-0 bg-white/[0.012] opacity-25 pointer-events-none mix-blend-overlay" />
            
            <nav className="flex flex-col gap-8 items-center text-center">
              {sidebarItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => {
                    handleScrollTo(item.target);
                    setIsMobileMenuOpen(false);
                  }}
                  className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer bg-transparent border-none"
                >
                  <span className="font-mono text-[10px] tracking-widest text-[#AA9082] uppercase opacity-80">
                    {item.num}
                  </span>
                  <span className="font-serif text-2xl tracking-wide text-[#3A2220] hover:text-[#AA9082] transition-colors duration-300 uppercase">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </nav>
            
            {/* Elegant Monogram at the bottom of mobile menu */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 scale-75">
              <OvalMonogram className="w-20 h-20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <section id="hero" className="relative w-full h-screen flex items-end justify-center overflow-hidden bg-stone-950 px-6 pb-[30px] pt-24">
        {/* Full-background image with darken overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={siteContent.imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80"} 
            alt="Warm mystical forest wedding" 
            className="w-full h-full object-cover contrast-[105%] brightness-[0.80]" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/25" /> {/* Darken overlay */}
        </div>

        {/* Center Typography & Emblem */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex justify-center">
              <OvalMonogram className="w-16 h-16 text-bg/90" />
            </div>
            
            <div className="mt-8">
              <h2 
                className="font-luxurious tracking-tight"
                style={{
                  borderColor: '#FFE4E9',
                  fontFamily: '"Luxurious Script", cursive',
                  fontSize: '170px',
                  lineHeight: '120px',
                  whiteSpace: 'pre-line',
                  color: '#FFE4E9'
                }}
              >
                {siteContent.heroTitle || "Sarah &\nAlderson"}
              </h2>
            </div>

            <div className="mt-[10px] flex justify-center">
              <button 
                onClick={() => handleScrollTo('rsvp')}
                className="font-mono text-[9px] tracking-[0.3em] uppercase border border-white/25 text-white bg-white/10 backdrop-blur-md py-[8px] px-[20px] rounded-full hover:bg-white/20 hover:border-white/45 transition-all duration-300 transform active:scale-95 ease-out cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
              >
                {t.heroBtn}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Wedding Story Section with Proper JavaScript-Powered Sticky Scroll */}
      <StorySection 
        lang={lang} 
        leftPortraitUrl={siteContent.leftPortraitUrl}
        rightPortraitUrl={siteContent.rightPortraitUrl}
        storyThreeUrl={siteContent.storyThreeUrl}
        storyFourUrl={siteContent.storyFourUrl}
        storyFiveUrl={siteContent.storyFiveUrl}
        brideName={siteContent.brideName}
        groomName={siteContent.groomName}
        invitationText={lang === 'VIE' ? siteContent.invitationTextVie : siteContent.invitationTextEng}
        venueName={lang === 'VIE' ? siteContent.venueNameVie : siteContent.venueNameEng}
        weddingDateShort={lang === 'VIE' ? siteContent.weddingDateShortVie : siteContent.weddingDateShortEng}
      />



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
                  src={siteContent.mapImageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80"} 
                  alt="Details" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <GatheringSection lang={lang} siteContent={siteContent} />

      {/* Coastal Blue Elegant Visual Collage Section (with RSVP) */}
      <section 
        id="rsvp" 
        className="w-full relative py-12 sm:py-20 md:py-24 overflow-hidden bg-stone-950 min-h-[550px] sm:min-h-[650px] md:min-h-[800px] flex flex-col items-center justify-center select-none"
      >
        {/* Background romantic wedding photo with high-contrast grayscale/dark overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={siteContent.collageBgUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80"} 
            alt="Wedding Couple Silhouette" 
            className="w-full h-full object-cover grayscale contrast-125 brightness-[0.24] pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette layer */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </motion.div>

        {/* Outer Draggable Constraining Stage wrapper to contain draggable wax stamps */}
        <motion.div 
          ref={constraintsRef} 
          initial={{ opacity: 0, scale: 0.96, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl h-[460px] sm:h-[580px] md:h-[720px] flex items-center justify-center px-4 overflow-visible"
        >
          {/* Main Lace Doily Card Background */}
          <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl aspect-[1.38/1] flex items-center justify-center p-6 sm:p-12 md:p-14 rounded-[32px] sm:rounded-[44px] md:rounded-[52px] overflow-hidden bg-transparent shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/5 select-none">
            {/* Underneath high-quality generated lace doily background image */}
            <img 
              src={siteContent.collageLaceBgUrl || "/src/assets/images/lace_card_bg_1781950708806.jpg"} 
              alt="Lace Frame Decor"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none rounded-[32px] sm:rounded-[44px] md:rounded-[52px]"
              referrerPolicy="no-referrer"
            />
            
            {/* The Text & Button overlay inside the card */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 pointer-events-auto">
              {/* Elegant script display title matching the mockup */}
              <span 
                className="font-script text-[36px] sm:text-[48px] md:text-[56px] text-[#3a2220] block leading-tight font-medium mb-3 sm:mb-5 mt-2 select-none"
                style={{ fontStyle: 'italic' }}
              >
                Together with our families,
              </span>
              
              {/* Wedding details paragraph */}
              <div className="space-y-3 sm:space-y-4 max-w-[92%] sm:max-w-[85%] mx-auto font-serif">
                <p className="text-[11px] sm:text-[13px] md:text-[15px] italic text-[#3a2220]/80 leading-relaxed font-semibold">
                  Thank you for being part of one of the the most meaningful moments of our lives.
                </p>
                <p className="text-[11px] sm:text-[13px] md:text-[15px] italic text-[#3a2220]/80 leading-relaxed font-semibold">
                  We cannot wait to celebrate love, laughter, and unforgettable memories with you.
                </p>
              </div>

              {/* Handcrafted buttons for RSVP and Guestbook */}
              <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    setActiveModalTab('rsvp');
                    setIsLocalModalOpen(true);
                  }}
                  className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-full bg-[#3a2220] hover:bg-[#3a2220]/90 text-[#FAF9F5] font-serif italic text-[11px] sm:text-[13px] active:scale-95 transition-all select-none cursor-pointer duration-300 shadow-md border border-[#3a2220]"
                >
                  {lang === 'VIE' ? "Xác nhận tham dự (RSVP)" : "Please RSVP Here"}
                </button>
                <button
                  onClick={() => {
                    setActiveModalTab('note');
                    setIsLocalModalOpen(true);
                  }}
                  className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-full border border-[#3a2220]/40 text-[#3a2220]/90 font-serif italic text-[11px] sm:text-[13px] bg-transparent hover:bg-[#3a2220]/5 active:scale-95 transition-all select-none cursor-pointer duration-300 shadow-sm"
                >
                  {lang === 'VIE' ? "Gửi lời chúc lưu bút" : "Write us a note"}
                </button>
              </div>
            </div>
          </div>

          {/* DRAGGABLE ITEM 1: Pink Circular Wax Seal Stamp (S monogram) */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.06}
            whileHover={{ scale: 1.08, rotate: -2, cursor: 'grab' }}
            whileDrag={{ scale: 1.15, rotate: 6, cursor: 'grabbing', zIndex: 100 }}
            className="absolute left-[3%] sm:left-[6%] md:left-[8%] top-[35%] sm:top-[38%] z-30 select-none touch-none w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-white/5 transition-shadow duration-300"
          >
            <img 
              src={siteContent.collagePinkStampUrl || "/src/assets/images/pink_wax_seal_1781950725822.jpg"} 
              alt="Draggable Pink Monogram Stamp"
              className="w-full h-full object-cover scale-[1.08] pointer-events-none select-none rounded-full"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* DRAGGABLE ITEM 2: Sage Green Oval Wax Seal Stamp (Wildflower stem illustration) */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.06}
            whileHover={{ scale: 1.08, rotate: 2, cursor: 'grab' }}
            whileDrag={{ scale: 1.15, rotate: -4, cursor: 'grabbing', zIndex: 100 }}
            className="absolute right-[3%] sm:right-[6%] md:right-[8%] bottom-[12%] sm:bottom-[15%] z-30 select-none touch-none w-20 h-28 sm:w-28 sm:h-38 md:w-36 md:h-48 rounded-[50%/40%] overflow-hidden border border-white/5 transition-shadow duration-300"
          >
            <img 
              src={siteContent.collageSageStampUrl || "/src/assets/images/sage_wax_seal_1781950741169.jpg"} 
              alt="Draggable Sage Green Botanical Stamp"
              className="w-full h-full object-cover scale-[1.08] pointer-events-none select-none rounded-[50%/40%]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </motion.div>

        {/* Elegant Stationery Note Writing Popup Modal */}
        <AnimatePresence>
          {isLocalModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Back backdrop dark mask */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLocalModalOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
              />

              {/* Stationery popup wrapper */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 35 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 35 }}
                transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                className="relative bg-[#FAF9F5] border border-stone-250/70 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.4)] w-full max-w-2xl mx-auto rounded-none p-5 sm:p-8 md:p-10 z-10 flex flex-col justify-between overflow-hidden max-h-[90vh]"
              >
                {/* Vintage Postmark Stamp Top-Right Graphic Decoration */}
                <div className="absolute top-6 right-8 opacity-[0.12] pointer-events-none select-none">
                  <svg width="105" height="52" viewBox="0 0 105 52" fill="none" stroke="currentColor" className="text-stone-800">
                    <path d="M 0 12 C 15 5, 20 18, 35 12 C 50 5, 55 18, 70 12 C 85 5, 90 18, 105 12" strokeWidth="1" />
                    <path d="M 0 24 C 15 17, 20 30, 35 24 C 50 17, 55 30, 70 24 C 85 17, 90 30, 105 24" strokeWidth="1" />
                    <path d="M 0 36 C 15 29, 20 42, 35 36 C 50 29, 55 42, 70 36 C 85 29, 90 42, 105 36" strokeWidth="1" />
                  </svg>
                </div>

                {/* Minimal close button */}
                <button 
                  onClick={() => setIsLocalModalOpen(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 focus:outline-none transition-colors z-20 cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center w-full mb-4 relative z-10 select-none">
                  {/* Small upper caps branding line */}
                  <span className="font-mono text-[7.5px] sm:text-[9px] tracking-[0.3em] font-medium text-stone-400 uppercase block mb-2">
                    {activeModalTab === 'rsvp' 
                      ? (lang === 'VIE' ? "XÁC NHẬN SỰ HIỆN DIỆN • CELEBRATION RSVP" : "CONFIRM PRESENCE • CELEBRATION RSVP") 
                      : (lang === 'VIE' ? "LƯU BÚT ĐÁM CƯỚI • KỶ NIỆM NGỌT NGÀO" : "GUESTBOOK MEMORIES • THE INK COLLECTION")}
                  </span>
                  
                  {/* Editorial elegant mix heading exactly like template image */}
                  <h3 className="font-serif text-[#3a2220] leading-tight max-w-[90%] mx-auto">
                    {activeModalTab === 'rsvp' ? (
                      <>
                        <span className="block font-serif italic text-[22px] sm:text-[26px] text-stone-500 font-light leading-none mb-1">
                          {lang === 'VIE' ? "Chung vui cùng tụi mình," : "Celebrate with us,"}
                        </span>
                        <span className="block font-serif tracking-[0.08em] font-normal text-[20px] sm:text-[24px] uppercase leading-none mt-1">
                          {lang === 'VIE' ? "XÁC NHẬN SỰ HIỆN DIỆN CỦA BẠN." : "KINDLY RESPOND TO OUR INVITATION."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="block font-serif italic text-[22px] sm:text-[26px] text-stone-500 font-light leading-none mb-1">
                          {lang === 'VIE' ? "Gửi trao nguyện ước," : "Leaving us a message,"}
                        </span>
                        <span className="block font-serif tracking-[0.08em] font-normal text-[20px] sm:text-[24px] uppercase leading-none mt-1">
                          {lang === 'VIE' ? "ĐỂ KỶ NIỆM CÒN MÃI VỚI THỜI GIAN." : "TO CHERISH YOUR LOVE FOREVER."}
                        </span>
                      </>
                    )}
                  </h3>

                  {/* Centered thin elegant vertical line */}
                  <div className="w-[1px] h-8 bg-stone-300 mx-auto my-3" />

                  {/* Elegant Tabs Selection */}
                  <div className="flex justify-center border-b border-stone-200/50 mb-2 gap-8 pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('rsvp')}
                      className={`font-mono text-[8.5px] sm:text-[10px] tracking-[0.25em] uppercase pb-2 transition-all relative cursor-pointer ${
                        activeModalTab === 'rsvp' 
                          ? 'text-[#3a2220] font-semibold border-b border-[#3a2220]' 
                          : 'text-stone-400 hover:text-[#3a2220]/75'
                      }`}
                    >
                      {lang === 'VIE' ? "Xác nhận tham dự" : "RSVP NOW"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('note')}
                      className={`font-mono text-[8.5px] sm:text-[10px] tracking-[0.25em] uppercase pb-2 transition-all relative cursor-pointer ${
                        activeModalTab === 'note' 
                          ? 'text-[#3a2220] font-semibold border-b border-[#3a2220]' 
                          : 'text-stone-400 hover:text-[#3a2220]/75'
                      }`}
                    >
                      {lang === 'VIE' ? "Gửi lời chúc" : "GUESTNOTE"}
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[50vh] pr-1 flex-1">
                  {activeModalTab === 'rsvp' ? (
                    <div className="py-2">
                      <RSVPForm lang={lang} />
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const guestNameVal = localGuestName.trim();
                        const noteTextVal = localNoteText.trim();
                        if (!noteTextVal || !guestNameVal) return;
                        
                        // Save note in live Firestore database with a secure server timestamp
                        addDoc(collection(db, 'guest_notes'), {
                          name: guestNameVal,
                          text: noteTextVal,
                          createdAt: serverTimestamp()
                        }).catch((error) => {
                          try {
                            handleFirestoreError(error, OperationType.WRITE, 'guest_notes');
                          } catch (err) {
                            console.error("Failed to add note to database: ", err);
                          }
                        });

                        // Maintain local notes / device history as fallback
                        const newNote = {
                          id: Date.now(),
                          name: guestNameVal,
                          text: noteTextVal
                        };
                        const updated = [newNote, ...localNotes];
                        setLocalNotes(updated);
                        localStorage.setItem('wedding_local_notes', JSON.stringify(updated));
                        
                        setIsLocalSubmitted(true);
                        setLocalNoteText('');
                        setLocalGuestName('');
                        setTimeout(() => {
                          setIsLocalSubmitted(false);
                          setIsLocalModalOpen(false);
                        }, 1800);
                      }} 
                      className="space-y-4 relative h-full flex flex-col flex-1"
                    >
                      {/* Lined stationery textarea with cursive fountain-pen style */}
                      <div className="relative flex-1 z-15 min-h-[175px] rounded-sm pt-2">
                        <textarea
                          value={localNoteText}
                          onChange={(e) => setLocalNoteText(e.target.value)}
                          placeholder={lang === 'VIE' ? "Hãy viết một câu chúc mừng, lời dặn dò hay gửi gắm những yêu thương ngọt ngào tới tụi mình tại đây nhé..." : "Leave a warm wish, loving note, or advice for our journey..."}
                          required
                          maxLength={300}
                          rows={5}
                          className="w-full bg-transparent p-3 sm:px-4 font-script text-rose-900 text-[18px] sm:text-[21px] leading-[32px] placeholder-stone-400/80 outline-none resize-none border-none focus:ring-0 active:ring-0"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(168, 162, 158, 0.15) 31px, rgba(168, 162, 158, 0.15) 32px)',
                            backgroundSize: '100% 32px',
                            lineHeight: '32px',
                            paddingTop: '6px'
                          }}
                        />
                      </div>

                      {/* Signature line & Action submit */}
                      <div className="pt-2 pb-5 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-stone-200/50">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-[#3a2220]/60 uppercase whitespace-nowrap select-none">
                            {lang === 'VIE' ? "KÝ TÊN / WITH LOVE," : "SIGNATURE / WITH LOVE:"}
                          </span>
                          <input
                            type="text"
                            value={localGuestName}
                            onChange={(e) => setLocalGuestName(e.target.value)}
                            placeholder="John Smith..."
                            required
                            maxLength={40}
                            className="bg-transparent border-b border-stone-300 hover:border-stone-400 focus:border-[#3a2220] outline-none font-script text-[18px] text-[#3a2220]/90 py-1 px-1.5 w-44 sm:w-56 transition-colors focus:ring-0 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!localNoteText.trim() || !localGuestName.trim() || isLocalSubmitted}
                          className={`py-2 px-6 sm:px-8 font-mono text-[8.5px] tracking-[0.25em] uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none border whitespace-nowrap ${
                            isLocalSubmitted
                              ? 'bg-emerald-800 border-emerald-800 text-[#FAF9F5]'
                              : 'bg-stone-900 border-stone-900 text-[#FAF9F5] hover:bg-stone-800 active:scale-95'
                          } disabled:opacity-40`}
                        >
                          {isLocalSubmitted ? (
                            <span>✓ {lang === 'VIE' ? "ĐÃ GỬI!" : "SENT!"}</span>
                          ) : (
                            <span>{lang === 'VIE' ? "GỬI CHÚC MỪNG" : "SEND NOTE"}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Countdown Section Footer */}
      <CountdownSection 
        lang={lang} 
        targetDate={siteContent.countdownTargetDate} 
        brideName={siteContent.brideName} 
        groomName={siteContent.groomName} 
        titleEng={siteContent.countdownTitleEng}
        titleVie={siteContent.countdownTitleVie}
        endTitleEng={siteContent.countdownEndTitleEng}
        endTitleVie={siteContent.countdownEndTitleVie}
        loc1City={siteContent.countdownLoc1City}
        loc1Country={siteContent.countdownLoc1Country}
        loc2City={siteContent.countdownLoc2City}
        loc2Country={siteContent.countdownLoc2Country}
        loc3City={siteContent.countdownLoc3City}
        loc3Country={siteContent.countdownLoc3Country}
        sinceText={siteContent.countdownSinceText}
        countdownHeight={siteContent.countdownHeight}
      />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto py-24 border-t border-black/5 text-center font-mono text-[8px] tracking-[0.4em] uppercase text-muted px-6 space-y-4">
        <p>&copy; 2026 {siteContent.brideName || "Bảo Eve"} & {siteContent.groomName || "Johnathan"}. All rights reserved.</p>
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
