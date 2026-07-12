import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { colors } from './lib/theme'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Account from './pages/Account'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Reports from './pages/Reports'

function NavLinks() {
  const location = useLocation()

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/drivers', label: 'Drivers' },
    { to: '/trips', label: 'Trips' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/fuel-expenses', label: 'Fuel & Expenses' },
    { to: '/reports', label: 'Reports' },
  ]

  return (
    <div style={{ display: 'flex', gap: '1.25rem' }}>
      {links.map(l => {
        const active = location.pathname === l.to
        return (
          <Link
            key={l.to}
            to={l.to}
            style={{
              color: active ? colors.accent : colors.textMuted,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 500,
              borderBottom: active ? `2px solid ${colors.accent}` : '2px solid transparent',
              paddingBottom: '0.25rem',
            }}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}

function AccountMenu() {
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email || null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const requestLogout = () => {
    setOpen(false)
    setConfirmingLogout(true)
  }

  const confirmLogout = async () => {
    await supabase.auth.signOut()
    setConfirmingLogout(false)
    navigate('/login')
  }

  if (!email) {
    return (
      <Link to="/login" style={{ color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
        Login
      </Link>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: `1px solid ${colors.border}`, borderRadius: '6px',
          padding: '0.4rem 0.75rem', color: colors.text, fontSize: '0.8125rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}
      >
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%', backgroundColor: colors.accent,
          color: colors.bg, fontSize: '0.6875rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {email.charAt(0).toUpperCase()}
        </div>
        {email}
        <span style={{ fontSize: '0.625rem', color: colors.textFaint }}>▾</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 20,
            backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: '8px', minWidth: '160px', overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '0.625rem 0.875rem', color: colors.text,
                fontSize: '0.8125rem', textDecoration: 'none', borderBottom: `1px solid ${colors.border}`,
              }}
            >
              Account details
            </Link>
            <button
              onClick={requestLogout}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem',
                background: 'none', border: 'none', color: '#f87171', fontSize: '0.8125rem', cursor: 'pointer',
              }}
            >
              Log out
            </button>
          </div>
        </>
      )}

      {confirmingLogout && (
        <div
          onClick={() => setConfirmingLogout(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
              borderRadius: '10px', padding: '1.5rem', maxWidth: '320px', width: '90%',
            }}
          >
            <h3 style={{ color: colors.text, fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Log out?
            </h3>
            <p style={{ color: colors.textMuted, fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
              You'll need to log back in to access the fleet dashboard.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmingLogout(false)}
                style={{
                  background: 'none', border: `1px solid ${colors.border}`, borderRadius: '6px',
                  padding: '0.5rem 1rem', color: colors.textMuted, fontSize: '0.8125rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  backgroundColor: '#f87171', border: 'none', borderRadius: '6px',
                  padding: '0.5rem 1rem', color: colors.bg, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 2rem', backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}`,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.accent }} />
          <span style={{ color: colors.text, fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
            TransitOps
          </span>
        </Link>

        <NavLinks />

        <AccountMenu />
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/fuel-expenses" element={<ProtectedRoute><FuelExpenses /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App