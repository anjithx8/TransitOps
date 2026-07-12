import { colors, page, card, input, button, label } from '../lib/theme'

export default function Login() {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={label}>Email</label>
              <input type="email" placeholder="you@fleet.com" style={{ ...input, width: '100%', boxSizing: 'border-box', marginRight: 0 }} />
            </div>
            <div>
              <label style={label}>Password</label>
              <input type="password" placeholder="••••••••" style={{ ...input, width: '100%', boxSizing: 'border-box', marginRight: 0 }} />
            </div>
            <button style={{ ...button, width: '100%' }}>Log in</button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: colors.textFaint, fontSize: '0.75rem', marginTop: '1.5rem', fontFamily: 'monospace' }}>
          Fleet Manager · Driver · Safety Officer · Financial Analyst
        </p>
      </div>
    </div>
  )
}