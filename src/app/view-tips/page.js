"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from 'sonner';

export default function ViewTipsPage() {
  const [user, setUser] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenLoading, setRegenLoading] = useState({}); // { [id]: boolean }
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
        await fetchTips(data.user.id);
      } else {
        router.push("/login");
      }
    };
    checkUser();
  }, []);

  const fetchTips = async (userId) => {
    setLoading(true);
    const { data: moods, error } = await supabase
      .from("mood_checkins")
      .select("mood, wellness_tip, created_at, id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setTips(moods);
    setLoading(false);
  };

  const regenerateTip = async (id, mood) => {
    setRegenLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mood }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setTips((prev) => prev.map(t => t.id === id ? { ...t, wellness_tip: result.data.wellness_tip } : t));
      toast.success('Wellness tip regenerated!');
    } catch (err) {
      toast.error('Failed to regenerate tip.');
    } finally {
      setRegenLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#fce7f3] px-4 py-12 animate-fade-in">
      {/* Soft floating background pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 animate-float-bg">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ minHeight: '100vh' }}>
          <circle cx="18%" cy="22%" r="110" fill="#a7f3d0" fillOpacity="0.16" />
          <circle cx="82%" cy="28%" r="80" fill="#c7d2fe" fillOpacity="0.13" />
          <circle cx="60%" cy="80%" r="100" fill="#fbcfe8" fillOpacity="0.12" />
        </svg>
      </div>
      <div className="w-full max-w-2xl flex items-center gap-4 mb-10 relative z-10">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow">
          <Sparkles className="w-8 h-8 text-[#6366f1]" />
        </span>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-[#6366f1] via-[#a7f3d0] to-[#fbcfe8] tracking-tight ml-2 drop-shadow animate-gradient-text">Your Wellness Tips</h1>
      </div>
      <div className="w-full max-w-2xl relative z-10">
        {loading ? (
          <div className="text-slate-500 text-center py-12">Loading tips...</div>
        ) : tips.length === 0 ? (
          <div className="text-slate-400 text-center py-12">No tips found yet. Check in your mood to get started!</div>
        ) : (
          <ul className="space-y-8">
            {tips.map((entry, idx) => (
              <li key={idx} className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-7 flex flex-col gap-3 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl" style={{ filter: 'drop-shadow(0 1px 2px #a7f3d0)' }}>{getMoodEmoji(entry.mood)}</span>
                  <span className="text-xl font-bold text-slate-700 dark:text-white capitalize tracking-wide">
                    {capitalize(entry.mood)}
                  </span>
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                {entry.wellness_tip && (
                  <div className="bg-gradient-to-tr from-[#f0fdfa]/60 via-[#a7f3d0]/20 to-[#fbcfe8]/30 dark:from-slate-800/60 dark:via-[#6366f1]/10 dark:to-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner flex flex-col gap-2">
                    <span className="block text-lg font-semibold text-[#6366f1] mb-1 group-hover:underline transition-all">Wellness Tip</span>
                    <span className="text-base text-slate-600 dark:text-slate-200 whitespace-pre-line leading-relaxed">{entry.wellness_tip}</span>
                    <button
                      className="mt-2 self-end flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => regenerateTip(entry.id, entry.mood)}
                      disabled={regenLoading[entry.id]}
                    >
                      <RefreshCw className={regenLoading[entry.id] ? 'animate-spin' : ''} size={16} />
                      {regenLoading[entry.id] ? 'Regenerating...' : 'Regenerate Tip'}
                    </button>
                  </div>
                )}
                {idx < tips.length - 1 && (
                  <div className="w-full h-px bg-gradient-to-r from-[#a7f3d0]/30 via-[#c7d2fe]/30 to-[#fbcfe8]/30 my-4" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <style jsx global>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1) forwards;
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
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-float-bg {
          animation: floatBg 12s ease-in-out infinite alternate;
        }
        @keyframes floatBg {
          0% { transform: translateY(0); }
          100% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
}

function getMoodEmoji(mood) {
  switch ((mood || "").toLowerCase().trim()) {
    case "happy": return "😊";
    case "sad": return "😢";
    case "anxious": return "😰";
    case "angry": return "😡";
    case "calm": return "😌";
    case "neutral": return "😐";
    default: return "🤔";
  }
}
function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
