import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
    if (error) {
      // unique constraint violation on registration_number lands here
      setError(error.message)
      return
    }
    setForm({ registration_number: '', name: '', type: '', max_load_capacity: '', acquisition_cost: '' })
    fetchVehicles()
  }

  return (
    <div>
      <h1>Vehicles</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Registration Number" value={form.registration_number}
          onChange={e => setForm({ ...form, registration_number: e.target.value })} required />
        <input placeholder="Name / Model" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Type" value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })} />
        <input placeholder="Max Load Capacity (kg)" type="number" value={form.max_load_capacity}
          onChange={e => setForm({ ...form, max_load_capacity: e.target.value })} required />
        <input placeholder="Acquisition Cost" type="number" value={form.acquisition_cost}
          onChange={e => setForm({ ...form, acquisition_cost: e.target.value })} />
        <button type="submit">Add Vehicle</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table>
        <thead>
          <tr><th>Reg. Number</th><th>Name</th><th>Type</th><th>Capacity</th><th>Status</th></tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td>{v.registration_number}</td><td>{v.name}</td><td>{v.type}</td>
              <td>{v.max_load_capacity} kg</td><td>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}