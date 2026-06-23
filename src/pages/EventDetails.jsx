import { Suspense } from "react"
import { Await, Link, useLoaderData } from "react-router-dom"
import { CalendarDays, Clock, MapPin, Star, Ticket } from "lucide-react"

function EventDetails() {
  const { event, extras } = useLoaderData()
  const availableTickets = event.ticketTypes.reduce((sum, ticket) => sum + Number(ticket.available), 0)

  return (
    <section className="page-shell detail-page">
      <div className="detail-hero">
        <img src={event.image} alt={event.title} />
        <div className="detail-copy">
          <p className="eyebrow">{event.category}</p>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="detail-facts">
            <span><CalendarDays size={18} /> {new Date(event.date).toLocaleDateString()}</span>
            <span><Clock size={18} /> {event.time}</span>
            <span><MapPin size={18} /> {event.venue}, {event.location}</span>
          </div>
          <Link className="primary-button" to={`/book/${event.id}`}>Book Now</Link>
        </div>
      </div>

      <div className="detail-layout">
        <section className="panel">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Ticket Types</p>
              <h2>{availableTickets} seats available</h2>
            </div>
          </div>
          <div className="ticket-list">
            {event.ticketTypes.map((ticket) => (
              <div className="ticket-row" key={ticket.id}>
                <div>
                  <strong>{ticket.name}</strong>
                  <span>{ticket.available} remaining</span>
                </div>
                <b>${ticket.price}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">Organizer</p>
          <h2>{event.organizerName}</h2>
          <p className="muted">
            Eventure verifies event details and keeps availability synced with JSON server data.
          </p>
        </section>
      </div>

      <Suspense fallback={<div className="panel skeleton">Streaming reviews and recommendations...</div>}>
        <Await resolve={extras}>
          {(resolved) => (
            <div className="detail-layout">
              <section className="panel">
                <p className="eyebrow">Reviews</p>
                <div className="review-list">
                  {resolved.reviews.map((review) => (
                    <article key={review.id}>
                      <span className="stars"><Star size={16} fill="currentColor" /> {review.rating}.0</span>
                      <p>{review.quote}</p>
                      <strong>{review.author}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <p className="eyebrow">Recommendations</p>
                <div className="mini-list">
                  {resolved.recommendations.map((item) => (
                    <Link to={`/events/${item.id}`} key={item.id}>
                      <Ticket size={17} />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  )
}

export default EventDetails
