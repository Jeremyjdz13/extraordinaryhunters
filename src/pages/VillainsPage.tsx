import { Link } from "react-router-dom";

export default function VillainsPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Threats</p>
        <h1>Villains</h1>
        <p>The villains route is standing by for migrated data.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
