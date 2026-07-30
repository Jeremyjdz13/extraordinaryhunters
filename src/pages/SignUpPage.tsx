import { Link } from "react-router-dom";

export default function SignUpPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Account</p>
        <h1>Sign up</h1>
        <p>This placeholder confirms the route is wired in Vite.</p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  )
}
