import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

type AuthMode = "signin" | "signup" | "forgot";

type AuthValues = {
  email: string;
  password?: string;
  displayName?: string;
  rememberMe?: boolean;
};

function authErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function useAuthSubmit(mode: AuthMode) {
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(values: AuthValues) {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(values.email, values.password ?? "", values.rememberMe);
        navigate("/profile");
      }

      if (mode === "signup") {
        await signUp(values.email, values.password ?? "", values.displayName ?? "");
        navigate("/profile");
      }

      if (mode === "forgot") {
        await resetPassword(values.email);
        setMessage("Password reset email sent. Check your inbox.");
      }
    } catch (caughtError) {
      setError(authErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error, message };
}
