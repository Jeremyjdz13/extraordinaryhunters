import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { useAuth } from "../auth/useAuth";
import {
  characterFromDoc,
  type CharacterSummary,
} from "./characterReadModel";

export function useCharacters() {
  const { currentUser, loading: authLoading } = useAuth();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !currentUser) return;

    return onSnapshot(
      collection(db, "users", currentUser.uid, "characters"),
      (snapshot) => {
        const nextCharacters = snapshot.docs
          .map((characterDoc) =>
            characterFromDoc(characterDoc.id, characterDoc.data()),
          )
          .sort((first, second) => first.name.localeCompare(second.name));

        setCharacters(nextCharacters);
        setSelectedId((currentSelectedId) => {
          if (nextCharacters.some((character) => character.id === currentSelectedId)) {
            return currentSelectedId;
          }

          return nextCharacters[0]?.id ?? "";
        });
        setLoading(false);
        setError("");
      },
      (caughtError) => {
        setError(caughtError.message);
        setLoading(false);
      },
    );
  }, [authLoading, currentUser]);

  const isSignedIn = Boolean(currentUser);
  const visibleCharacters = isSignedIn ? characters : [];
  const visibleSelectedId = isSignedIn ? selectedId : "";

  return {
    characters: visibleCharacters,
    selectedCharacter:
      visibleCharacters.find((character) => character.id === visibleSelectedId) ??
      visibleCharacters[0] ??
      null,
    selectedId: visibleSelectedId,
    setSelectedId,
    loading: authLoading || (isSignedIn && loading),
    error: isSignedIn ? error : "",
    isSignedIn,
  };
}
