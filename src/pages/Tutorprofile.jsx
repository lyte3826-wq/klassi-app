import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./TutorProfile.css";

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [booking, setBooking] = useState(false);

  const TIME_SLOTS = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
    "5:00 PM", "6:00 PM", "7:00 PM",
  ];

  useEffect(() => {
    fetchTutor();
    checkUser();
  }, [id]);

  async function fetchTutor() {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setTutor(data);
    setLoading(false);
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  function handleBookClick() {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowBooking(true);
  }

  async function handleConfirmBooking() {
    if (!selectedDate || !selectedTime) return;
    setBooking(true);

    const { error } = await supabase.from("bookings").insert({
      student_id: user.id,
      tutor_id: tutor.id,
      date: selectedDate,
      time: selectedTime,
      subject: tutor.subjects?.[0],
      rate: tutor.rate,
      status: "pending",
    });

    setBooking(false);
    if (!error) {
      setBookingSuccess(true);
      setShowBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <p>Tutor not found.</p>
          <button onClick={() => navigate("/tutors")}>← Back to tutors</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-header__inner">
          <a href="/" className="tutors-logo">Klass<span>i</span></a>
          <button className="btn-back" onClick={() => navigate("/tutors")}>
            ← Back to tutors
          </button>
        </div>
      </div>

      <div className="profile-body">
        {/* LEFT — TUTOR INFO */}
        <div className="profile-main">

          {/* TOP CARD */}
          <div className="profile-card profile-card--hero">
            <div className="profile-card__hero-bg" />
            <div className="profile-card__hero-content">
              <div className="profile-avatar">
                {tutor.avatar_url ? (
                  <img src={tutor.avatar_url} alt={tutor.full_name} />
                ) : (
                  <span>{tutor.full_name.charAt(0)}</span>
                )}
              </div>
              <div className="profile-identity">
                <div className="profile-name-row">
                  <h1>{tutor.full_name}</h1>
                  {tutor.is_verified && (
                    <span className="profile-verified">✓ Verified</span>
                  )}
                </div>
                <div className="profile-rating">
                  {"★".repeat(Math.floor(tutor.rating))}
                  <span className="profile-rating__score">{tutor.rating}</span>
                  <span className="profile-rating__count">· 5.0 rating</span>
                </div>
                <div className="profile-subjects">
                  {tutor.subjects?.map((s) => (
                    <span key={s} className="subject-pill">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BIO */}
          <div className="profile-card">
            <h2 className="profile-card__title">About</h2>
            <p className="profile-bio">{tutor.bio}</p>
          </div>

          {/* LEVELS */}
          <div className="profile-card">
            <h2 className="profile-card__title">Teaches</h2>
            <div className="profile-levels">
              {tutor.level?.map((l) => (
                <div key={l} className="level-badge">
                  <span className="level-badge__icon">🎓</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SUBJECTS */}
          <div className="profile-card">
            <h2 className="profile-card__title">Subjects</h2>
            <div className="profile-subjects-list">
              {tutor.subjects?.map((s) => (
                <div key={s} className="subject-row">
                  <span className="subject-row__dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — BOOKING SIDEBAR */}
        <div className="profile-sidebar">
          <div className="booking-card">
            <div className="booking-card__rate">
              ₦{tutor.rate?.toLocaleString()}
              <span>/session</span>
            </div>
            <div className="booking-card__info">
              <div className="booking-info-row">
                <span>⏱</span><span>60 min session</span>
              </div>
              <div className="booking-info-row">
                <span>📱</span><span>Online via Klassi</span>
              </div>
              <div className="booking-info-row">
                <span>✓</span><span>Verified tutor</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="booking-success">
                <div className="booking-success__icon">🎉</div>
                <h3>Booking Requested!</h3>
                <p>Your session request has been sent to {tutor.full_name}. They will confirm shortly.</p>
                <button className="btn-primary" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            ) : showBooking ? (
              <div className="booking-form">
                <h3>Pick a date & time</h3>
                <div className="booking-form__field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="booking-form__field">
                  <label>Time</label>
                  <div className="time-slots">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        className={`time-slot ${selectedTime === t ? "time-slot--active" : ""}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime || booking}
                >
                  {booking ? "Booking..." : `Confirm — ₦${tutor.rate?.toLocaleString()}`}
                </button>
                <button className="btn-cancel" onClick={() => setShowBooking(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={handleBookClick}>
                {user ? "Book a Session →" : "Login to Book →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}