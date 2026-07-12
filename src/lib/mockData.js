export const mockVehicles = [
  { id: 1, registration_number: "KA01AB1234", name: "Truck 1", type: "truck",
    max_load_capacity: 5000, odometer: 12000, acquisition_cost: 800000, status: "available" },
  { id: 2, registration_number: "KA01AB5678", name: "Van 1", type: "van",
    max_load_capacity: 1500, odometer: 8000, acquisition_cost: 400000, status: "on_trip" },
  { id: 3, registration_number: "KA01AB9012", name: "Truck 2", type: "truck",
    max_load_capacity: 6000, odometer: 25000, acquisition_cost: 900000, status: "in_shop" },
];

export const mockDrivers = [
  { id: 1, name: "Ravi Kumar", license_number: "DL123", license_category: "HMV",
    license_expiry_date: "2027-01-01", contact_number: "9999999999",
    safety_score: 85, status: "available" },
  { id: 2, name: "Suresh Babu", license_number: "DL456", license_category: "LMV",
    license_expiry_date: "2026-12-01", contact_number: "9888888888",
    safety_score: 92, status: "on_trip" },
  { id: 3, name: "Anil Sharma", license_number: "DL789", license_category: "HMV",
    license_expiry_date: "2025-01-01", contact_number: "9777777777",
    safety_score: 60, status: "suspended" },
];

export const mockTrips = [];
export const mockMaintenanceLogs = [];
export const mockFuelLogs = [];
export const mockExpenses = [];