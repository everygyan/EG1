import React, { useState } from 'react';
import { X, Mail, CheckCircle, Bell } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        <div className="relative bg-gradient-to-br from-[#0e1628] to-[#1e293b] text-white p-6 pb-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="font-serif-display font-bold text-2xl">Stay Informed with EveryGyan</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-xs mx-auto">
            Get curated editorial briefings, breaking tech analysis, and cultural essays delivered straight to your inbox.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800">You're on the list!</h3>
            <p className="text-xs text-slate-500">
              We've dispatched a welcome verification note to <span className="font-semibold text-slate-700">{email}</span>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-slate-900 text-white text-xs font-bold px-6 py-2 rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Newsletter Frequency
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`py-2 rounded-xl font-medium border text-center transition ${
                    frequency === 'daily'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Daily Morning Digest
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`py-2 rounded-xl font-medium border text-center transition ${
                    frequency === 'weekly'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Weekly Deep-Dive
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              Subscribe for Free
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Zero spam. Unsubscribe at any time with one click.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
