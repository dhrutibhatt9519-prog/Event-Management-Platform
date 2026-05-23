import { useEffect, useState } from "react"
import api from "../services/api"

function Home() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events")
        setEvents(response.data)
      } catch (error) {
        console.log(error)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Events
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="border rounded-xl overflow-hidden shadow"
          >
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-bold">
                {event.title}
              </h2>

              <p>{event.location}</p>

              <p>{event.date}</p>

              <button className="bg-black text-white px-4 py-2 rounded mt-4">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home