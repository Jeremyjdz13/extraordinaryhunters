import { Link } from "react-router-dom";
import { AuthForm } from "../features/auth/AuthForm";
import { useAuth } from "../features/auth/useAuth";
import { useAuthSubmit } from "../features/auth/useAuthSubmit";

export default function SignInPage() {
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const { submit, loading, error } = useAuthSubmit("signin");

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Extraordinary Hunters</p>
        {authLoading ? (
          <p>Checking account...</p>
        ) : currentUser ? (
          <>
            <h1>Welcome back.</h1>
            <p>
              Signed in as {currentUser.displayName || currentUser.email}. The
              migration and profile routes are ready for the next pass.
            </p>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
            <Link to="/profile">Go to profile</Link>
          </>
        ) : (
          <AuthForm
            mode="signin"
            title="Sign in"
            submitLabel="Sign in"
            loading={loading}
            error={error}
            onSubmit={submit}
          />
        )}
      </section>
    </main>
  )
}
