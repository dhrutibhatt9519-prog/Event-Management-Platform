import { configureStore } from "@reduxjs/toolkit"
import eventWizardReducer from "./eventWizardSlice"

export const store = configureStore({
  reducer: {
    eventWizard: eventWizardReducer
  }
})
