import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-logo">
          Klass<span>i</span>
        </Link>

        <section className="auth-panel">
          <span className="auth-eyebrow">Klassi Access</span>
          <h1 className="auth-title">Welcome back to your learning hub.</h1>
          <p className="auth-copy">
            Log in to keep lessons organized, revisit tutor matches, and stay close to every student goal.
          </p>

          <div className="auth-points">
            <article className="auth-point">
              <div className="auth-point__index">01</div>
              <div>
                <h2 className="auth-point__title">Track every session</h2>
                <p className="auth-point__copy">
                  Stay on top of upcoming classes, tutor activity, and the next learning milestone.
                </p>
              </div>
            </article>

            <article className="auth-point">
              <div className="auth-point__index">02</div>
              <div>
                <h2 className="auth-point__title">Built for serious progress</h2>
                <p className="auth-point__copy">
                  Klassi keeps Nigerian students and tutors in sync from discovery to exam prep.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Log in</h2>
            <p className="auth-card__copy">Use your Klassi account to continue where you left off.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__group">
              <span className="auth-form__label">Email address</span>
              <input
                className="auth-form__input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-form__group">
              <span className="auth-form__label">Password</span>
              <input
                className="auth-form__input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage ? <div className="auth-alert">{errorMessage}</div> : null}

            <button className="auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>

            <p className="auth-switch">
              New to Klassi? <Link to="/signup">Create an account</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
