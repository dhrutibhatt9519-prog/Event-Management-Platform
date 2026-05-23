import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import EventDetails from "./pages/EventDetails"
import MyBookings from "./pages/MyBookings"
import Navbar from "./components/Navbar"

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/bookings" element={<MyBookings />} />
      </Routes>
    </>
  )
}

export default App