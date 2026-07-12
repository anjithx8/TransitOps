import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Driver = {
  id: string
  name: string
  license_number: string
  license_category: string
  license_expiry_date: string
  status: string
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [form, setForm] = useState({
    name: '', license_number: '', license_category: '', license_expiry_date: '', contact_number: ''
  })
  const [error, setError] = useState('')

  const fetchDrivers = async () => {
    const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setDrivers(data)
  }

  useEffect(() => { fetchDrivers() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('drivers').insert({
      name: form.name,
      license_number: form.license_number,
      license_category: form.license_category,
      license_expiry_date: form.license_expiry_date,
      contact_number: form.contact_number,
    })
    if (error) { setError(error.message); return }
    setForm({ name: '', license_number: '', license_category: '', license_expiry_date: '', contact_number: '' })
    fetchDrivers()
  }

  return (
    <div>
      <h1>Drivers</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="License Number" value={form.license_number}
          onChange={e => setForm({ ...form, license_number: e.target.value })} required />
        <input placeholder="License Category" value={form.license_category}
          onChange={e => setForm({ ...form, license_category: e.target.value })} />
        <input placeholder="License Expiry" type="date" value={form.license_expiry_date}
          onChange={e => setForm({ ...form, license_expiry_date: e.target.value })} required />
        <input placeholder="Contact Number" value={form.contact_number}
          onChange={e => setForm({ ...form, contact_number: e.target.value })} />
        <button type="submit">Add Driver</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table>
        <thead>
          <tr><th>Name</th><th>License #</th><th>Category</th><th>Expiry</th><th>Status</th></tr>
        </thead>
        <tbody>
          {drivers.map(d => (
            <tr key={d.id}>
              <td>{d.name}</td><td>{d.license_number}</td><td>{d.license_category}</td>
              <td>{d.license_expiry_date}</td><td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}