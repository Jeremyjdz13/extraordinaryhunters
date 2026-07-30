import { Link } from "react-router-dom";

export default function CharactersPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Roster</p>
        <h1>Characters</h1>
        <p>The character list route is ready for the migrated provider.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
