import { useMemo, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarX, TicketCheck } from "lucide-react"
import { cancelBooking, getBookings, queryKeys } from "../services/eventApi"

function MyBookings() {
  const loaderData = useLoaderData()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState("upcoming")

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings(filter),
    queryFn: getBookings,
    initialData: filter === "upcoming" ? loaderData.bookings : undefined,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
    enabled: Boolean(filter)
  })

  const bookings = useMemo(() => {
    const today = new Date()
    return (bookingsQuery.data || []).filter((booking) => {
      if (filter === "cancelled") return booking.status === "cancelled"
      if (filter === "past") return booking.status !== "cancelled" && new Date(booking.eventDate) < today
      return booking.status !== "cancelled" && new Date(booking.eventDate) >= today
    })
  }, [bookingsQuery.data, filter])

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onMutate: async (bookingId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings(filter) })
      const previousBookings = queryClient.getQueryData(queryKeys.bookings(filter))
      queryClient.setQueryData(queryKeys.bookings(filter), (old = []) =>
        old.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
        )
      )
      return { previousBookings }
    },
    onError: (_error, _bookingId, context) => {
      queryClient.setQueryData(queryKeys.bookings(filter), context.previousBookings)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    }
  })

  return (
    <section className="page-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">My Bookings</p>
          <h1>Tickets, status, and cancellations</h1>
        </div>
        <div className="segmented-control">
          {["upcoming", "past", "cancelled"].map((item) => (
            <button
              className={filter === item ? "active" : ""}
              key={item}
              type="button"
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {bookingsQuery.isLoading && <p className="status-text">Loading bookings...</p>}
      {bookingsQuery.isError && <p className="error-text">Could not load bookings.</p>}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article className="booking-card" key={booking.id}>
            <div className="booking-icon"><TicketCheck size={22} /></div>
            <div>
              <p className="eyebrow">{booking.referenceNumber}</p>
              <h2>{booking.eventTitle}</h2>
              <p>{new Date(booking.eventDate).toLocaleDateString()} - ${booking.totalAmount}</p>
              <div className="event-meta">
                {booking.tickets.map((ticket) => (
                  <span key={ticket.type}>{ticket.quantity} {ticket.type}</span>
                ))}
                <span className={`status-pill ${booking.status}`}>{booking.status}</span>
              </div>
            </div>
            {booking.status !== "cancelled" && (
              <button
                className="danger-button"
                type="button"
                onClick={() => cancelMutation.mutate(booking.id)}
              >
                <CalendarX size={17} /> Cancel
              </button>
            )}
          </article>
        ))}
      </div>

      {!bookings.length && !bookingsQuery.isLoading && (
        <div className="empty-state compact">
          <h3>No {filter} bookings yet.</h3>
          <p>Bookings will appear here as soon as the JSON server returns them.</p>
        </div>
      )}
    </section>
  )
}

export default MyBookings
