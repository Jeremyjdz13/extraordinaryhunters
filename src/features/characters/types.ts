import { FieldValue, Timestamp } from 'firebase/firestore';


export type Pool = {
    current: number, 
    max?: number, 
    spent?: number
};

export type RichDoc = {
    format: "tiptap" | "markdown";
    content: any;
    updatedAt: FieldValue
};

export type GameEntity = 
    | Item
    | Skill
    | Spell
    | Stat
    | Stunt
    | Power
    | Merit
    | Flaw
    | Curse
    | Blessing
    | Background
    | SpellBook;

interface EntityBase {
    id: string;
    kind: string;
    name: string;
    rank?: number;
    description?:string;
    imageUrl?: string;
    tagIds?: string[];
};

interface Item extends EntityBase {
    kind: 'item'
    quantity: number;
    isArmor?: boolean;
    isWeapon?: boolean;
    isResistance?: boolean;
    isComponent?: boolean;
    isActive?:boolean;
    isProtoniumGenerator?:boolean;
    isScroll?:boolean;
    isTalisman?: boolean;
    talisman?: {
        stuntIds?: string[];
        spellIds?: string[];
    };
};

interface Stat extends EntityBase {
    kind: "stat";
}

interface FeatBase extends EntityBase {
    castingTime?: number;
    range?: number;
    duration?:number;
    attempts?: number;
    isAreaOfEffect?:boolean;
    isMastered?:boolean;
    isArmor?: boolean;
    isWeapon?: boolean;
    isResistance?: boolean;
    isComponent?: boolean;
    isActive?:boolean;
    isCondition?:boolean;
}

interface Skill extends EntityBase {
    kind: "skill";
    category: SkillCategory
}
interface Spell extends FeatBase {
    kind: "spell";
    componentIds?: string[];
    isProtoniumGenerator?:boolean;
}

interface Stunt extends FeatBase {
    kind: "stunt";
}

interface Power extends EntityBase {
    kind: "power";
    stuntIds: string[]
}

interface Merit extends EntityBase {
    kind: "merit"
}

interface Flaw extends EntityBase {
    kind: "flaw"
}

interface Background extends EntityBase {
    kind: "background"
}

interface Curse extends EntityBase {
    kind: 'curse'
}

interface Blessing extends EntityBase {
    kind: 'blessing'
}


interface SpellBook extends EntityBase {
    kind: 'spellbook';
    spellIds: string[];
}

type ConditionSourceKind = "item" | "spell" | "power" | "curse" | "blessing" | "stunt";

export type Condition = {
    id: string;
    kind: 'condition';
    label: string;
    sourceKind: ConditionSourceKind;
    sourceId: string; // Points to item/spell/power/curse/blessing
    resistanceIds?: string[];
    startedAt?: Timestamp;
    expiresAt?: Timestamp;
}

export type ResistanceFlags = {
    cold?: boolean;
    heat?: boolean;
    magic?: boolean;
    electricity?: boolean;
    toxic?: boolean;
    radiation?: boolean;
    psychic?: boolean;
    force?: boolean;
    acid?: boolean;
};


export type PrimaryAttributes = {
    strength: Stat;
    fight: Stat;
    agility: Stat;
    endurance: Stat;
    reason: Stat;
    intuition: Stat;
    psyche: Stat;
}


export type SkillCategory = "combat" | "physical" | "professional" | "mental";
export type Skills = Skill[];

export type CharacterContextProps = {
    characters: Character[]
    character: Character | undefined
    loading: boolean
    addCharacter: () => void
    deleteCharacter: (character: Character) => void
    editCharacter: (character: Character) => void
    setSelectedCharacter: (id: string) => void
};

export type Character = {
    id: string;
    name: string;
    alias?: string;
    nature?: string;
    portraitUrl?: string;

    createdAt: Timestamp;
    lastUpdate: Timestamp;

    isActive: boolean;
    isArchived: boolean;

    role: "hero" | "villain" | "npc";

    attributes: {
        primary: PrimaryAttributes;
    };

    skills: Skills;

    traits: {
        merits: Merit[];
        flaws: Flaw[];
        backgrounds: Background[];
    };
    condition: Condition[];
    resistances: ResistanceFlags;
    resources: {
        health: {
            bashing: Pool;
            lethal: Pool;
            death: Pool;
        };
        protonium: {
            pool: Pool;
            generators?: Item[]; // or ids
        };
        experience: Pool;
        karma: Pool;
        initiative: number;
    };

    inventory: {
        items: Item[];
    };

    powers: {
        powers: Power[];
        stunts: Stunt[]; // or Stunt[]
    };
    arcana: {
        spellbooks: SpellBook[];
        spells: Spell[];
    };

    story: {
        background: RichDoc;
    };
    rollLog?: { createdAt: Timestamp; formula: string; result: number }[];
};

export type EditCharacter = {
    editCharacter: (newCharacter: Character) => void
  }
  
export type CharacterCardProps = {
    character: CharacterData
}

export type CharacterButtonProps = {
    character: CharacterData
    key: string
}