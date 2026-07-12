import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { colors, page, heading, card, input, select as selectStyle, button, table, th, td, errorText } from '../lib/theme'

type Vehicle = {
  id: string
  registration_number: string
  name: string
}

type FuelLog = {
  id: string
  vehicle_id: string
  liters: number
  cost: number
  date: string
  vehicles?: { registration_number: string; name: string }
}

type Expense = {
  id: string
  vehicle_id: string
  type: string
  amount: number
  date: string
  vehicles?: { registration_number: string; name: string }
}

const subheading = { fontSize: '1rem', fontWeight: 600, color: colors.text, marginTop: '2rem', marginBottom: '0.75rem' }

export default function FuelExpenses() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [error, setError] = useState('')

  const [fuelForm, setFuelForm] = useState({ vehicle_id: '', liters: '', cost: '', date: '' })
  const [expenseForm, setExpenseForm] = useState({ vehicle_id: '', type: '', amount: '', date: '' })

  const fetchAll = async () => {
    const { data: vData } = await supabase.from('vehicles').select('id, registration_number, name')
    setVehicles(vData || [])

    const { data: fData } = await supabase
      .from('fuel_logs').select('*, vehicles(registration_number, name)').order('date', { ascending: false })
    setFuelLogs(fData || [])

    const { data: eData } = await supabase
      .from('expenses').select('*, vehicles(registration_number, name)').order('date', { ascending: false })
    setExpenses(eData || [])
  }

  useEffect(() => { fetchAll() }, [])

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!fuelForm.vehicle_id || !fuelForm.liters || !fuelForm.cost || !fuelForm.date) {
      setError('Fill all fuel log fields.')
      return
    }
    const { error: insertError } = await supabase.from('fuel_logs').insert({
      vehicle_id: fuelForm.vehicle_id,
      liters: Number(fuelForm.liters),
      cost: Number(fuelForm.cost),
      date: fuelForm.date,
    })
    if (insertError) { setError(insertError.message); return }
    setFuelForm({ vehicle_id: '', liters: '', cost: '', date: '' })
    fetchAll()
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!expenseForm.vehicle_id || !expenseForm.type || !expenseForm.amount || !expenseForm.date) {
      setError('Fill all expense fields.')
      return
    }
    const { error: insertError } = await supabase.from('expenses').insert({
      vehicle_id: expenseForm.vehicle_id,
      type: expenseForm.type,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
    })
    if (insertError) { setError(insertError.message); return }
    setExpenseForm({ vehicle_id: '', type: '', amount: '', date: '' })
    fetchAll()
  }

  const costByVehicle = vehicles.map(v => {
    const fuelTotal = fuelLogs.filter(f => f.vehicle_id === v.id).reduce((sum, f) => sum + Number(f.cost), 0)
    const expenseTotal = expenses.filter(e => e.vehicle_id === v.id).reduce((sum, e) => sum + Number(e.amount), 0)
    return { vehicle: v, fuelTotal, expenseTotal, total: fuelTotal + expenseTotal }
  })

  return (
    <div style={page}>
      <h1 style={heading}>Fuel & Expenses</h1>
      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: colors.text, marginBottom: '0.75rem' }}>Add Fuel Log</h3>
        <form onSubmit={handleAddFuel}>
          <select style={selectStyle} value={fuelForm.vehicle_id} onChange={e => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
          </select>
          <input style={input} placeholder="Liters" type="number" value={fuelForm.liters}
            onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} required />
          <input style={input} placeholder="Cost" type="number" value={fuelForm.cost}
            onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} required />
          <input style={input} type="date" value={fuelForm.date}
            onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} required />
          <button type="submit" style={button}>Add Fuel Log</button>
        </form>
      </div>

      {fuelLogs.length === 0 ? (
        <p style={{ color: colors.textMuted }}>No fuel logs yet</p>
      ) : (
        <table style={table}>
          <thead><tr><th style={th}>Vehicle</th><th style={th}>Liters</th><th style={th}>Cost</th><th style={th}>Date</th></tr></thead>
          <tbody>
            {fuelLogs.map(f => (
              <tr key={f.id}>
                <td style={td}>{f.vehicles?.registration_number}</td>
                <td style={td}>{f.liters}</td>
                <td style={td}>{f.cost}</td>
                <td style={td}>{f.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={subheading}>Add Expense</h3>
      <div style={card}>
        <form onSubmit={handleAddExpense}>
          <select style={selectStyle} value={expenseForm.vehicle_id} onChange={e => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })} required>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
          </select>
          <input style={input} placeholder="Type (e.g. toll, repair)" value={expenseForm.type}
            onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })} required />
          <input style={input} placeholder="Amount" type="number" value={expenseForm.amount}
            onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
          <input style={input} type="date" value={expenseForm.date}
            onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} required />
          <button type="submit" style={button}>Add Expense</button>
        </form>
      </div>

      {expenses.length === 0 ? (
        <p style={{ color: colors.textMuted }}>No expenses yet</p>
      ) : (
        <table style={table}>
          <thead><tr><th style={th}>Vehicle</th><th style={th}>Type</th><th style={th}>Amount</th><th style={th}>Date</th></tr></thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td style={td}>{e.vehicles?.registration_number}</td>
                <td style={td}>{e.type}</td>
                <td style={td}>{e.amount}</td>
                <td style={td}>{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={subheading}>Total Operational Cost per Vehicle</h3>
      <table style={table}>
        <thead><tr><th style={th}>Vehicle</th><th style={th}>Fuel Cost</th><th style={th}>Other Expenses</th><th style={th}>Total</th></tr></thead>
        <tbody>
          {costByVehicle.map(c => (
            <tr key={c.vehicle.id}>
              <td style={td}>{c.vehicle.registration_number} — {c.vehicle.name}</td>
              <td style={td}>{c.fuelTotal.toFixed(2)}</td>
              <td style={td}>{c.expenseTotal.toFixed(2)}</td>
              <td style={{ ...td, fontWeight: 700, color: colors.accent }}>{c.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}