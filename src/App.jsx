import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

const subjects = [
  { icon: "📐", name: "Mathematics", tag: "WAEC/JAMB" },
  { icon: "📖", name: "English Language", tag: "WAEC/JAMB" },
  { icon: "🔬", name: "Biology", tag: "WAEC/NECO" },
  { icon: "⚗️", name: "Chemistry", tag: "WAEC/JAMB" },
  { icon: "⚡", name: "Physics", tag: "WAEC/JAMB" },
  { icon: "🌍", name: "Geography", tag: "WAEC" },
  { icon: "💻", name: "Computer Science", tag: "WAEC" },
  { icon: "📚", name: "Literature", tag: "WAEC/NECO" },
];

const steps = [
  {
    number: "01",
    title: "Browse Tutors",
    desc: "Search by subject, level or price. Every tutor is verified.",
  },
  {
    number: "02",
    title: "Book a Session",
    desc: "Pick a time that works for your child. Pay securely with Paystack.",
  },
  {
    number: "03",
    title: "Learn & Pass",
    desc: "Join the live lesson online. Track progress after every session.",
  },
];

const testimonials = [
  {
    name: "Mrs. Adeyemi",
    role: "Parent, Lagos",
    text: "My son went from F9 to B2 in Mathematics in just 6 weeks. Klassi tutors are exceptional.",
    avatar: "A",
  },
  {
    name: "Chidi O.",
    role: "SS3 Student, Abuja",
    text: "I was so scared of JAMB but my tutor on Klassi made everything click. I scored 312!",
    avatar: "C",
  },
  {
    name: "Mrs. Okafor",
    role: "Parent, Ibadan",
    text: "Finally a platform that understands Nigerian curriculum. Highly recommend for JSS parents.",
    avatar: "O",
  },
];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="klassi">
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            Klass<span>i</span>
          </Link>
          <div className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
            <a href="#subjects">Subjects</a>
            <a href="#how">How it works</a>
            <a href="#tutors">Tutors</a>
            <Link to="/login" className="btn btn--outline">Log in</Link>
            <Link to="/signup" className="btn btn--primary">Get Started</Link>
          </div>
          <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__dots" />
        </div>
        <div className="hero__content">
          <div className="hero__badge">🇳🇬 Built for Nigerian Students</div>
          <h1 className="hero__title">
            Find the perfect tutor<br />
            <span>for your child.</span>
          </h1>
          <p className="hero__subtitle">
            Verified tutors. Live online lessons. Real results.<br />
            From Primary school to WAEC &amp; JAMB prep — we've got them covered.
          </p>
          <div className="hero__actions">
            <Link to="/signup" className="btn btn--primary btn--lg">Find a Tutor →</Link>
            <Link to="/signup?role=tutor" className="btn btn--ghost btn--lg">Become a Tutor</Link>
          </div>
          <div className="hero__stats">
            <div className="stat"><strong>500+</strong><span>Verified Tutors</span></div>
            <div className="stat__divider" />
            <div className="stat"><strong>2,000+</strong><span>Students</span></div>
            <div className="stat__divider" />
            <div className="stat"><strong>98%</strong><span>Pass Rate</span></div>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__card hero__card--main">
            <div className="lesson-card">
              <div className="lesson-card__header">
                <div className="avatar avatar--green">T</div>
                <div>
                  <div className="lesson-card__name">Mr. Taiwo</div>
                  <div className="lesson-card__subject">Mathematics • JSS3</div>
                </div>
                <div className="lesson-card__live">● LIVE</div>
              </div>
              <div className="lesson-card__timer">24:32</div>
              <div className="lesson-card__label">Session in progress</div>
            </div>
          </div>
          <div className="hero__card hero__card--sub">
            <div className="mini-card">
              <span>🎯</span>
              <div>
                <strong>JAMB Ready</strong>
                <p>Next session in 2hrs</p>
              </div>
            </div>
          </div>
          <div className="hero__card hero__card--sub2">
            <div className="mini-card mini-card--dark">
              <span>⭐</span>
              <div>
                <strong>4.9 Rating</strong>
                <p>Top tutor this week</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="subjects" id="subjects">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">What we cover</div>
            <h2>Every subject.<br />Every level.</h2>
            <p>From Primary 1 to SS3 — our tutors cover the full Nigerian curriculum including WAEC, JAMB and NECO prep.</p>
          </div>
          <div className="subjects__grid">
            {subjects.map((s) => (
              <div className="subject-card" key={s.name}>
                <div className="subject-card__icon">{s.icon}</div>
                <div className="subject-card__name">{s.name}</div>
                <div className="subject-card__tag">{s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Simple process</div>
            <h2>How Klassi works</h2>
            <p>Getting started takes less than 5 minutes.</p>
          </div>
          <div className="how__steps">
            {steps.map((step, i) => (
              <div className="step" key={i}>
                <div className="step__number">{step.number}</div>
                <div className="step__content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="step__arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Real results</div>
            <h2>Parents &amp; students love Klassi</h2>
          </div>
          <div className="testimonials__grid">
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-card__quote">"</div>
                <p>{t.text}</p>
                <div className="testimonial-card__author">
                  <div className="avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta__inner">
          <h2>Ready to help your child succeed?</h2>
          <p>Join thousands of Nigerian students already learning on Klassi.</p>
          <div className="cta__actions">
            <Link to="/signup" className="btn btn--white btn--lg">Get Started Free →</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="navbar__logo">Klass<span>i</span></div>
            <p>Connecting Nigerian students with the best tutors — online, affordable, effective.</p>
          </div>
          <div className="footer__bottom">
            <span>© 2026 Klassi. All rights reserved.</span>
            <div className="footer__links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
