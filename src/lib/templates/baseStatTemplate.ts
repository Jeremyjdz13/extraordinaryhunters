import { doc, collection } from "../firebase"
import { db } from "@/lib/firebase"

export const createNewStat = () => (
    {
        id: doc(collection(db, "skills")).id,
        name: 'skill/merit/flaw/background',
        rank: 1,
        description: 'What does this stat do?',
        tags: []
    }
)