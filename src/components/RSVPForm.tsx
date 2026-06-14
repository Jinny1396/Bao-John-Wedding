import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const RSVPForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    attending: '',
    firstName: '',
    lastName: '',
    email: '',
    attendees: '',
    dietary: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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

            <div className="pt-8 text-center">
              <button
                type="submit"
                className="px-12 py-4 border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-500 uppercase tracking-[0.3em]"
              >
                Send RSVP
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
