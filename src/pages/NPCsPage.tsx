import { Link } from "react-router-dom";

export default function NPCsPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Cast</p>
        <h1>NPCs</h1>
        <p>NPC management can be reattached here.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
