import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { colors, page, heading, card, input, button, table, th, td, errorText } from '../lib/theme'

type Vehicle = {
  id: string
  registration_number: string
  name: string
  acquisition_cost: number | null
}

type ReportRow = {
  vehicle: Vehicle
  totalDistance: number
  totalFuel: number
  fuelEfficiency: number | null
  fuelCost: number
  expenseCost: number
  operationalCost: number
  revenue: number
  roi: number | null
}

const secondaryButton = {
  ...button,
  backgroundColor: 'transparent',
  border: `1px solid ${colors.border}`,
  color: colors.textMuted,
  marginLeft: '0.5rem',
}

export default function Reports() {
  const [rows, setRows] = useState<ReportRow[]>([])
  const [fleetUtilization, setFleetUtilization] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revenueInputs, setRevenueInputs] = useState<Record<string, string>>({})

  const buildReport = async () => {
    setLoading(true)
    setError('')

    const { data: vehicles, error: vErr } = await supabase.from('vehicles').select('*')
    if (vErr) { setError(vErr.message); setLoading(false); return }

    const { data: trips } = await supabase.from('trips').select('*').eq('status', 'completed')
    const { data: fuelLogs } = await supabase.from('fuel_logs').select('*')
    const { data: expenses } = await supabase.from('expenses').select('*')

    const allVehicles = vehicles || []
    const onTripCount = allVehicles.filter(v => v.status === 'on_trip').length
    const activeCount = allVehicles.filter(v => v.status !== 'retired').length
    setFleetUtilization(activeCount > 0 ? Math.round((onTripCount / activeCount) * 100) : 0)

    const report: ReportRow[] = allVehicles.map(v => {
      const vTrips = (trips || []).filter(t => t.vehicle_id === v.id)
      const totalDistance = vTrips.reduce((sum, t) => sum + (Number(t.planned_distance) || 0), 0)
      const totalFuel = vTrips.reduce((sum, t) => sum + (Number(t.fuel_consumed) || 0), 0)
      const fuelEfficiency = totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : null

      const fuelCost = (fuelLogs || []).filter(f => f.vehicle_id === v.id).reduce((sum, f) => sum + Number(f.cost), 0)
      const expenseCost = (expenses || []).filter(e => e.vehicle_id === v.id).reduce((sum, e) => sum + Number(e.amount), 0)
      const operationalCost = fuelCost + expenseCost

      const revenue = Number(revenueInputs[v.id]) || 0
      const roi = v.acquisition_cost ? Number(((revenue - operationalCost) / v.acquisition_cost).toFixed(3)) : null

      return { vehicle: v, totalDistance, totalFuel, fuelEfficiency, fuelCost, expenseCost, operationalCost, revenue, roi }
    })

    setRows(report)
    setLoading(false)
  }

  useEffect(() => { buildReport() }, [])

  const handleExportCsv = () => {
    const headers = ['Registration', 'Name', 'Distance (km)', 'Fuel (L)', 'Fuel Efficiency (km/L)', 'Fuel Cost', 'Other Expenses', 'Operational Cost', 'Revenue', 'ROI']
    const lines = rows.map(r => [
      r.vehicle.registration_number, r.vehicle.name, r.totalDistance, r.totalFuel,
      r.fuelEfficiency ?? 'N/A', r.fuelCost, r.expenseCost, r.operationalCost, r.revenue, r.roi ?? 'N/A',
    ].join(','))
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transitops_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={page}>
      <h1 style={heading}>Reports & Analytics</h1>
      {error && <p style={errorText}>{error}</p>}

      <div style={{ ...card, display: 'inline-block', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted, marginBottom: '0.5rem' }}>
          Fleet Utilization
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: colors.accent }}>{fleetUtilization}%</div>
      </div>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading report...</p>
      ) : (
        <>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Vehicle</th><th style={th}>Distance (km)</th><th style={th}>Fuel (L)</th>
                <th style={th}>Efficiency (km/L)</th><th style={th}>Fuel Cost</th><th style={th}>Other Expenses</th>
                <th style={th}>Operational Cost</th><th style={th}>Revenue</th><th style={th}>ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.vehicle.id}>
                  <td style={td}>{r.vehicle.registration_number}</td>
                  <td style={td}>{r.totalDistance}</td>
                  <td style={td}>{r.totalFuel}</td>
                  <td style={td}>{r.fuelEfficiency ?? 'N/A'}</td>
                  <td style={td}>{r.fuelCost}</td>
                  <td style={td}>{r.expenseCost}</td>
                  <td style={td}>{r.operationalCost}</td>
                  <td style={td}>
                    <input
                      type="number"
                      style={{ ...input, width: '80px', marginRight: 0, marginBottom: 0 }}
                      placeholder="0"
                      value={revenueInputs[r.vehicle.id] || ''}
                      onChange={e => setRevenueInputs({ ...revenueInputs, [r.vehicle.id]: e.target.value })}
                    />
                  </td>
                  <td style={td}>{r.roi ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem' }}>
            <button style={button} onClick={buildReport}>Recalculate</button>
            <button style={secondaryButton} onClick={handleExportCsv}>Export CSV</button>
          </div>
        </>
      )}
    </div>
  )
}