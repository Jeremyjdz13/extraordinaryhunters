import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

type AuthMode = "signin" | "signup" | "forgot";

type AuthFormValues = {
  email: string;
  password?: string;
  displayName?: string;
  rememberMe?: boolean;
};

type AuthFormProps = {
  mode: AuthMode;
  title: string;
  submitLabel: string;
  loading?: boolean;
  error?: string;
  message?: string;
  onSubmit: (values: AuthFormValues) => void | Promise<void>;
};

export function AuthForm({
  mode,
  title,
  submitLabel,
  loading,
  error,
  message,
  onSubmit,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const showPassword = mode !== "forgot";
  const showDisplayName = mode === "signup";

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (showDisplayName && !displayName.trim()) return false;
    if (showPassword && !password) return false;
    return true;
  }, [displayName, email, password, showDisplayName, showPassword]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      email: email.trim(),
      password: showPassword ? password : undefined,
      displayName: showDisplayName ? displayName.trim() : undefined,
      rememberMe: mode === "signin" ? rememberMe : undefined,
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>{title}</h1>

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="notice">{message}</p> : null}

      {showDisplayName ? (
        <label>
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
      ) : null}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      {showPassword ? (
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
      ) : null}

      {mode === "signin" ? (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          Remember me
        </label>
      ) : null}

      <button type="submit" disabled={loading || !canSubmit}>
        {loading ? "Working..." : submitLabel}
      </button>

      <div className="auth-links">
        {mode === "signin" ? (
          <>
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/signup">Sign up</Link>
          </>
        ) : null}

        {mode === "signup" ? <Link to="/">Already have an account?</Link> : null}
        {mode === "forgot" ? <Link to="/">Back to sign in</Link> : null}
      </div>
    </form>
  );
}
