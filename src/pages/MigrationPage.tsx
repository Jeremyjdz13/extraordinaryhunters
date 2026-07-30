import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import {
  migrateRealtimeToFirestore,
  previewRealtimeMigration,
  type MigrationPreview,
  type MigrationResult,
} from "../lib/migration/realtimeToFirestore";

type Status = "idle" | "loading" | "ready" | "migrated" | "error";

function countMissing(items: MigrationPreview["characters"]) {
  return items.filter((item) => !item.existsInFirestore).length;
}

function readinessMessage({
  currentUserEmail,
  hasMissingDocs,
  uidMatchesSignedInUser,
}: {
  currentUserEmail?: string | null;
  hasMissingDocs: boolean;
  uidMatchesSignedInUser: boolean;
}) {
  if (!currentUserEmail) {
    return "Sign in before creating Firestore docs.";
  }

  if (!uidMatchesSignedInUser) {
    return "The UID must match the signed-in user before writing.";
  }

  if (!hasMissingDocs) {
    return "All previewed docs already exist in Firestore.";
  }

  return "Ready to create missing Firestore docs.";
}

export default function MigrationPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [uid, setUid] = useState(currentUser?.uid ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState("");
  const migrationUid = uid || currentUser?.uid || "";

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const nextPreview = await previewRealtimeMigration(migrationUid);
      setPreview(nextPreview);
      setStatus("ready");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      setStatus("error");
    }
  }

  async function handleMigrate() {
    setStatus("loading");
    setError("");

    try {
      const nextResult = await migrateRealtimeToFirestore(migrationUid);
      setResult(nextResult);
      setPreview(nextResult);
      setStatus("migrated");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      setStatus("error");
    }
  }

  const missingCharacters = preview ? countMissing(preview.characters) : 0;
  const missingNotes = preview ? countMissing(preview.notes) : 0;
  const hasMissingDocs = missingCharacters > 0 || missingNotes > 0;
  const uidMatchesSignedInUser = Boolean(
    currentUser && migrationUid.trim() === currentUser.uid,
  );
  const canMigrate =
    status === "ready" &&
    uidMatchesSignedInUser &&
    hasMissingDocs;
  const writeReadiness = readinessMessage({
    currentUserEmail: currentUser?.email,
    hasMissingDocs,
    uidMatchesSignedInUser,
  });

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Manual Migration</p>
        <h1>Realtime to Firestore</h1>
        <p>
          This tool reads the live Realtime Database and creates missing
          Firestore copies. It does not delete or write Realtime Database data.
        </p>
        {authLoading ? <p>Checking account...</p> : null}
        {!authLoading && currentUser ? (
          <p className="notice">
            Signed in as {currentUser.email}. Firestore writes will use your
            current account permissions.
          </p>
        ) : null}
        {!authLoading && !currentUser ? (
          <p className="error">
            Sign in before creating Firestore docs. Dry run may work with read
            permissions, but writes usually require an authenticated user.
          </p>
        ) : null}

        <form className="migration-form" onSubmit={handlePreview}>
          <label htmlFor="uid">User UID</label>
          <input
            id="uid"
            value={migrationUid}
            onChange={(event) => setUid(event.target.value)}
            placeholder="Paste a Firebase Auth user UID"
            required
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Checking..." : "Dry run"}
          </button>
        </form>

        {preview ? (
          <div className="summary">
            <h2>Dry Run Summary</h2>
            <dl>
              <div>
                <dt>Characters found</dt>
                <dd>{preview.characters.length}</dd>
              </div>
              <div>
                <dt>Characters to create</dt>
                <dd>{missingCharacters}</dd>
              </div>
              <div>
                <dt>Notes found</dt>
                <dd>{preview.notes.length}</dd>
              </div>
              <div>
                <dt>Notes to create</dt>
                <dd>{missingNotes}</dd>
              </div>
            </dl>
            <button type="button" disabled={!canMigrate} onClick={handleMigrate}>
              Create missing Firestore docs
            </button>
            <div className="readiness">
              <h2>Write Readiness</h2>
              <dl>
                <div>
                  <dt>Signed in</dt>
                  <dd>{currentUser ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>UID matches</dt>
                  <dd>{uidMatchesSignedInUser ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Missing docs</dt>
                  <dd>{hasMissingDocs ? "Yes" : "No"}</dd>
                </div>
              </dl>
              <p className={canMigrate ? "notice" : "error"}>{writeReadiness}</p>
            </div>
          </div>
        ) : null}

        {result ? (
          <p className="notice">
            Created {result.createdCharacters} character docs and{" "}
            {result.createdNotes} note docs.
          </p>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

        <Link to="/">Back home</Link>
      </section>
    </main>
  );
}
