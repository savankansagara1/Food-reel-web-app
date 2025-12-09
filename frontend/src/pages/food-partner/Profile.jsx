import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setErr("");

      try {
        // 1) Partner profile (protected: send cookie)
        const res = await axios.get(
          `http://localhost:3000/api/foodpartner/${id}`,
          { withCredentials: true }
        );
        if (!mounted) return;

        // Adjust field name if your controller returns a different shape
        const partner = res.data?.foodPartner || res.data?.partner || res.data;
        setProfile(partner || null);

        // 2) This partner's videos (protected: send cookie!)
        const foodRes = await axios.get(
          `http://localhost:3000/api/food?partner=${id}`,
          { withCredentials: true } // <-- REQUIRED or you'll get 401
        );
        if (!mounted) return;

        const items = Array.isArray(foodRes.data?.foodItems)
          ? foodRes.data.foodItems
          : Array.isArray(foodRes.data)
          ? foodRes.data
          : [];
        setVideos(items);
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.response?.data?.message || "Failed to load profile or videos");
        if (mounted) {
          setProfile(null);
          setVideos([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '40vh' }}>Loading...</div>;
  }
  if (err || !profile) {
    return <div style={{ color: 'red', textAlign: 'center', paddingTop: '40vh' }}>{err || "Profile not found"}</div>;
  }

  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: 'var(--background, #0b0b0b)' }}>
      <div className="profile-card"
           style={{ maxWidth: 400, margin: '40px auto', borderRadius: 24, background: 'var(--card, #141414)',
                    padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', color: 'var(--onCard, #fff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary, #ff4c4c)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 8 }}>
              {profile.name || profile.fullname || 'Business Name'}
            </div>
            <div style={{ opacity: 0.85 }}>
              {profile.address || profile.city || 'Address'}
            </div>
            {profile.phone && (
              <div style={{ marginTop: 6, opacity: 0.85 }}>📞 {profile.phone}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, marginBottom: 8 }}>
          <Stat label="total meals" value={videos.length} />
          <Stat label="customers served" value={profile.customersServed || '—'} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border, #2a2a2a)', margin: '16px 0' }} />
      </div>

      <div className="profile-videos"
           style={{ maxWidth: 960, margin: '24px auto 56px', padding: '0 8px',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 7 }}>
        {videos.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', color: 'var(--onCard, #bbb)', textAlign: 'center', opacity: 0.8 }}>
            No videos yet
          </div>
        ) : (
          videos.map((food) => (
            <div key={food._id}
                 style={{ background: 'var(--card, #141414)', borderRadius: 12, overflow: 'hidden',
                          aspectRatio: '9/16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 title={food.description}>
              {food.video ? (
                <video src={food.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       muted loop playsInline controls={false} />
              ) : (
                <span style={{ color: 'var(--onCard, #bbb)' }}>No video</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '0.95rem', opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: 4 }}>{value}</div>
    </div>
  );
}
