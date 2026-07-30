import { get, ref } from "firebase/database";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, realtimeDb } from "../firebase";

type LegacyRecord = Record<string, unknown>;

type MigrationPreviewItem = {
  id: string;
  existsInFirestore: boolean;
};

export type MigrationPreview = {
  uid: string;
  characters: MigrationPreviewItem[];
  notes: MigrationPreviewItem[];
};

export type MigrationResult = MigrationPreview & {
  createdCharacters: number;
  createdNotes: number;
};

function randomId() {
  return crypto.randomUUID();
}

function asLegacyArray(value: unknown): LegacyRecord[] {
  if (!value) return [];

  const parsed = typeof value === "string" ? JSON.parse(value) : value;

  if (Array.isArray(parsed)) {
    return parsed.filter(Boolean) as LegacyRecord[];
  }

  if (typeof parsed === "object") {
    return Object.values(parsed as Record<string, unknown>).filter(
      Boolean,
    ) as LegacyRecord[];
  }

  return [];
}

function legacyList(value: unknown): LegacyRecord[] {
  return Array.isArray(value) ? (value.filter(Boolean) as LegacyRecord[]) : [];
}

function legacyStat(value: unknown, fallbackName: string, fallbackRank = 0) {
  if (value && typeof value === "object") {
    return value;
  }

  return {
    id: randomId(),
    name: fallbackName,
    rank: fallbackRank,
  };
}

function convertCharacter(character: LegacyRecord) {
  const primaryAttributes = legacyList(character.primaryAttributes);
  const secondaryAttributes = legacyList(character.secondaryAttributes);

  return {
    id: String(character.id ?? randomId()),
    alias: character.alias ?? "",
    agility: legacyStat(primaryAttributes[2], "Agility", 3),
    backgrounds: legacyList(character.backgrounds),
    backgroundStory: {
      id: randomId(),
      title: "Background Story",
      markdown: "Write your background story here.",
      tagIds: [],
    },
    bashing: {
      id: randomId(),
      name: "Bashing",
      rank: 0,
    },
    campaign: [],
    combat: legacyList(character.combatSkills).map((skill) => ({
      ...skill,
      description: "Coming Soon!",
    })),
    createdAt: serverTimestamp(),
    death: {
      id: randomId(),
      name: "Death",
      rank: 0,
    },
    endurance: legacyStat(primaryAttributes[3], "Endurance", 3),
    experience: legacyStat(secondaryAttributes[3], "Experience", 0),
    fight: legacyStat(primaryAttributes[0], "Fight", 3),
    flaws: legacyList(character.flaws).map((flaw) => ({
      ...flaw,
      description:
        "What about this flaw makes you want to reassure the gm it really is a flaw and not some hidden benefit?",
    })),
    imageUrl: character.imageUrl ?? "",
    initiative: {
      id: randomId(),
      name: "Initiative",
      rank: 0,
    },
    intuition: legacyStat(primaryAttributes[5], "Intuition", 3),
    inventory: [
      ...legacyList(character.equipmentItems).map((item) => ({
        ...item,
        isArmor: false,
        isComponent: false,
        isProtoniumGenerator: false,
        isTalisman: false,
        isWeapon: false,
        isResistance: false,
        isActive: false,
        isSpellBook: false,
        quantity: 1,
      })),
      ...legacyList(character.talismans).map((item) => ({
        ...item,
        isArmor: false,
        isComponent: false,
        isProtoniumGenerator: false,
        isTalisman: true,
        isWeapon: false,
        isResistance: false,
        isActive: false,
        isSpellBook: false,
        quantity: 1,
      })),
    ],
    karma: legacyStat(secondaryAttributes[2], "Karma", 0),
    lethal: {
      id: randomId(),
      name: "Lethal",
      rank: 0,
    },
    merits: legacyList(character.merits).map((merit) => ({
      ...merit,
      description: "What about this merits makes you want to tell your friends about it?",
    })),
    mental: legacyList(character.mentalSkills).map((skill) => ({
      ...skill,
      description: "Coming soon!",
    })),
    name: character.name ?? "Migrated Character",
    nature: character.nature ?? "",
    physical: legacyList(character.physicalSkills).map((skill) => ({
      ...skill,
      description: "Coming soon!",
    })),
    powers: legacyList(character.powers).map((power) => ({
      ...power,
      isResistance: false,
      stuntIds: [],
    })),
    professional: legacyList(character.professionalSkills).map((skill) => ({
      ...skill,
      description: "Coming soon!",
    })),
    protonium: legacyStat(secondaryAttributes[5], "Protonium", 0),
    protoniumPool: {
      id: randomId(),
      name: "Protonium Pool",
      rank: 0,
    },
    protoniumConsumed: {
      id: randomId(),
      name: "Consumed Protonium",
      rank: 0,
    },
    psyche: legacyStat(primaryAttributes[6], "Psyche", 3),
    reason: legacyStat(primaryAttributes[4], "Reason", 3),
    rollTally: [
      {
        id: randomId(),
        rollDate: "",
        name: "Roll Tally",
        numberDiceRolled: 0,
        rollSuccessTotal: 0,
        rollDifficulty: 0,
        isFailed: false,
        isBotched: false,
        isCombat: false,
        isNonCombat: true,
        isKarmaReroll: false,
        protoniumSpent: 0,
        isProtoniumUsedToLowerDiff: false,
        statsUsed: [
          { name: "Stat Used", rank: 0 },
          { name: "Stat Used", rank: 0 },
        ],
      },
    ],
    resistances: [
      { isColdResistant: false },
      { isHeatResistant: false },
      { isMagicResistant: false },
      { isElectricityResistant: false },
      { isToxicResistant: false },
      { isRadiationResistant: false },
      { isPsychicResistant: false },
      { isForceResistant: false },
      { isAcidResistant: false },
    ],
    spellbooks: [],
    spells: legacyList(character.spellbook).map((item) => ({
      ...item,
      attempts: item.rank ?? 0,
      castingTime: "instant",
      duration: "string",
      rank: 0,
      range: "self",
      componentIds: [],
      isMastered: false,
      isArmor: false,
      isComponent: false,
      isAreaOfEffect: false,
      isPurchased: item.purchased ?? false,
      isTargeted: false,
      isActive: false,
      isWeapon: false,
      isResistance: false,
    })),
    strength: legacyStat(primaryAttributes[1], "Strength", 3),
    stunts: legacyList(character.powerStunts).map((item) => ({
      ...item,
      attempts: item.rank ?? 0,
      chargeTime: "instant",
      duration: "instant",
      range: "self",
      rank: 0,
      isMastered: false,
      isArmor: false,
      isComponent: false,
      isAreaOfEffect: false,
      isTargeted: false,
      isActive: false,
      isWeapon: false,
    })),
    talismans: [],
    isArchived: false,
    updatedAt: serverTimestamp(),
    isVillain: false,
    isHero: true,
    isNPC: false,
    isActive: true,
  };
}

function convertNote(note: LegacyRecord) {
  return {
    ...note,
    id: String(note.id ?? randomId()),
    markdown: note.body ?? note.markdown ?? "",
    createdAt: note.creationDate ?? "",
    lastUpdate: note.editDate ?? "",
    tagIds: [],
  };
}

async function readLegacyData(uid: string) {
  const [charactersSnapshot, notesSnapshot] = await Promise.all([
    get(ref(realtimeDb, `users/${uid}/characters`)),
    get(ref(realtimeDb, `users/${uid}/journal`)),
  ]);

  return {
    characters: charactersSnapshot.exists()
      ? asLegacyArray(charactersSnapshot.val())
      : [],
    notes: notesSnapshot.exists() ? asLegacyArray(notesSnapshot.val()) : [],
  };
}

async function itemPreview(uid: string, collectionName: string, item: LegacyRecord) {
  const id = String(item.id ?? "");

  if (!id) {
    return {
      id: "(missing id)",
      existsInFirestore: false,
    };
  }

  const existingDoc = await getDoc(doc(db, "users", uid, collectionName, id));

  return {
    id,
    existsInFirestore: existingDoc.exists(),
  };
}

export async function previewRealtimeMigration(uid: string): Promise<MigrationPreview> {
  const cleanUid = uid.trim();
  const { characters, notes } = await readLegacyData(cleanUid);

  const [characterPreview, notePreview] = await Promise.all([
    Promise.all(characters.map((item) => itemPreview(cleanUid, "characters", item))),
    Promise.all(notes.map((item) => itemPreview(cleanUid, "notes", item))),
  ]);

  return {
    uid: cleanUid,
    characters: characterPreview,
    notes: notePreview,
  };
}

export async function migrateRealtimeToFirestore(uid: string): Promise<MigrationResult> {
  const cleanUid = uid.trim();
  const { characters, notes } = await readLegacyData(cleanUid);
  let createdCharacters = 0;
  let createdNotes = 0;

  for (const legacyCharacter of characters) {
    if (!legacyCharacter.id) continue;

    const character = convertCharacter(legacyCharacter);
    const characterRef = doc(db, "users", cleanUid, "characters", character.id);
    const existingCharacter = await getDoc(characterRef);

    if (!existingCharacter.exists()) {
      await setDoc(characterRef, character);
      createdCharacters += 1;
    }
  }

  for (const legacyNote of notes) {
    if (!legacyNote.id) continue;

    const note = convertNote(legacyNote);
    const noteRef = doc(db, "users", cleanUid, "notes", note.id);
    const existingNote = await getDoc(noteRef);

    if (!existingNote.exists()) {
      await setDoc(noteRef, note);
      createdNotes += 1;
    }
  }

  await setDoc(
    doc(db, "users", cleanUid, "migrationStatus", "realtimeToFirestore"),
    {
      lastRunAt: serverTimestamp(),
      source: "realtime-database",
      target: "firestore",
      createdCharacters,
      createdNotes,
      mode: "manual",
    },
    { merge: true },
  );

  const preview = await previewRealtimeMigration(cleanUid);

  return {
    ...preview,
    createdCharacters,
    createdNotes,
  };
}
