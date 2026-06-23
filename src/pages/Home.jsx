import { Heart, Search, SlidersHorizontal } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import { Link, useRouteLoaderData } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEvents, getUser, patchEvent, queryKeys, updateUser } from "../services/eventApi"
import { useAuth } from "../context/useAuth"

const emptyEvents = []

function Home() {
  const rootData = useRouteLoaderData("root")
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [dateRange, setDateRange] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const deferredSearch = useDeferredValue(search)

  const eventsQuery = useQuery({
    queryKey: queryKeys.events,
    queryFn: getEvents,
    initialData: rootData?.events
  })

  const userQuery = useQuery({
    queryKey: queryKeys.user,
    queryFn: getUser,
    initialData: user
  })

  const events = eventsQuery.data || emptyEvents
  const favoriteEvents = userQuery.data?.favoriteEvents || []
  const categories = ["All", ...new Set(events.map((event) => event.category))]

  const favoriteMutation = useMutation({
    mutationFn: async (event) => {
      const isFavorite = favoriteEvents.includes(event.id)
      const nextFavorites = isFavorite
        ? favoriteEvents.filter((id) => id !== event.id)
        : [...favoriteEvents, event.id]

      await Promise.all([
        updateUser({ favoriteEvents: nextFavorites }),
        patchEvent(event.id, { likes: Math.max(0, event.likes + (isFavorite ? -1 : 1)) })
      ])
    },
    onMutate: async (event) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events })
      await queryClient.cancelQueries({ queryKey: queryKeys.user })
      const previousEvents = queryClient.getQueryData(queryKeys.events)
      const previousUser = queryClient.getQueryData(queryKeys.user)
      const isFavorite = favoriteEvents.includes(event.id)

      queryClient.setQueryData(queryKeys.events, (old = []) =>
        old.map((item) =>
          item.id === event.id
            ? { ...item, likes: Math.max(0, item.likes + (isFavorite ? -1 : 1)) }
            : item
        )
      )
      queryClient.setQueryData(queryKeys.user, (old) => ({
        ...old,
        favoriteEvents: isFavorite
          ? old.favoriteEvents.filter((id) => id !== event.id)
          : [...old.favoriteEvents, event.id]
      }))

      return { previousEvents, previousUser }
    },
    onError: (_error, _event, context) => {
      queryClient.setQueryData(queryKeys.events, context.previousEvents)
      queryClient.setQueryData(queryKeys.user, context.previousUser)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events })
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
    }
  })

  const filteredEvents = useMemo(() => {
    const now = new Date()
    const maxPriceFor = (event) => Math.min(...event.ticketTypes.map((ticket) => ticket.price))

    return events
      .filter((event) => {
        const matchesSearch = `${event.title} ${event.location} ${event.category}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())
        const matchesCategory = category === "All" || event.category === category
        const eventDate = new Date(event.date)
        const matchesDate =
          dateRange === "all" ||
          (dateRange === "upcoming" && eventDate >= now) ||
          (dateRange === "thisMonth" &&
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear())
        const lowestPrice = maxPriceFor(event)
        const matchesPrice =
          priceRange === "all" ||
          (priceRange === "freeUnder50" && lowestPrice <= 50) ||
          (priceRange === "mid" && lowestPrice > 50 && lowestPrice <= 150) ||
          (priceRange === "premium" && lowestPrice > 150)

        return matchesSearch && matchesCategory && matchesDate && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === "price") {
          return maxPriceFor(a) - maxPriceFor(b)
        }
        return new Date(a.date) - new Date(b.date)
      })
  }, [category, dateRange, deferredSearch, events, priceRange, sortBy])

  return (
    <section className="page-shell">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1>Discover events worth leaving the group chat for.</h1>
          <p>
            Browse curated conferences, concerts, food labs, and workshops. Save favorites,
            filter by mood and budget, then book with a clean three-step checkout.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#events">Browse events</a>
            <Link className="ghost-button" to="/create-event">Create event</Link>
          </div>
        </div>
        <div className="hero-panel">
          <img
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80"
            alt="Audience at a live event"
          />
          <div className="hero-stat">
            <strong>{events.length}</strong>
            <span>live events</span>
          </div>
        </div>
      </div>

      <div className="section-heading" id="events">
        <div>
          <p className="eyebrow">Events Listing</p>
          <h2>Find your next booking</h2>
        </div>
        <span>{filteredEvents.length} results</span>
      </div>

      <div className="filters-panel">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, city, or category"
          />
        </label>
        <label>
          <span><SlidersHorizontal size={15} /> Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Date range</span>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
            <option value="all">Any date</option>
            <option value="upcoming">Upcoming</option>
            <option value="thisMonth">This month</option>
          </select>
        </label>
        <label>
          <span>Price range</span>
          <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
            <option value="all">Any price</option>
            <option value="freeUnder50">$50 or less</option>
            <option value="mid">$51 to $150</option>
            <option value="premium">Over $150</option>
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date">Date</option>
            <option value="price">Price</option>
          </select>
        </label>
      </div>

      {eventsQuery.isLoading && <p className="status-text">Loading events...</p>}
      {eventsQuery.isError && <p className="error-text">Could not load events.</p>}

      <div className="event-grid">
        {filteredEvents.map((event) => {
          const lowestPrice = Math.min(...event.ticketTypes.map((ticket) => ticket.price))
          const isFavorite = favoriteEvents.includes(event.id)
          return (
            <article className="event-card" key={event.id}>
              <div className="event-media">
                {event.featured && <span className="event-tag">Featured</span>}
                <button
                  className={`like-button ${isFavorite ? "active" : ""}`}
                  type="button"
                  aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
                  onClick={() => favoriteMutation.mutate(event)}
                >
                  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <img src={event.image} alt={event.title} />
              </div>
              <div className="event-card-body">
                <div>
                  <p className="eyebrow">{event.category}</p>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="event-meta">
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                  <span>{event.location}</span>
                  <span>From ${lowestPrice}</span>
                </div>
                <div className="card-footer">
                  <span>{event.likes} likes</span>
                  <Link className="secondary-button" to={`/events/${event.id}`}>
                    View details
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {!filteredEvents.length && !eventsQuery.isLoading && (
        <div className="empty-state compact">
          <h3>No events match those filters.</h3>
          <p>Try a broader category, date, or price range.</p>
        </div>
      )}
    </section>
  )
}

export default Home
