import { useContext, useId, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ThemeContext } from "../context/theme-context"
import { useAuth } from "../context/useAuth"
import { queryKeys, updateUser } from "../services/eventApi"

function Profile() {
  const { user } = useAuth()
  const { darkMode, setDarkMode } = useContext(ThemeContext)
  const queryClient = useQueryClient()
  const fieldId = useId()
  const [newsletter, setNewsletter] = useState(Boolean(user.preferences?.newsletter))

  const preferenceMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.user, updatedUser)
    }
  })

  const savePreferences = () => {
    preferenceMutation.mutate({
      preferences: {
        theme: darkMode ? "dark" : "light",
        newsletter
      }
    })
  }

  return (
    <section className="page-shell narrow-page">
      <div className="panel profile-panel">
        <p className="eyebrow">Profile</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <div className="form-grid">
          <label className="switch-row" htmlFor={`${fieldId}-theme`}>
            <span>
              Dark mode
              <small>Persisted with ThemeContext and localStorage.</small>
            </span>
            <input id={`${fieldId}-theme`} type="checkbox" checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} />
          </label>
          <label className="switch-row" htmlFor={`${fieldId}-newsletter`}>
            <span>
              Event recommendations
              <small>Saved to the simulated user record.</small>
            </span>
            <input id={`${fieldId}-newsletter`} type="checkbox" checked={newsletter} onChange={(event) => setNewsletter(event.target.checked)} />
          </label>
        </div>
        <button className="primary-button" type="button" onClick={savePreferences}>
          {preferenceMutation.isPending ? "Saving..." : "Save preferences"}
        </button>
        {preferenceMutation.isSuccess && <p className="success-text">Preferences saved.</p>}
      </div>
    </section>
  )
}

export default Profile
