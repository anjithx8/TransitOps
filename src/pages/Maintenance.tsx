
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

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
    console.log("vehicleId is:", vehicleId, "description is:", description)
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

    // Auto-transition: vehicle goes to in_shop
    await supabase
      .from("vehicles")
      .update({ status: "in_shop" })
      .eq("id", vehicleId)

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

    // Auto-transition: vehicle back to available, unless retired
    const vehicle = vehicles.find((v) => v.id === log.vehicle_id)
    if (vehicle && vehicle.status !== "retired") {
      await supabase
        .from("vehicles")
        .update({ status: "available" })
        .eq("id", log.vehicle_id)
    }

    await loadData()
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Maintenance</h1>

      <form onSubmit={handleCreate} className="border rounded p-4 mb-6 space-y-3">
        <h2 className="font-semibold">Create Maintenance Log</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="border p-2 w-full"
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
          className="border p-2 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Create Log"}
        </button>
      </form>

      <h2 className="font-semibold mb-2">Logs</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Vehicle</th>
            <th className="p-2">Description</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="p-2">{log.vehicles?.registration_number || log.vehicle_id}</td>
              <td className="p-2">{log.description}</td>
              <td className="p-2">{log.status}</td>
              <td className="p-2">{new Date(log.created_at).toLocaleDateString()}</td>
              <td className="p-2">
                {log.status === "open" && (
                  <button
                    onClick={() => handleClose(log)}
                    disabled={loading}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
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
