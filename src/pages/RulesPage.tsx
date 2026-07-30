import { Link } from "react-router-dom";

export default function RulesPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Reference</p>
        <h1>Rules</h1>
        <p>The rules reference route is live.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
