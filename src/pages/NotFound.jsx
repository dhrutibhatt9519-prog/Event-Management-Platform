import { Link } from "react-router-dom"

function NotFound() {
  return (
    <section className="empty-state page-shell">
      <p className="eyebrow">404</p>
      <h1>That page is not on the guest list.</h1>
      <p>Head back to the event grid and keep browsing.</p>
      <Link className="primary-button" to="/">Explore events</Link>
    </section>
  )
}

export default NotFound
