export default function Login() {
  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input type="email" placeholder="Email" className="border p-2 w-full mb-2" />
      <input type="password" placeholder="Password" className="border p-2 w-full mb-4" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Log in</button>
    </div>
  )
}