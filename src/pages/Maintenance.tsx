import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { colors, page, heading, card, select as selectStyle, button, table, th, td, errorText } from "../lib/theme"

type Vehicle = {
  id: string
  registration_number: string
  name: string
  status: string
}

type MaintenanceLog = {
  id: string
  vehicle_id: string
  description: string
  status: string
  created_at: string
  closed_at: string | null
  vehicles?: Vehicle
}

const textarea = {
  backgroundColor: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: '4px',
  padding: '0.5rem 0.75rem',
  color: colors.text,
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  resize: 'vertical' as const,
  marginBottom: '0.75rem',
}

const closeButton = {
  ...button,
  backgroundColor: '#22c55e',
  color: '#0f172a',
  padding: '0.375rem 0.75rem',
  fontSize: '0.75rem',
}

export default function Maintenance() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [vehicleId, setVehicleId] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadData() {
    const { data: vData } = await supabase.from("vehicles").select("*")
    setVehicles(vData || [])

    const { data: lData } = await supabase
      .from("maintenance_logs")
      .select("*, vehicles(id, registration_number, name, status)")
      .order("created_at", { ascending: false })
    setLogs(lData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!vehicleId || !description) {
      setError("Vehicle and description are required")
      return
    }
    setLoading(true)

    const { error: insertError } = await supabase.from("maintenance_logs").insert({
      vehicle_id: vehicleId,
      description,
      status: "open",
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    await supabase.from("vehicles").update({ status: "in_shop" }).eq("id", vehicleId)

    setDescription("")
    setVehicleId("")
    await loadData()
    setLoading(false)
  }

  async function handleClose(log: MaintenanceLog) {
    setLoading(true)

    await supabase
      .from("maintenance_logs")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", log.id)

    const vehicle = vehicles.find((v) => v.id === log.vehicle_id)
    if (vehicle && vehicle.status !== "retired") {
      await supabase.from("vehicles").update({ status: "available" }).eq("id", log.vehicle_id)
    }

    await loadData()
    setLoading(false)
  }

  return (
    <div style={page}>
      <h1 style={heading}>Maintenance</h1>

      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.text, marginBottom: '0.75rem' }}>
          Create Maintenance Log
        </h2>
        <form onSubmit={handleCreate}>
          {error && <p style={errorText}>{error}</p>}
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            style={{ ...selectStyle, width: '100%', marginBottom: '0.75rem' }}
          >
            <option value="">Select vehicle</option>
            {vehicles
              .filter((v) => v.status !== "in_shop")
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration_number} — {v.name}
                </option>
              ))}
          </select>
          <textarea
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={textarea}
          />
          <button type="submit" disabled={loading} style={button}>
            {loading ? "Saving..." : "Create Log"}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.text, marginBottom: '0.75rem' }}>Logs</h2>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Vehicle</th>
            <th style={th}>Description</th>
            <th style={th}>Status</th>
            <th style={th}>Created</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={td}>{log.vehicles?.registration_number || log.vehicle_id}</td>
              <td style={td}>{log.description}</td>
              <td style={td}>{log.status}</td>
              <td style={td}>{new Date(log.created_at).toLocaleDateString()}</td>
              <td style={td}>
                {log.status === "open" && (
                  <button onClick={() => handleClose(log)} disabled={loading} style={closeButton}>
                    Close
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}