import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { colors, page, card, button, errorText } from '../lib/theme'

type Profile = {
  id: string
  full_name: string | null
  role: string
  created_at: string
}

export default function Account() {
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setEmail(user.email || '')

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileErr) setError(profileErr.message)
      else setProfile(profileData)

      setLoading(false)
    }
    loadAccount()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const roleLabels: Record<string, string> = {
    fleet_manager: 'Fleet Manager',
    driver: 'Driver',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  }

  if (loading) {
    return (
      <div style={page}>
        <p style={{ color: colors.textMuted }}>Loading account...</p>
      </div>
    )
  }

  return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }} />
          <div style={{ flex: 1, maxWidth: '120px', borderTop: `1px dashed ${colors.border}` }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.border }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.text, letterSpacing: '-0.02em', margin: 0 }}>
            Account
          </h1>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <div style={card}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted, marginBottom: '0.25rem' }}>
              Name
            </div>
            <div style={{ color: colors.text, fontSize: '1rem' }}>{profile?.full_name || '—'}</div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted, marginBottom: '0.25rem' }}>
              Email
            </div>
            <div style={{ color: colors.text, fontSize: '1rem' }}>{email}</div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted, marginBottom: '0.25rem' }}>
              Role
            </div>
            <div style={{ color: colors.accent, fontSize: '1rem', fontWeight: 600 }}>
              {profile?.role ? roleLabels[profile.role] || profile.role : '—'}
            </div>
          </div>

          <button onClick={handleLogout} style={{ ...button, width: '100%' }}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}