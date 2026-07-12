import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Reports from './pages/Reports'
import { colors } from './lib/theme'

function App() {
  const navLinkStyle = {
    color: colors.textMuted,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
  }

  return (
    <BrowserRouter>
      <nav style={{
        display: 'flex', gap: '1.5rem', padding: '1rem 2rem',
        backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}`,
      }}>
        <Link to="/login" style={navLinkStyle}>Login</Link>
        <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
        <Link to="/vehicles" style={navLinkStyle}>Vehicles</Link>
        <Link to="/drivers" style={navLinkStyle}>Drivers</Link>
        <Link to="/trips" style={navLinkStyle}>Trips</Link>
        <Link to="/maintenance" style={navLinkStyle}>Maintenance</Link>
        <Link to="/fuel-expenses" style={navLinkStyle}>Fuel & Expenses</Link>
        <Link to="/reports" style={navLinkStyle}>Reports</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
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