import { Link } from "react-router-dom";

export default function ProfilePage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Player</p>
        <h1>Profile</h1>
        <p>Firebase profile data can be restored here next.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
