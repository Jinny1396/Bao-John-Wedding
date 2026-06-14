import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  Lock, 
  Unlock, 
  RefreshCw, 
  LogOut, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Search, 
  EyeOff, 
  Users, 
  Heart,
  FileSpreadsheet
} from 'lucide-react';

interface RSVPEntity {
  id: string;
  guestName: string;
  attendingStatus: 'yes' | 'no' | string;
  dietaryRestrictions: string;
  coupleNote: string;
  createdAt?: any;
}

interface AdminPanelProps {
  onBackToHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToHome }) => {
  const [pin, setPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [rsvps, setRsvps] = useState<RSVPEntity[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. PIN Check
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsPinVerified(true);
      setPinError('');
      // Save verification state locally
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

  // 2. Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Check if email is authorized
  const isAuthorizedEmail = currentUser?.email === 'jminxiii@gmail.com';

  // 4. Load RSVPs from firestore
  const fetchRSVPs = async () => {
    if (!currentUser || !isAuthorizedEmail) return;
    
    setIsDataLoading(true);
    setFetchError(null);
    try {
      const rsvpQuery = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(rsvpQuery);
      const data: RSVPEntity[] = [];
      querySnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        data.push({
          id: docSnap.id,
          guestName: docData.guestName || '',
          attendingStatus: docData.attendingStatus || 'no',
          dietaryRestrictions: docData.dietaryRestrictions || '',
          coupleNote: docData.coupleNote || '',
          createdAt: docData.createdAt
        });
      });
      setRsvps(data);
    } catch (err: any) {
      console.error('Error fetching RSVPs:', err);
      setFetchError(err?.message || 'Permission denied or connection issue.');
      try {
        handleFirestoreError(err, OperationType.LIST, 'rsvps');
      } catch (e) {
        // Suppress or handle formatted error code
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  // Trigger load when authorized
  useEffect(() => {
    if (isPinVerified && currentUser && isAuthorizedEmail) {
      fetchRSVPs();
    }
  }, [isPinVerified, currentUser, isAuthorizedEmail]);

  // Google Log In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setFetchError(`Google Login failed: ${err.message}`);
    }
  };

  // Log Out
  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Full reset (unverify pin + signout)
  const handleFullReset = async () => {
    sessionStorage.removeItem('admin_pin_verified');
    setIsPinVerified(false);
    setPin('');
    await handleLogOut();
  };

  // Filtered RSVPs by guest name
  const filteredRSVPs = rsvps.filter(rsvp => 
    rsvp.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rsvp.dietaryRestrictions.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rsvp.coupleNote.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute metrics
  const totalSubmissions = rsvps.length;
  const attendingCount = rsvps.filter(r => r.attendingStatus === 'yes').length;
  const decliningCount = rsvps.filter(r => r.attendingStatus === 'no').length;

  // Render Formatted Date Helper
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
    <div className="min-h-screen bg-[#FDFDFB] text-[#3A2220] px-4 md:px-12 py-12 flex flex-col font-sans selection:bg-[#3A2220]/10 selection:text-[#3A2220]">
      
      {/* Top control bar */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between mb-12 py-4 border-b border-black/5 font-mono text-[9px] tracking-widest uppercase">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-[#3A2220]/75 hover:text-[#3A2220] transition-colors cursor-pointer group"
          id="admin-back-btn"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Home Suite</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="opacity-55">Guest Ledger System</span>
          {isPinVerified && (
            <button 
              onClick={handleFullReset}
              className="flex items-center gap-1.5 text-red-700/80 hover:text-red-700 transition-all cursor-pointer border border-transparent hover:border-red-200 bg-red-50/10 px-3 py-1 rounded-full"
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
            className="flex-1 flex items-center justify-center max-w-md w-full mx-auto"
          >
            <div className="bg-white border border-black/5 shadow-xl rounded-sm p-8 md:p-10 w-full text-center space-y-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#3A2220]/5 flex items-center justify-center text-[#3A2220]/70">
                <Lock size={20} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl tracking-normal text-[#3A2220] uppercase">ADMIN LEDGER</h2>
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
                    className="w-full text-center bg-transparent border-b border-black/15 py-3 font-mono text-3xl tracking-[1em] focus:border-[#3A2220] outline-none transition-colors"
                  />
                </div>

                {pinError && (
                  <p className="text-red-600 font-mono text-[9px] uppercase tracking-wider">{pinError}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#3A2220] text-white font-mono text-xs tracking-[0.25em] hover:bg-neutral-800 transition-colors uppercase rounded-none cursor-pointer"
                  >
                    CONTINUE
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 2: Google Authorization Guard (Zero Trust Implementation) */}
        {isPinVerified && (isAuthLoading || !currentUser || !isAuthorizedEmail) && (
          <motion.div 
            key="auth-gate"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 flex items-center justify-center max-w-lg w-full mx-auto"
          >
            <div className="bg-white border border-black/5 shadow-xl rounded-sm p-8 md:p-12 w-full text-center space-y-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-700">
                <Unlock size={20} />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-serif text-2xl tracking-normal text-[#3A2220] uppercase">SECURE OAUTH VERIFICATION</h3>
                <p className="font-mono text-[8.5px] tracking-wider text-neutral-400 uppercase">Step 2 of the Zero-Trust Security Protocol</p>
              </div>

              <div className="bg-neutral-50 p-4 rounded text-left space-y-2 font-mono text-[9px] text-[#3A2220]/75 leading-relaxed uppercase tracking-wider">
                <p>🔓 <span className="font-semibold text-[#3A2220]">PIN accepted successfully.</span></p>
                <p>🔒 To safeguard guest lists and dietary profiles from scraping, unauthenticated public read operations are structurally blocked by Firestore rules.</p>
                <p>👉 Please authenticate securely below using Google OAuth. Access requires authorization as the wedding owner account: <strong className="text-black">jminxiii@gmail.com</strong></p>
              </div>

              {isAuthLoading ? (
                <div className="flex justify-center items-center gap-3 font-mono text-[10px] tracking-widest text-[#3A2220]/50 py-4 uppercase">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Configuring authorization...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUser && !isAuthorizedEmail && (
                    <div className="border border-red-200 bg-red-50 p-3.5 text-center space-y-1 rounded">
                      <p className="text-red-700 font-mono text-[9px] uppercase tracking-wider">AUTHORIZATION REJECTED</p>
                      <p className="text-xs font-mono text-neutral-600 uppercase tracking-widest leading-loose">
                        Logged in as: {currentUser.email}<br />
                        This account is not authorized as the admin owner.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 border border-black/10 hover:border-black hover:bg-neutral-50 font-mono text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 transition-all uppercase cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.564-1.88 4.6-6.887 4.6-4.33 0-7.86-3.582-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.028 5.044 1.929l3.245-3.129C18.243 1.83 15.483 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.3-.176-1.85H12.24z"/>
                    </svg>
                    AUTHORIZE WITH GOOGLE
                  </button>

                  {currentUser && (
                    <button 
                      onClick={handleLogOut}
                      className="font-mono text-[8.5px] uppercase tracking-widest text-neutral-400 hover:text-[#3A2220] transition-colors bg-transparent border-none py-1 block mx-auto underline cursor-pointer"
                    >
                      Authenticate with another account
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Fully Authenticated Guest RSVPs Index Board */}
        {isPinVerified && currentUser && isAuthorizedEmail && (
          <motion.div 
            key="admin-ledger-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl w-full mx-auto space-y-8 flex-1"
          >
            {/* Header portion */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-black/5 pb-8">
              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-400 block">Wedding Suite Control Deck</span>
                <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-tight text-[#3A2220]">RSVP LEDGER BOARD</h1>
                <p className="font-mono text-[9.5px] uppercase tracking-widest text-neutral-500/85">
                  Logged in: <strong className="text-stone-800">{currentUser.email}</strong> • Real-time stream active
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRSVPs}
                  disabled={isDataLoading}
                  className="px-5 py-2.5 border border-black/10 hover:border-black/30 font-mono text-[9px] tracking-widest uppercase flex items-center gap-2 rounded-full transition-colors bg-white disabled:opacity-55 cursor-pointer"
                >
                  <RefreshCw size={11} className={`${isDataLoading ? 'animate-spin' : ''}`} />
                  <span>{isDataLoading ? 'Refreshing' : 'Refresh Ledger'}</span>
                </button>
                
                <button
                  onClick={handleFullReset}
                  className="px-5 py-2.5 border border-red-200/50 hover:border-red-600 bg-red-50/20 hover:bg-red-50/50 text-red-700/80 hover:text-red-800 font-mono text-[9px] tracking-widest uppercase flex items-center gap-2 rounded-full transition-colors cursor-pointer"
                >
                  <EyeOff size={11} />
                  <span>Lock Deck</span>
                </button>
              </div>
            </div>

            {/* Analytics Stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 border border-black/5 shadow-sm rounded-sm flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#3A2220]/5 flex items-center justify-center text-[#3A2220]">
                  <Users size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-neutral-400">Total Submissions</p>
                  <p className="font-serif text-3xl font-light leading-none">{totalSubmissions}</p>
                </div>
              </div>

              <div className="bg-white p-6 border border-black/5 shadow-sm rounded-sm flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-700">
                  <CheckCircle size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-neutral-400">Attending (Accepts)</p>
                  <p className="font-serif text-3xl font-light leading-none text-emerald-800">{attendingCount}</p>
                </div>
              </div>

              <div className="bg-white p-6 border border-black/5 shadow-sm rounded-sm flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400">
                  <XCircle size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-widest uppercase text-neutral-400">Declined (Regrets)</p>
                  <p className="font-serif text-3xl font-light leading-none text-neutral-500">{decliningCount}</p>
                </div>
              </div>

            </div>

            {/* Main table control and ledger frame */}
            <div className="bg-white border border-black/5 shadow-sm rounded-sm overflow-hidden">
              
              {/* Search Header */}
              <div className="p-4 md:p-6 border-b border-black/5 bg-neutral-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter guests by name, note, or diet..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-black/10 hover:border-black/20 focus:border-[#3A2220] py-2 pl-10 pr-4 font-mono text-[9px] tracking-widest uppercase outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[8px] text-muted hover:text-black uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <p className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 whitespace-nowrap">
                  Showing {filteredRSVPs.length} of {totalSubmissions} records
                </p>
              </div>

              {/* Error overlay or Table core */}
              {fetchError ? (
                <div className="p-16 text-center space-y-4">
                  <p className="text-red-600 font-mono text-[10px] uppercase tracking-widest">Error Loading Ledger Data</p>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">{fetchError}</p>
                  <button
                    onClick={fetchRSVPs}
                    className="px-6 py-2 border border-black/10 hover:border-black font-mono text-[9px] tracking-widest uppercase rounded-full transition-all cursor-pointer"
                  >
                    Retry Query
                  </button>
                </div>
              ) : isDataLoading && rsvps.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                  <RefreshCw size={24} className="animate-spin text-[#3A2220]/40" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400">Querying Firestore tables...</p>
                </div>
              ) : filteredRSVPs.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <p className="font-serif text-xl italic text-neutral-400">No matching guest response found</p>
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
                          <td className="py-5 px-6 font-serif text-base italic leading-none font-medium text-[#3A2220]">
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
                              <span className="text-stone-800 font-medium">{rsvp.dietaryRestrictions}</span>
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
                          <td className="py-5 px-6 text-neutral-500 text-[8.5px] uppercase whitespace-nowrap">
                            {formatDate(rsvp.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
