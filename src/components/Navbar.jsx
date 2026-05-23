import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex gap-6">
      <Link to="/">Events</Link>

      <Link to="/bookings">
        My Bookings
      </Link>
    </nav>
  )
}

export default Navbar