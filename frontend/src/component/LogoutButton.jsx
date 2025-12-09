import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Try partner logout (ignore fail)
      await axios
        .get("http://localhost:3000/api/auth/foodpartner/logout", {
          withCredentials: true,
        })
        .catch(() => {});

      // Try user logout (ignore fail)
      await axios
        .get("http://localhost:3000/api/auth/user/logout", {
          withCredentials: true,
        })
        .catch(() => {});
    } catch (err) {
      console.log("logout error:", err);
    } finally {
      setLoading(false);
      navigate("/user/login"); // 🔥 change if your login page route different
    }
  };

  return (
   <button
  onClick={handleLogout}
  disabled={loading}
  style={{
    position: "absolute", // Agar parent relative hai to ye corner me chipak jayega
    top: "9.2px",
    right: "4px",
    zIndex: 1000,
    background: "rgba(255, 255, 255, 0.15)", // Halka transparent white
    border: "1px solid rgba(255, 255, 255, 0.2)", // Bahut light border
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "20px", // Thoda round shape (Pill shape)
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "13px",
    fontWeight: "500",
    backdropFilter: "blur(10px)", // Strong blur for premium feel
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Halka shadow depth ke liye
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  }}
  onMouseEnter={(e) => {
    e.target.style.background = "rgba(255, 255, 255, 0.25)";
    e.target.style.transform = "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "rgba(255, 255, 255, 0.15)";
    e.target.style.transform = "translateY(0)";
  }}
>
  {/* Logout Icon SVG */}
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
  {loading ? "..." : "Logout"}
</button>
  );
}
