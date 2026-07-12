import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('fleet_manager')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    setLoading(false)
    if (error) {
      console.log('Full signup error:', error)
      setError(error.message || JSON.stringify(error))
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">{isSignup ? 'Sign Up' : 'Login'}</h1>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={isSignup ? handleSignup : handleLogin}>
        {isSignup && (
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="border p-2 w-full mb-2"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
          required
        />
        {isSignup && (
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="border p-2 w-full mb-4"
          >
            <option value="fleet_manager">Fleet Manager</option>
            <option value="driver">Driver</option>
            <option value="safety_officer">Safety Officer</option>
            <option value="financial_analyst">Financial Analyst</option>
          </select>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log in'}
        </button>
      </form>
      <button
        onClick={() => setIsSignup(!isSignup)}
        className="text-sm text-blue-600 mt-3 underline"
      >
        {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}