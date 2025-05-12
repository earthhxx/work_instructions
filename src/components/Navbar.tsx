import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed min-w-screen bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">MyApp</div>
        <div className="flex flex-row gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/RegisterDC" className="hover:underline">Products</Link>
          <Link to="/reports" className="hover:underline">Reports</Link>
          <Link to="/settings" className="hover:underline">Settings</Link>
        </div>
      </div>
    </nav>
  )
}
