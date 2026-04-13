import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    setUser(user);

    // Get profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(profileData);

    // Get bookings
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    setBookings(bookingData || []);

    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function cancelBooking(bookingId) {
    await supabase.from("bookings").delete().eq("id", bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  }

  const upcoming = bookings.filter((b) => b.status !== "cancelled");
  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-loading">
          <div className="dash-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <a href="/" className="dash-logo">Klass<span>i</span></a>
        <nav className="dash-nav">
          <div className="dash-nav__item dash-nav__item--active">
            <span>📋</span> Dashboard
          </div>
          <div className="dash-nav__item" onClick={() => navigate("/tutors")}>
            <span>🔍</span> Find Tutors
          </div>
          <div className="dash-nav__item">
            <span>📅</span> My Sessions
          </div>
          <div className="dash-nav__item">
            <span>👤</span> Profile
          </div>
        </nav>
        <div className="dash-sidebar__bottom">
          <div className="dash-user">
            <div className="dash-user__avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="dash-user__info">
              <strong>{profile?.full_name || "User"}</strong>
              <span>{profile?.role || "student"}</span>
            </div>
          </div>
          <button className="dash-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">
        {/* TOP BAR */}
        <div className="dash-topbar">
          <div>
            <h1 className="dash-welcome">Good day, {firstName} 👋</h1>
            <p className="dash-welcome__sub">Here's what's happening with your learning.</p>
          </div>
          <button className="dash-find-btn" onClick={() => navigate("/tutors")}>
            + Find a Tutor
          </button>
        </div>

        {/* STATS */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon">📚</div>
            <div>
              <div className="dash-stat-card__value">{bookings.length}</div>
              <div className="dash-stat-card__label">Total Sessions</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon">⏳</div>
            <div>
              <div className="dash-stat-card__value">
                {bookings.filter((b) => b.status === "pending").length}
              </div>
              <div className="dash-stat-card__label">Pending</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon">✅</div>
            <div>
              <div className="dash-stat-card__value">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
              <div className="dash-stat-card__label">Confirmed</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon">💰</div>
            <div>
              <div className="dash-stat-card__value">
                ₦{bookings.reduce((sum, b) => sum + (b.rate || 0), 0).toLocaleString()}
              </div>
              <div className="dash-stat-card__label">Total Spent</div>
            </div>
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="dash-section">
          <div className="dash-section__header">
            <h2>My Booked Sessions</h2>
            <button className="dash-section__link" onClick={() => navigate("/tutors")}>
              Book another →
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty__icon">📅</div>
              <h3>No sessions yet</h3>
              <p>Find a tutor and book your first session to get started.</p>
              <button className="dash-find-btn" onClick={() => navigate("/tutors")}>
                Browse Tutors →
              </button>
            </div>
          ) : (
            <div className="dash-bookings">
              {upcoming.map((booking) => (
                <div className="booking-row" key={booking.id}>
                  <div className="booking-row__left">
                    <div className="booking-row__avatar">
                      {booking.subject?.charAt(0) || "S"}
                    </div>
                    <div className="booking-row__info">
                      <div className="booking-row__subject">{booking.subject}</div>
                      <div className="booking-row__time">
                        📅 {booking.date} &nbsp;·&nbsp; ⏰ {booking.time}
                      </div>
                    </div>
                  </div>
                  <div className="booking-row__right">
                    <div className={`booking-row__status booking-row__status--${booking.status}`}>
                      {booking.status}
                    </div>
                    <div className="booking-row__rate">
                      ₦{booking.rate?.toLocaleString()}
                    </div>
                    <button
                      className="booking-row__cancel"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA BANNER */}
        {bookings.length === 0 && (
          <div className="dash-cta">
            <div className="dash-cta__text">
              <h3>Ready to start learning?</h3>
              <p>Browse our verified tutors and book your first session today.</p>
            </div>
            <button className="dash-find-btn" onClick={() => navigate("/tutors")}>
              Find a Tutor →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}