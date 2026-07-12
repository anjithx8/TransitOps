import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { colors } from './lib/theme'

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

function AccountMenu() {
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpen(false)
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
              onClick={handleLogout}
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
    </div>
  )
}

function App() {
  const navLinkStyle = { color: colors.textMuted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }

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

        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
          <Link to="/vehicles" style={navLinkStyle}>Vehicles</Link>
          <Link to="/drivers" style={navLinkStyle}>Drivers</Link>
          <Link to="/trips" style={navLinkStyle}>Trips</Link>
          <Link to="/maintenance" style={navLinkStyle}>Maintenance</Link>
          <Link to="/fuel-expenses" style={navLinkStyle}>Fuel & Expenses</Link>
          <Link to="/reports" style={navLinkStyle}>Reports</Link>
        </div>

        <AccountMenu />
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/fuel-expenses" element={<FuelExpenses />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App