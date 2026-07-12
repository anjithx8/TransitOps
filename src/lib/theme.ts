export const colors = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
  accent: '#f59e0b',
  accentHover: '#fbbf24',
  danger: '#f87171',
}

export const page: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.bg,
  padding: '2rem',
  color: colors.text,
  fontFamily: 'system-ui, sans-serif',
}

export const heading: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: colors.text,
  letterSpacing: '-0.02em',
  marginBottom: '1.5rem',
}

export const card: React.CSSProperties = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '1.5rem',
}

export const input: React.CSSProperties = {
  backgroundColor: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: '4px',
  padding: '0.5rem 0.75rem',
  color: colors.text,
  fontSize: '0.875rem',
  outline: 'none',
  marginRight: '0.5rem',
  marginBottom: '0.5rem',
}

export const select: React.CSSProperties = { ...input }

export const button: React.CSSProperties = {
  backgroundColor: colors.accent,
  color: colors.bg,
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
}

export const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
}

export const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.625rem 0.75rem',
  borderBottom: `2px solid ${colors.border}`,
  color: colors.textMuted,
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export const td: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  borderBottom: `1px solid ${colors.border}`,
  color: colors.text,
}

export const errorText: React.CSSProperties = {
  color: colors.danger,
  fontSize: '0.875rem',
  marginBottom: '1rem',
}

export const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: colors.textMuted,
  marginBottom: '0.25rem',
}