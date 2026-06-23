import { CalendarPlus, Moon, Sparkles, Sun, Ticket, UserRound } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useContext } from "react"
import { ThemeContext } from "../context/theme-context"
import { useAuth } from "../context/useAuth"

function Navbar() {
  const { darkMode, setDarkMode } = useContext(ThemeContext)
  const { user } = useAuth()

  return (
    <header className="site-header">
      <NavLink to="/" className="brand" aria-label="Eventure home">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>Eventure</span>
      </NavLink>

      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/">Events</NavLink>
        <NavLink to="/my-bookings"><Ticket size={17} /> My Bookings</NavLink>
        <NavLink to="/create-event"><CalendarPlus size={17} /> Create</NavLink>
        <NavLink to="/profile"><UserRound size={17} /> {user.name.split(" ")[0]}</NavLink>
      </nav>

      <button
        className="icon-button"
        type="button"
        aria-label="Toggle theme"
        onClick={() => setDarkMode((value) => !value)}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}

export default Navbar
