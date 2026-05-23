export const initialState = {
  step: 1,
  tickets: [],
  attendees: [],
  total: 0
}

export function bookingReducer(state, action) {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        step: state.step + 1
      }

    case "PREV_STEP":
      return {
        ...state,
        step: state.step - 1
      }

    case "SET_TICKETS":
      return {
        ...state,
        tickets: action.payload
      }

    default:
      return state
  }
}