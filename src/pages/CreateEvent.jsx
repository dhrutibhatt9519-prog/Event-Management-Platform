import { useId, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import {
  addTicketType,
  nextStep,
  previousStep,
  publishEvent,
  removeTicketType,
  resetWizard,
  updateDraft,
  updateTicketType
} from "../store/eventWizardSlice"

function CreateEvent() {
  const fieldId = useId()
  const dispatch = useDispatch()
  const { step, draft, status, error, publishedEvent } = useSelector((state) => state.eventWizard)
  const [validationError, setValidationError] = useState("")

  const minPrice = useMemo(() => {
    const prices = draft.ticketTypes.map((ticket) => Number(ticket.price || 0))
    return Math.min(...prices)
  }, [draft.ticketTypes])

  const validateStep = () => {
    if (step === 1 && (!draft.title.trim() || !draft.description.trim() || !draft.image.trim())) {
      setValidationError("Add a title, description, and image URL before continuing.")
      return false
    }
    if (step === 2) {
      const hasEventDetails = draft.date && draft.time && draft.location.trim()
      const hasTickets = draft.ticketTypes.every((ticket) => ticket.name.trim() && Number(ticket.available) >= 0)
      if (!hasEventDetails || !hasTickets) {
        setValidationError("Complete date, time, location, and all ticket rows.")
        return false
      }
    }
    setValidationError("")
    return true
  }

  const goNext = () => {
    if (validateStep()) {
      dispatch(nextStep())
    }
  }

  const publish = () => {
    if (validateStep()) {
      dispatch(publishEvent(draft))
    }
  }

  return (
    <section className="page-shell narrow-page">
      <div className="wizard-header">
        <div>
          <p className="eyebrow">Create Event</p>
          <h1>Publish a new experience</h1>
        </div>
        <span>Step {step}/3</span>
      </div>

      <div className="progress-track">
        {["Basics", "Schedule", "Preview"].map((label, index) => (
          <span className={step >= index + 1 ? "active" : ""} key={label}>{label}</span>
        ))}
      </div>

      <div className="panel wizard-panel">
        {step === 1 && (
          <div className="form-grid">
            <label htmlFor={`${fieldId}-title`}>
              Title
              <input id={`${fieldId}-title`} value={draft.title} onChange={(event) => dispatch(updateDraft({ title: event.target.value }))} />
            </label>
            <label htmlFor={`${fieldId}-category`}>
              Category
              <select id={`${fieldId}-category`} value={draft.category} onChange={(event) => dispatch(updateDraft({ category: event.target.value }))}>
                <option>Technology</option>
                <option>Design</option>
                <option>Music</option>
                <option>Business</option>
                <option>Food</option>
              </select>
            </label>
            <label htmlFor={`${fieldId}-image`} className="wide-field">
              Image URL
              <input id={`${fieldId}-image`} value={draft.image} onChange={(event) => dispatch(updateDraft({ image: event.target.value }))} />
            </label>
            <label htmlFor={`${fieldId}-description`} className="wide-field">
              Description
              <textarea id={`${fieldId}-description`} value={draft.description} onChange={(event) => dispatch(updateDraft({ description: event.target.value }))} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid">
            <label>
              Date
              <input type="date" value={draft.date} onChange={(event) => dispatch(updateDraft({ date: event.target.value }))} />
            </label>
            <label>
              Time
              <input value={draft.time} placeholder="09:00 AM" onChange={(event) => dispatch(updateDraft({ time: event.target.value }))} />
            </label>
            <label>
              Location
              <input value={draft.location} onChange={(event) => dispatch(updateDraft({ location: event.target.value }))} />
            </label>
            <label>
              Venue
              <input value={draft.venue} onChange={(event) => dispatch(updateDraft({ venue: event.target.value }))} />
            </label>
            <label className="wide-field">
              Organizer
              <input value={draft.organizerName} onChange={(event) => dispatch(updateDraft({ organizerName: event.target.value }))} />
            </label>
            <div className="wide-field ticket-editor">
              <div className="card-footer">
                <strong>Ticket types</strong>
                <button className="secondary-button" type="button" onClick={() => dispatch(addTicketType())}>
                  <Plus size={16} /> Add
                </button>
              </div>
              {draft.ticketTypes.map((ticket, index) => (
                <div className="ticket-edit-row" key={ticket.id}>
                  <input value={ticket.name} placeholder="Name" onChange={(event) => dispatch(updateTicketType({ index, field: "name", value: event.target.value }))} />
                  <input type="number" value={ticket.price} placeholder="Price" onChange={(event) => dispatch(updateTicketType({ index, field: "price", value: event.target.value }))} />
                  <input type="number" value={ticket.available} placeholder="Available" onChange={(event) => dispatch(updateTicketType({ index, field: "available", value: event.target.value }))} />
                  <button className="icon-button danger" type="button" onClick={() => dispatch(removeTicketType(index))} disabled={draft.ticketTypes.length === 1}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <article className="event-card preview-card">
            <div className="event-media">
              <img src={draft.image || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80"} alt={draft.title || "Event preview"} />
            </div>
            <div className="event-card-body">
              <p className="eyebrow">{draft.category}</p>
              <h2>{draft.title || "Untitled event"}</h2>
              <p>{draft.description || "Description preview will appear here."}</p>
              <div className="event-meta">
                <span>{draft.date || "Date TBD"}</span>
                <span>{draft.location || "Location TBD"}</span>
                <span>From ${Number.isFinite(minPrice) ? minPrice : 0}</span>
              </div>
              {publishedEvent && (
                <p className="success-text">
                  Published. <Link to={`/events/${publishedEvent.id}`}>View event</Link>
                </p>
              )}
            </div>
          </article>
        )}

        {validationError && <p className="error-text">{validationError}</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="wizard-actions">
          <button className="ghost-button" type="button" onClick={() => dispatch(previousStep())} disabled={step === 1}>Back</button>
          <button className="ghost-button" type="button" onClick={() => dispatch(resetWizard())}>Clear draft</button>
          {step < 3 ? (
            <button className="primary-button" type="button" onClick={goNext}>Next</button>
          ) : (
            <button className="primary-button" type="button" onClick={publish} disabled={status === "loading"}>
              {status === "loading" ? "Publishing..." : "Preview and Publish"}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default CreateEvent
