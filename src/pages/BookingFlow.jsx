import { useId, useMemo, useOptimistic, useReducer, useState } from "react"
import { Link, useLoaderData, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { createBooking, currentUserId, queryKeys } from "../services/eventApi"
import { useAuth } from "../context/useAuth"

const initialState = {
  step: 1,
  quantities: {},
  attendee: { name: "", email: "", phone: "" }
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_QUANTITY":
      return {
        ...state,
        quantities: {
          ...state.quantities,
          [action.ticketId]: Math.max(0, Number(action.quantity))
        }
      }
    case "SET_ATTENDEE":
      return {
        ...state,
        attendee: {
          ...state.attendee,
          [action.field]: action.value
        }
      }
    case "NEXT":
      return { ...state, step: Math.min(3, state.step + 1) }
    case "BACK":
      return { ...state, step: Math.max(1, state.step - 1) }
    default:
      return state
  }
}

function BookingFlow() {
  const { event } = useLoaderData()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fieldId = useId()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [formError, setFormError] = useState("")
  const [optimisticStatus, setOptimisticStatus] = useOptimistic("idle", (_state, value) => value)

  const selectedTickets = useMemo(() =>
    event.ticketTypes
      .map((ticket) => ({
        ...ticket,
        quantity: Number(state.quantities[ticket.id] || 0)
      }))
      .filter((ticket) => ticket.quantity > 0),
  [event.ticketTypes, state.quantities])

  const total = selectedTickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onMutate: async (booking) => {
      setOptimisticStatus("confirmed")
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings("all") })
      const previousBookings = queryClient.getQueryData(queryKeys.bookings("all")) || []
      queryClient.setQueryData(queryKeys.bookings("all"), [
        { ...booking, id: "optimistic-booking", optimistic: true },
        ...previousBookings
      ])
      return { previousBookings }
    },
    onError: (_error, _booking, context) => {
      setOptimisticStatus("failed")
      queryClient.setQueryData(queryKeys.bookings("all"), context.previousBookings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("all") })
      setTimeout(() => navigate("/my-bookings"), 650)
    }
  })

  const canContinue = () => {
    if (state.step === 1 && !selectedTickets.length) {
      setFormError("Choose at least one ticket to continue.")
      return false
    }
    if (state.step === 2) {
      const { name, email, phone } = state.attendee
      if (!name.trim() || !email.includes("@") || phone.trim().length < 7) {
        setFormError("Enter a valid name, email, and phone number.")
        return false
      }
    }
    setFormError("")
    return true
  }

  const next = () => {
    if (canContinue()) {
      dispatch({ type: "NEXT" })
    }
  }

  const submitBooking = () => {
    if (!canContinue()) return

    bookingMutation.mutate({
      userId: currentUserId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      tickets: selectedTickets.map((ticket) => ({
        type: ticket.name,
        quantity: ticket.quantity,
        price: ticket.price
      })),
      attendees: [state.attendee],
      totalAmount: total,
      status: "confirmed",
      bookingDate: new Date().toISOString(),
      referenceNumber: `BK${Math.floor(100000 + Math.random() * 900000)}`
    })
  }

  return (
    <section className="page-shell narrow-page">
      <Link className="text-link" to={`/events/${event.id}`}>Back to event</Link>
      <div className="wizard-header">
        <div>
          <p className="eyebrow">Booking Flow</p>
          <h1>{event.title}</h1>
        </div>
        <span>${total}</span>
      </div>

      <div className="progress-track">
        {["Tickets", "Attendee", "Confirm"].map((label, index) => (
          <span className={state.step >= index + 1 ? "active" : ""} key={label}>{label}</span>
        ))}
      </div>

      <div className="panel wizard-panel">
        {state.step === 1 && (
          <div className="ticket-list">
            {event.ticketTypes.map((ticket) => (
              <label className="ticket-row selectable" key={ticket.id}>
                <div>
                  <strong>{ticket.name}</strong>
                  <span>${ticket.price} each - {ticket.available} available</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={ticket.available}
                  value={state.quantities[ticket.id] || 0}
                  onChange={(input) => dispatch({
                    type: "SET_QUANTITY",
                    ticketId: ticket.id,
                    quantity: input.target.value
                  })}
                />
              </label>
            ))}
          </div>
        )}

        {state.step === 2 && (
          <div className="form-grid">
            <label htmlFor={`${fieldId}-name`}>
              Full name
              <input
                id={`${fieldId}-name`}
                value={state.attendee.name}
                onChange={(event) => dispatch({ type: "SET_ATTENDEE", field: "name", value: event.target.value })}
                placeholder={user.name}
              />
            </label>
            <label htmlFor={`${fieldId}-email`}>
              Email
              <input
                id={`${fieldId}-email`}
                type="email"
                value={state.attendee.email}
                onChange={(event) => dispatch({ type: "SET_ATTENDEE", field: "email", value: event.target.value })}
                placeholder={user.email}
              />
            </label>
            <label htmlFor={`${fieldId}-phone`}>
              Phone
              <input
                id={`${fieldId}-phone`}
                value={state.attendee.phone}
                onChange={(event) => dispatch({ type: "SET_ATTENDEE", field: "phone", value: event.target.value })}
                placeholder="1234567890"
              />
            </label>
          </div>
        )}

        {state.step === 3 && (
          <div className="confirmation-box">
            <CheckCircle2 size={40} />
            <h2>Confirm your booking</h2>
            <p>{selectedTickets.map((ticket) => `${ticket.quantity} ${ticket.name}`).join(", ")}</p>
            <strong>Total: ${total}</strong>
            {optimisticStatus === "confirmed" && <p className="success-text">Booking confirmed instantly. Saving...</p>}
            {optimisticStatus === "failed" && <p className="error-text">Booking failed and was rolled back.</p>}
          </div>
        )}

        {formError && <p className="error-text">{formError}</p>}

        <div className="wizard-actions">
          <button className="ghost-button" type="button" disabled={state.step === 1} onClick={() => dispatch({ type: "BACK" })}>
            <ChevronLeft size={17} /> Back
          </button>
          {state.step < 3 ? (
            <button className="primary-button" type="button" onClick={next}>
              Next <ChevronRight size={17} />
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={submitBooking} disabled={bookingMutation.isPending}>
              {bookingMutation.isPending ? "Saving..." : "Confirm Booking"}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default BookingFlow
