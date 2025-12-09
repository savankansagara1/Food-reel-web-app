import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/reels.css";
import LogoutButton from "../../component/LogoutButton";

// === ONE PLACE: API base + cookies + 401 redirect ===
const API = import.meta.env.VITE_API_URL; // must be: https://food-reel-web-app.onrender.com
const api = axios.create({
  baseURL: API,
  withCredentials: true, // send cookies (JWT) with every request
});

// if backend returns 401 -> go to /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default function Home() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // PROTECTED endpoints -> if not logged in, interceptor will send to /login
        const [foodRes, savedRes] = await Promise.all([
          api.get("/api/food"),
          api.get("/api/food/saved"),
        ]);

        const foodItems = foodRes?.data?.foodItems ?? [];
        const savedItems = savedRes?.data?.savedItems ?? [];
        const savedSet = new Set(savedItems.map((i) => String(i._id)));

        const merged = foodItems.map((v) => ({
          likeCount: v.likeCount ?? 0,
          saveCount: v.saveCount ?? 0,
          isLiked: v.isLiked ?? false,
          isSaved: savedSet.has(String(v._id)),
          ...v,
        }));

        if (isMounted) setVideos(merged);
      } catch (err) {
        if (isMounted) setError("Failed to load videos");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!videos.length) return;
    videoRefs.current = videoRefs.current.slice(0, videos.length);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const el of videoRefs.current) if (el && !el.paused) el.pause();
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
  }, [videos]);

  if (loading)
    return (
      <div style={{ color: "#fff", textAlign: "center", paddingTop: "40vh" }}>
        Loading...
      </div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", paddingTop: "40vh" }}>
        {error}
      </div>
    );

  const clamp0 = (n) => (n < 0 ? 0 : n);

  async function toggleLike(item) {
    const prevLiked = !!item.isLiked;
    const delta = prevLiked ? -1 : 1;

    setVideos((prev) =>
      prev.map((v) =>
        v._id === item._id
          ? {
              ...v,
              isLiked: !prevLiked,
              likeCount: clamp0((v.likeCount ?? 0) + delta),
            }
          : v
      )
    );

    try {
      const res = await api.post("/api/food/like", { foodId: item._id });
      const serverLike =
        typeof res?.data?.like === "boolean" ? res.data.like : null;
      const serverCount =
        typeof res?.data?.likeCount === "number" ? res.data.likeCount : null;

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                isLiked: serverLike ?? v.isLiked,
                likeCount: serverCount !== null ? clamp0(serverCount) : v.likeCount,
              }
            : v
        )
      );
    } catch (e) {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                isLiked: prevLiked,
                likeCount: clamp0((v.likeCount ?? 0) - delta),
              }
            : v
        )
      );
      // 401 case already handled by interceptor
    }
  }

  async function toggleSave(item) {
    const prevSaved = !!item.isSaved;
    const delta = prevSaved ? -1 : 1;

    setVideos((prev) =>
      prev.map((v) =>
        v._id === item._id
          ? {
              ...v,
              isSaved: !prevSaved,
              saveCount: clamp0((v.saveCount ?? 0) + delta),
            }
          : v
      )
    );

    try {
      const res = await api.post("/api/food/save", { foodId: item._id });
      const serverSaved =
        typeof res?.data?.saved === "boolean" ? res.data.saved : null;
      const serverCount =
        typeof res?.data?.saveCount === "number" ? res.data.saveCount : null;

      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                isSaved: serverSaved ?? v.isSaved,
                saveCount: serverCount !== null ? clamp0(serverCount) : v.saveCount,
              }
            : v
        )
      );
    } catch (e) {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? {
                ...v,
                isSaved: prevSaved,
                saveCount: clamp0((v.saveCount ?? 0) - delta),
              }
            : v
        )
      );
      // 401 case already handled by interceptor
    }
  }

  return (
    <div className="reels-screen">
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 5000 }}>
        <LogoutButton />
      </div>

      {videos.map((item, idx) => {
        const id = item._id || String(idx);
        const isLiked = item.isLiked === true;
        const likeCount = item.likeCount ?? 0;
        const isSaved = item.isSaved === true;
        const saveCount = item.saveCount ?? 0;

        return (
          <div className="reel" key={id}>
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={item.video}
              loop
              muted
              playsInline
              controls={false}
              preload="metadata"
            />

            <div className="reel-actions">
              <div className="action">
                <button
                  className={`action-btn ${isLiked ? "liked" : ""}`}
                  onClick={() => toggleLike(item)}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  aria-pressed={isLiked}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    {isLiked ? (
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="white"
                      />
                    ) : (
                      <path
                        d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    )}
                  </svg>
                </button>
                <div className="action-count">{likeCount}</div>
              </div>

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
                      <path
                        d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    )}
                  </svg>
                </button>
                <div className="action-count">{saveCount}</div>
              </div>
            </div>

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

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          {({ isActive }) => (
            <>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 26, height: 26 }}>
                {isActive ? (
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="white" />
                ) : (
                  <path
                    d="M3 9.5L12 3l9 6.5v10.5a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
              home
            </>
          )}
        </NavLink>

        <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          {({ isActive }) => (
            <>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 26, height: 26 }}>
                {isActive ? (
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="white" />
                ) : (
                  <path
                    d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
              saved
            </>
          )}
        </NavLink>
      </nav>

      {!videos.length && (
        <div style={{ color: "#888", textAlign: "center", padding: 24 }}>
          No reels yet.
        </div>
      )}
    </div>
  );
}
