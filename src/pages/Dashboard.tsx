export default function Dashboard() {
  const kpis = [
    { label: "Active Vehicles", value: 12 },
    { label: "Available", value: 8 },
    { label: "In Maintenance", value: 2 },
    { label: "Active Trips", value: 4 },
    { label: "Pending Trips", value: 3 },
    { label: "Drivers On Duty", value: 6 },
    { label: "Fleet Utilization %", value: "67%" },
  ]
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {kpis.map(k => (
        <div key={k.label} className="border rounded p-4">
          <div className="text-sm text-gray-500">{k.label}</div>
          <div className="text-2xl font-bold">{k.value}</div>
        </div>
      ))}
    </div>
  )
}