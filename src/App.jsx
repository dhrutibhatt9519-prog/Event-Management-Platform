import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Home from "./pages/Home"
import EventDetails from "./pages/EventDetails"
import MyBookings from "./pages/MyBookings"
import BookingFlow from "./pages/BookingFlow"
import CreateEvent from "./pages/CreateEvent"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import RootLayout from "./pages/RootLayout"
import ErrorPage from "./pages/ErrorPage"
import {
  createBooking,
  createEvent,
  getBookings,
  getEvent,
  getEvents,
  getSlowEventExtras,
  queryKeys
} from "./services/eventApi"
import { queryClient } from "./lib/queryClient"

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    loader: async () => ({ events: await queryClient.ensureQueryData({ queryKey: queryKeys.events, queryFn: getEvents }) }),
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: <ErrorPage />
      },
      {
        path: "events/:id",
        element: <EventDetails />,
        errorElement: <ErrorPage />,
        loader: async ({ params }) => {
          const event = await queryClient.ensureQueryData({
            queryKey: queryKeys.event(params.id),
            queryFn: () => getEvent(params.id)
          })

          return {
            event,
            extras: queryClient.ensureQueryData({
              queryKey: queryKeys.extras(params.id),
              queryFn: () => getSlowEventExtras(params.id)
            })
          }
        }
      },
      {
        path: "book/:eventId",
        element: <BookingFlow />,
        errorElement: <ErrorPage />,
        loader: async ({ params }) => ({
          event: await queryClient.ensureQueryData({
            queryKey: queryKeys.event(params.eventId),
            queryFn: () => getEvent(params.eventId)
          })
        }),
        action: async ({ request }) => {
          const booking = Object.fromEntries(await request.formData())
          return createBooking(JSON.parse(booking.payload))
        }
      },
      {
        path: "my-bookings",
        element: <MyBookings />,
        errorElement: <ErrorPage />,
        loader: async () => ({
          bookings: await queryClient.ensureQueryData({
            queryKey: queryKeys.bookings("all"),
            queryFn: getBookings
          })
        })
      },
      {
        path: "create-event",
        element: <CreateEvent />,
        errorElement: <ErrorPage />,
        action: async ({ request }) => {
          const payload = JSON.parse(Object.fromEntries(await request.formData()).payload)
          return createEvent(payload)
        }
      },
      {
        path: "profile",
        element: <Profile />,
        errorElement: <ErrorPage />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
