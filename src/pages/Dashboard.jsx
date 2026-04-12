import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()

      if (isMounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-shell auth-shell--dashboard">
        <Link to="/" className="auth-logo">
          Klass<span>i</span>
        </Link>

        <section className="auth-panel dashboard-card">
          <span className="dashboard-badge">Dashboard Ready</span>
          <h1 className="auth-title">
            {isLoading
              ? 'Preparing your Klassi workspace.'
              : session
                ? 'You are signed in and ready to keep learning moving.'
                : 'Your Klassi account is set up.'}
          </h1>
          <p className="auth-copy">
            {isLoading
              ? 'We are checking your current session now.'
              : session
                ? 'This route is wired and ready for your next dashboard build. You can now layer in tutor discovery, booking, and profile features.'
                : 'If email confirmation is enabled in Supabase, verify your inbox and then log in to continue into your full dashboard experience.'}
          </p>

          <div className="dashboard-meta">
            <div>
              <strong>Current account:</strong>{' '}
              {session?.user?.email ?? 'No active session detected yet'}
            </div>
            <div>
              <strong>Next build step:</strong> connect dashboard data, protected routes, and profile loading.
            </div>
          </div>

          <div className="dashboard-actions">
            {session ? (
              <button type="button" className="auth-button" onClick={handleSignOut}>
                Sign out
              </button>
            ) : (
              <Link to="/login" className="auth-button">
                Log in
              </Link>
            )}
            <Link to="/" className="auth-button--secondary">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
