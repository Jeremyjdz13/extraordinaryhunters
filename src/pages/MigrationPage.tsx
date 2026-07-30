import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
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

export default function MigrationPage() {
  const [uid, setUid] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState("");

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const nextPreview = await previewRealtimeMigration(uid);
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
      const nextResult = await migrateRealtimeToFirestore(uid);
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
  const canMigrate = status === "ready" && (missingCharacters > 0 || missingNotes > 0);

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Manual Migration</p>
        <h1>Realtime to Firestore</h1>
        <p>
          This tool reads the live Realtime Database and creates missing
          Firestore copies. It does not delete or write Realtime Database data.
        </p>

        <form className="migration-form" onSubmit={handlePreview}>
          <label htmlFor="uid">User UID</label>
          <input
            id="uid"
            value={uid}
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
