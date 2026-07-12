import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { page, heading, card, input, select as selectStyle, button, table, th, td, errorText } from '../lib/theme'

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

  const handleStatusChange = async (driverId: string, newStatus: string) => {
    setError('')
    const { error } = await supabase.from('drivers').update({ status: newStatus }).eq('id', driverId)
    if (error) setError(error.message)
    else fetchDrivers()
  }

  return (
    <div style={page}>
      <h1 style={heading}>Drivers</h1>

      <div style={card}>
        <form onSubmit={handleSubmit}>
          <input style={input} placeholder="Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={input} placeholder="License Number" value={form.license_number}
            onChange={e => setForm({ ...form, license_number: e.target.value })} required />
          <input style={input} placeholder="License Category" value={form.license_category}
            onChange={e => setForm({ ...form, license_category: e.target.value })} />
          <input style={input} placeholder="License Expiry" type="date" value={form.license_expiry_date}
            onChange={e => setForm({ ...form, license_expiry_date: e.target.value })} required />
          <input style={input} placeholder="Contact Number" value={form.contact_number}
            onChange={e => setForm({ ...form, contact_number: e.target.value })} />
          <button type="submit" style={button}>Add Driver</button>
        </form>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Name</th><th style={th}>License #</th><th style={th}>Category</th>
            <th style={th}>Expiry</th><th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(d => (
            <tr key={d.id}>
              <td style={td}>{d.name}</td>
              <td style={td}>{d.license_number}</td>
              <td style={td}>{d.license_category}</td>
              <td style={td}>{d.license_expiry_date}</td>
              <td style={td}>
                <select style={selectStyle} value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)}>
                  <option value="available">available</option>
                  <option value="on_trip">on_trip</option>
                  <option value="off_duty">off_duty</option>
                  <option value="suspended">suspended</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}