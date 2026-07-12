import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/vehicles">Vehicles</Link> | <Link to="/drivers">Drivers</Link>
      </nav>
      <Routes>
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App