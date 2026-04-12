import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Tutors.css";

const ALL_SUBJECTS = [
  "All",
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science",
  "Literature",
  "Further Maths",
  "Basic Science",
];

const ALL_LEVELS = ["All", "Primary", "JSS", "SSS", "WAEC", "JAMB", "NECO"];

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("All");
  const [level, setLevel] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTutors();
  }, []);

  async function fetchTutors() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("is_verified", true)
      .order("rating", { ascending: false });
    if (!error) setTutors(data);
    setLoading(false);
  }

  const filtered = tutors.filter((t) => {
    const matchSubject =
      subject === "All" || t.subjects?.includes(subject);
    const matchLevel =
      level === "All" || t.level?.includes(level);
    const matchSearch =
      search === "" ||
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchSubject && matchLevel && matchSearch;
  });

  return (
    <div className="tutors-page">
      {/* HEADER */}
      <div className="tutors-header">
        <div className="tutors-header__inner">
          <a href="/" className="tutors-logo">
            Klass<span>i</span>
          </a>
          <div className="tutors-header__right">
            <a href="/dashboard" className="btn-dash">Dashboard</a>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="tutors-banner">
        <div className="tutors-banner__inner">
          <h1>Find your perfect tutor</h1>
          <p>Verified Nigerian tutors for Primary, JSS, SSS, WAEC & JAMB</p>
          <div className="tutors-search">
            <span className="tutors-search__icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="tutors-body">
        {/* FILTERS */}
        <div className="tutors-filters">
          <div className="filter-group">
            <div className="filter-group__label">Subject</div>
            <div className="filter-group__pills">
              {ALL_SUBJECTS.map((s) => (
                <button
                  key={s}
                  className={`pill ${subject === s ? "pill--active" : ""}`}
                  onClick={() => setSubject(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-group__label">Level</div>
            <div className="filter-group__pills">
              {ALL_LEVELS.map((l) => (
                <button
                  key={l}
                  className={`pill ${level === l ? "pill--active" : ""}`}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="tutors-results">
          <div className="tutors-results__count">
            {loading ? "Loading tutors..." : `${filtered.length} tutor${filtered.length !== 1 ? "s" : ""} found`}
          </div>

          {loading ? (
            <div className="tutors-skeleton">
              {[...Array(6)].map((_, i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="tutors-empty">
              <div className="tutors-empty__icon">🔍</div>
              <h3>No tutors found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="tutors-grid">
              {filtered.map((tutor) => (
                <div
                  className="tutor-card"
                  key={tutor.id}
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
                  <div className="tutor-card__top">
                    <div className="tutor-card__avatar">
                      {tutor.avatar_url ? (
                        <img src={tutor.avatar_url} alt={tutor.full_name} />
                      ) : (
                        <span>{tutor.full_name.charAt(0)}</span>
                      )}
                    </div>
                    {tutor.is_verified && (
                      <div className="tutor-card__verified">✓ Verified</div>
                    )}
                  </div>
                  <div className="tutor-card__body">
                    <h3 className="tutor-card__name">{tutor.full_name}</h3>
                    <div className="tutor-card__rating">
                      {"★".repeat(Math.floor(tutor.rating))}
                      <span>{tutor.rating}</span>
                    </div>
                    <p className="tutor-card__bio">{tutor.bio}</p>
                    <div className="tutor-card__subjects">
                      {tutor.subjects?.map((s) => (
                        <span key={s} className="subject-pill">{s}</span>
                      ))}
                    </div>
                    <div className="tutor-card__levels">
                      {tutor.level?.map((l) => (
                        <span key={l} className="level-pill">{l}</span>
                      ))}
                    </div>
                  </div>
                  <div className="tutor-card__footer">
                    <div className="tutor-card__rate">
                      ₦{tutor.rate?.toLocaleString()}
                      <span>/session</span>
                    </div>
                    <button className="btn-book">Book →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}