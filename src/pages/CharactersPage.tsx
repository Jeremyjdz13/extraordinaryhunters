import { Link } from "react-router-dom";
import { useCharacters } from "../features/characters/useCharacters";
import type { CharacterStat } from "../features/characters/characterReadModel";

function StatGroup({ title, stats }: { title: string; stats: CharacterStat[] }) {
  const visibleStats = stats.filter((stat) => stat.name);

  if (visibleStats.length === 0) return null;

  return (
    <section className="sheet-section">
      <h2>{title}</h2>
      <div className="stat-grid">
        {visibleStats.map((stat, index) => (
          <div className="stat-pill" key={`${stat.name}-${index}`}>
            <span>{stat.name}</span>
            <strong>{stat.rank}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CharactersPage() {
  const {
    characters,
    selectedCharacter,
    selectedId,
    setSelectedId,
    loading,
    error,
    isSignedIn,
  } = useCharacters();

  return (
    <main className="app-shell">
      <section className="panel characters-panel">
        <p className="eyebrow">Roster</p>
        <h1>Characters</h1>

        {!isSignedIn ? (
          <>
            <p>Sign in before loading your Firestore characters.</p>
            <Link to="/">Go to sign in</Link>
          </>
        ) : null}

        {isSignedIn && loading ? <p>Loading characters...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {isSignedIn && !loading && characters.length === 0 ? (
          <>
            <p>No Firestore characters found for this user yet.</p>
            <Link to="/migration">Run migration</Link>
          </>
        ) : null}

        {characters.length > 0 ? (
          <>
            <div className="character-token-row" aria-label="Character list">
              {characters.map((character) => (
                <button
                  className="character-token"
                  data-selected={character.id === selectedId}
                  key={character.id}
                  onClick={() => setSelectedId(character.id)}
                  type="button"
                >
                  <span className="character-avatar">
                    {character.imageUrl ? (
                      <img src={character.imageUrl} alt="" />
                    ) : (
                      character.name.slice(0, 1)
                    )}
                  </span>
                  <span>{character.name}</span>
                </button>
              ))}
            </div>

            {selectedCharacter ? (
              <article className="character-sheet">
                <header className="sheet-header">
                  <div className="sheet-portrait">
                    {selectedCharacter.imageUrl ? (
                      <img src={selectedCharacter.imageUrl} alt="" />
                    ) : (
                      selectedCharacter.name.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <h2>{selectedCharacter.name}</h2>
                    {selectedCharacter.alias ? <p>{selectedCharacter.alias}</p> : null}
                    {selectedCharacter.nature ? <p>{selectedCharacter.nature}</p> : null}
                  </div>
                </header>

                <StatGroup title="Primary Attributes" stats={selectedCharacter.primaryStats} />
                <StatGroup title="Resources" stats={selectedCharacter.resources} />
                <StatGroup title="Combat" stats={selectedCharacter.combat} />
                <StatGroup title="Physical" stats={selectedCharacter.physical} />
                <StatGroup title="Mental" stats={selectedCharacter.mental} />
                <StatGroup title="Professional" stats={selectedCharacter.professional} />
                <StatGroup title="Powers" stats={selectedCharacter.powers} />
                <StatGroup title="Stunts" stats={selectedCharacter.stunts} />
                <StatGroup title="Spells" stats={selectedCharacter.spells} />
                <StatGroup title="Inventory" stats={selectedCharacter.inventory} />
              </article>
            ) : null}
          </>
        ) : null}

        <Link to="/profile">Back to profile</Link>
      </section>
    </main>
  )
}
