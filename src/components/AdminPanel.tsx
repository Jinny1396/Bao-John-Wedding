import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  Lock, 
  RefreshCw, 
  LogOut, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Search, 
  EyeOff, 
  Users,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { uploadToCloudinary } from '../cloudinaryUpload';

interface RSVPEntity {
  id: string;
  guestName: string;
  attendingStatus: 'yes' | 'no' | string;
  dietaryRestrictions: string;
  coupleNote: string;
  createdAt?: any;
}

interface GuestNoteEntity {
  id: string;
  name: string;
  text: string;
  createdAt?: any;
}

const IMAGE_FIELDS = [
  {
    key: 'imageUrl',
    label: 'Main Hero Background',
    description: 'The spectacular dark background photo displayed in the opening Hero section of the website.',
    defaultUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
  },
  {
    key: 'heroMonogramUrl',
    label: 'Hero Section Monogram Emblem',
    description: 'The custom PNG image (e.g. transparent monogram emblem) displayed at the top of the Hero section, replacing the default elegant SVG monogram.',
    defaultUrl: ''
  },
  {
    key: 'loadingIconUrl',
    label: 'Loading Screen Icon / Monogram',
    description: 'The custom icon or monogram image displayed in the center of the loading screen when the website first loads.',
    defaultUrl: ''
  },
  {
    key: 'leftPortraitUrl',
    label: 'Left Story Portrait',
    description: 'The couple portrait displayed on the left of the wedding story sticky collage details.',
    defaultUrl: 'https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469897-765GLULNCOJ4LM48N3PK/pexels-vikkirillova-15266111.jpg'
  },
  {
    key: 'rightPortraitUrl',
    label: 'Right Story Portrait',
    description: 'The couple portrait displayed on the right of the wedding story sticky collage details.',
    defaultUrl: 'https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469885-00IS12CZLY3SF6UFRHDE/pexels-vikkirillova-15102055.jpg'
  },
  {
    key: 'mapImageUrl',
    label: 'Venue Map & Logistics',
    description: 'The diagram displayed in the Details section next to the wedding timeline itinerary.',
    defaultUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80'
  },
  {
    key: 'storyThreeUrl',
    label: 'Story Gallery Image 3 (Horizontal)',
    description: 'The middle horizontal overlay photo in the story sticky collage section (forest hug).',
    defaultUrl: 'https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469911-NVXD5WLOV689KNTRMOAR/pexels-vikkirillova-15280972.jpg'
  },
  {
    key: 'storyFourUrl',
    label: 'Story Gallery Image 4 (Vertical)',
    description: 'The lower left vertical photo in the story sticky collage section (hand holding).',
    defaultUrl: 'https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469921-AUZDKVU38IDB61BAJJ0W/pexels-vikkirillova-15266110.jpg'
  },
  {
    key: 'storyFiveUrl',
    label: 'Story Gallery Image 5 (Vertical)',
    description: 'The bottom right vertical photo in the story sticky collage section (soft gaze).',
    defaultUrl: 'https://images.squarespace-cdn.com/content/v1/69a5a56a5a76f0578c2e374e/1772463469930-BPBK33AUJHSG9Y7BT6GL/pexels-vikkirillova-15280966.jpg'
  },
  {
    key: 'storyTextBgUrl',
    label: 'Story Invitation Text Background',
    description: 'The circular romantic texture background behind the bride & groom names and invitation details in the Story section.',
    defaultUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200'
  },
  {
    key: 'storyTextBgMobileUrl',
    label: 'Story Invitation Text Mobile Background',
    description: 'The romantic texture background behind the bride & groom names and invitation details in the Story section when viewed on mobile devices.',
    defaultUrl: ''
  },
  {
    key: 'collageBgUrl',
    label: 'Collage Section Background',
    description: 'The romantic background photo displayed behind the lace doily interactive section.',
    defaultUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80'
  },
  {
    key: 'collageBgMobileUrl',
    label: 'Collage Section Mobile Background',
    description: 'The romantic background photo displayed behind the lace doily interactive section on mobile devices.',
    defaultUrl: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1000'
  },
  {
    key: 'collageLaceBgUrl',
    label: 'Lace Doily Card Background',
    description: 'The elegant rectangular lace doily graphic overlay background card.',
    defaultUrl: '/src/assets/images/lace_card_bg_1781950708806.jpg'
  },
  {
    key: 'collageLaceBgMobileUrl',
    label: 'Lace Doily Card Mobile Background',
    description: 'The elegant rectangular lace doily graphic overlay background card for mobile devices.',
    defaultUrl: ''
  },
  {
    key: 'collagePinkStampUrl',
    label: 'Pink Monogram Wax Seal Stamp',
    description: 'Draggable wax seal stamp illustration representing a pink wax seal with monogram "S".',
    defaultUrl: '/src/assets/images/pink_wax_seal_1781950725822.jpg'
  },
  {
    key: 'collageSageStampUrl',
    label: 'Sage Green Wildflower Wax Seal Stamp',
    description: 'Draggable oval wax seal stamp illustration featuring a sage green color with wildflowers.',
    defaultUrl: '/src/assets/images/sage_wax_seal_1781950741169.jpg'
  },
  {
    key: 'eventsStampUrl',
    label: 'Events Section Bottom Stamp',
    description: 'Postage stamp or wax seal displayed at the bottom-right of the Events/Story section collage with a tilt.',
    defaultUrl: '/src/assets/images/sage_wax_seal_1781950741169.jpg'
  },
  {
    key: 'countdownBgUrl',
    label: 'Countdown Section Background Image',
    description: 'The background photo or pattern overlay displayed behind the live Countdown section.',
    defaultUrl: ''
  }
] as const;

interface AdminPanelProps {
  onBackToHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToHome }) => {
  const [pin, setPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  
  const [rsvps, setRsvps] = useState<RSVPEntity[]>([]);
  const [guestNotes, setGuestNotes] = useState<GuestNoteEntity[]>([]);
  const [activeTab, setActiveTab] = useState<'rsvps' | 'notes' | 'images' | 'texts'>('rsvps');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Cloudinary direct image uploading
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | null>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [recentSuccess, setRecentSuccess] = useState<Record<string, boolean>>({});

  // CMS Website Text States
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDateEng, setHeroDateEng] = useState('');
  const [heroDateVie, setHeroDateVie] = useState('');
  const [invitationTextEng, setInvitationTextEng] = useState('');
  const [invitationTextVie, setInvitationTextVie] = useState('');
  const [venueNameEng, setVenueNameEng] = useState('');
  const [venueNameVie, setVenueNameVie] = useState('');
  const [weddingDateShortEng, setWeddingDateShortEng] = useState('');
  const [weddingDateShortVie, setWeddingDateShortVie] = useState('');
  const [photoQuoteEng, setPhotoQuoteEng] = useState('');
  const [photoQuoteVie, setPhotoQuoteVie] = useState('');
  const [attireDescEng, setAttireDescEng] = useState('');
  const [attireDescVie, setAttireDescVie] = useState('');
  const [registryTextEng, setRegistryTextEng] = useState('');
  const [registryTextVie, setRegistryTextVie] = useState('');
  const [countdownTargetDate, setCountdownTargetDate] = useState('');
  const [countdownHeight, setCountdownHeight] = useState('');

  // Countdown Section customization states
  const [countdownTitleEng, setCountdownTitleEng] = useState('');
  const [countdownTitleVie, setCountdownTitleVie] = useState('');
  const [countdownEndTitleEng, setCountdownEndTitleEng] = useState('');
  const [countdownEndTitleVie, setCountdownEndTitleVie] = useState('');
  const [countdownLoc1City, setCountdownLoc1City] = useState('');
  const [countdownLoc1Country, setCountdownLoc1Country] = useState('');
  const [countdownLoc2City, setCountdownLoc2City] = useState('');
  const [countdownLoc2Country, setCountdownLoc2Country] = useState('');
  const [countdownLoc3City, setCountdownLoc3City] = useState('');
  const [countdownLoc3Country, setCountdownLoc3Country] = useState('');
  const [countdownSinceText, setCountdownSinceText] = useState('');

  // Sidebar dynamic labels
  const [sidebarHomeEng, setSidebarHomeEng] = useState('');
  const [sidebarHomeVie, setSidebarHomeVie] = useState('');
  const [sidebarStoryEng, setSidebarStoryEng] = useState('');
  const [sidebarStoryVie, setSidebarStoryVie] = useState('');
  const [sidebarEventsEng, setSidebarEventsEng] = useState('');
  const [sidebarEventsVie, setSidebarEventsVie] = useState('');
  const [sidebarGatherEng, setSidebarGatherEng] = useState('');
  const [sidebarGatherVie, setSidebarGatherVie] = useState('');
  const [sidebarRsvpEng, setSidebarRsvpEng] = useState('');
  const [sidebarRsvpVie, setSidebarRsvpVie] = useState('');

  // Gathering Grounds dynamic fields states
  const [gatherHeadingEng, setGatherHeadingEng] = useState('');
  const [gatherHeadingVie, setGatherHeadingVie] = useState('');
  const [gatherSubtitleEng, setGatherSubtitleEng] = useState('');
  const [gatherSubtitleVie, setGatherSubtitleVie] = useState('');
  const [gatherDescEng, setGatherDescEng] = useState('');
  const [gatherDescVie, setGatherDescVie] = useState('');
  const [gatherCereTitleEng, setGatherCereTitleEng] = useState('');
  const [gatherCereTitleVie, setGatherCereTitleVie] = useState('');
  const [gatherCereDescEng, setGatherCereDescEng] = useState('');
  const [gatherCereDescVie, setGatherCereDescVie] = useState('');
  const [gatherFeastTitleEng, setGatherFeastTitleEng] = useState('');
  const [gatherFeastTitleVie, setGatherFeastTitleVie] = useState('');
  const [gatherFeastDescEng, setGatherFeastDescEng] = useState('');
  const [gatherFeastDescVie, setGatherFeastDescVie] = useState('');
  const [gatherNoteEng, setGatherNoteEng] = useState('');
  const [gatherNoteVie, setGatherNoteVie] = useState('');
  const [gatherMapPillEng, setGatherMapPillEng] = useState('');
  const [gatherMapPillVie, setGatherMapPillVie] = useState('');
  const [gatherLatitude, setGatherLatitude] = useState('');
  const [gatherLongitude, setGatherLongitude] = useState('');
  const [gatherDirectionsTextEng, setGatherDirectionsTextEng] = useState('');
  const [gatherDirectionsTextVie, setGatherDirectionsTextVie] = useState('');
  const [gatherDirectionsUrl, setGatherDirectionsUrl] = useState('');
  const [gatherPinUrl, setGatherPinUrl] = useState('');

  // Primary buttons and details helper phrases
  const [heroBtnEng, setHeroBtnEng] = useState('');
  const [heroBtnVie, setHeroBtnVie] = useState('');
  const [registryBtnEng, setRegistryBtnEng] = useState('');
  const [registryBtnVie, setRegistryBtnVie] = useState('');
  const [respondByEng, setRespondByEng] = useState('');
  const [respondByVie, setRespondByVie] = useState('');
  const [writeNoteTitleEng, setWriteNoteTitleEng] = useState('');
  const [writeNoteTitleVie, setWriteNoteTitleVie] = useState('');
  const [writeNoteSubtitleEng, setWriteNoteSubtitleEng] = useState('');
  const [writeNoteSubtitleVie, setWriteNoteSubtitleVie] = useState('');
  const [collageLaceBgRotate, setCollageLaceBgRotate] = useState('0');

  const [textSubTab, setTextSubTab] = useState<'identity' | 'story' | 'timeline' | 'registry' | 'navigation' | 'venue'>('identity');

  const [hasInitializedTexts, setHasInitializedTexts] = useState(false);
  const [isSavingTexts, setIsSavingTexts] = useState(false);
  const [saveTextsSuccess, setSaveTextsSuccess] = useState(false);
  const [saveTextsError, setSaveTextsError] = useState<string | null>(null);

  // PIN Check
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2910') {
      setIsPinVerified(true);
      setPinError('');
      sessionStorage.setItem('admin_pin_verified', 'true');
    } else {
      setPinError('Invalid Admin PIN. Please try again.');
      setPin('');
    }
  };

  // Check pin session on mount
  useEffect(() => {
    if (sessionStorage.getItem('admin_pin_verified') === 'true') {
      setIsPinVerified(true);
    }
  }, []);

  // Load RSVPs and Guest Notes from Firestore
  const fetchRSVPs = async () => {
    setIsDataLoading(true);
    setFetchError(null);
    try {
      const rsvpQuery = query(collection(db, 'rsvps'));
      const rsvpSnapshot = await getDocs(rsvpQuery);

      const rsvpData: RSVPEntity[] = [];
      rsvpSnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        rsvpData.push({
          id: docSnap.id,
          guestName: docData.guestName || '',
          attendingStatus: docData.attendingStatus || 'no',
          dietaryRestrictions: docData.dietaryRestrictions || '',
          coupleNote: docData.coupleNote || '',
          createdAt: docData.createdAt
        });
      });

      const notesQuery = query(collection(db, 'guest_notes'));
      const notesSnapshot = await getDocs(notesQuery);
      
      const notesData: GuestNoteEntity[] = [];
      notesSnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        notesData.push({
          id: docSnap.id,
          name: docData.name || '',
          text: docData.text || '',
          createdAt: docData.createdAt
        });
      });

      const getVal = (val: any) => {
        if (!val) return 0;
        if (typeof val.seconds === 'number') return val.seconds;
        if (typeof val.getTime === 'function') return val.getTime() / 1000;
        if (val instanceof Date) return val.getTime() / 1000;
        return Number(val) || 0;
      };

      // Sort arrays in-memory to prevent index errors
      rsvpData.sort((a, b) => getVal(b.createdAt) - getVal(a.createdAt));
      notesData.sort((a, b) => getVal(b.createdAt) - getVal(a.createdAt));

      setRsvps(rsvpData);
      setGuestNotes(notesData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      let errMsg = err?.message || 'Permission denied or connection issue.';
      // Clean up stringified Firestore error if present
      if (errMsg.startsWith('{') && errMsg.endsWith('}')) {
        try {
          const parsed = JSON.parse(errMsg);
          if (parsed.error) errMsg = parsed.error;
        } catch (e) {
          // ignore
        }
      }
      setFetchError(errMsg);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Trigger load when PIN is verified
  useEffect(() => {
    if (isPinVerified) {
      fetchRSVPs();
    }
  }, [isPinVerified]);

  // Synchronize site content images and text in real-time
  useEffect(() => {
    if (isPinVerified) {
      const unsub = onSnapshot(doc(db, 'site_content', 'main'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSiteImages({
            imageUrl: data.imageUrl || '',
            heroMonogramUrl: data.heroMonogramUrl || '',
            loadingIconUrl: data.loadingIconUrl || '',
            leftPortraitUrl: data.leftPortraitUrl || '',
            rightPortraitUrl: data.rightPortraitUrl || '',
            mapImageUrl: data.mapImageUrl || '',
            storyThreeUrl: data.storyThreeUrl || '',
            storyFourUrl: data.storyFourUrl || '',
            storyFiveUrl: data.storyFiveUrl || '',
            storyTextBgUrl: data.storyTextBgUrl || '',
            storyTextBgMobileUrl: data.storyTextBgMobileUrl || '',
            collageBgUrl: data.collageBgUrl || '',
            collageBgMobileUrl: data.collageBgMobileUrl || '',
            collageLaceBgUrl: data.collageLaceBgUrl || '',
            collageLaceBgMobileUrl: data.collageLaceBgMobileUrl || '',
            collagePinkStampUrl: data.collagePinkStampUrl || '',
            collageSageStampUrl: data.collageSageStampUrl || '',
            eventsStampUrl: data.eventsStampUrl || '',
            countdownBgUrl: data.countdownBgUrl || '',
          });

          // Only initialize local input states once on load to prevent jumping cursors while editing
          if (!hasInitializedTexts) {
            setBrideName(data.brideName || '');
            setGroomName(data.groomName || '');
            setHeroTitle(data.heroTitle || '');
            setHeroDateEng(data.heroDateEng || '');
            setHeroDateVie(data.heroDateVie || '');
            setInvitationTextEng(data.invitationTextEng || '');
            setInvitationTextVie(data.invitationTextVie || '');
            setVenueNameEng(data.venueNameEng || '');
            setVenueNameVie(data.venueNameVie || '');
            setWeddingDateShortEng(data.weddingDateShortEng || '');
            setWeddingDateShortVie(data.weddingDateShortVie || '');
            setPhotoQuoteEng(data.photoQuoteEng || '');
            setPhotoQuoteVie(data.photoQuoteVie || '');
            setAttireDescEng(data.attireDescEng || '');
            setAttireDescVie(data.attireDescVie || '');
            setRegistryTextEng(data.registryTextEng || '');
            setRegistryTextVie(data.registryTextVie || '');
            setCountdownTargetDate(data.countdownTargetDate || '');
            setCountdownHeight(data.countdownHeight || '');
            
            setCountdownTitleEng(data.countdownTitleEng || '');
            setCountdownTitleVie(data.countdownTitleVie || '');
            setCountdownEndTitleEng(data.countdownEndTitleEng || '');
            setCountdownEndTitleVie(data.countdownEndTitleVie || '');
            setCountdownLoc1City(data.countdownLoc1City || '');
            setCountdownLoc1Country(data.countdownLoc1Country || '');
            setCountdownLoc2City(data.countdownLoc2City || '');
            setCountdownLoc2Country(data.countdownLoc2Country || '');
            setCountdownLoc3City(data.countdownLoc3City || '');
            setCountdownLoc3Country(data.countdownLoc3Country || '');
            setCountdownSinceText(data.countdownSinceText || '');
            
            setSidebarHomeEng(data.sidebarHomeEng || '');
            setSidebarHomeVie(data.sidebarHomeVie || '');
            setSidebarStoryEng(data.sidebarStoryEng || '');
            setSidebarStoryVie(data.sidebarStoryVie || '');
            setSidebarEventsEng(data.sidebarEventsEng || '');
            setSidebarEventsVie(data.sidebarEventsVie || '');
            setSidebarGatherEng(data.sidebarGatherEng || '');
            setSidebarGatherVie(data.sidebarGatherVie || '');
            setSidebarRsvpEng(data.sidebarRsvpEng || '');
            setSidebarRsvpVie(data.sidebarRsvpVie || '');
            
            setHeroBtnEng(data.heroBtnEng || '');
            setHeroBtnVie(data.heroBtnVie || '');
            setRegistryBtnEng(data.registryBtnEng || '');
            setRegistryBtnVie(data.registryBtnVie || '');
            setRespondByEng(data.respondByEng || '');
            setRespondByVie(data.respondByVie || '');
            setWriteNoteTitleEng(data.writeNoteTitleEng || '');
            setWriteNoteTitleVie(data.writeNoteTitleVie || '');
            setWriteNoteSubtitleEng(data.writeNoteSubtitleEng || '');
            setWriteNoteSubtitleVie(data.writeNoteSubtitleVie || '');

            setGatherHeadingEng(data.gatherHeadingEng || '');
            setGatherHeadingVie(data.gatherHeadingVie || '');
            setGatherSubtitleEng(data.gatherSubtitleEng || '');
            setGatherSubtitleVie(data.gatherSubtitleVie || '');
            setGatherDescEng(data.gatherDescEng || '');
            setGatherDescVie(data.gatherDescVie || '');
            setGatherCereTitleEng(data.gatherCereTitleEng || '');
            setGatherCereTitleVie(data.gatherCereTitleVie || '');
            setGatherCereDescEng(data.gatherCereDescEng || '');
            setGatherCereDescVie(data.gatherCereDescVie || '');
            setGatherFeastTitleEng(data.gatherFeastTitleEng || '');
            setGatherFeastTitleVie(data.gatherFeastTitleVie || '');
            setGatherFeastDescEng(data.gatherFeastDescEng || '');
            setGatherFeastDescVie(data.gatherFeastDescVie || '');
            setGatherNoteEng(data.gatherNoteEng || '');
            setGatherNoteVie(data.gatherNoteVie || '');
            setGatherMapPillEng(data.gatherMapPillEng || '');
            setGatherMapPillVie(data.gatherMapPillVie || '');
            setGatherLatitude(data.gatherLatitude || '');
            setGatherLongitude(data.gatherLongitude || '');
            setGatherDirectionsTextEng(data.gatherDirectionsTextEng || '');
            setGatherDirectionsTextVie(data.gatherDirectionsTextVie || '');
            setGatherDirectionsUrl(data.gatherDirectionsUrl || '');
            setGatherPinUrl(data.gatherPinUrl || '');
            setCollageLaceBgRotate(data.collageLaceBgRotate || '0');
            
            setHasInitializedTexts(true);
          }
        }
      });
      return () => unsub();
    }
  }, [isPinVerified, hasInitializedTexts]);

  // Handle local file selection and basic validation before uploading
  const handleFileChange = (fieldKey: string, file: File | null) => {
    setUploadErrors(prev => ({ ...prev, [fieldKey]: null }));
    setRecentSuccess(prev => ({ ...prev, [fieldKey]: false }));
    
    if (!file) {
      setSelectedFiles(prev => ({ ...prev, [fieldKey]: null }));
      return;
    }

    // Direct frontend validation
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const isValidType = file.type.startsWith('image/') && (file.type.endsWith('jpeg') || file.type.endsWith('png') || file.type.endsWith('webp'));
    const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      setUploadErrors(prev => ({ ...prev, [fieldKey]: 'Invalid file format. Select a JPG, PNG, or WebP image.' }));
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadErrors(prev => ({ ...prev, [fieldKey]: 'Image file is too large. Max size allowed is 100MB.' }));
      return;
    }

    setSelectedFiles(prev => ({ ...prev, [fieldKey]: file }));
  };

  // Perform actual direct-to-Cloudinary uploading then link URL inside Firestore
  const handleImageUpload = async (fieldKey: string) => {
    const file = selectedFiles[fieldKey];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [fieldKey]: true }));
    setUploadProgress(prev => ({ ...prev, [fieldKey]: 0 }));
    setUploadErrors(prev => ({ ...prev, [fieldKey]: null }));
    setRecentSuccess(prev => ({ ...prev, [fieldKey]: false }));

    try {
      // 1. Upload to Cloudinary & get secure URL back
      const secureUrl = await uploadToCloudinary(file, {
        onProgress: (progress) => {
          setUploadProgress(prev => ({ ...prev, [fieldKey]: progress }));
        }
      });

      // 2. Save directly in Firebase document site_content/main
      await setDoc(doc(db, 'site_content', 'main'), {
        [fieldKey]: secureUrl
      }, { merge: true });

      // 3. Clear file selection and trigger successful response animations
      setSelectedFiles(prev => ({ ...prev, [fieldKey]: null }));
      setRecentSuccess(prev => ({ ...prev, [fieldKey]: true }));
      setUploadProgress(prev => ({ ...prev, [fieldKey]: 100 }));
    } catch (err: any) {
      console.error(`Upload failed for ${fieldKey}:`, err);
      setUploadErrors(prev => ({ 
        ...prev, 
        [fieldKey]: err.message || 'An unexpected error occurred during direct upload.' 
      }));
    } finally {
      setIsUploading(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  // Restore fallback settings by removing custom Firestore link
  const handleRestoreDefault = async (fieldKey: string) => {
    if (!window.confirm('Are you sure you want to revert this image to its original default background?')) {
      return;
    }

    setUploadErrors(prev => ({ ...prev, [fieldKey]: null }));
    setRecentSuccess(prev => ({ ...prev, [fieldKey]: false }));
    setSelectedFiles(prev => ({ ...prev, [fieldKey]: null }));

    try {
      await setDoc(doc(db, 'site_content', 'main'), {
        [fieldKey]: '' // Empty string triggers local beautiful dynamic fallbacks
      }, { merge: true });
      
      setRecentSuccess(prev => ({ ...prev, [fieldKey]: true }));
      setTimeout(() => {
        setRecentSuccess(prev => ({ ...prev, [fieldKey]: false }));
      }, 3000);
    } catch (err: any) {
      console.error(`Restore default failed for ${fieldKey}:`, err);
      setUploadErrors(prev => ({ 
        ...prev, 
        [fieldKey]: 'Failed to remove custom photo in database.' 
      }));
    }
  };

  // Save modified dynamic website texts and countdown dates inside Firestore
  const handleSaveTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTexts(true);
    setSaveTextsSuccess(false);
    setSaveTextsError(null);

    try {
      await setDoc(doc(db, 'site_content', 'main'), {
        brideName,
        groomName,
        heroTitle,
        heroDateEng,
        heroDateVie,
        invitationTextEng,
        invitationTextVie,
        venueNameEng,
        venueNameVie,
        weddingDateShortEng,
        weddingDateShortVie,
        photoQuoteEng,
        photoQuoteVie,
        attireDescEng,
        attireDescVie,
        registryTextEng,
        registryTextVie,
        countdownTargetDate,
        countdownHeight,
        countdownTitleEng,
        countdownTitleVie,
        countdownEndTitleEng,
        countdownEndTitleVie,
        countdownLoc1City,
        countdownLoc1Country,
        countdownLoc2City,
        countdownLoc2Country,
        countdownLoc3City,
        countdownLoc3Country,
        countdownSinceText,
        sidebarHomeEng,
        sidebarHomeVie,
        sidebarStoryEng,
        sidebarStoryVie,
        sidebarEventsEng,
        sidebarEventsVie,
        sidebarGatherEng,
        sidebarGatherVie,
        sidebarRsvpEng,
        sidebarRsvpVie,
        heroBtnEng,
        heroBtnVie,
        registryBtnEng,
        registryBtnVie,
        respondByEng,
        respondByVie,
        writeNoteTitleEng,
        writeNoteTitleVie,
        writeNoteSubtitleEng,
        writeNoteSubtitleVie,
        gatherHeadingEng,
        gatherHeadingVie,
        gatherSubtitleEng,
        gatherSubtitleVie,
        gatherDescEng,
        gatherDescVie,
        gatherCereTitleEng,
        gatherCereTitleVie,
        gatherCereDescEng,
        gatherCereDescVie,
        gatherFeastTitleEng,
        gatherFeastTitleVie,
        gatherFeastDescEng,
        gatherFeastDescVie,
        gatherNoteEng,
        gatherNoteVie,
        gatherMapPillEng,
        gatherMapPillVie,
        gatherLatitude,
        gatherLongitude,
        gatherDirectionsTextEng,
        gatherDirectionsTextVie,
        gatherDirectionsUrl,
        gatherPinUrl,
        collageLaceBgRotate,
      }, { merge: true });

      setSaveTextsSuccess(true);
      setTimeout(() => {
        setSaveTextsSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to save texts to Firestore:', err);
      setSaveTextsError(err.message || 'An error occurred while saving the text settings.');
    } finally {
      setIsSavingTexts(false);
    }
  };

  // Lock session and reset
  const handleFullReset = () => {
    sessionStorage.removeItem('admin_pin_verified');
    setIsPinVerified(false);
    setPin('');
    setRsvps([]);
    setGuestNotes([]);
  };

  // Delete a guestbook note
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this guestbook note from the database? This cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'guest_notes', noteId));
      setGuestNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Failed to delete note:', err);
      alert('Failed to delete guest note from database.');
    }
  };

  // Filtered RSVPs by search text
  const filteredRSVPs = rsvps.filter(rsvp => 
    rsvp.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rsvp.dietaryRestrictions.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rsvp.coupleNote.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered guest notes by search text
  const filteredNotes = guestNotes.filter(note =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute metrics
  const totalSubmissions = rsvps.length;
  const attendingCount = rsvps.filter(r => r.attendingStatus === 'yes').length;
  const decliningCount = rsvps.filter(r => r.attendingStatus === 'no').length;

  // Format timestamp helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No stamp';
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(timestamp);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#362223] px-4 md:px-12 py-12 flex flex-col font-sans selection:bg-[#362223]/10 selection:text-[#362223]">
      
      {/* Top control bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between mb-12 py-4 border-b border-black/5 font-mono text-[9px] tracking-widest uppercase">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 border border-black/5 bg-white/30 backdrop-blur-md text-[#362223]/75 hover:text-[#362223] hover:bg-white/60 transition-all cursor-pointer group rounded-full shadow-sm animate-fade-in"
          id="admin-back-btn"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Home Suite</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="opacity-55 font-semibold tracking-widest">Guest Ledger System</span>
          {isPinVerified && (
            <button 
              onClick={handleFullReset}
              className="flex items-center gap-1.5 text-red-700/80 hover:text-red-700 transition-all cursor-pointer border border-red-200/40 bg-red-50/25 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold hover:bg-red-50/50 shadow-sm"
              id="admin-reset-session-btn"
            >
              <LogOut size={12} />
              <span>Lock Admin</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step 1: Admin PIN Verification Overlay */}
        {!isPinVerified && (
          <motion.div 
            key="pin-gate"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center max-w-md w-full mx-auto"
          >
            <div className="bg-white border border-black/5 shadow-xl rounded-sm p-8 md:p-10 w-full text-center space-y-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#362223]/5 flex items-center justify-center text-[#362223]/75">
                <Lock size={20} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl tracking-normal text-[#362223] uppercase font-semibold">ADMIN LEDGER</h2>
                <p className="font-mono text-[9px] tracking-wider text-neutral-400 mt-1 uppercase">Enter Host PIN to open session</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="••••"
                    autoFocus
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center bg-transparent border-b border-black/15 py-3 font-mono text-3xl tracking-[1em] focus:border-[#362223] outline-none transition-colors"
                  />
                </div>

                {pinError && (
                  <p className="text-red-600 font-mono text-[9px] uppercase tracking-wider">{pinError}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#362223]/80 hover:bg-[#362223] text-white font-mono text-xs tracking-[0.25em] transition-all uppercase rounded-none border border-[#362223]/20 backdrop-blur-md shadow-md cursor-pointer font-bold"
                  >
                    CONTINUE
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 2: Fully Authenticated Guest RSVPs Index Board */}
        {isPinVerified && (
          <motion.div 
            key="admin-ledger-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl w-full mx-auto space-y-8 flex-1"
          >
            {/* Header portion */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-black/5 pb-8">
              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-400 block font-semibold">Wedding Suite Control Deck</span>
                <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-tight text-[#362223]">RSVP LEDGER BOARD</h1>
                <p className="font-mono text-[9.5px] uppercase tracking-widest text-neutral-500/85">
                  Real-time database stream active
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRSVPs}
                  disabled={isDataLoading}
                  className="px-5 py-2.5 border border-black/10 hover:border-black/30 font-mono text-[9px] tracking-widest uppercase flex items-center gap-2 rounded-full transition-colors bg-white/40 backdrop-blur-md disabled:opacity-55 cursor-pointer font-semibold hover:bg-white/70 shadow-sm"
                >
                  <RefreshCw size={11} className={`${isDataLoading ? 'animate-spin' : ''}`} />
                  <span>{isDataLoading ? 'Refreshing' : 'Refresh Ledger'}</span>
                </button>
                
                <button
                  onClick={handleFullReset}
                  className="px-5 py-2.5 border border-red-200/30 hover:border-red-600 bg-red-50/30 backdrop-blur-md text-red-700/80 hover:text-red-800 font-mono text-[9px] tracking-widest uppercase flex items-center gap-2 rounded-full transition-colors cursor-pointer font-semibold hover:bg-red-50/60 shadow-sm"
                >
                  <EyeOff size={11} />
                  <span>Lock Deck</span>
                </button>
              </div>
            </div>

            {/* Analytics Stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 border border-black/5 shadow-sm rounded-sm flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#362223]/5 flex items-center justify-center text-[#362223]">
                  <Users size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-neutral-400 font-semibold">Total Submissions</p>
                  <p className="font-serif text-3xl font-light leading-none">{totalSubmissions}</p>
                </div>
              </div>

              <div className="bg-white p-6 border border-black/5 shadow-sm rounded-sm flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-700">
                  <CheckCircle size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-neutral-400 font-semibold">Attending (Accepts)</p>
                  <p className="font-serif text-3xl font-light leading-none text-emerald-800">{attendingCount}</p>
                </div>
              </div>

              <div className="bg-white p-6 border border-black/5 shadow-sm rounded-sm flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400">
                  <XCircle size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-neutral-400 font-semibold">Declined (Regrets)</p>
                  <p className="font-serif text-3xl font-light leading-none text-neutral-500">{decliningCount}</p>
                </div>
              </div>

            </div>

            {/* Tab Selection Navigation */}
            <div className="flex gap-4 border-b border-black/5">
              <button
                onClick={() => { setActiveTab('rsvps'); setSearchQuery(''); }}
                className={`pb-3 px-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-all relative cursor-pointer font-bold ${
                  activeTab === 'rsvps'
                    ? 'text-[#362223] border-b-2 border-[#362223]'
                    : 'text-neutral-400 hover:text-[#362223]'
                }`}
              >
                RSVP Responses ({rsvps.length})
              </button>
              <button
                onClick={() => { setActiveTab('notes'); setSearchQuery(''); }}
                className={`pb-3 px-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-all relative cursor-pointer font-bold ${
                  activeTab === 'notes'
                    ? 'text-[#362223] border-b-2 border-[#362223]'
                    : 'text-neutral-400 hover:text-[#362223]'
                }`}
              >
                Guestbook Wishes ({guestNotes.length})
              </button>
              <button
                onClick={() => { setActiveTab('images'); setSearchQuery(''); }}
                className={`pb-3 px-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-all relative cursor-pointer font-bold ${
                  activeTab === 'images'
                    ? 'text-[#362223] border-b-2 border-[#362223]'
                    : 'text-neutral-400 hover:text-[#362223]'
                }`}
              >
                Website Images
              </button>
              <button
                onClick={() => { setActiveTab('texts'); setSearchQuery(''); }}
                className={`pb-3 px-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-all relative cursor-pointer font-bold ${
                  activeTab === 'texts'
                    ? 'text-[#362223] border-b-2 border-[#362223]'
                    : 'text-neutral-400 hover:text-[#362223]'
                }`}
              >
                Website Text & Content
              </button>
            </div>

            {/* Main table control and ledger frame */}
            {activeTab === 'rsvps' && (
              <div className="bg-white border border-black/5 shadow-sm rounded-sm overflow-hidden animate-fade-in">
                
                {/* Search Header */}
                <div className="p-4 md:p-6 border-b border-b-black/5 bg-neutral-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Filter guests by name, note, or diet..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-black/10 hover:border-black/20 focus:border-[#362223] py-2 pl-10 pr-4 font-mono text-[9px] tracking-widest uppercase outline-none transition-colors"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[8px] text-muted hover:text-black uppercase cursor-pointer bg-white/45 backdrop-blur-sm border border-black/5 px-2 py-0.5 rounded-full transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <p className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 whitespace-nowrap font-semibold">
                    Showing {filteredRSVPs.length} of {totalSubmissions} records
                  </p>
                </div>

                {/* Error overlay or Table core */}
                {fetchError ? (
                  <div className="p-12 text-center space-y-6 max-w-xl mx-auto">
                    <div className="space-y-2">
                      <p className="text-red-600 font-mono text-[10px] uppercase tracking-widest font-bold">Error Querying Firestore Collection</p>
                      <p className="text-xs text-neutral-600 font-mono bg-red-50/50 p-4 border border-red-100/50 rounded break-all leading-relaxed whitespace-pre-wrap">
                        {fetchError}
                      </p>
                    </div>
                    <div className="space-y-2 font-mono text-[8px] uppercase tracking-wider text-neutral-400">
                      <p>Possible causes:</p>
                      <ul className="list-disc list-inside text-left space-y-1 max-w-sm mx-auto">
                        <li>Offline or connection timeout to the Firebase emulator or service</li>
                        <li>Firestore rules are being deployed or took a few seconds to apply</li>
                        <li>Collection name mismatch (expected "rsvps")</li>
                      </ul>
                    </div>
                    <button
                      onClick={fetchRSVPs}
                      className="px-6 py-2.5 bg-[#362223]/80 hover:bg-[#362223] text-white border border-[#362223]/20 backdrop-blur-md font-mono text-[9px] tracking-widest uppercase rounded-full transition-all cursor-pointer font-bold shadow-md"
                    >
                      Retry Fetch Query
                    </button>
                  </div>
                ) : isDataLoading && rsvps.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <RefreshCw size={24} className="animate-spin text-[#362223]/40" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-semibold">Querying Firestore tables...</p>
                  </div>
                ) : filteredRSVPs.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <p className="font-serif text-xl italic text-neutral-400">No matching records found</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 leading-relaxed">
                      Try adjusting your search filters or make sure query matches record data exactly.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-black/5 font-mono text-[8.5px] tracking-widest text-neutral-500 uppercase">
                          <th className="py-4 px-6 font-semibold">Guest Name</th>
                          <th className="py-4 px-6 font-semibold">Attendance Status</th>
                          <th className="py-4 px-6 font-semibold">Dietary Restrictions</th>
                          <th className="py-4 px-6 font-semibold">Song Requests / Note</th>
                          <th className="py-4 px-6 font-semibold">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 md:text-xs">
                        {filteredRSVPs.map((rsvp) => (
                          <tr 
                            key={rsvp.id} 
                            className="hover:bg-neutral-50/75 transition-colors font-mono tracking-wide"
                          >
                            <td className="py-5 px-6 font-serif text-base italic leading-none font-medium text-[#362223]">
                              {rsvp.guestName}
                            </td>
                            <td className="py-5 px-6 uppercase text-[9px] tracking-widest">
                              {rsvp.attendingStatus === 'yes' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                                  Accept
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 block"></span>
                                  Decline
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-6 text-neutral-600 uppercase text-[9px] leading-relaxed max-w-xs truncate" title={rsvp.dietaryRestrictions}>
                              {rsvp.dietaryRestrictions ? (
                                <span className="text-stone-800 font-semibold">{rsvp.dietaryRestrictions}</span>
                              ) : (
                                <span className="text-neutral-400 italic">None</span>
                              )}
                            </td>
                            <td className="py-5 px-6 text-neutral-600 uppercase text-[9px] leading-relaxed max-w-sm" title={rsvp.coupleNote}>
                              {rsvp.coupleNote ? (
                                <span className="text-stone-800">{rsvp.coupleNote}</span>
                              ) : (
                                <span className="text-neutral-400">-</span>
                              )}
                            </td>
                            <td className="py-5 px-6 text-neutral-500 text-[8.5px] uppercase whitespace-nowrap font-semibold">
                              {formatDate(rsvp.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Guestbook Wishes */}
            {activeTab === 'notes' && (
              <div className="bg-white border border-black/5 shadow-sm rounded-sm overflow-hidden animate-fade-in">
                
                {/* Search Header */}
                <div className="p-4 md:p-6 border-b border-b-black/5 bg-neutral-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Filter wishes by guest name or message..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-black/10 hover:border-black/20 focus:border-[#362223] py-2 pl-10 pr-4 font-mono text-[9px] tracking-widest uppercase outline-none transition-colors"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[8px] text-muted hover:text-black uppercase cursor-pointer bg-white/45 backdrop-blur-sm border border-black/5 px-2 py-0.5 rounded-full transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <p className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 whitespace-nowrap font-semibold">
                    Showing {filteredNotes.length} of {guestNotes.length} wishes
                  </p>
                </div>

                {/* Error overlay or Core */}
                {fetchError ? (
                  <div className="p-12 text-center space-y-6 max-w-xl mx-auto">
                    <div className="space-y-2">
                      <p className="text-red-600 font-mono text-[10px] uppercase tracking-widest font-bold">Error Querying Guestbook</p>
                      <p className="text-xs text-neutral-600 font-mono bg-red-50/50 p-4 border border-red-100/50 rounded break-all leading-relaxed whitespace-pre-wrap">
                        {fetchError}
                      </p>
                    </div>
                  </div>
                ) : isDataLoading && guestNotes.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <RefreshCw size={24} className="animate-spin text-[#362223]/40" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-semibold">Querying guestbook tables...</p>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <p className="font-serif text-xl italic text-neutral-400">No wedding wishes found</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 leading-relaxed">
                      Wishes will appear here in real-time once guests submit them on the homepage.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-black/5 font-mono text-[8.5px] tracking-widest text-neutral-500 uppercase">
                          <th className="py-4 px-6 font-semibold">Guest Signature</th>
                          <th className="py-4 px-6 font-semibold">Wedding Wish / Message</th>
                          <th className="py-4 px-6 font-semibold">Submitted At</th>
                          <th className="py-4 px-6 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredNotes.map((note) => (
                          <tr 
                            key={note.id} 
                            className="hover:bg-neutral-50/75 transition-colors font-sans"
                          >
                            <td className="py-5 px-6 font-serif text-base italic leading-none font-medium text-[#362223] whitespace-nowrap">
                              {note.name}
                            </td>
                            <td className="py-4 px-6 text-[#362223] text-sm/relaxed font-serif italic max-w-md">
                              "{note.text}"
                            </td>
                            <td className="py-5 px-6 text-neutral-500 text-[8.5px] uppercase whitespace-nowrap font-semibold font-mono">
                              {formatDate(note.createdAt)}
                            </td>
                            <td className="py-5 px-6 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200/40 rounded-full font-mono text-[8px] uppercase tracking-wider font-semibold cursor-pointer transition-colors shadow-sm"
                              >
                                <Trash2 size={11} />
                                <span>Delete Note</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Website Images */}
            {activeTab === 'images' && (
              <div className="space-y-8 animate-fade-in text-[#362223]">
                <div className="bg-[#FAF9F6] p-6 md:p-8 border border-black/5 rounded-sm space-y-4">
                  <h3 className="font-serif text-xl md:text-2xl uppercase tracking-tight font-semibold">Cloudinary Image Asset Control Panel</h3>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 leading-relaxed font-semibold">
                    Direct-to-cloud unsigned upload with instant website propagation. Click "Choose File" to select an image, then click "Upload & Save Image" to update live assets. Use the Revert button on custom images to fall back on initial defaults. Supports up to 100MB files.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {IMAGE_FIELDS.map((field) => {
                    const currentUrl = siteImages[field.key] || '';
                    const isCustom = !!currentUrl;
                    const previewUrl = currentUrl || field.defaultUrl;
                    const selectedFile = selectedFiles[field.key];
                    const progress = uploadProgress[field.key] || 0;
                    const error = uploadErrors[field.key];
                    const uploading = isUploading[field.key];
                    const success = recentSuccess[field.key];

                    return (
                      <div 
                        key={field.key}
                        className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-serif text-lg tracking-normal font-semibold uppercase">{field.label}</h4>
                            <span className="font-mono text-[8px] bg-[#362223]/5 text-[#362223]/70 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                              {isCustom ? 'Active Custom' : 'Static Default'}
                            </span>
                          </div>
                          <p className="font-mono text-[8.5px] leading-relaxed text-neutral-500 max-w-md uppercase">
                            {field.description}
                          </p>
                        </div>

                        {/* Current Preview */}
                        <div className="relative border border-black/5 bg-stone-50 overflow-hidden aspect-video flex items-center justify-center rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                          {previewUrl ? (
                            <img 
                              src={previewUrl} 
                              alt={field.label} 
                              className="w-full h-full object-cover grayscale transition-all duration-300 hover:grayscale-0"
                            />
                          ) : (
                            <div className="py-12 flex flex-col items-center text-center text-neutral-300">
                              <ImageIcon size={32} strokeWidth={1} />
                              <span className="font-mono text-[8px] uppercase tracking-widest mt-2">No Image Saved</span>
                            </div>
                          )}

                          {isCustom && (
                            <button
                              onClick={() => handleRestoreDefault(field.key)}
                              className="absolute top-3 right-3 p-2 bg-white/75 hover:bg-white text-red-700/80 hover:text-red-700 border border-black/10 rounded-full cursor-pointer transition-all shadow-sm"
                              title="Revert to original placeholder background"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Control Box */}
                        <div className="space-y-4">
                          {/* File Selection */}
                          <div className="flex items-center gap-3">
                            <label className="flex-1">
                              <span className="sr-only">Choose image</span>
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={(e) => handleFileChange(field.key, e.target.files?.[0] || null)}
                                className="block w-full text-[9px] font-mono tracking-widest uppercase text-stone-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border file:border-stone-200
                                  file:text-[9px] file:font-mono file:font-semibold file:tracking-widest file:uppercase
                                  file:bg-stone-50 file:text-stone-700
                                  file:cursor-pointer hover:file:bg-stone-100 transition-all"
                              />
                            </label>
                            
                            {selectedFile && (
                              <button
                                onClick={() => handleFileChange(field.key, null)}
                                className="font-mono text-[8.5px] text-zinc-500 hover:text-black uppercase cursor-pointer bg-stone-100 border border-black/5 px-3 py-1 rounded-full transition-colors font-semibold shadow-sm"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Error block */}
                          {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded text-red-700 font-mono text-[9px] uppercase leading-normal">
                              <AlertCircle size={12} className="flex-shrink-0" />
                              <span>{error}</span>
                            </div>
                          )}

                          {/* Progress Indicator */}
                          {uploading && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center font-mono text-[8.5px] uppercase text-[#362223]/60">
                                <span className="animate-pulse font-semibold">Uploading direct to Cloudinary...</span>
                                <span className="font-bold">{progress}%</span>
                              </div>
                              <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#362223] h-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Recent Success element */}
                          {success && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 font-mono text-[9px] uppercase font-semibold">
                              <Check size={12} className="flex-shrink-0" />
                              <span>Database sync complete. Live image set!</span>
                            </div>
                          )}

                          {/* Upload action button */}
                          <button
                            disabled={!selectedFile || uploading}
                            onClick={() => handleImageUpload(field.key)}
                            className="w-full py-4 border border-black/10 bg-white/45 hover:bg-[#362223] text-[#362223] hover:text-white font-mono text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 rounded-full transition-all duration-300 cursor-pointer shadow-sm disabled:opacity-30 disabled:hover:bg-white/45 disabled:hover:text-[#362223] disabled:cursor-not-allowed font-bold"
                          >
                            <Upload size={12} />
                            <span>{uploading ? `Uploading ${progress}%` : 'Upload & Save Image'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Website Texts & Content CMS */}
            {activeTab === 'texts' && (
              <form onSubmit={handleSaveTexts} className="space-y-8 animate-fade-in text-[#362223]">
                <div className="bg-[#FAF9F6] p-6 md:p-8 border border-black/5 rounded-sm space-y-4">
                  <h3 className="font-serif text-xl md:text-2xl uppercase tracking-tight font-semibold">Website Texts & Content CMS</h3>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 leading-relaxed font-semibold">
                    Customize the core texts, names, dates, quotes, locations, and countdown timers across the entire wedding website. Modifying these fields dynamically updates both the English and Vietnamese versions of the app in real-time. Leave fields empty to automatically restore defaults.
                  </p>
                </div>

                {saveTextsSuccess && (
                  <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 font-mono text-[10px] uppercase font-semibold">
                    <Check size={14} className="flex-shrink-0 animate-bounce" />
                    <span>All changes written to Firebase! The live wedding website has been updated.</span>
                  </div>
                )}

                {saveTextsError && (
                  <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded text-red-700 font-mono text-[10px] uppercase font-semibold">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>Error saving changes: {saveTextsError}</span>
                  </div>
                )}

                {/* Subcategory sub-navigation links */}
                <div className="flex flex-wrap gap-2 border-b border-black/5 pb-6">
                  <button
                    type="button"
                    onClick={() => setTextSubTab('identity')}
                    className={`px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase rounded-full transition-all border font-bold ${
                      textSubTab === 'identity'
                        ? 'bg-[#362223] border-[#362223] text-stone-100 shadow-sm'
                        : 'bg-white border-black/5 text-[#362223] hover:bg-[#362223]/5'
                    }`}
                  >
                    1. Identity & Countdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSubTab('story')}
                    className={`px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase rounded-full transition-all border font-bold ${
                      textSubTab === 'story'
                        ? 'bg-[#362223] border-[#362223] text-stone-100 shadow-sm'
                        : 'bg-white border-black/5 text-[#362223] hover:bg-[#362223]/5'
                    }`}
                  >
                    2. Story & Photo Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSubTab('timeline')}
                    className={`px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase rounded-full transition-all border font-bold ${
                      textSubTab === 'timeline'
                        ? 'bg-[#362223] border-[#362223] text-stone-100 shadow-sm'
                        : 'bg-white border-black/5 text-[#362223] hover:bg-[#362223]/5'
                    }`}
                  >
                    3. Timeline & Dress Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSubTab('registry')}
                    className={`px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase rounded-full transition-all border font-bold ${
                      textSubTab === 'registry'
                        ? 'bg-[#362223] border-[#362223] text-stone-100 shadow-sm'
                        : 'bg-white border-black/5 text-[#362223] hover:bg-[#362223]/5'
                    }`}
                  >
                    4. Registry & Guestbook
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSubTab('navigation')}
                    className={`px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase rounded-full transition-all border font-bold ${
                      textSubTab === 'navigation'
                        ? 'bg-[#362223] border-[#362223] text-stone-100 shadow-sm'
                        : 'bg-white border-black/5 text-[#362223] hover:bg-[#362223]/5'
                    }`}
                  >
                    5. Sidebar & Action Buttons
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSubTab('venue')}
                    className={`px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase rounded-full transition-all border font-bold ${
                      textSubTab === 'venue'
                        ? 'bg-[#362223] border-[#362223] text-stone-100 shadow-sm'
                        : 'bg-white border-black/5 text-[#362223] hover:bg-[#362223]/5'
                    }`}
                  >
                    6. Venue & Trails
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Phase 1: Couple Names */}
                  {textSubTab === 'identity' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">1. Main Couple Identity</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Bride Name (Primary)</label>
                        <input 
                          type="text" 
                          value={brideName}
                          onChange={(e) => setBrideName(e.target.value)}
                          placeholder="Bảo Eve"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Groom Name (Primary)</label>
                        <input 
                          type="text" 
                          value={groomName}
                          onChange={(e) => setGroomName(e.target.value)}
                          placeholder="Johnathan"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Hero Couple Header (Names on Opening Screen)</label>
                        <textarea 
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                          placeholder={"Sarah &\nAlderson"}
                          rows={2}
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none"
                        />
                        <p className="font-mono text-[7.5px] uppercase text-neutral-400 leading-tight font-semibold">
                          Press Enter to break into multiple lines. Default fallback is "Sarah &\nAlderson".
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 2: Countdown Date */}
                  {textSubTab === 'identity' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">2. Live Countdown Trigger</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Countdown Target Timestamp</label>
                        <input 
                          type="text" 
                          value={countdownTargetDate}
                          onChange={(e) => setCountdownTargetDate(e.target.value)}
                          placeholder="2027-10-10T17:00:00"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-mono text-xs outline-none transition-colors"
                        />
                        <p className="font-mono text-[7.5px] uppercase text-neutral-400 leading-tight font-semibold">Must follow ISO format: YYYY-MM-DDTHH:MM:SS</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Countdown Section Height (px or vh)</label>
                        <input 
                          type="text" 
                          value={countdownHeight}
                          onChange={(e) => setCountdownHeight(e.target.value)}
                          placeholder="800"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-mono text-xs outline-none transition-colors"
                        />
                        <p className="font-mono text-[7.5px] uppercase text-neutral-400 leading-tight font-semibold">Examples: 800 (for 800px), 80vh, 100vh. Default is 800px.</p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 2b: Countdown Customization */}
                  {textSubTab === 'identity' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6 md:col-span-2">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">3. Countdown Section Typography & Locations</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Countdown Heading (English)</label>
                          <input 
                            type="text" 
                            value={countdownTitleEng}
                            onChange={(e) => setCountdownTitleEng(e.target.value)}
                            placeholder="Let's the countdown"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Countdown Heading (Vietnamese)</label>
                          <input 
                            type="text" 
                            value={countdownTitleVie}
                            onChange={(e) => setCountdownTitleVie(e.target.value)}
                            placeholder="Cùng đếm ngược"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Bottom Cursive Title (English)</label>
                          <input 
                            type="text" 
                            value={countdownEndTitleEng}
                            onChange={(e) => setCountdownEndTitleEng(e.target.value)}
                            placeholder="begin"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Bottom Cursive Title (Vietnamese)</label>
                          <input 
                            type="text" 
                            value={countdownEndTitleVie}
                            onChange={(e) => setCountdownEndTitleVie(e.target.value)}
                            placeholder="bắt đầu"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/5 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <span className="font-serif text-xs tracking-wide uppercase text-[#362223]/70 font-semibold block">Location 1</span>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">City</label>
                          <input 
                            type="text" 
                            value={countdownLoc1City}
                            onChange={(e) => setCountdownLoc1City(e.target.value)}
                            placeholder="DANANG"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">Country</label>
                          <input 
                            type="text" 
                            value={countdownLoc1Country}
                            onChange={(e) => setCountdownLoc1Country(e.target.value)}
                            placeholder="VIETNAM"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="font-serif text-xs tracking-wide uppercase text-[#362223]/70 font-semibold block">Location 2</span>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">City</label>
                          <input 
                            type="text" 
                            value={countdownLoc2City}
                            onChange={(e) => setCountdownLoc2City(e.target.value)}
                            placeholder="TOKYO"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">Country</label>
                          <input 
                            type="text" 
                            value={countdownLoc2Country}
                            onChange={(e) => setCountdownLoc2Country(e.target.value)}
                            placeholder="JAPAN"
                            className="w-full bg-stone-50 border border-black/10 py-2 px-3 font-mono text-xs outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="font-serif text-xs tracking-wide uppercase text-[#362223]/70 font-semibold block">Location 3</span>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">City</label>
                          <input 
                            type="text" 
                            value={countdownLoc3City}
                            onChange={(e) => setCountdownLoc3City(e.target.value)}
                            placeholder="CITY"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[8px] uppercase tracking-wider text-neutral-400 font-semibold">Country</label>
                          <input 
                            type="text" 
                            value={countdownLoc3Country}
                            onChange={(e) => setCountdownLoc3Country(e.target.value)}
                            placeholder="ENGLAND"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/5 pt-6">
                      <div className="space-y-1.5 max-w-md">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Anniversary / Since Text (Bottom Right)</label>
                        <input 
                          type="text" 
                          value={countdownSinceText}
                          onChange={(e) => setCountdownSinceText(e.target.value)}
                          placeholder="SINCE 2022"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-mono text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 3: Invitation Texts */}
                  {textSubTab === 'story' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">3. Welcome Story Invitation</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Invitation Body Text (ENGLISH)</label>
                        <textarea 
                          rows={3}
                          value={invitationTextEng}
                          onChange={(e) => setInvitationTextEng(e.target.value)}
                          placeholder="Invite you to share in a quiet weekend of woodfire, forest walks..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Invitation Body Text (VIETNAMESE)</label>
                        <textarea 
                          rows={3}
                          value={invitationTextVie}
                          onChange={(e) => setInvitationTextVie(e.target.value)}
                          placeholder="Trân trọng kính mời bạn ghé thăm một ngày ấm áp đầy tiếng cười..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 4: Venue Info & Hero Date */}
                  {textSubTab === 'timeline' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">4. Hero Timeline & Location</h4>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Hero Main Date (ENG)</label>
                          <input 
                            type="text" 
                            value={heroDateEng}
                            onChange={(e) => setHeroDateEng(e.target.value)}
                            placeholder="22 JUNE 2026, FRIDAY"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Hero Main Date (VIE)</label>
                          <input 
                            type="text" 
                            value={heroDateVie}
                            onChange={(e) => setHeroDateVie(e.target.value)}
                            placeholder="THỨ SÁU, 22 THÁNG 6, 2026"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Venue Location (ENG)</label>
                          <input 
                            type="text" 
                            value={venueNameEng}
                            onChange={(e) => setVenueNameEng(e.target.value)}
                            placeholder="TOKYO, JAPAN"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Venue Location (VIE)</label>
                          <input 
                            type="text" 
                            value={venueNameVie}
                            onChange={(e) => setVenueNameVie(e.target.value)}
                            placeholder="TOKYO, NHẬT BẢN"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Timeline Short Date (ENG)</label>
                          <input 
                            type="text" 
                            value={weddingDateShortEng}
                            onChange={(e) => setWeddingDateShortEng(e.target.value)}
                            placeholder="OCT, 2027"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Timeline Short Date (VIE)</label>
                          <input 
                            type="text" 
                            value={weddingDateShortVie}
                            onChange={(e) => setWeddingDateShortVie(e.target.value)}
                            placeholder="TH.10, 2027"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 5: Attire Details */}
                  {textSubTab === 'timeline' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">5. Attire Dress Code Guidelines</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Dress Code details (ENGLISH)</label>
                        <textarea 
                          rows={2}
                          value={attireDescEng}
                          onChange={(e) => setAttireDescEng(e.target.value)}
                          placeholder="Cocktail Attire. Black tie optional."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Dress Code details (VIETNAMESE)</label>
                        <textarea 
                          rows={2}
                          value={attireDescVie}
                          onChange={(e) => setAttireDescVie(e.target.value)}
                          placeholder="Trang phục bán trang trọng (Cocktail). Nam có thể thắt nơ."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 6: Registry Message */}
                  {textSubTab === 'registry' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">6. Registry Hộp Quà Details</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Registry Paragraph (ENGLISH)</label>
                        <textarea 
                          rows={3}
                          value={registryTextEng}
                          onChange={(e) => setRegistryTextEng(e.target.value)}
                          placeholder="We are so grateful to have you as a part of our lives..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Registry Paragraph (VIETNAMESE)</label>
                        <textarea 
                          rows={3}
                          value={registryTextVie}
                          onChange={(e) => setRegistryTextVie(e.target.value)}
                          placeholder="Sự hiện diện của bạn là niềm hạnh phúc lớn nhất của chúng mình..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 7: Photo Quote Details */}
                  {textSubTab === 'story' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">7. Kodak Photo Frame Quote</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Photo Quote Text (ENGLISH)</label>
                        <textarea 
                          rows={2}
                          value={photoQuoteEng}
                          onChange={(e) => setPhotoQuoteEng(e.target.value)}
                          placeholder="A quiet instant captured on analogue medium..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Photo Quote Text (VIETNAMESE)</label>
                        <textarea 
                          rows={2}
                          value={photoQuoteVie}
                          onChange={(e) => setPhotoQuoteVie(e.target.value)}
                          placeholder="Khoảnh khắc an yên ghi dấu qua thước phim màu..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 7.5: Interactive RSVP Card Customization */}
                  {textSubTab === 'story' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">8. Interactive RSVP Card Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Card Image Rotation (Degrees)</label>
                        <select 
                          value={collageLaceBgRotate}
                          onChange={(e) => setCollageLaceBgRotate(e.target.value)}
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-mono text-xs outline-none transition-colors"
                        >
                          <option value="0">0° (No rotation - default)</option>
                          <option value="90">90° (Quarter turn right)</option>
                          <option value="180">180° (Half turn)</option>
                          <option value="270">270° (Quarter turn left)</option>
                        </select>
                        <p className="font-mono text-[8.5px] uppercase tracking-wide text-neutral-400 mt-1.5 leading-normal">
                          Useful if your custom lace card background image uploads sideways or if you need to manually orient it.
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 8: Sidebar Floating Labels */}
                  {textSubTab === 'navigation' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">8. Sidebar Floating Labels</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">HOME (ENG)</label>
                          <input 
                            type="text" 
                            value={sidebarHomeEng}
                            onChange={(e) => setSidebarHomeEng(e.target.value)}
                            placeholder="HOME"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">HOME (VIE)</label>
                          <input 
                            type="text" 
                            value={sidebarHomeVie}
                            onChange={(e) => setSidebarHomeVie(e.target.value)}
                            placeholder="TRANG CHỦ"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">OUR STORY (ENG)</label>
                          <input 
                            type="text" 
                            value={sidebarStoryEng}
                            onChange={(e) => setSidebarStoryEng(e.target.value)}
                            placeholder="OUR STORY"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">OUR STORY (VIE)</label>
                          <input 
                            type="text" 
                            value={sidebarStoryVie}
                            onChange={(e) => setSidebarStoryVie(e.target.value)}
                            placeholder="CÂU CHUYỆN"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">EVENTS (ENG)</label>
                          <input 
                            type="text" 
                            value={sidebarEventsEng}
                            onChange={(e) => setSidebarEventsEng(e.target.value)}
                            placeholder="EVENTS"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">EVENTS (VIE)</label>
                          <input 
                            type="text" 
                            value={sidebarEventsVie}
                            onChange={(e) => setSidebarEventsVie(e.target.value)}
                            placeholder="SỰ KIỆN"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">RSVP (ENG)</label>
                          <input 
                            type="text" 
                            value={sidebarRsvpEng}
                            onChange={(e) => setSidebarRsvpEng(e.target.value)}
                            placeholder="RSVP"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">RSVP (VIE)</label>
                          <input 
                            type="text" 
                            value={sidebarRsvpVie}
                            onChange={(e) => setSidebarRsvpVie(e.target.value)}
                            placeholder="XÁC NHẬN"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 9: Dynamic Action Buttons */}
                  {textSubTab === 'navigation' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">9. Action Buttons & Deadlines</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Hero / RSVP Button text (ENG)</label>
                          <input 
                            type="text" 
                            value={heroBtnEng}
                            onChange={(e) => setHeroBtnEng(e.target.value)}
                            placeholder="RSVP NOW"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Hero / RSVP Button text (VIE)</label>
                          <input 
                            type="text" 
                            value={heroBtnVie}
                            onChange={(e) => setHeroBtnVie(e.target.value)}
                            placeholder="PHẢN HỒI NGAY"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Registry Access Button text (ENG)</label>
                          <input 
                            type="text" 
                            value={registryBtnEng}
                            onChange={(e) => setRegistryBtnEng(e.target.value)}
                            placeholder="View Our Wedding Registry"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Registry Access Button text (VIE)</label>
                          <input 
                            type="text" 
                            value={registryBtnVie}
                            onChange={(e) => setRegistryBtnVie(e.target.value)}
                            placeholder="Xem Hộp Quà Chúc Mừng"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Respond By RSVP Deadline phrase (ENG)</label>
                        <input 
                          type="text" 
                          value={respondByEng}
                          onChange={(e) => setRespondByEng(e.target.value)}
                          placeholder="Kindly respond by March 23, 2026."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Respond By RSVP Deadline phrase (VIE)</label>
                        <input 
                          type="text" 
                          value={respondByVie}
                          onChange={(e) => setRespondByVie(e.target.value)}
                          placeholder="Vui lòng cho tụi mình biết phản hồi trước ngày 23 tháng 3, 2026."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 10: Wish Board Heading & Subtext */}
                  {textSubTab === 'registry' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">10. Wish Board Panel Texts</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Board Heading (ENG)</label>
                          <input 
                            type="text" 
                            value={writeNoteTitleEng}
                            onChange={(e) => setWriteNoteTitleEng(e.target.value)}
                            placeholder="WRITE US A NOTE"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Board Heading (VIE)</label>
                          <input 
                            type="text" 
                            value={writeNoteTitleVie}
                            onChange={(e) => setWriteNoteTitleVie(e.target.value)}
                            placeholder="GỬI LỜI CHÚC MỪNG"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Board Subtitle description (ENG)</label>
                        <textarea 
                          rows={2}
                          value={writeNoteSubtitleEng}
                          onChange={(e) => setWriteNoteSubtitleEng(e.target.value)}
                          placeholder="Leave a memory, wish, or guidance on our wedding board."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Board Subtitle description (VIE)</label>
                        <textarea 
                          rows={2}
                          value={writeNoteSubtitleVie}
                          onChange={(e) => setWriteNoteSubtitleVie(e.target.value)}
                          placeholder="Ghi lại kỷ niệm hoặc lời nhắn nhủ dành cho ngày hạnh phúc của chúng mình."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 11: Gathering Grounds & Venue CMS */}
                  {textSubTab === 'venue' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6 md:col-span-2">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">1. Venue Overview & Introductions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Section Subtitle (ENG)</label>
                        <input 
                          type="text" 
                          value={gatherSubtitleEng}
                          onChange={(e) => setGatherSubtitleEng(e.target.value)}
                          placeholder="02 // The Gathering Grounds"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Section Subtitle (VIE)</label>
                        <input 
                          type="text" 
                          value={gatherSubtitleVie}
                          onChange={(e) => setGatherSubtitleVie(e.target.value)}
                          placeholder="02 // Địa Điểm Hội Tụ"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Section Main Heading (ENG)</label>
                        <input 
                          type="text" 
                          value={gatherHeadingEng}
                          onChange={(e) => setGatherHeadingEng(e.target.value)}
                          placeholder="Where the world slows down."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Section Main Heading (VIE)</label>
                        <input 
                          type="text" 
                          value={gatherHeadingVie}
                          onChange={(e) => setGatherHeadingVie(e.target.value)}
                          placeholder="Nơi thế giới ngừng trôi."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Section Main Description (ENG)</label>
                        <textarea 
                          rows={3}
                          value={gatherDescEng}
                          onChange={(e) => setGatherDescEng(e.target.value)}
                          placeholder="The ceremony and celebratory feast will both be hosted..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Section Main Description (VIE)</label>
                        <textarea 
                          rows={3}
                          value={gatherDescVie}
                          onChange={(e) => setGatherDescVie(e.target.value)}
                          placeholder="Lễ cưới và tiệc mừng hân hoan đều được tổ chức..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 12: Ceremony & Feast cards */}
                  {textSubTab === 'venue' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">2. Event Block details</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Ceremony Block Title (ENG)</label>
                          <input 
                            type="text" 
                            value={gatherCereTitleEng}
                            onChange={(e) => setGatherCereTitleEng(e.target.value)}
                            placeholder="THE CEREMONY"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Ceremony Block Title (VIE)</label>
                          <input 
                            type="text" 
                            value={gatherCereTitleVie}
                            onChange={(e) => setGatherCereTitleVie(e.target.value)}
                            placeholder="LỄ THÀNH HÔN"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Ceremony Block Description (ENG)</label>
                        <textarea 
                          rows={2}
                          value={gatherCereDescEng}
                          onChange={(e) => setGatherCereDescEng(e.target.value)}
                          placeholder="Four P.M. Under the giant Oak..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Ceremony Block Description (VIE)</label>
                        <textarea 
                          rows={2}
                          value={gatherCereDescVie}
                          onChange={(e) => setGatherCereDescVie(e.target.value)}
                          placeholder="Bốn giờ chiều. Dưới tán cây sồi..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Feast Block Title (ENG)</label>
                          <input 
                            type="text" 
                            value={gatherFeastTitleEng}
                            onChange={(e) => setGatherFeastTitleEng(e.target.value)}
                            placeholder="THE GATHERING & FEAST"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Feast Block Title (VIE)</label>
                          <input 
                            type="text" 
                            value={gatherFeastTitleVie}
                            onChange={(e) => setGatherFeastTitleVie(e.target.value)}
                            placeholder="TIỆC GIAO LƯU & CHIÊU ĐÃI"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2.5 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Feast Block Description (ENG)</label>
                        <textarea 
                          rows={2}
                          value={gatherFeastDescEng}
                          onChange={(e) => setGatherFeastDescEng(e.target.value)}
                          placeholder="To follow immediately within the wooden Glass Barn..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Feast Block Description (VIE)</label>
                        <textarea 
                          rows={2}
                          value={gatherFeastDescVie}
                          onChange={(e) => setGatherFeastDescVie(e.target.value)}
                          placeholder="Khai tiệc ngay sau đó tại Glass Barn..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 13: Map and coordinates */}
                  {textSubTab === 'venue' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">3. Interactive Map & Logistics</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Map Pill Label (ENG)</label>
                          <input 
                            type="text" 
                            value={gatherMapPillEng}
                            onChange={(e) => setGatherMapPillEng(e.target.value)}
                            placeholder="INTERACTIVE MAP & TRAILS"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Map Pill Label (VIE)</label>
                          <input 
                            type="text" 
                            value={gatherMapPillVie}
                            onChange={(e) => setGatherMapPillVie(e.target.value)}
                            placeholder="BẢN ĐỒ CHI TIẾT & LỐI ĐI"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Latitude GPS value</label>
                          <input 
                            type="text" 
                            value={gatherLatitude}
                            onChange={(e) => setGatherLatitude(e.target.value)}
                            placeholder="Latitude: 45.4192° N"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Longitude GPS value</label>
                          <input 
                            type="text" 
                            value={gatherLongitude}
                            onChange={(e) => setGatherLongitude(e.target.value)}
                            placeholder="Longitude: 122.1824° W"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-[10px] outline-none transition-colors font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Directions Link Text (ENG)</label>
                          <input 
                            type="text" 
                            value={gatherDirectionsTextEng}
                            onChange={(e) => setGatherDirectionsTextEng(e.target.value)}
                            placeholder="GET DIRECTIONS"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Directions Link Text (VIE)</label>
                          <input 
                            type="text" 
                            value={gatherDirectionsTextVie}
                            onChange={(e) => setGatherDirectionsTextVie(e.target.value)}
                            placeholder="CHỈ ĐƯỜNG CHI TIẾT"
                            className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Google Maps URL Hyperlink</label>
                        <input 
                          type="text" 
                          value={gatherDirectionsUrl}
                          onChange={(e) => setGatherDirectionsUrl(e.target.value)}
                          placeholder="https://maps.google.com/?q=45.4192,-122.1824"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Interactive Ceremony Pin URL (West Ridge Link)</label>
                        <input 
                          type="text" 
                          value={gatherPinUrl}
                          onChange={(e) => setGatherPinUrl(e.target.value)}
                          placeholder="https://maps.google.com/?q=45.4192,-122.1824"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-mono text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Phase 14: Notice block and Sidebar navigation text */}
                  {textSubTab === 'venue' && (
                  <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 shadow-sm space-y-6 md:col-span-2">
                    <h4 className="font-serif text-base tracking-normal uppercase border-b border-black/5 pb-3 font-semibold">4. Notices & Navigation links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Notice Info Box Text (ENG)</label>
                        <textarea 
                          rows={2}
                          value={gatherNoteEng}
                          onChange={(e) => setGatherNoteEng(e.target.value)}
                          placeholder="Accommodation details & guidelines available upon request."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Notice Info Box Text (VIE)</label>
                        <textarea 
                          rows={2}
                          value={gatherNoteVie}
                          onChange={(e) => setGatherNoteVie(e.target.value)}
                          placeholder="Thông tin phòng lưu trú & hướng dẫn hành trình chi tiết..."
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Sidebar Menu Item Label (ENG)</label>
                        <input 
                          type="text" 
                          value={sidebarGatherEng}
                          onChange={(e) => setSidebarGatherEng(e.target.value)}
                          placeholder="VENUE"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Sidebar Menu Item Label (VIE)</label>
                        <input 
                          type="text" 
                          value={sidebarGatherVie}
                          onChange={(e) => setSidebarGatherVie(e.target.value)}
                          placeholder="ĐỊA ĐIỂM"
                          className="w-full bg-stone-50 border border-black/10 focus:border-[#362223] py-2 px-3 font-serif text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Submit Button card */}
                  <div className="bg-neutral-50 border border-black/5 rounded-sm p-6 md:p-8 flex flex-col justify-center items-center space-y-4 text-center">
                    <h4 className="font-serif text-lg tracking-normal uppercase font-semibold">Publish Modifications</h4>
                    <p className="font-mono text-[8.5px] max-w-sm leading-relaxed text-neutral-500 uppercase font-semibold">
                      Confirming save updates all client devices immediately via live websocket synchronicity. Make sure to double-check spelling and countdown format conventions before deploying.
                    </p>
                    
                    <button
                      type="submit"
                      disabled={isSavingTexts}
                      className="w-full max-w-xs py-4 px-6 bg-[#362223] hover:bg-[#20100F] text-white font-mono text-[10px] tracking-[0.25em] uppercase flex items-center justify-center gap-2 rounded-full transition-all duration-300 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                      <span>{isSavingTexts ? 'Writing to DB...' : 'Save & Publish Texts'}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
