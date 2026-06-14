import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const RSVPForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    attending: '',
    firstName: '',
    lastName: '',
    email: '',
    attendees: '',
    dietary: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.attending) {
      setSubmitError('Please let us know if you are able to join us.');
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    const rsvpData = {
      attending: formData.attending,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      attendees: parseInt(formData.attendees, 10) || 1,
      dietary: formData.dietary.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'rsvps'), rsvpData);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error saving RSVP to Firestore:', err);
      setSubmitError('Unable to send RSVP. Please try again.');
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
              <p className="text-muted">Are you able to join us?</p>
              <div className="flex gap-4">
                {[
                  { id: 'yes', label: 'Accept with pleasure' },
                  { id: 'no', label: 'Decline with regret' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, attending: option.id })}
                    className={`px-6 py-2 border rounded-full transition-all ${
                      formData.attending === option.id 
                        ? 'bg-ink text-white border-ink' 
                        : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="space-y-4">
              <p className="text-muted">Name <span className="lowercase opacity-50">(required)</span></p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <input
                    required
                    type="text"
                    className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <p className="text-[8px] opacity-40">First Name</p>
                </div>
                <div className="space-y-2">
                  <input
                    required
                    type="text"
                    className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                  <p className="text-[8px] opacity-40">Last Name</p>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-4">
              <p className="text-muted">Email <span className="lowercase opacity-50">(required)</span></p>
              <input
                required
                type="email"
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Attendees Field */}
            <div className="space-y-4">
              <p className="text-muted">Number of attendees <span className="lowercase opacity-50">(required)</span></p>
              <input
                required
                type="number"
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              />
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-4">
              <p className="text-muted">Do you have any dietary restrictions?</p>
              <textarea
                rows={2}
                className="w-full bg-transparent border-b border-black/10 py-2 focus:border-ink outline-none transition-colors resize-none"
                value={formData.dietary}
                onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
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
                className={`px-12 py-4 border border-ink text-ink transition-all duration-500 uppercase tracking-[0.3em] ${
                  isLoading 
                    ? 'opacity-55 cursor-not-allowed' 
                    : 'hover:bg-ink hover:text-white cursor-pointer'
                }`}
              >
                {isLoading ? 'Sending...' : 'Send RSVP'}
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
            <h2 className="font-script text-6xl normal-case tracking-normal">Thank You</h2>
            <p className="max-w-xs mx-auto leading-relaxed text-muted">
              Your response has been received. We look forward to celebrating with you soon.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
