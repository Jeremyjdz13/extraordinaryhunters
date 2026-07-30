import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export default function ProfilePage() {
  const { currentUser, loading, signOut } = useAuth();

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Player</p>
        {loading ? (
          <p>Checking account...</p>
        ) : currentUser ? (
          <>
            <h1>{currentUser.displayName || "Profile"}</h1>
            <p>{currentUser.email}</p>
            <dl className="profile-list">
              <div>
                <dt>User UID</dt>
                <dd>{currentUser.uid}</dd>
              </div>
              <div>
                <dt>Email verified</dt>
                <dd>{currentUser.emailVerified ? "Yes" : "No"}</dd>
              </div>
            </dl>
            <nav className="nav-grid" aria-label="App sections">
              <Link to="/characters">Characters</Link>
              <Link to="/notes">Notes</Link>
              <Link to="/npcs">NPCs</Link>
              <Link to="/villains">Villains</Link>
              <Link to="/rules">Rules</Link>
              <Link to="/migration">Migration</Link>
            </nav>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <h1>Sign in required</h1>
            <p>You need an account session before profile data can load.</p>
            <Link to="/">Go to sign in</Link>
          </>
        )}
      </section>
    </main>
  )
}
