import { Link } from "react-router-dom";

export default function NotesPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Journal</p>
        <h1>Notes</h1>
        <p>The notes route is available for the Firestore note workflow.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
