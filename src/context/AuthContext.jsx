import { useQuery } from "@tanstack/react-query"
import { getUser, queryKeys } from "../services/eventApi"
import { AuthContext } from "./auth-context"

export function AuthProvider({ children }) {
  const userQuery = useQuery({
    queryKey: queryKeys.user,
    queryFn: getUser,
    staleTime: 1000 * 60 * 10
  })

  const user = userQuery.data || {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    favoriteEvents: [],
    preferences: { theme: "light" }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: userQuery.isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
