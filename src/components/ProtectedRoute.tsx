import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { colors, page } from '../lib/theme'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setChecked(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!checked) {
    return (
      <div style={page}>
        <p style={{ color: colors.textMuted }}>Checking session...</p>
      </div>
    )
  }

  if (!authed) return <Navigate to="/login" replace />

  return <>{children}</>
}