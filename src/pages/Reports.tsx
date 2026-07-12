import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

      const fuelCost = (fuelLogs || [])
        .filter(f => f.vehicle_id === v.id)
        .reduce((sum, f) => sum + Number(f.cost), 0)
      const expenseCost = (expenses || [])
        .filter(e => e.vehicle_id === v.id)
        .reduce((sum, e) => sum + Number(e.amount), 0)
      const operationalCost = fuelCost + expenseCost

      const revenue = Number(revenueInputs[v.id]) || 0
      const roi = v.acquisition_cost
        ? Number(((revenue - operationalCost) / v.acquisition_cost).toFixed(3))
        : null

      return { vehicle: v, totalDistance, totalFuel, fuelEfficiency, fuelCost, expenseCost, operationalCost, revenue, roi }
    })

    setRows(report)
    setLoading(false)
  }

  useEffect(() => { buildReport() }, [])

  const handleExportCsv = () => {
    const headers = ['Registration', 'Name', 'Distance (km)', 'Fuel (L)', 'Fuel Efficiency (km/L)', 'Fuel Cost', 'Other Expenses', 'Operational Cost', 'Revenue', 'ROI']
    const lines = rows.map(r => [
      r.vehicle.registration_number,
      r.vehicle.name,
      r.totalDistance,
      r.totalFuel,
      r.fuelEfficiency ?? 'N/A',
      r.fuelCost,
      r.expenseCost,
      r.operationalCost,
      r.revenue,
      r.roi ?? 'N/A',
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
    <div style={{ padding: '1.5rem' }}>
      <h1>Reports & Analytics</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <strong>Fleet Utilization: {fleetUtilization}%</strong>
      </div>

      {loading ? (
        <p>Loading report...</p>
      ) : (
        <>
          <table border={1} cellPadding={6} style={{ marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Distance (km)</th>
                <th>Fuel (L)</th>
                <th>Fuel Efficiency (km/L)</th>
                <th>Fuel Cost</th>
                <th>Other Expenses</th>
                <th>Operational Cost</th>
                <th>Revenue (enter)</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.vehicle.id}>
                  <td>{r.vehicle.registration_number}</td>
                  <td>{r.totalDistance}</td>
                  <td>{r.totalFuel}</td>
                  <td>{r.fuelEfficiency ?? 'N/A'}</td>
                  <td>{r.fuelCost}</td>
                  <td>{r.expenseCost}</td>
                  <td>{r.operationalCost}</td>
                  <td>
                    <input
                      type="number"
                      style={{ width: '80px' }}
                      placeholder="0"
                      value={revenueInputs[r.vehicle.id] || ''}
                      onChange={e => setRevenueInputs({ ...revenueInputs, [r.vehicle.id]: e.target.value })}
                    />
                  </td>
                  <td>{r.roi ?? 'N/A (no acquisition cost)'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={buildReport} style={{ marginRight: '0.5rem' }}>Recalculate with entered revenue</button>
          <button onClick={handleExportCsv}>Export CSV</button>
        </>
      )}
    </div>
  )
}