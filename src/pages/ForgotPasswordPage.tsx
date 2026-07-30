import { AuthForm } from "../features/auth/AuthForm";
import { useAuthSubmit } from "../features/auth/useAuthSubmit";

export default function ForgotPasswordPage() {
  const { submit, loading, error, message } = useAuthSubmit("forgot");

  return (
    <main className="app-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Account</p>
        <AuthForm
          mode="forgot"
          title="Reset password"
          submitLabel="Send reset email"
          loading={loading}
          error={error}
          message={message}
          onSubmit={submit}
        />
      </section>
    </main>
  );
}
