import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import App from "./App"
import ThemeProvider from "./context/ThemeProvider"
import { AuthProvider } from "./context/AuthContext"
import { queryClient } from "./lib/queryClient"
import { store } from "./store"

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
)
