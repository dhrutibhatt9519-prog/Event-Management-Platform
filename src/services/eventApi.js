import api from "./api"

export const currentUserId = "user1"

export const queryKeys = {
  events: ["events"],
  event: (id) => ["events", id],
  bookings: (filter = "all") => ["bookings", currentUserId, filter],
  user: ["user", currentUserId],
  extras: (eventId) => ["events", eventId, "extras"]
}

export async function getEvents() {
  const { data } = await api.get("/events")
  return data
}

export async function getEvent(id) {
  const { data } = await api.get(`/events/${id}`)
  return data
}

export async function getUser() {
  const { data } = await api.get(`/users/${currentUserId}`)
  return data
}

export async function updateUser(partial) {
  const user = await getUser()
  const { data } = await api.patch(`/users/${currentUserId}`, {
    ...partial,
    preferences: {
      ...user.preferences,
      ...(partial.preferences || {})
    }
  })
  return data
}

export async function patchEvent(id, partial) {
  const { data } = await api.patch(`/events/${id}`, partial)
  return data
}

export async function getBookings() {
  const { data } = await api.get(`/bookings?userId=${currentUserId}`)
  return data
}

export async function createBooking(booking) {
  const { data } = await api.post("/bookings", booking)
  return data
}

export async function cancelBooking(id) {
  const { data } = await api.patch(`/bookings/${id}`, { status: "cancelled" })
  return data
}

export async function createEvent(event) {
  const { data } = await api.post("/events", event)
  return data
}

export async function getSlowEventExtras(eventId) {
  await new Promise((resolve) => setTimeout(resolve, 850))
  const events = await getEvents()
  return {
    reviews: [
      {
        id: "r1",
        author: "Maya Chen",
        rating: 5,
        quote: "Beautifully organized and packed with practical sessions."
      },
      {
        id: "r2",
        author: "Avery Singh",
        rating: 4,
        quote: "The venue flow and speaker lineup made the day feel effortless."
      }
    ],
    recommendations: events.filter((event) => event.id !== eventId).slice(0, 3)
  }
}
