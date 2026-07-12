import { Link } from 'react-router-dom'
import { colors, page, card } from '../lib/theme'

const sections = [
  { to: '/dashboard', label: 'Dashboard', desc: 'Live fleet KPIs and utilization' },
  { to: '/vehicles', label: 'Vehicles', desc: 'Registry and status management' },
  { to: '/drivers', label: 'Drivers', desc: 'Licenses, status, and safety scores' },
  { to: '/trips', label: 'Trips', desc: 'Dispatch, tracking, and completion' },
  { to: '/maintenance', label: 'Maintenance', desc: 'Repair logs and vehicle downtime' },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', desc: 'Cost tracking per vehicle' },
  { to: '/reports', label: 'Reports', desc: 'Efficiency, ROI, and CSV export' },
]

export default function Home() {
  return (
    <div style={{ ...page, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }} />
        <div style={{ width: '120px', borderTop: `1px dashed ${colors.border}` }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.border }} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: colors.text, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
        TransitOps
      </h1>
      <p style={{ color: colors.textFaint, fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
        Smart Transport Operations Platform
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%', maxWidth: '900px' }}>
        {sections.map(s => (
          <Link key={s.to} to={s.to} style={{ textDecoration: 'none' }}>
            <div style={{ ...card, marginBottom: 0, transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: colors.text, marginBottom: '0.25rem' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>
                {s.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}