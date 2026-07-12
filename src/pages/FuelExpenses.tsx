import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
      .from('fuel_logs')
      .select('*, vehicles(registration_number, name)')
      .order('date', { ascending: false })
    setFuelLogs(fData || [])

    const { data: eData } = await supabase
      .from('expenses')
      .select('*, vehicles(registration_number, name)')
      .order('date', { ascending: false })
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

  // Per-vehicle total operational cost = sum of fuel costs + sum of expenses
  const costByVehicle = vehicles.map(v => {
    const fuelTotal = fuelLogs
      .filter(f => f.vehicle_id === v.id)
      .reduce((sum, f) => sum + Number(f.cost), 0)
    const expenseTotal = expenses
      .filter(e => e.vehicle_id === v.id)
      .reduce((sum, e) => sum + Number(e.amount), 0)
    return {
      vehicle: v,
      fuelTotal,
      expenseTotal,
      total: fuelTotal + expenseTotal,
    }
  })

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Fuel & Expenses</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Add Fuel Log</h3>
      <form onSubmit={handleAddFuel} style={{ marginBottom: '1.5rem' }}>
        <select value={fuelForm.vehicle_id} onChange={e => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })} required>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
          ))}
        </select>
        <input placeholder="Liters" type="number" value={fuelForm.liters}
          onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} required />
        <input placeholder="Cost" type="number" value={fuelForm.cost}
          onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} required />
        <input type="date" value={fuelForm.date}
          onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} required />
        <button type="submit">Add Fuel Log</button>
      </form>

      <h3>Fuel Logs</h3>
      {fuelLogs.length === 0 ? <p>No fuel logs yet</p> : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr><th>Vehicle</th><th>Liters</th><th>Cost</th><th>Date</th></tr>
          </thead>
          <tbody>
            {fuelLogs.map(f => (
              <tr key={f.id}>
                <td>{f.vehicles?.registration_number}</td>
                <td>{f.liters}</td>
                <td>{f.cost}</td>
                <td>{f.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '2rem' }}>Add Expense</h3>
      <form onSubmit={handleAddExpense} style={{ marginBottom: '1.5rem' }}>
        <select value={expenseForm.vehicle_id} onChange={e => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })} required>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
          ))}
        </select>
        <input placeholder="Type (e.g. toll, repair)" value={expenseForm.type}
          onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })} required />
        <input placeholder="Amount" type="number" value={expenseForm.amount}
          onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
        <input type="date" value={expenseForm.date}
          onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} required />
        <button type="submit">Add Expense</button>
      </form>

      <h3>Expenses</h3>
      {expenses.length === 0 ? <p>No expenses yet</p> : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr><th>Vehicle</th><th>Type</th><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.vehicles?.registration_number}</td>
                <td>{e.type}</td>
                <td>{e.amount}</td>
                <td>{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '2rem' }}>Total Operational Cost per Vehicle</h3>
      <table border={1} cellPadding={6}>
        <thead>
          <tr><th>Vehicle</th><th>Fuel Cost</th><th>Other Expenses</th><th>Total</th></tr>
        </thead>
        <tbody>
          {costByVehicle.map(c => (
            <tr key={c.vehicle.id}>
              <td>{c.vehicle.registration_number} — {c.vehicle.name}</td>
              <td>{c.fuelTotal.toFixed(2)}</td>
              <td>{c.expenseTotal.toFixed(2)}</td>
              <td><strong>{c.total.toFixed(2)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}