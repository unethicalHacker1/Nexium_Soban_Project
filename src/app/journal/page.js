'use client';

import { supabase } from '../../lib/supabase'; // adjust path if needed
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, NotebookPen } from 'lucide-react';

export default function JournalForm({}) {
  const [journalText, setJournalText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [message] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      toast.error('User not logged in', {
        description: error?.message || 'Please log in again.',
        position: 'top-center',
      });
      setLoading(false);
      return;
    }

    const user_id = user.id;

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        journalText,
        reflectionText,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success('Journal saved!', {
        description: 'Your thoughts are safely stored.',
        position: 'top-center',
      });
      setJournalText('');
      setReflectionText('');
    } else {
      toast.error('Something went wrong', {
        description: data.message || 'Please try again.',
        position: 'top-center',
      });
    }
  }


  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#fce7f3] px-4 py-12 animate-fade-in">
      {/* Background bubbles */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 animate-float-bg">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ minHeight: '100vh' }}>
          <circle cx="15%" cy="25%" r="110" fill="#a7f3d0" fillOpacity="0.16" />
          <circle cx="85%" cy="30%" r="90" fill="#c7d2fe" fillOpacity="0.13" />
          <circle cx="60%" cy="85%" r="100" fill="#fbcfe8" fillOpacity="0.12" />
        </svg>
      </div>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center gap-4 mb-10 relative z-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow">
          <NotebookPen className="w-8 h-8 text-[#6366f1]" />
        </span>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-[#6366f1] via-[#a7f3d0] to-[#fbcfe8] tracking-tight ml-2 drop-shadow animate-gradient-text">
          Daily Journal
        </h1>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-base text-center mb-6 max-w-2xl mx-auto leading-relaxed">
        <strong>Welcome to your private daily journal.</strong> Use this space to freely express your thoughts, experiences, and emotions from the day. Journaling helps reduce stress, build self-awareness, and uncover patterns in your mental wellness journey.
        <br /><br />
        <strong>Not sure where to start?</strong> Try reflecting on how you felt today, any challenges you faced, what you're grateful for, or what you learned.
        <br /><br />
        <strong>Your entries are securely stored</strong> and only visible to you. This is your personal space to grow.
      </p>



      {/* Form */}
      <div className="w-full max-w-2xl relative z-10">
        <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-slate-900/80 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-6 hover:shadow-2xl transition-all duration-300">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">
              Write your journal
            </label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[#a7f3d0]"
              placeholder="Write freely and gain clarity..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">
              Reflections (Optional)
            </label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
              placeholder="What did you learn or realize today?"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold px-4 py-3 rounded-full shadow hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Journal'}
          </button>

          {message && (
            <p className={`text-center mt-4 font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Animations */}
      <style jsx global>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1.2s ease-out forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradientMove 3.5s ease-in-out infinite alternate;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        .animate-float-bg {
          animation: floatBg 12s ease-in-out infinite alternate;
        }
        @keyframes floatBg {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-30px);
          }
        }
      `}</style>
    </div>
  );
}
