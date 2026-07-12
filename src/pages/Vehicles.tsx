import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { page, heading, card, input, select as selectStyle, button, table, th, td, errorText } from '../lib/theme'

type Vehicle = {
  id: string
  registration_number: string
  name: string
  type: string
  max_load_capacity: number
  status: string
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState({
    registration_number: '', name: '', type: '', max_load_capacity: '', acquisition_cost: ''
  })
  const [error, setError] = useState('')

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setVehicles(data)
  }

  useEffect(() => { fetchVehicles() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('vehicles').insert({
      registration_number: form.registration_number,
      name: form.name,
      type: form.type,
      max_load_capacity: Number(form.max_load_capacity),
      acquisition_cost: Number(form.acquisition_cost) || null,
    })
    if (error) { setError(error.message); return }
    setForm({ registration_number: '', name: '', type: '', max_load_capacity: '', acquisition_cost: '' })
    fetchVehicles()
  }

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    setError('')
    const { error } = await supabase.from('vehicles').update({ status: newStatus }).eq('id', vehicleId)
    if (error) setError(error.message)
    else fetchVehicles()
  }

  return (
    <div style={page}>
      <h1 style={heading}>Vehicles</h1>

      <div style={card}>
        <form onSubmit={handleSubmit}>
          <input style={input} placeholder="Registration Number" value={form.registration_number}
            onChange={e => setForm({ ...form, registration_number: e.target.value })} required />
          <input style={input} placeholder="Name / Model" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={input} placeholder="Type" value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })} />
          <input style={input} placeholder="Max Load Capacity (kg)" type="number" value={form.max_load_capacity}
            onChange={e => setForm({ ...form, max_load_capacity: e.target.value })} required />
          <input style={input} placeholder="Acquisition Cost" type="number" value={form.acquisition_cost}
            onChange={e => setForm({ ...form, acquisition_cost: e.target.value })} />
          <button type="submit" style={button}>Add Vehicle</button>
        </form>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Reg. Number</th><th style={th}>Name</th><th style={th}>Type</th>
            <th style={th}>Capacity</th><th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td style={td}>{v.registration_number}</td>
              <td style={td}>{v.name}</td>
              <td style={td}>{v.type}</td>
              <td style={td}>{v.max_load_capacity} kg</td>
              <td style={td}>
                <select style={selectStyle} value={v.status} onChange={e => handleStatusChange(v.id, e.target.value)}>
                  <option value="available">available</option>
                  <option value="on_trip">on_trip</option>
                  <option value="in_shop">in_shop</option>
                  <option value="retired">retired</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}