import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

const validRole = (role) => (role === 'tutor' ? 'tutor' : 'student')

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(validRole(searchParams.get('role')))
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          full_name: fullName,
          role,
        },
        {
          onConflict: 'id',
        },
      )

      if (profileError) {
        setErrorMessage(profileError.message)
        setIsSubmitting(false)
        return
      }
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
          <span className="auth-eyebrow">Start With Klassi</span>
          <h1 className="auth-title">Find the right tutor and keep momentum high.</h1>
          <p className="auth-copy">
            Create your account in a minute, choose your role, and step into a tutoring experience built to feel clear, modern, and results-driven.
          </p>

          <div className="auth-points">
            <article className="auth-point">
              <div className="auth-point__index">01</div>
              <div>
                <h2 className="auth-point__title">For students and families</h2>
                <p className="auth-point__copy">
                  Match with tutors who understand the Nigerian curriculum and know how to teach for confidence.
                </p>
              </div>
            </article>

            <article className="auth-point">
              <div className="auth-point__index">02</div>
              <div>
                <h2 className="auth-point__title">For tutors ready to lead</h2>
                <p className="auth-point__copy">
                  Join a platform that makes it easier to showcase your expertise and manage each learner well.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Create account</h2>
            <p className="auth-card__copy">Set up your Klassi profile and head straight to your dashboard.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__group">
              <span className="auth-form__label">Full name</span>
              <input
                className="auth-form__input"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </label>

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
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <div className="auth-form__group">
              <span className="auth-form__label">Choose your role</span>
              <div className="auth-role-toggle" role="group" aria-label="Select account role">
                <button
                  type="button"
                  className={`auth-role-toggle__option ${role === 'student' ? 'auth-role-toggle__option--active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  I am a Student
                </button>
                <button
                  type="button"
                  className={`auth-role-toggle__option ${role === 'tutor' ? 'auth-role-toggle__option--active' : ''}`}
                  onClick={() => setRole('tutor')}
                >
                  I am a Tutor
                </button>
              </div>
            </div>

            {errorMessage ? <div className="auth-alert">{errorMessage}</div> : null}

            <button className="auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="auth-switch">
              Already on Klassi? <Link to="/login">Log in</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
