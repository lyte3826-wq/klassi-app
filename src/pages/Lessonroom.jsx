import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { importPKCS8, SignJWT } from "jose";
import "./LessonRoom.css";

const APP_ID = import.meta.env.VITE_JAAS_APP_ID;
const KEY_ID = import.meta.env.VITE_JAAS_KEY_ID;
const PRIVATE_KEY_PEM = import.meta.env.VITE_JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");
const LESSON_DURATION = 60 * 60; // 60 minutes in seconds

export default function LessonRoom() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const jitsiRef = useRef(null);
  const apiRef = useRef(null);
  const timerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(LESSON_DURATION);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [lessonEnded, setLessonEnded] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("video"); // video | notes

  useEffect(() => {
    loadRoom();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (apiRef.current) apiRef.current.dispose();
    };
  }, [bookingId]);

  async function loadRoom() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    setUser(user);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !data) {
      setError("Booking not found.");
      setLoading(false);
      return;
    }

    setBooking(data);
    setLoading(false);
  }

  async function generateToken(userEmail, userName) {
    try {
      const privateKey = await importPKCS8(PRIVATE_KEY_PEM, "RS256");
      const token = await new SignJWT({
        iss: "chat",
        aud: "jitsi",
        sub: APP_ID,
        room: `klassi-${bookingId}`,
        context: {
          user: {
            avatar: "",
            email: userEmail,
            name: userName,
            id: userEmail,
          },
          features: {
            livestreaming: false,
            recording: false,
            transcription: false,
            "outbound-call": false,
          },
        },
      })
        .setProtectedHeader({ alg: "RS256", kid: KEY_ID, typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(privateKey);

      return token;
    } catch (err) {
      console.error("Token generation failed:", err);
      return null;
    }
  }

  async function startLesson() {
    setLessonStarted(true);

    const userName = user.email.split("@")[0];
    const token = await generateToken(user.email, userName);

    if (!token) {
      setError("Could not start video. Please refresh and try again.");
      return;
    }

    const domain = "8x8.vc";
    const roomName = `${APP_ID}/klassi-${bookingId}`;

    const options = {
      roomName,
      jwt: token,
      width: "100%",
      height: "100%",
      parentNode: jitsiRef.current,
      userInfo: { email: user.email, displayName: userName },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: [
          "microphone", "camera", "desktop", "fullscreen",
          "hangup", "chat", "tileview",
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        DEFAULT_BACKGROUND: "#0d1117",
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    apiRef.current = api;

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endLesson();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    api.addEventListener("videoConferenceLeft", () => {
      endLesson();
    });
  }

  function endLesson() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch {}
    }
    setLessonEnded(true);
  }

  async function saveNotes() {
    await supabase
      .from("bookings")
      .update({ notes })
      .eq("id", bookingId);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const timerColor = timeLeft < 300 ? "#ef4444" : timeLeft < 600 ? "#f59e0b" : "#1db954";

  if (loading) {
    return (
      <div className="room-page">
        <div className="room-loading">
          <div className="room-spinner" />
          <p>Preparing your lesson room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-page">
        <div className="room-loading">
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (lessonEnded) {
    return (
      <div className="room-page">
        <div className="room-ended">
          <div className="room-ended__icon">🎓</div>
          <h1>Lesson Complete!</h1>
          <p>Great session! Your lesson with <strong>{booking?.subject}</strong> tutor has ended.</p>
          {notes && (
            <div className="room-ended__notes">
              <h3>Your Notes</h3>
              <p>{notes}</p>
            </div>
          )}
          <div className="room-ended__actions">
            <button className="btn-green" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
            <button className="btn-outline" onClick={() => navigate("/tutors")}>
              Book Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      {/* TOP BAR */}
      <div className="room-topbar">
        <a href="/" className="room-logo">Klass<span>i</span></a>
        <div className="room-info">
          <span className="room-subject">{booking?.subject}</span>
          <span className="room-date">📅 {booking?.date} · {booking?.time}</span>
        </div>
        <div className="room-timer" style={{ color: timerColor }}>
          {lessonStarted ? (
            <>
              <span className="room-timer__label">Time left</span>
              <span className="room-timer__value">{formatTime(timeLeft)}</span>
            </>
          ) : (
            <span className="room-timer__value">60:00</span>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="room-body">
        {/* VIDEO AREA */}
        <div className="room-main">
          {!lessonStarted ? (
            <div className="room-pregame">
              <div className="room-pregame__icon">🎓</div>
              <h2>Ready to start your lesson?</h2>
              <p>Subject: <strong>{booking?.subject}</strong></p>
              <p>Date: <strong>{booking?.date}</strong> at <strong>{booking?.time}</strong></p>
              <div className="room-pregame__tips">
                <div className="tip">✅ Check your microphone and camera</div>
                <div className="tip">✅ Find a quiet space</div>
                <div className="tip">✅ Have your materials ready</div>
              </div>
              <button className="btn-start" onClick={startLesson}>
                🚀 Start Lesson
              </button>
            </div>
          ) : (
            <div className="room-video" ref={jitsiRef} />
          )}
        </div>

        {/* SIDEBAR */}
        <div className="room-sidebar">
          <div className="room-tabs">
            <button
              className={`room-tab ${activeTab === "notes" ? "room-tab--active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              📝 Notes
            </button>
            <button
              className={`room-tab ${activeTab === "info" ? "room-tab--active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              ℹ️ Info
            </button>
          </div>

          {activeTab === "notes" && (
            <div className="room-notes">
              <textarea
                className="room-notes__textarea"
                placeholder="Take notes during your lesson here... They'll be saved to your dashboard."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button className="room-notes__save" onClick={saveNotes}>
                {notesSaved ? "✅ Saved!" : "Save Notes"}
              </button>
            </div>
          )}

          {activeTab === "info" && (
            <div className="room-info-panel">
              <div className="room-info-row">
                <span>Subject</span>
                <strong>{booking?.subject}</strong>
              </div>
              <div className="room-info-row">
                <span>Date</span>
                <strong>{booking?.date}</strong>
              </div>
              <div className="room-info-row">
                <span>Time</span>
                <strong>{booking?.time}</strong>
              </div>
              <div className="room-info-row">
                <span>Duration</span>
                <strong>60 minutes</strong>
              </div>
              <div className="room-info-row">
                <span>Amount Paid</span>
                <strong>₦{booking?.rate?.toLocaleString()}</strong>
              </div>
              <button className="btn-end" onClick={endLesson}>
                End Lesson
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}