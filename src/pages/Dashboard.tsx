import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { colors, page, heading, card, button } from '../lib/theme'

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    inMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchKpis = async () => {
    setLoading(true)

    const { data: vehicles } = await supabase.from('vehicles').select('status')
    const { data: trips } = await supabase.from('trips').select('status')
    const { data: drivers } = await supabase.from('drivers').select('status')

    const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0
    const onTripVehicles = vehicles?.filter(v => v.status === 'on_trip').length || 0
    const inMaintenance = vehicles?.filter(v => v.status === 'in_shop').length || 0
    const activeVehicles = vehicles?.filter(v => v.status !== 'retired').length || 0

    const activeTrips = trips?.filter(t => t.status === 'dispatched').length || 0
    const pendingTrips = trips?.filter(t => t.status === 'draft').length || 0

    const driversOnDuty = drivers?.filter(d => d.status === 'on_trip' || d.status === 'available').length || 0

    const fleetUtilization = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0

    setKpis({ activeVehicles, availableVehicles, inMaintenance, activeTrips, pendingTrips, driversOnDuty, fleetUtilization })
    setLoading(false)
  }

  useEffect(() => { fetchKpis() }, [])

  const kpiCards = [
    { label: 'Active Vehicles', value: kpis.activeVehicles },
    { label: 'Available', value: kpis.availableVehicles },
    { label: 'In Maintenance', value: kpis.inMaintenance },
    { label: 'Active Trips', value: kpis.activeTrips },
    { label: 'Pending Trips', value: kpis.pendingTrips },
    { label: 'Drivers On Duty', value: kpis.driversOnDuty },
    { label: 'Fleet Utilization %', value: `${kpis.fleetUtilization}%` },
  ]

  return (
    <div style={page}>
      <h1 style={heading}>Dashboard</h1>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading live data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {kpiCards.map(k => (
            <div key={k.label} style={card}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted, marginBottom: '0.5rem' }}>
                {k.label}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: colors.text }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchKpis} style={{ ...button, marginTop: '1rem' }}>Refresh</button>
    </div>
  )
}