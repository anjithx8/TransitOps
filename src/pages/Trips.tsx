import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { colors, page, heading, card, input, select as selectStyle, button, table, th, td, errorText } from '../lib/theme'

type Vehicle = {
  id: string
  registration_number: string
  name: string
  max_load_capacity: number
  status: string
}

type Driver = {
  id: string
  name: string
  license_expiry_date: string
  status: string
}

type Trip = {
  id: string
  source: string
  destination: string
  vehicle_id: string
  driver_id: string
  cargo_weight: number
  planned_distance: number
  status: string
  actual_odometer: number | null
  fuel_consumed: number | null
  vehicles?: { registration_number: string; name: string }
  drivers?: { name: string }
}

const secondaryButton = {
  ...button,
  backgroundColor: 'transparent',
  border: `1px solid ${colors.border}`,
  color: colors.textMuted,
  marginLeft: '0.5rem',
}

const smallInput = { ...input, width: '110px', marginRight: '0.5rem' }

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    source: '', destination: '', vehicle_id: '', driver_id: '',
    cargo_weight: '', planned_distance: ''
  })
  const [completionInputs, setCompletionInputs] = useState<Record<string, { odometer: string; fuel: string }>>({})

  const fetchAll = async () => {
    const { data: tripsData, error: tripsErr } = await supabase
      .from('trips')
      .select('*, vehicles(registration_number, name), drivers(name)')
      .order('created_at', { ascending: false })
    if (tripsErr) setError(tripsErr.message)
    else setTrips(tripsData as any)

    const { data: vehicleData } = await supabase.from('vehicles').select('*').eq('status', 'available')
    setVehicles(vehicleData || [])

    const today = new Date().toISOString().split('T')[0]
    const { data: driverData } = await supabase
      .from('drivers').select('*').eq('status', 'available').gt('license_expiry_date', today)
    setDrivers(driverData || [])
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const vehicle = vehicles.find(v => v.id === form.vehicle_id)
    const cargoWeight = Number(form.cargo_weight)

    if (vehicle && cargoWeight > vehicle.max_load_capacity) {
      setError(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.max_load_capacity}kg)`)
      return
    }

    const { error } = await supabase.from('trips').insert({
      source: form.source,
      destination: form.destination,
      vehicle_id: form.vehicle_id,
      driver_id: form.driver_id,
      cargo_weight: cargoWeight,
      planned_distance: Number(form.planned_distance) || null,
      status: 'draft',
    })

    if (error) { setError(error.message); return }
    setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' })
    fetchAll()
  }

  const handleDispatch = async (trip: Trip) => {
    setError('')
    const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', trip.vehicle_id).single()
    const { data: driver } = await supabase.from('drivers').select('*').eq('id', trip.driver_id).single()

    if (!vehicle || vehicle.status !== 'available') { setError('Vehicle is no longer available for dispatch.'); fetchAll(); return }
    if (!driver || driver.status !== 'available') { setError('Driver is no longer available for dispatch.'); fetchAll(); return }
    const today = new Date().toISOString().split('T')[0]
    if (driver.license_expiry_date <= today) { setError('Driver license has expired — cannot dispatch.'); fetchAll(); return }
    if (trip.cargo_weight > vehicle.max_load_capacity) { setError('Cargo weight exceeds vehicle capacity — cannot dispatch.'); return }

    const { error: tripErr } = await supabase
      .from('trips').update({ status: 'dispatched', dispatched_at: new Date().toISOString() }).eq('id', trip.id)
    if (tripErr) { setError(tripErr.message); return }

    await supabase.from('vehicles').update({ status: 'on_trip' }).eq('id', trip.vehicle_id)
    await supabase.from('drivers').update({ status: 'on_trip' }).eq('id', trip.driver_id)
    fetchAll()
  }

  const handleComplete = async (trip: Trip) => {
    setError('')
    const inputs = completionInputs[trip.id]
    if (!inputs?.odometer || !inputs?.fuel) { setError('Enter final odometer and fuel consumed before completing.'); return }

    const { error: tripErr } = await supabase
      .from('trips')
      .update({
        status: 'completed',
        actual_odometer: Number(inputs.odometer),
        fuel_consumed: Number(inputs.fuel),
        completed_at: new Date().toISOString(),
      })
      .eq('id', trip.id)
    if (tripErr) { setError(tripErr.message); return }

    await supabase.from('vehicles').update({ status: 'available', odometer: Number(inputs.odometer) }).eq('id', trip.vehicle_id)
    await supabase.from('drivers').update({ status: 'available' }).eq('id', trip.driver_id)
    fetchAll()
  }

  const handleCancel = async (trip: Trip) => {
    setError('')
    const { error: tripErr } = await supabase.from('trips').update({ status: 'cancelled' }).eq('id', trip.id)
    if (tripErr) { setError(tripErr.message); return }

    if (trip.status === 'dispatched') {
      await supabase.from('vehicles').update({ status: 'available' }).eq('id', trip.vehicle_id)
      await supabase.from('drivers').update({ status: 'available' }).eq('id', trip.driver_id)
    }
    fetchAll()
  }

  return (
    <div style={page}>
      <h1 style={heading}>Trips</h1>

      <div style={card}>
        <form onSubmit={handleCreateTrip}>
          <input style={input} placeholder="Source" value={form.source}
            onChange={e => setForm({ ...form, source: e.target.value })} required />
          <input style={input} placeholder="Destination" value={form.destination}
            onChange={e => setForm({ ...form, destination: e.target.value })} required />

          <select style={selectStyle} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registration_number} — {v.name} (max {v.max_load_capacity}kg)</option>
            ))}
          </select>

          <select style={selectStyle} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} required>
            <option value="">Select Driver</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <input style={input} placeholder="Cargo Weight (kg)" type="number" value={form.cargo_weight}
            onChange={e => setForm({ ...form, cargo_weight: e.target.value })} required />
          <input style={input} placeholder="Planned Distance (km)" type="number" value={form.planned_distance}
            onChange={e => setForm({ ...form, planned_distance: e.target.value })} />

          <button type="submit" style={button}>Create Trip (Draft)</button>
        </form>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Source</th><th style={th}>Destination</th><th style={th}>Vehicle</th>
            <th style={th}>Driver</th><th style={th}>Cargo</th><th style={th}>Status</th><th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(t => (
            <tr key={t.id}>
              <td style={td}>{t.source}</td>
              <td style={td}>{t.destination}</td>
              <td style={td}>{t.vehicles?.registration_number}</td>
              <td style={td}>{t.drivers?.name}</td>
              <td style={td}>{t.cargo_weight}kg</td>
              <td style={td}>{t.status}</td>
              <td style={td}>
                {t.status === 'draft' && (
                  <>
                    <button style={button} onClick={() => handleDispatch(t)}>Dispatch</button>
                    <button style={secondaryButton} onClick={() => handleCancel(t)}>Cancel</button>
                  </>
                )}
                {t.status === 'dispatched' && (
                  <>
                    <input style={smallInput} placeholder="Final odometer" type="number"
                      onChange={e => setCompletionInputs({ ...completionInputs, [t.id]: { ...completionInputs[t.id], odometer: e.target.value } })} />
                    <input style={smallInput} placeholder="Fuel used (L)" type="number"
                      onChange={e => setCompletionInputs({ ...completionInputs, [t.id]: { ...completionInputs[t.id], fuel: e.target.value } })} />
                    <button style={button} onClick={() => handleComplete(t)}>Complete</button>
                    <button style={secondaryButton} onClick={() => handleCancel(t)}>Cancel</button>
                  </>
                )}
                {(t.status === 'completed' || t.status === 'cancelled') && <em style={{ color: colors.textFaint }}>—</em>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}