import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/reels.css";
import LogoutButton from "../../component/LogoutButton";

export default function Saved() {
  const navigate = useNavigate();

  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRefs = useRef([]);

  // ---- initial load: saved only ----
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/food/saved", {
          withCredentials: true,
        });
        const list = (res?.data?.savedItems ?? []).map((v) => ({
          likeCount: v.likeCount ?? 0,
          saveCount: v.saveCount ?? 0,
          isLiked: v.isLiked ?? false,
          isSaved: true,
          ...v,
        }));
        if (isMounted) setSavedVideos(list);
      } catch (e) {
        if (isMounted) setError("Failed to load saved items");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // ---- simple autoplay for most visible ----
  useEffect(() => {
    if (!savedVideos.length) return;
    videoRefs.current = videoRefs.current.slice(0, savedVideos.length);

    const observer = new IntersectionObserver(
      (entries) => {
        // pause all
        for (const el of videoRefs.current) if (el && !el.paused) el.pause();
        // play most visible
        let top = null;
        for (const e of entries) {
          if (!top || e.intersectionRatio > top.intersectionRatio) top = e;
        }
        if (top?.isIntersecting && top.intersectionRatio >= 0.5) {
          top.target.play().catch(() => {});
        }
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );

    for (const el of videoRefs.current) if (el) observer.observe(el);
    return () => {
      for (const el of videoRefs.current) if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [savedVideos]);

  if (loading)
    return <div style={{ color: "#fff", textAlign: "center", paddingTop: "40vh" }}>Loading...</div>;
  if (error)
    return <div style={{ color: "red", textAlign: "center", paddingTop: "40vh" }}>{error}</div>;

  // ---- helpers / actions ----
  const clamp0 = (n) => (n < 0 ? 0 : n);

  async function toggleLike(item) {
    const prevLiked = !!item.isLiked;
    const delta = prevLiked ? -1 : 1;

    // optimistic
    setSavedVideos((prev) =>
      prev.map((v) =>
        v._id === item._id ? { ...v, isLiked: !prevLiked, likeCount: clamp0((v.likeCount ?? 0) + delta) } : v
      )
    );

    try {
      const res = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodId: item._id },
        { withCredentials: true }
      );
      const serverLike = typeof res?.data?.like === "boolean" ? res.data.like : null;
      const serverCount = typeof res?.data?.likeCount === "number" ? res.data.likeCount : null;

      setSavedVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? { ...v, isLiked: serverLike ?? v.isLiked, likeCount: serverCount ?? v.likeCount }
            : v
        )
      );
    } catch (e) {
      // revert
      setSavedVideos((prev) =>
        prev.map((v) =>
          v._id === item._id ? { ...v, isLiked: prevLiked, likeCount: clamp0((v.likeCount ?? 0) - delta) } : v
        )
      );
      if (e?.response?.status === 401) console.warn("Please login first to like.");
    }
  }

  async function toggleSave(item) {
    const prevSaved = !!item.isSaved;

    // UX: Saved screen me unsave karte hi item ko turant hata do (optimistic)
    if (prevSaved) {
      setSavedVideos((prev) => prev.filter((v) => v._id !== item._id));
    } else {
      // theoretically yaha rarely aayega, but handle anyway
      setSavedVideos((prev) =>
        prev.map((v) => (v._id === item._id ? { ...v, isSaved: true, saveCount: (v.saveCount ?? 0) + 1 } : v))
      );
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodId: item._id },
        { withCredentials: true }
      );

      const serverSaved = typeof res?.data?.saved === "boolean" ? res.data.saved : null;
      const serverCount = typeof res?.data?.saveCount === "number" ? res.data.saveCount : null;

      // If server says it's still saved (rare), ensure present; if unsaved, ensure removed
      setSavedVideos((prev) => {
        const exists = prev.some((v) => v._id === item._id);
        if (serverSaved === false) {
          // make sure it's removed
          return prev.filter((v) => v._id !== item._id);
        }
        if (serverSaved === true) {
          // ensure present (if was removed due to optimistic, add back using item data)
          if (!exists) {
            return [{ ...item, isSaved: true, saveCount: serverCount ?? (item.saveCount ?? 1) }, ...prev];
          }
          return prev.map((v) =>
            v._id === item._id ? { ...v, isSaved: true, saveCount: serverCount ?? v.saveCount } : v
          );
        }
        return prev;
      });
    } catch (e) {
      // revert on error: if we removed, add it back
      if (prevSaved) {
        setSavedVideos((prev) => [{ ...item, isSaved: true }, ...prev]);
      } else {
        setSavedVideos((prev) =>
          prev.map((v) => (v._id === item._id ? { ...v, isSaved: false, saveCount: clamp0((v.saveCount ?? 1) - 1) } : v))
        );
      }
      if (e?.response?.status === 401) console.warn("Please login first to save.");
    }
  }

  return (
    <div className="reels-screen" style={{ background: "#000", color: "#fff" }}>
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 5000 }}>
  <LogoutButton />
</div>

      {savedVideos.length === 0 && (
        <div style={{ padding: "24px 16px", maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ margin: "12px 0 6px 0" }}>Saved</h2>
          <p style={{ opacity: 0.8, marginBottom: 16 }}>Your bookmarked meals will appear here.</p>
          <div style={{ border: "1px dashed rgba(255,255,255,0.25)", padding: 20, borderRadius: 12, textAlign: "center", opacity: 0.9 }}>
            Nothing saved yet.
          </div>
        </div>
      )}

      {savedVideos.map((item, idx) => {
        const id = item._id || String(idx);
        const isLiked = item.isLiked === true;
        const likeCount = item.likeCount ?? 0;
        const isSaved = item.isSaved === true; // in this page mostly true
        const saveCount = item.saveCount ?? 0;

        return (
          <div className="reel" key={id}>
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={item.video}
              muted
              playsInline
              loop
              controls={false}
              preload="metadata"
              onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
              onClick={() => {
                const el = videoRefs.current[idx];
                if (!el) return;
                if (el.paused) el.play().catch(() => {}); else el.pause();
              }}
            />

            {/* Right actions (LIKE + SAVE/UNSAVE) */}
            <div className="reel-actions">
              {/* LIKE */}
              <div className="action">
                <button
                  className={`action-btn ${isLiked ? "liked" : ""}`}
                  onClick={() => toggleLike(item)}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  aria-pressed={isLiked}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    {isLiked ? (
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white" />
                    ) : (
                      <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="none" stroke="white" strokeWidth="1.5" />
                    )}
                  </svg>
                </button>
                <div className="action-count">{likeCount}</div>
              </div>

              {/* SAVE / UNSAVE */}
              <div className="action">
                <button
                  className={`action-btn ${isSaved ? "saved" : ""}`}
                  onClick={() => toggleSave(item)}
                  aria-label={isSaved ? "Unsave" : "Save"}
                  aria-pressed={isSaved}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    {isSaved ? (
                      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="white" />
                    ) : (
                      <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" fill="none" stroke="white" strokeWidth="1.5" />
                    )}
                  </svg>
                </button>
                <div className="action-count">{saveCount}</div>
              </div>
            </div>

            {/* Bottom description + button */}
            <div className="reel-overlay">
              <div className="reel-overlay-gradient" aria-hidden="true" />
              <div className="reel-content">
                <p className="reel-description" title={item.description}>
                  {item.description || "No description"}
                </p>
                <button
                  className="reel-btn"
                  onClick={() => navigate(`/food-partner/${item.foodPartner}`)}
                >
                  visit store
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="icon" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9H6v-9H3l9-8z" /></svg>
          home
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="icon" viewBox="0 0 24 24"><path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" /></svg>
          saved
        </NavLink>
      </nav>
    </div>
  );
}
