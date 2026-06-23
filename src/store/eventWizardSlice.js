import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { createEvent } from "../services/eventApi"

const draftKey = "event-draft"

const emptyDraft = {
  title: "",
  description: "",
  category: "Technology",
  image: "",
  date: "",
  time: "",
  location: "",
  venue: "",
  organizerName: "",
  ticketTypes: [{ id: "general", name: "General", price: 0, available: 50 }]
}

function readDraft() {
  try {
    const saved = localStorage.getItem(draftKey)
    return saved ? JSON.parse(saved) : emptyDraft
  } catch {
    return emptyDraft
  }
}

export const publishEvent = createAsyncThunk("eventWizard/publish", async (draft) => {
  const ticketTypes = draft.ticketTypes.map((ticket, index) => ({
    id: ticket.id || `ticket-${index + 1}`,
    name: ticket.name,
    price: Number(ticket.price),
    available: Number(ticket.available)
  }))

  return createEvent({
    ...draft,
    ticketTypes,
    likes: 0,
    featured: false
  })
})

const eventWizardSlice = createSlice({
  name: "eventWizard",
  initialState: {
    step: 1,
    draft: readDraft(),
    status: "idle",
    error: null,
    publishedEvent: null
  },
  reducers: {
    updateDraft(state, action) {
      state.draft = {
        ...state.draft,
        ...action.payload
      }
      localStorage.setItem(draftKey, JSON.stringify(state.draft))
    },
    addTicketType(state) {
      state.draft.ticketTypes.push({
        id: `ticket-${Date.now()}`,
        name: "",
        price: 0,
        available: 25
      })
      localStorage.setItem(draftKey, JSON.stringify(state.draft))
    },
    updateTicketType(state, action) {
      const { index, field, value } = action.payload
      state.draft.ticketTypes[index][field] = value
      localStorage.setItem(draftKey, JSON.stringify(state.draft))
    },
    removeTicketType(state, action) {
      state.draft.ticketTypes = state.draft.ticketTypes.filter((_, index) => index !== action.payload)
      localStorage.setItem(draftKey, JSON.stringify(state.draft))
    },
    nextStep(state) {
      state.step = Math.min(state.step + 1, 3)
    },
    previousStep(state) {
      state.step = Math.max(state.step - 1, 1)
    },
    resetWizard(state) {
      state.step = 1
      state.draft = emptyDraft
      state.status = "idle"
      state.error = null
      state.publishedEvent = null
      localStorage.removeItem(draftKey)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(publishEvent.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(publishEvent.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.publishedEvent = action.payload
        localStorage.removeItem(draftKey)
      })
      .addCase(publishEvent.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Unable to publish event."
      })
  }
})

export const {
  updateDraft,
  addTicketType,
  updateTicketType,
  removeTicketType,
  nextStep,
  previousStep,
  resetWizard
} = eventWizardSlice.actions

export default eventWizardSlice.reducer
