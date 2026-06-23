# Eventure - Event Management Platform

React + Vite project for browsing events, booking tickets, managing bookings, creating events, and saving user preferences.

## Features

- Event listing at `/` with TanStack Query caching, deferred search, category/date/price filters, sorting, and optimistic favorites.
- Event details at `/events/:id` with route loader data and streamed slow extras through `Suspense`/`Await`.
- Booking flow at `/book/:eventId` with `useReducer`, progress steps, validation, optimistic confirmation, and rollback-ready Query mutation.
- My bookings at `/my-bookings` with stale/cache timing, upcoming/past/cancelled filters, loading/error states, and optimistic cancellation.
- Create event wizard at `/create-event` using Redux Toolkit, dynamic ticket rows, validation, localStorage draft saving, preview, and publish.
- Profile at `/profile` with ThemeContext light/dark mode and simulated user preferences.

## Setup

```bash
npm install
npm run server
```

In a second terminal:

```bash
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

## Checks

```bash
npm run lint
npm run build
```
