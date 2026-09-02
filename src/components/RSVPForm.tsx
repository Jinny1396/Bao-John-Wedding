import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface RSVPFormProps {
  lang?: 'VIE' | 'ENG';
}

export const RSVPForm = ({ lang = 'VIE' }: RSVPFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    guestName: '',
    attendingStatus: '',
    guestSide: 'bride',
    bringingGuest: '0',
    dietaryRestrictions: '',
    coupleNote: '',
  });

  const translations = {
    ENG: {
      alertStatus: 'Please let us know if you are able to join us.',
      alertName: 'Please provide your name.',
      errorPrefix: 'Unable to send RSVP:',
      promptStatus: 'Are you able to join us?',
      yesLabel: 'Accept with pleasure',
      noLabel: 'Decline with regret',
      sideLabel: "Whose guest are you?",
      brideSideLabel: "Bride's Side",
      groomSideLabel: "Groom's Side",
      bothSideLabel: "Both / Mutual",
      bringingGuestLabel: 'Bringing a guest?',
      guestOption0: 'No (Just me — 1 person)',
      guestOption1: 'Yes, bringing 1 guest (+1)',
      guestOption2: 'Yes, bringing 2 guests (+2)',
      guestOption3: 'Yes, bringing 3 guests (+3)',
      nameLabel: 'Guest Name',
      requiredLabel: 'required',
      namePlaceholder: 'YOUR FULL NAME',
      dietLabel: 'Do you have any dietary restrictions?',
      dietPlaceholder: 'NONE OR SPECIFY E.G., GLUTEN-FREE, VEGAN',
      noteLabel: 'Leave a note for the couple',
      notePlaceholder: 'CONGRATULATORY MESSAGE OR NOTE',
      btnSending: 'Sending...',
      btnSend: 'Send RSVP',
      thankYou: 'Thank You',
      successMsg: 'Your response has been received. We look forward to celebrating with you soon.',
    },
    VIE: {
      alertStatus: 'Vui lòng cho chúng mình biết bạn có thể tham dự không nhé.',
      alertName: 'Vui lòng điền họ tên của bạn.',
      errorPrefix: 'Không thể gửi phản hồi:',
      promptStatus: 'Bạn sẽ đến chung vui cùng chúng mình chứ?',
      yesLabel: 'Đồng ý tham dự',
      noLabel: 'Tiếc không thể đến',
      sideLabel: 'Bạn là khách của bên nào?',
      brideSideLabel: 'Nhà Gái',
      groomSideLabel: 'Nhà Trai',
      bothSideLabel: 'Cả Hai Nhà',
      bringingGuestLabel: 'Bạn có đi cùng người đi kèm (khách) không?',
      guestOption0: 'Không (Chỉ mình tôi — 1 người)',
      guestOption1: 'Có, đi cùng 1 người (+1)',
      guestOption2: 'Có, đi cùng 2 người (+2)',
      guestOption3: 'Có, đi cùng 3 người (+3)',
      nameLabel: 'Họ và Tên',
      requiredLabel: 'bắt buộc',
      namePlaceholder: 'HỌ VÀ TÊN CỦA BẠN',
      dietLabel: 'Bạn có yêu cầu đặc biệt nào về đồ ăn không?',
      dietPlaceholder: 'KHÔNG CÓ HOẶC GHI RÕ VD: ĂN CHAY, DỊ ỨNG HẢI SẢN...',
      noteLabel: 'Lời nhắn gửi tới cô dâu chú rể',
      notePlaceholder: 'LỜI CHÚC MỪNG HOẶC TIN NHẮN THÂN THƯƠNG',
      btnSending: 'Đang gửi...',
      btnSend: 'Gửi Phản Hồi',
      thankYou: 'Xin Cảm Ơn',
      successMsg: 'Phản hồi của bạn đã được ghi lại. Rất mong được đón tiếp bạn tại ngày trọng đại.',
    }
  };

  const t = translations[lang];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.attendingStatus) {
      setSubmitError(t.alertStatus);
      return;
    }
    if (!formData.guestName.trim()) {
      setSubmitError(t.alertName);
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    const rsvpData = {
      guestName: formData.guestName.trim(),
      attendingStatus: formData.attendingStatus,
      guestSide: formData.guestSide || 'bride',
      bringingGuest: formData.bringingGuest || '0',
      dietaryRestrictions: formData.dietaryRestrictions.trim(),
      coupleNote: formData.coupleNote.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'rsvps'), rsvpData);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error saving RSVP to Firestore:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setSubmitError(`${t.errorPrefix} ${errMsg}`);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'rsvps');
      } catch (formattedError) {
        // Log handled error format
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full text-left font-mono text-[10px] tracking-widest uppercase">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Attendance Toggle */}
            <div className="space-y-2">
              <p className="text-muted">{t.promptStatus}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'yes', label: t.yesLabel },
                  { id: 'no', label: t.noLabel }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, attendingStatus: option.id })}
                    className={`px-6 py-2 border rounded-full transition-all backdrop-blur-md shadow-sm ${
                      formData.attendingStatus === option.id 
                        ? 'bg-[#362223]/90 text-white border-ink/40 hover:bg-ink' 
                        : 'border-black/15 bg-white/30 text-ink/75 hover:bg-white/60 hover:border-black/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Side Selection (Bride's Side / Groom's Side) */}
            <div className="space-y-2">
              <p className="text-muted">{t.sideLabel}</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'bride', label: t.brideSideLabel },
                  { id: 'groom', label: t.groomSideLabel },
                  { id: 'both', label: t.bothSideLabel }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, guestSide: option.id })}
                    className={`px-5 py-2 border rounded-full transition-all backdrop-blur-md shadow-sm text-[9.5px] ${
                      formData.guestSide === option.id 
                        ? 'bg-[#362223]/90 text-white border-ink/40 hover:bg-ink font-semibold' 
                        : 'border-black/15 bg-white/30 text-ink/75 hover:bg-white/60 hover:border-black/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Name Field */}
            <div className="space-y-2">
              <p className="text-muted">{t.nameLabel} <span className="lowercase opacity-50">({t.requiredLabel})</span></p>
              <input
                required
                type="text"
                placeholder={t.namePlaceholder}
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              />
            </div>

            {/* Bringing a guest? Dropdown */}
            <div className="space-y-2">
              <p className="text-muted">{t.bringingGuestLabel}</p>
              <div className="relative">
                <select
                  value={formData.bringingGuest}
                  onChange={(e) => setFormData({ ...formData, bringingGuest: e.target.value })}
                  className="w-full bg-transparent border-b border-black/10 py-2.5 focus:border-ink outline-none transition-colors appearance-none cursor-pointer pr-8 font-mono text-[10px] tracking-widest uppercase text-[#362223]"
                >
                  <option value="0" className="bg-[#fcfaf7] text-[#362223]">{t.guestOption0}</option>
                  <option value="1" className="bg-[#fcfaf7] text-[#362223]">{t.guestOption1}</option>
                  <option value="2" className="bg-[#fcfaf7] text-[#362223]">{t.guestOption2}</option>
                  <option value="3" className="bg-[#fcfaf7] text-[#362223]">{t.guestOption3}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-neutral-500">
                  <svg className="w-3.5 h-3.5 fill-current opacity-70" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-2">
              <p className="text-muted">{t.dietLabel}</p>
              <textarea
                rows={2}
                placeholder={t.dietPlaceholder}
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors resize-none"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              />
            </div>

            {submitError && (
              <div className="text-red-500 font-sans normal-case text-xs text-center border border-red-200/50 bg-red-50/50 p-3 rounded-md">
                {submitError}
              </div>
            )}

            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 sm:px-8 py-2 sm:py-2.5 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md border hover:border-black/25 text-[#362223] font-serif italic active:scale-95 transition-all select-none cursor-pointer duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
                  isLoading 
                    ? 'opacity-55 cursor-not-allowed border-black/10' 
                    : 'border-black/10'
                }`}
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              >
                {isLoading ? t.btnSending : t.btnSend}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 py-12"
          >
            <h2 className="font-script text-6xl normal-case tracking-normal">{t.thankYou}</h2>
            <p className="max-w-xs mx-auto leading-relaxed text-muted">
              {t.successMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
