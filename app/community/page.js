"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase";
import {
  collection, addDoc, getDocs, doc, getDoc,
  updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, orderBy, query, onSnapshot,
} from "firebase/firestore";
import {
  MessageSquare, Heart, Plus, Shield, Sparkles,
  Search, Smile, X, Send, ChevronDown, Loader2,
  Trophy, Flame, Star,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

// ─── Tag config ───────────────────────────────────────────────────────────────
const TAGS = ["All", "Wins", "Struggles", "Advice", "Question"];

const TAG_STYLE = {
  Wins:      "bg-emerald-50 text-emerald-600 border-emerald-100",
  Struggles: "bg-rose-50    text-rose-600    border-rose-100",
  Advice:    "bg-blue-50    text-blue-600    border-blue-100",
  Question:  "bg-amber-50   text-amber-600   border-amber-100",
};

const AVATAR_COLORS = [
  "bg-blue-100    text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100  text-purple-600",
  "bg-rose-100    text-rose-600",
  "bg-amber-100   text-amber-600",
  "bg-indigo-100  text-indigo-600",
];

function getAvatarColor(uid = "") {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-slate-100 rounded w-28" />
          <div className="h-2.5 bg-slate-100 rounded w-20" />
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded" />
      <div className="h-2.5 bg-slate-100 rounded w-3/4" />
      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

// ─── New post modal ───────────────────────────────────────────────────────────
function NewPostModal({ userData, onClose, onPosted }) {
  const [content, setContent] = useState("");
  const [tag,     setTag]     = useState("Wins");
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    if (!content.trim() || content.trim().length < 10) {
      toast.error("Write at least 10 characters.");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    setPosting(true);
    try {
      const daysSober = userData?.sobrietyDate
        ? Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000)
        : 0;

      await addDoc(collection(db, "communityPosts"), {
        uid:        user.uid,
        userName:   userData?.name ?? "Anonymous",
        tag,
        content:    content.trim(),
        likes:      [],
        supports:   [],
        daysSober,
        level:      userData?.level ?? 1,
        streak:     userData?.currentStreak ?? 0,
        createdAt:  serverTimestamp(),
      });

      toast.success("Post shared with the community! 🌟");
      onPosted();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-black text-slate-900">Share with the community</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Tag selector */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.filter(t => t !== "All").map(t => (
                <button key={t} onClick={() => setTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${
                    tag === t ? TAG_STYLE[t] + " scale-105 border" : "bg-slate-50 text-slate-400 border-slate-100"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <textarea
            rows={4}
            placeholder="Share your story, advice, or what's on your mind..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-none transition"
            autoFocus
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{content.length} chars</span>
            {content.length >= 10 && <span className="text-xs text-emerald-600 font-bold">✓ Ready to post</span>}
          </div>

          {/* Anonymous note */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-start gap-2">
            <Shield size={14} className="text-purple-500 shrink-0 mt-0.5" />
            <p className="text-xs text-purple-700 font-medium">
              Your post shows your first name and days sober. This is a safe, supportive space.
            </p>
          </div>

          <button onClick={submit} disabled={posting || content.trim().length < 10}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
            {posting ? <><Loader2 className="animate-spin" size={16} />Posting...</> : <><Send size={16} />Share Post</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single post card ─────────────────────────────────────────────────────────
function PostCard({ post, currentUid, onLike, onSupport }) {
  const avatarColor  = getAvatarColor(post.uid);
  const liked        = (post.likes    || []).includes(currentUid);
  const supported    = (post.supports || []).includes(currentUid);
  const firstName    = (post.userName ?? "?").split(" ")[0];
  const isOwn        = post.uid === currentUid;

  const timeAgo = (ts) => {
    if (!ts?.toDate) return "just now";
    const diff = (Date.now() - ts.toDate().getTime()) / 60000;
    if (diff < 1)   return "just now";
    if (diff < 60)  return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4"
    >
      {/* Author row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${avatarColor}`}>
            {firstName[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              {firstName}
              {isOwn && <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">You</span>}
              {post.level >= 5 && <Shield size={12} className="text-blue-500" fill="currentColor" />}
            </h3>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {post.daysSober > 0 && (
                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 flex items-center gap-0.5">
                  <Flame size={8} className="text-orange-400" />{post.daysSober}d sober
                </span>
              )}
              {post.level > 1 && (
                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 flex items-center gap-0.5">
                  <Star size={8} className="text-yellow-400" />L{post.level}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{timeAgo(post.createdAt)}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${TAG_STYLE[post.tag] ?? "bg-slate-50 text-slate-400 border-slate-100"}`}>
            {post.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
        {/* Like */}
        <button onClick={() => onLike(post.id, liked)}
          className={`flex items-center gap-1.5 text-xs font-black transition-all active:scale-90 ${liked ? "text-rose-500" : "text-slate-400"}`}>
          <div className={`p-1.5 rounded-xl transition-colors ${liked ? "bg-rose-50" : "bg-slate-50"}`}>
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
          </div>
          {(post.likes || []).length}
        </button>

        {/* Support */}
        <button onClick={() => onSupport(post.id, supported)}
          className={`flex items-center gap-1.5 text-xs font-black transition-all active:scale-90 ${supported ? "text-amber-500" : "text-slate-400"}`}>
          <div className={`p-1.5 rounded-xl transition-colors ${supported ? "bg-amber-50" : "bg-slate-50"}`}>
            <Smile size={15} fill={supported ? "currentColor" : "none"} />
          </div>
          {(post.supports || []).length > 0 ? `${(post.supports || []).length} supporting` : "Support"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const [userData,   setUserData]   = useState(null);
  const [currentUid, setCurrentUid] = useState(null);
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("All");
  const [search,     setSearch]     = useState("");
  const [showNew,    setShowNew]    = useState(false);

  // ── Auth + user data ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { setLoading(false); return; }
      setCurrentUid(user.uid);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (err) { console.error(err); }
    });
    return () => unsub();
  }, []);

  // ── Real-time posts listener ──────────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "communityPosts"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error("Posts listener error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Like / unlike ─────────────────────────────────────────────────────────
  const handleLike = async (postId, alreadyLiked) => {
    if (!currentUid) return;
    const ref = doc(db, "communityPosts", postId);
    try {
      await updateDoc(ref, {
        likes: alreadyLiked ? arrayRemove(currentUid) : arrayUnion(currentUid),
      });
    } catch (err) { console.error(err); }
  };

  // ── Support / unsupport ───────────────────────────────────────────────────
  const handleSupport = async (postId, alreadySupported) => {
    if (!currentUid) return;
    const ref = doc(db, "communityPosts", postId);
    try {
      await updateDoc(ref, {
        supports: alreadySupported ? arrayRemove(currentUid) : arrayUnion(currentUid),
      });
    } catch (err) { console.error(err); }
  };

  // ── Filter + search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchTab    = activeTab === "All" || p.tag === activeTab;
      const matchSearch = !search.trim() || p.content.toLowerCase().includes(search.toLowerCase()) || p.userName?.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [posts, activeTab, search]);

  const totalOnline = Math.max(posts.length, 1) * 3 + 12; // fun approximation

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto pb-28">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900">Safe <span className="text-purple-600">Space</span></h1>
            <p className="text-slate-400 text-xs font-semibold">Anonymous · Supportive · Real</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{posts.length} Posts</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            placeholder="Search stories & advice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {TAGS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ── Feed ── */}
      <div className="flex-1 px-5 py-4 space-y-3">
        {loading ? (
          <>
            <PostSkeleton /><PostSkeleton /><PostSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-black text-slate-700 text-lg mb-1">
              {search ? "No results found" : "No posts yet"}
            </p>
            <p className="text-slate-400 text-sm mb-6">
              {search ? "Try a different search term." : "Be the first to share your story!"}
            </p>
            {!search && (
              <button onClick={() => setShowNew(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg shadow-purple-200">
                Share Your Story
              </button>
            )}
          </div>
        ) : (
          filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUid={currentUid}
              onLike={handleLike}
              onSupport={handleSupport}
            />
          ))
        )}

      
      </div>

      {/* ── Floating post button ── */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setShowNew(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-purple-600 text-white rounded-2xl shadow-2xl shadow-purple-300 flex items-center justify-center z-40"
      >
        <Plus size={26} />
      </motion.button>

      {/* ── New post modal ── */}
      <AnimatePresence>
        {showNew && (
          <NewPostModal
            userData={userData}
            onClose={() => setShowNew(false)}
            onPosted={() => {}}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}