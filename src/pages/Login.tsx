import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { colors, page, card, input,select as selectStyle, button, label, errorText } from '../lib/theme'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('fleet_manager')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    setLoading(false)
    if (error) {
      setError(error.message || JSON.stringify(error))
      return
    }
    navigate('/dashboard')
  }

  const fullWidthInput = { ...input, width: '100%', boxSizing: 'border-box' as const, marginRight: 0, marginBottom: '0.75rem' }

  return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }} />
          <div style={{ flex: 1, maxWidth: '120px', borderTop: `1px dashed ${colors.border}` }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.border }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.text, letterSpacing: '-0.02em', margin: 0 }}>
            TransitOps
          </h1>
          <p style={{ color: colors.textFaint, fontSize: '0.875rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>
            Fleet Operations Console
          </p>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.text, marginBottom: '1rem' }}>
            {isSignup ? 'Sign Up' : 'Log In'}
          </h2>

          {error && <p style={errorText}>{error}</p>}

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && (
              <>
                <label style={label}>Full Name</label>
                <input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={fullWidthInput}
                  required
                />
              </>
            )}

            <label style={label}>Email</label>
            <input
              type="email"
              placeholder="you@fleet.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={fullWidthInput}
              required
            />

            <label style={label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={fullWidthInput}
              required
            />

            {isSignup && (
              <>
                <label style={label}>Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{ ...selectStyle, width: '100%', marginBottom: '1rem', marginRight: 0 }}
                >
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="driver">Driver</option>
                  <option value="safety_officer">Safety Officer</option>
                  <option value="financial_analyst">Financial Analyst</option>
                </select>
              </>
            )}

            <button type="submit" disabled={loading} style={{ ...button, width: '100%' }}>
              {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log in'}
            </button>
          </form>

          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'none', border: 'none', color: colors.accent, fontSize: '0.8125rem',
              marginTop: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0,
            }}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: colors.textFaint, fontSize: '0.75rem', marginTop: '1.5rem', fontFamily: 'monospace' }}>
          Fleet Manager · Driver · Safety Officer · Financial Analyst
        </p>
      </div>
    </div>
  )
}