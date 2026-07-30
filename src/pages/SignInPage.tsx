import { Link } from "react-router-dom";

export default function SignInPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Extraordinary Hunters</p>
        <h1>Campaign tools are coming back online.</h1>
        <p>
          The Vite migration is loading. Auth and Firebase workflows can be
          reconnected from this baseline.
        </p>
        <nav className="nav-grid" aria-label="App sections">
          <Link to="/signup">Sign up</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/characters">Characters</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/npcs">NPCs</Link>
          <Link to="/villains">Villains</Link>
          <Link to="/rules">Rules</Link>
          <Link to="/migration">Migration</Link>
        </nav>
      </section>
    </main>
  )
}
