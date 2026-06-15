import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Heart, Send, Check } from 'lucide-react';

interface GuestNote {
  id: string;
  guestName: string;
  noteText: string;
  createdAt: Timestamp | null;
}

interface GuestNotesProps {
  lang?: 'VIE' | 'ENG';
}

export const GuestNotes = ({ lang = 'VIE' }: GuestNotesProps) => {
  const [guestName, setGuestName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notes, setNotes] = useState<GuestNote[]>([]);

  const translations = {
    ENG: {
      alertName: 'Please sign your name.',
      alertText: 'Please write a message.',
      errorSave: 'Failed to pin note. Please try again.',
      postHeader: '✉ POSTED FROM GUESTBOOK',
      writeNoteTitle: 'Write Us a Note...',
      writeNoteSubtitle: 'Leave a congratulatory note, a warm wish, or a loving message.',
      placeholderText: 'Write your wishes to the newlyweds here...',
      withLove: 'With Love,',
      placeholderName: 'Your Name(s)',
      saving: 'Saving...',
      pinned: 'Pinned!',
      pinToBoard: 'Pin to Board',
      boardTitle: 'The Guest Registry Board',
      boardSubtitle: 'Live notes from friends and family',
    },
    VIE: {
      alertName: 'Vui lòng ký tên của bạn.',
      alertText: 'Vui lòng viết lời nhắn của bạn.',
      errorSave: 'Gửi lời chúc không thành công. Vui lòng thử lại.',
      postHeader: '✉ GỬI TỪ SỔ LƯU BÚT',
      writeNoteTitle: 'Gửi Lời Chúc Mừng...',
      writeNoteSubtitle: 'Gửi gắm một lời chúc phúc, lời nhắn yêu thương hay một lời khuyên chân thành.',
      placeholderText: 'Viết những lời chúc tốt đẹp nhất gửi tới cô dâu chú rể tại đây...',
      withLove: 'Thân thương,',
      placeholderName: 'Tên của bạn',
      saving: 'Đang Lưu...',
      pinned: 'Đã Đăng!',
      pinToBoard: 'Gửi Lời Chúc',
      boardTitle: 'Sổ Lưu Bút Chúc Mừng',
      boardSubtitle: 'Lời chúc và kỷ niệm từ người thân, bạn bè',
    }
  };

  const t = translations[lang];

  // Fetch guest notes in real-time
  useEffect(() => {
    const notesQuery = query(
      collection(db, 'guestNotes'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const fetchedNotes: GuestNote[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedNotes.push({
            id: doc.id,
            guestName: data.guestName || 'Anonymous',
            noteText: data.noteText || '',
            createdAt: data.createdAt,
          });
        });
        setNotes(fetchedNotes);
      },
      (error) => {
        console.error('Error listening to guest notes:', error);
        try {
          handleFirestoreError(error, OperationType.LIST, 'guestNotes');
        } catch (e) {
          // Handled format
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      setSubmitError(t.alertName);
      return;
    }
    if (!noteText.trim()) {
      setSubmitError(t.alertText);
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    const notePayload = {
      guestName: guestName.trim(),
      noteText: noteText.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'guestNotes'), notePayload);
      setIsSubmitted(true);
      setNoteText('');
      setGuestName('');
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error('Error adding guest note:', err);
      setSubmitError(t.errorSave);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'guestNotes');
      } catch (e) {
        // Handled format
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-12">
      {/* Visual Stationery Notepad Section */}
      <div className="max-w-2xl mx-auto relative">
        {/* Shadow Overlay Backdrop for physical depth */}
        <div className="absolute inset-0 bg-[#3A2220]/5 translate-x-3 translate-y-3 rounded-lg blur-md" />

        {/* The White Paper Notepad (Guards and Lines style) */}
        <div 
          className="relative bg-[#FAF9F5] border border-black/10 rounded-sm p-8 md:p-14 md:pb-10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] min-h-[480px] flex flex-col justify-between before:absolute before:left-10 md:before:left-14 before:top-0 before:bottom-0 before:w-[1px] before:bg-red-200/50 before:z-10"
          id="visual-white-paper"
        >
          {/* Faux Tape Header for tactile vibe */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 tape px-6 py-1.5 font-mono text-[8px] tracking-[0.4em] uppercase text-muted/80 select-none z-20">
            {t.postHeader}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative h-full flex flex-col flex-1 pl-6 md:pl-10">
            {/* Paper Lined Background using css gradient */}
            <div className="absolute inset-0 top-[2.5rem] bg-[linear-gradient(transparent_97.5%,rgba(58,34,32,0.06)_97.5%)] bg-[size:100%_40px] pointer-events-none select-none" />

            {/* Header Title inside Paper */}
            <div className="z-10 pb-4">
              <h3 className="font-serif text-2xl md:text-3xl text-ink tracking-tight italic select-none">
                {t.writeNoteTitle}
              </h3>
              <p className="font-mono text-[8px] tracking-widest text-muted uppercase mt-1 select-none">
                {t.writeNoteSubtitle}
              </p>
            </div>

            {/* Note Area aligned with horizontal layout */}
            <div className="relative flex-1 z-10 pt-2 min-h-[240px]">
              <textarea
                required
                disabled={isLoading}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t.placeholderText}
                maxLength={400}
                className="w-full bg-transparent border-none outline-none font-script text-[18px] md:text-[21px] leading-[40px] text-ink/90 placeholder-black/25 resize-none h-full focus:ring-0 selection:bg-[#3A2220]/10 select-text"
                rows={6}
                style={{ lineHeight: '40px' }}
              />
            </div>

            {/* Name Input/Signed Section at the bottom */}
            <div className="border-t border-black/5 pt-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] tracking-widest text-muted uppercase">{t.withLove}</span>
                <input
                  required
                  disabled={isLoading}
                  type="text"
                  placeholder={t.placeholderName}
                  className="bg-transparent border-b border-black/10 hover:border-black/20 focus:border-ink outline-none font-script text-[20px] text-ink py-1 px-2 w-48 transition-colors"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={40}
                />
              </div>

              {/* Submit Note Button with required 'Blur Glass' styled rule */}
              <button
                type="submit"
                disabled={isLoading || !noteText.trim() || !guestName.trim()}
                className={`py-3 px-8 font-mono text-[9px] tracking-[0.25em] uppercase rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none ${
                  isSubmitted
                    ? 'bg-forest text-[#FAF9F6] border border-forest/15 backdrop-blur-md'
                    : 'bg-white/40 border border-black/15 text-ink hover:bg-[#3A2220] hover:text-white hover:border-[#3A2220] backdrop-blur-md active:scale-95 ease-out'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <span>{t.saving}</span>
                ) : isSubmitted ? (
                  <>
                    <Check size={11} />
                    <span>{t.pinned}</span>
                  </>
                ) : (
                  <>
                    <Send size={11} className="transition-transform group-hover:translate-x-0.5" />
                    <span>{t.pinToBoard}</span>
                  </>
                )}
              </button>
            </div>

            {submitError && (
              <div className="text-red-500 font-sans normal-case text-[10px] text-center mt-4">
                {submitError}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Guestbook Live Board - Sticky Cards Grid */}
      <AnimatePresence>
        {notes.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
              <h4 className="font-serif text-xl uppercase tracking-wider text-[#3A2220]/80">{t.boardTitle}</h4>
              <p className="font-mono text-[8px] tracking-widest text-muted uppercase mt-1">{t.boardSubtitle}</p>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4"
            >
              <AnimatePresence mode="popLayout">
                {notes.map((note, index) => {
                  // Beautiful variations for authentic polaroid/note card layouts (rotation tags, tint variations)
                  const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', '-rotate-1.5', 'rotate-1.5'];
                  const rotation = rotations[index % rotations.length];
                  const tints = [
                    'bg-[#FCFBF7] border-black/5 shadow-sm',
                    'bg-[#FAF9F5] border-black/5 shadow-sm',
                    'bg-[#FDFCF9] border-black/5 shadow-sm',
                  ];
                  const tint = tints[index % tints.length];

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -15 }}
                      transition={{ duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-6 ${tint} ${rotation} border select-none transition-shadow`}
                    >
                      {/* Pushpin/Tape for decorative look */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2.5 bg-white/60 backdrop-blur-[1px] border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]" />
                      
                      <div className="space-y-4 text-left">
                        <p className="font-script text-[18px] text-[#3A2220] leading-relaxed break-words whitespace-pre-wrap">
                          "{note.noteText}"
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#3A2220]/5">
                          <span className="font-script text-[15px] text-ink font-medium">
                            — {note.guestName}
                          </span>
                          <Heart size={10} className="text-red-300 fill-red-200" />
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
    </div>
  );
};
