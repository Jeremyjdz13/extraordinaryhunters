import type { DocumentData } from "firebase/firestore";

export type CharacterStat = {
  name: string;
  rank: number;
};

export type CharacterSummary = {
  id: string;
  name: string;
  alias: string;
  nature: string;
  imageUrl: string;
  primaryStats: CharacterStat[];
  resources: CharacterStat[];
  combat: CharacterStat[];
  physical: CharacterStat[];
  mental: CharacterStat[];
  professional: CharacterStat[];
  powers: CharacterStat[];
  stunts: CharacterStat[];
  spells: CharacterStat[];
  inventory: CharacterStat[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stat(value: unknown, fallbackName: string): CharacterStat {
  if (!isRecord(value)) {
    return { name: fallbackName, rank: 0 };
  }

  return {
    name: text(value.name, fallbackName),
    rank: number(value.rank),
  };
}

function statList(value: unknown): CharacterStat[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => stat(item, `Item ${index + 1}`));
}

function nestedPrimaryStats(data: Record<string, unknown>) {
  const attributes = isRecord(data.attributes) ? data.attributes : undefined;
  const primary = attributes && isRecord(attributes.primary) ? attributes.primary : undefined;

  if (!primary) return [];

  return [
    stat(primary.strength, "Strength"),
    stat(primary.fight, "Fight"),
    stat(primary.agility, "Agility"),
    stat(primary.endurance, "Endurance"),
    stat(primary.reason, "Reason"),
    stat(primary.intuition, "Intuition"),
    stat(primary.psyche, "Psyche"),
  ];
}

function flatPrimaryStats(data: Record<string, unknown>) {
  return [
    stat(data.strength, "Strength"),
    stat(data.fight, "Fight"),
    stat(data.agility, "Agility"),
    stat(data.endurance, "Endurance"),
    stat(data.reason, "Reason"),
    stat(data.intuition, "Intuition"),
    stat(data.psyche, "Psyche"),
  ];
}

function nestedResources(data: Record<string, unknown>) {
  const resources = isRecord(data.resources) ? data.resources : undefined;

  if (!resources) return [];

  const health = isRecord(resources.health) ? resources.health : undefined;
  const protonium = isRecord(resources.protonium) ? resources.protonium : undefined;

  return [
    stat(health?.bashing, "Bashing"),
    stat(health?.lethal, "Lethal"),
    stat(health?.death, "Death"),
    stat(protonium?.pool, "Protonium Pool"),
    stat(resources.karma, "Karma"),
    stat(resources.experience, "Experience"),
    { name: "Initiative", rank: number(resources.initiative) },
  ];
}

function flatResources(data: Record<string, unknown>) {
  return [
    stat(data.bashing, "Bashing"),
    stat(data.lethal, "Lethal"),
    stat(data.death, "Death"),
    stat(data.protonium, "Protonium"),
    stat(data.protoniumPool, "Protonium Pool"),
    stat(data.protoniumConsumed, "Consumed Protonium"),
    stat(data.karma, "Karma"),
    stat(data.experience, "Experience"),
    stat(data.initiative, "Initiative"),
  ];
}

function nestedList(
  data: Record<string, unknown>,
  groupName: string,
  listName: string,
) {
  const group = isRecord(data[groupName]) ? data[groupName] : undefined;

  return group ? statList(group[listName]) : [];
}

export function characterFromDoc(id: string, data: DocumentData): CharacterSummary {
  const record = data as Record<string, unknown>;
  const nestedStats = nestedPrimaryStats(record);
  const nestedResourceStats = nestedResources(record);

  return {
    id,
    name: text(record.name, "Unnamed Character"),
    alias: text(record.alias),
    nature: text(record.nature),
    imageUrl: text(record.imageUrl) || text(record.portraitUrl),
    primaryStats: nestedStats.length > 0 ? nestedStats : flatPrimaryStats(record),
    resources:
      nestedResourceStats.length > 0 ? nestedResourceStats : flatResources(record),
    combat: statList(record.combat),
    physical: statList(record.physical),
    mental: statList(record.mental),
    professional: statList(record.professional),
    powers: nestedList(record, "powers", "powers").concat(statList(record.powers)),
    stunts: nestedList(record, "powers", "stunts").concat(statList(record.stunts)),
    spells: nestedList(record, "arcana", "spells").concat(statList(record.spells)),
    inventory: nestedList(record, "inventory", "items").concat(
      statList(record.inventory),
    ),
  };
}
