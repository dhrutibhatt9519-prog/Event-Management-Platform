import { Outlet, ScrollRestoration, useNavigation } from "react-router-dom"
import Navbar from "../components/Navbar"

function RootLayout() {
  const navigation = useNavigation()

  return (
    <>
      <Navbar />
      {navigation.state !== "idle" && <div className="route-loading" />}
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}

export default RootLayout
