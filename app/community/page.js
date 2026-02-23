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
  Search, Smile, X, Send, Loader2,
  Flame, Star,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  gold:       "#c8a060",
  goldLight:  "#f7e0bb",
  muted:      "#a07848",
  text:       "#3d2410",
  parchment:  "linear-gradient(180deg, #f5e8c8 0%, #ede0b4 100%)",
  cardBg:     "linear-gradient(135deg, rgba(90,52,24,0.72) 0%, rgba(58,32,16,0.82) 100%)",
  cardBorder: "rgba(200,160,74,0.28)",
  pageBg:     "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
  questBtn:   "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
  questShadow:"0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
  woodLight:  "linear-gradient(180deg, #d4b483 0%, #b8955c 50%, #a07840 100%)",
  btnBorder:  "#8a6030",
  btnShadow:  "0 3px 0 #6a4820, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,230,160,0.4)",
};

// ─── Tag config ───────────────────────────────────────────────────────────────
const TAGS = ["All", "Wins", "Struggles", "Advice", "Question"];

const TAG_CONFIG = {
  Wins:      { color: "#7aab6a", bg: "rgba(122,171,106,0.15)", border: "rgba(122,171,106,0.35)", glyph: "⚔️" },
  Struggles: { color: "#c08060", bg: "rgba(192,128,96,0.15)",  border: "rgba(192,128,96,0.35)",  glyph: "🌊" },
  Advice:    { color: "#6ab4d8", bg: "rgba(106,180,216,0.15)", border: "rgba(106,180,216,0.35)", glyph: "📜" },
  Question:  { color: "#c8a060", bg: "rgba(200,160,96,0.15)",  border: "rgba(200,160,96,0.35)",  glyph: "🔮" },
};

const AVATAR_RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚺ", "ᚾ", "ᛁ"];
const AVATAR_COLORS = [
  { bg: "rgba(106,180,216,0.2)", border: "rgba(106,180,216,0.4)", text: "#6ab4d8" },
  { bg: "rgba(122,171,106,0.2)", border: "rgba(122,171,106,0.4)", text: "#7aab6a" },
  { bg: "rgba(154,120,192,0.2)", border: "rgba(154,120,192,0.4)", text: "#9a78c0" },
  { bg: "rgba(192,128,96,0.2)",  border: "rgba(192,128,96,0.4)",  text: "#c08060" },
  { bg: "rgba(200,160,74,0.2)",  border: "rgba(200,160,74,0.4)",  text: "#c8a060" },
];

function getAvatar(uid = "") {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return { color: AVATAR_COLORS[idx], rune: AVATAR_RUNES[Math.abs(hash >> 3) % AVATAR_RUNES.length] };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: 20, animation: "shimmer 1.6s ease-in-out infinite alternate" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.15)" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 10, width: 100, borderRadius: 6, background: "rgba(200,160,74,0.1)" }} />
          <div style={{ height: 8, width: 70, borderRadius: 6, background: "rgba(200,160,74,0.08)" }} />
        </div>
      </div>
      {[100, 80, 60].map((w, i) => (
        <div key={i} style={{ height: 8, width: `${w}%`, borderRadius: 6, background: "rgba(200,160,74,0.08)", marginBottom: 8 }} />
      ))}
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
        ? Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000) : 0;
      await addDoc(collection(db, "communityPosts"), {
        uid: user.uid, userName: userData?.name ?? "Anonymous", tag,
        content: content.trim(), likes: [], supports: [], daysSober,
        level: userData?.level ?? 1, streak: userData?.currentStreak ?? 0,
        createdAt: serverTimestamp(),
      });
      toast.success("Scroll shared with the fellowship! 📜");
      onPosted(); onClose();
    } catch (err) {
      console.error(err); toast.error("Couldn't post. Try again.");
    } finally { setPosting(false); }
  };

  const tagCfg = TAG_CONFIG[tag];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%", maxWidth: 520,
          background: "linear-gradient(180deg, #3d2210 0%, #2d1a0c 100%)",
          border: "2px solid rgba(200,160,74,0.35)",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,130,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(200,160,74,0.3)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px", borderBottom: "1px solid rgba(200,160,74,0.15)" }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.05rem" }}>Share with the Fellowship</h2>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.7rem", fontStyle: "italic", marginTop: 2 }}>ᚠ ᚢ ᚦ — your words have power</p>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(200,160,74,0.12)", border: "1px solid rgba(200,160,74,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.gold }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Tag selector */}
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Scroll Type</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TAGS.filter(t => t !== "All").map(t => {
                const cfg = TAG_CONFIG[t];
                const active = tag === t;
                return (
                  <button key={t} onClick={() => setTag(t)}
                    className="transition-all active:scale-95"
                    style={{
                      padding: "6px 14px", borderRadius: 99,
                      fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                      background: active ? cfg.bg : "rgba(200,160,74,0.07)",
                      border: `1.5px solid ${active ? cfg.border : "rgba(200,160,74,0.18)"}`,
                      color: active ? cfg.color : T.muted,
                      transform: active ? "scale(1.05)" : "scale(1)",
                    }}>
                    {cfg.glyph} {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea — parchment */}
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Your Words</p>
            <textarea
              rows={4} autoFocus
              placeholder="Share your story, advice, or what's on your mind..."
              value={content} onChange={e => setContent(e.target.value)}
              style={{
                width: "100%", background: T.parchment,
                border: `2px solid ${content.length >= 10 ? "#7aab6a" : "#b8954a"}`,
                borderRadius: 10, padding: "12px 14px",
                fontSize: "0.85rem", color: T.text, fontFamily: "Georgia, serif",
                outline: "none", resize: "none", boxSizing: "border-box",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = content.length >= 10 ? "#7aab6a" : "#e8a030")}
              onBlur={e => (e.target.style.borderColor = content.length >= 10 ? "#7aab6a" : "#b8954a")}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted }}>{content.length} runes</span>
              {content.length >= 10 && <span style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: "#7aab6a" }}>✓ Ready to share</span>}
            </div>
          </div>

          {/* Safe space note — parchment */}
          <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
            <Shield size={13} style={{ color: "#b8954a", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.text, lineHeight: 1.6 }}>
              Your post shows your first name and days sober. This is a safe, supportive space — your story matters.
            </p>
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={posting || content.trim().length < 10}
            className="transition-all active:scale-[0.97]"
            style={{
              background: posting || content.trim().length < 10 ? "rgba(200,160,74,0.1)" : T.questBtn,
              border: posting || content.trim().length < 10 ? "1.5px solid rgba(200,160,74,0.2)" : "2px solid #1478b0",
              borderRadius: 24, padding: "13px 20px",
              boxShadow: posting || content.trim().length < 10 ? "none" : T.questShadow,
              color: posting || content.trim().length < 10 ? T.muted : "#fff",
              fontWeight: 900, fontFamily: "Georgia, serif",
              fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: posting || content.trim().length < 10 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}>
            {posting
              ? <><Loader2 className="animate-spin" size={15} />Inscribing...</>
              : <><Send size={14} />Share Scroll</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single post card ─────────────────────────────────────────────────────────
function PostCard({ post, currentUid, onLike, onSupport }) {
  const { color: avatarColor, rune } = getAvatar(post.uid);
  const tagCfg   = TAG_CONFIG[post.tag] ?? TAG_CONFIG.Advice;
  const liked    = (post.likes    || []).includes(currentUid);
  const supported= (post.supports || []).includes(currentUid);
  const firstName= (post.userName ?? "?").split(" ")[0];
  const isOwn    = post.uid === currentUid;
  const [hover,  setHover] = useState(false);

  const timeAgo = (ts) => {
    if (!ts?.toDate) return "just now";
    const diff = (Date.now() - ts.toDate().getTime()) / 60000;
    if (diff < 1)    return "just now";
    if (diff < 60)   return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover
          ? "linear-gradient(135deg, rgba(110,64,28,0.8) 0%, rgba(72,40,20,0.88) 100%)"
          : T.cardBg,
        border: `1.5px solid ${T.cardBorder}`,
        borderRadius: 18, padding: 18,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,220,130,0.05)",
        transition: "background 0.2s",
      }}
    >
      {/* Author row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Rune avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: avatarColor.bg, border: `1.5px solid ${avatarColor.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "serif", fontSize: "1.1rem", color: avatarColor.text,
            boxShadow: "inset 0 1px 0 rgba(255,220,130,0.1)",
          }}>{rune}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>{firstName}</span>
              {isOwn && (
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", background: "rgba(154,120,192,0.2)", border: "1px solid rgba(154,120,192,0.35)", color: "#9a78c0", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>You</span>
              )}
              {post.level >= 5 && <Shield size={11} style={{ color: "#6ab4d8" }} fill="#6ab4d8" />}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {post.daysSober > 0 && (
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, background: "rgba(200,160,74,0.1)", border: "1px solid rgba(200,160,74,0.2)", padding: "1px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                  🔥 {post.daysSober}d sober
                </span>
              )}
              {post.level > 1 && (
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, background: "rgba(200,160,74,0.1)", border: "1px solid rgba(200,160,74,0.2)", padding: "1px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                  ⭐ L{post.level}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, letterSpacing: "0.05em" }}>{timeAgo(post.createdAt)}</span>
          <span style={{
            fontFamily: "Georgia, serif", fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 99,
            background: tagCfg.bg, border: `1px solid ${tagCfg.border}`, color: tagCfg.color,
          }}>
            {tagCfg.glyph} {post.tag}
          </span>
        </div>
      </div>

      {/* Content — parchment-ish text */}
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.84rem", color: T.goldLight, lineHeight: 1.7, marginBottom: 14, opacity: 0.9 }}>
        {post.content}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(200,160,74,0.12)" }}>
        {/* Like */}
        <button onClick={() => onLike(post.id, liked)}
          className="transition-all active:scale-90"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            background: liked ? "rgba(192,128,96,0.2)" : "rgba(200,160,74,0.08)",
            border: `1.5px solid ${liked ? "rgba(192,128,96,0.4)" : "rgba(200,160,74,0.18)"}`,
            transition: "all 0.2s",
          }}>
            <Heart size={14} fill={liked ? "#c08060" : "none"} style={{ color: liked ? "#c08060" : T.muted }} />
          </div>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", fontWeight: 900, color: liked ? "#c08060" : T.muted }}>
            {(post.likes || []).length}
          </span>
        </button>

        {/* Support */}
        <button onClick={() => onSupport(post.id, supported)}
          className="transition-all active:scale-90"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            background: supported ? "rgba(200,160,74,0.2)" : "rgba(200,160,74,0.08)",
            border: `1.5px solid ${supported ? "rgba(200,160,74,0.45)" : "rgba(200,160,74,0.18)"}`,
            transition: "all 0.2s",
          }}>
            <Smile size={14} fill={supported ? "#c8a060" : "none"} style={{ color: supported ? "#c8a060" : T.muted }} />
          </div>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", fontWeight: 900, color: supported ? T.gold : T.muted }}>
            {(post.supports || []).length > 0 ? `${(post.supports || []).length} backing` : "Back"}
          </span>
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

  useEffect(() => {
    const q = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => { console.error("Posts listener error:", err); setLoading(false); });
    return () => unsub();
  }, []);

  const handleLike = async (postId, alreadyLiked) => {
    if (!currentUid) return;
    try { await updateDoc(doc(db, "communityPosts", postId), { likes: alreadyLiked ? arrayRemove(currentUid) : arrayUnion(currentUid) }); }
    catch (err) { console.error(err); }
  };

  const handleSupport = async (postId, alreadySupported) => {
    if (!currentUid) return;
    try { await updateDoc(doc(db, "communityPosts", postId), { supports: alreadySupported ? arrayRemove(currentUid) : arrayUnion(currentUid) }); }
    catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => posts.filter(p => {
    const matchTab    = activeTab === "All" || p.tag === activeTab;
    const matchSearch = !search.trim() || p.content.toLowerCase().includes(search.toLowerCase()) || p.userName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }), [posts, activeTab, search]);

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", paddingBottom: 112 }}>
      <Toaster position="top-center" richColors />
      <style>{`
        @keyframes shimmer{from{opacity:.4}to{opacity:.8}}
        @keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}
      `}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        {[{l:"6%",t:"12%"},{l:"88%",t:"18%"},{l:"15%",t:"78%"},{l:"82%",t:"70%"}].map((p,i)=>(
          <div key={i} className="absolute rounded-full"
            style={{ left:p.l, top:p.t, width:5, height:5, background:i%2===0?"rgba(255,230,140,0.7)":"rgba(180,240,200,0.6)",
              animation:`pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${i*0.35}s` }} />
        ))}
      </div>

      {/* ── Header ── */}
      <header className="relative z-20" style={{ position: "sticky", top: 0, background: "linear-gradient(180deg, rgba(45,26,12,0.97), rgba(45,26,12,0.93))", borderBottom: "1px solid rgba(200,160,74,0.18)", backdropFilter: "blur(12px)", padding: "24px 20px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.3rem", lineHeight: 1.2 }}>
              Safe <span style={{ color: "#9a78c0" }}>Space</span>
            </h1>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.7rem", fontStyle: "italic", marginTop: 2 }}>Anonymous · Supportive · Real</p>
            <p style={{ color: "rgba(200,160,74,0.25)", fontSize: "0.62rem", letterSpacing: "0.2em", fontFamily: "serif", marginTop: 3 }}>ᚠ ᚢ ᚦ ᚨ ᚱ</p>
          </div>
          {/* Posts count badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(122,171,106,0.15)", border: "1.5px solid rgba(122,171,106,0.3)", borderRadius: 99, padding: "5px 12px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7aab6a", animation: "pulse 2s ease-in-out infinite alternate" }} />
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#7aab6a", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {posts.length} Scrolls
            </span>
          </div>
        </div>

        {/* Search — parchment style */}
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
          <input
            type="text"
            placeholder="Search scrolls & stories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", background: "rgba(200,160,74,0.07)",
              border: "1.5px solid rgba(200,160,74,0.22)",
              borderRadius: 12, padding: "10px 36px",
              fontSize: "0.82rem", fontFamily: "Georgia, serif", color: T.goldLight,
              outline: "none", boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(200,160,74,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(200,160,74,0.22)")}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {TAGS.map(tab => {
            const active = activeTab === tab;
            const cfg = tab !== "All" ? TAG_CONFIG[tab] : null;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="transition-all active:scale-95"
                style={{
                  whiteSpace: "nowrap", padding: "7px 14px", borderRadius: 99, flexShrink: 0,
                  fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "0.72rem",
                  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                  background: active ? (cfg ? cfg.bg : "rgba(200,160,74,0.18)") : "rgba(200,160,74,0.07)",
                  border: `1.5px solid ${active ? (cfg ? cfg.border : "rgba(200,160,74,0.4)") : "rgba(200,160,74,0.15)"}`,
                  color: active ? (cfg ? cfg.color : T.gold) : T.muted,
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                }}>
                {cfg ? `${cfg.glyph} ` : ""}{tab}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Feed ── */}
      <div className="relative z-10" style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>📜</div>
            <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.1rem", marginBottom: 6 }}>
              {search ? "No scrolls found" : "The fellowship awaits"}
            </p>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.8rem", fontStyle: "italic", marginBottom: 18 }}>
              {search ? "Try a different search, Seeker." : "Be the first to share your story!"}
            </p>
            {!search && (
              <button onClick={() => setShowNew(true)}
                className="transition-all active:scale-[0.97]"
                style={{ background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "12px 24px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                Share Your Story
              </button>
            )}
          </div>
        ) : (
          filtered.map(post => (
            <PostCard key={post.id} post={post} currentUid={currentUid} onLike={handleLike} onSupport={handleSupport} />
          ))
        )}
      </div>

      {/* ── Floating compose button ── */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowNew(true)}
        className="transition-all"
        style={{
          position: "fixed", bottom: 96, right: 20,
          width: 54, height: 54, borderRadius: 16, zIndex: 40,
          background: "linear-gradient(135deg, #d4b483, #8a6030)",
          border: "2px solid #b8954a",
          boxShadow: T.btnShadow,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
        <Plus size={24} style={{ color: T.text }} />
      </motion.button>

      {/* ── New post modal ── */}
      <AnimatePresence>
        {showNew && (
          <NewPostModal userData={userData} onClose={() => setShowNew(false)} onPosted={() => {}} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}