import { Link, useRouteError } from "react-router-dom"

function ErrorPage() {
  const error = useRouteError()

  return (
    <section className="empty-state page-shell">
      <p className="eyebrow">Something went sideways</p>
      <h1>We could not load this part of Eventure.</h1>
      <p>{error?.message || "Please make sure the JSON server is running, then try again."}</p>
      <Link className="primary-button" to="/">Back to events</Link>
    </section>
  )
}

export default ErrorPage
