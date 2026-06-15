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
      nameLabel: 'Họ và Tên',
      requiredLabel: 'bắt buộc',
      namePlaceholder: 'HỌ VÀ TÊN CỦA BẠN',
      dietLabel: 'Bạn có yêu cầu đặc biệt nào về đồ ăn không?',
      dietPlaceholder: 'KHÔNG CÓ HOẶC GHI RÕ VD: ĂN CHAY, DỊ ỨNG HẢI SẢN...',
      noteLabel: 'Nhời nhắn gửi tới cô dâu chú rể',
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
            className="space-y-12"
          >
            {/* Attendance Toggle */}
            <div className="space-y-4">
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
                        ? 'bg-[#3A2220]/90 text-white border-ink/40 hover:bg-ink' 
                        : 'border-black/15 bg-white/30 text-ink/75 hover:bg-white/60 hover:border-black/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Name Field */}
            <div className="space-y-4">
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

            {/* Dietary Restrictions */}
            <div className="space-y-4">
              <p className="text-muted">{t.dietLabel}</p>
              <textarea
                rows={2}
                placeholder={t.dietPlaceholder}
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors resize-none"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              />
            </div>

            {/* Couple Note */}
            <div className="space-y-4">
              <p className="text-muted">{t.noteLabel}</p>
              <textarea
                rows={3}
                placeholder={t.notePlaceholder}
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors resize-none"
                value={formData.coupleNote}
                onChange={(e) => setFormData({ ...formData, coupleNote: e.target.value })}
              />
            </div>

            {submitError && (
              <div className="text-red-500 font-sans normal-case text-xs text-center border border-red-200/50 bg-red-50/50 p-3 rounded-md">
                {submitError}
              </div>
            )}

            <div className="pt-8 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-12 py-4 border uppercase tracking-[0.3em] font-medium transition-all duration-500 text-ink backdrop-blur-md ${
                  isLoading 
                    ? 'opacity-55 bg-black/5 border-black/10 cursor-not-allowed' 
                    : 'bg-white/40 border-black/15 hover:bg-[#3A2220] hover:text-white hover:border-[#3A2220] cursor-pointer shadow-md'
                }`}
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
