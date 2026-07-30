'use client'
import React, { useState, useEffect, useContext, ReactNode } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { 
  collection, 
  deleteDoc, 
  doc, 
  getDocs, 
  getFirestore, 
  onSnapshot, 
  query, 
  setDoc, 
  updateDoc, 
  where 
} from 'firebase/firestore'
import { characterTemplate } from '../../../context/DefaultDataTemplates'
import { CharacterContextProps, Character, } from '../../../context/CharacterTypes'
import { firebase_app } from '@/config/firebaseconfig'

const CharacterContext = React.createContext<CharacterContextProps | undefined>(undefined)



export function useCharacter(): CharacterContextProps | undefined {
    return useContext(CharacterContext)
}

export function CharacterProvider({ children }: { children: ReactNode}) {
    const { currentUser, loading: loadingUser } = useAuth()
    const [characters, setCharacters] = useState<Character[]>([])
    const [character, setCharacter] = useState<Character | undefined>(undefined)

    const [loading, setLoading] = useState(true)
    const db = getFirestore(firebase_app)
    
    useEffect(() => {
        if(loadingUser){
            return; // still initializing, do nothing.
        }

        if(!currentUser){
            //no user signed in!
            setCharacters([]);
            setLoading(false)
            return;
        }
        // user is logged in.

        const charactersRef = collection(db, 'users', currentUser.uid, 'characters')
        
        // const createCharacters = collection(db, 'user', currentUser.uid)

        getDocs(charactersRef)
            .then((querySnapshot) => {
                const charactersData = querySnapshot.docs.map((doc) => doc.data() as Character);
                if(charactersData.length === 0){
                
                  console.log(charactersData, "not found")
                } else {
                    setCharacters(charactersData)
                    console.log("Characters Loaded")
                }
                setLoading(false);        
            })
            .catch((error) => {
                console.error('Error retrieving characters:', error);
                setLoading(false);
            }) 
    }, [currentUser, loadingUser, db]);

    useEffect(() => {

        if(loadingUser){
            return; // still initializing, do nothing.
        }

        if(!currentUser){
            //no user signed in!
            setLoading(false)
            return;
        }
        const collectionRef = collection(db, 'users', currentUser.uid, 'characters')
    
        setLoading(true);
     
        const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
          const items: any = [];
          querySnapshot.forEach((doc) => {
            items.push(doc.data());
          });
          setCharacters(items);
          setLoading(false);
        });
        return () => {
          unsubscribe();
        };
    
        // eslint-disable-next-line
      }, []);
    
      async function addCharacter() {
        const collectionRef = currentUser ? collection(db, 'users', currentUser.uid, 'characters') : null;
        console.log("Add Character")
        const newCharacter = characterTemplate
    
        if(collectionRef) {
          try {
            const characterRef = doc(collectionRef, newCharacter.id);
            await setDoc(characterRef, newCharacter);
          } catch (error) {
            console.error(error);
          }
        }
      }

      async function deleteCharacter(character: Character) {

        
        const collectionRef = collection(db, 'users', currentUser?.uid || '', 'characters');

        try {
          const characterRef = doc(collectionRef, character.id);
          await deleteDoc(characterRef);
        } catch (error) {
          console.error(error);
        }
      }
    // EDIT FUNCTION
    async function editCharacter(character: Character) {
      if (!character) return;

      const collectionRef = collection(db, 'users', currentUser?.uid || '', 'characters')

      const generators = character?.inventory.filter(item => item.isProtoniumGenerator === true)
      const generatorTotal = generators?.reduce((total, protoniumTotal) => total + protoniumTotal.rank, 0);
      const protoniumPoolTotal = (character?.protonium.rank ?? 0) + (generatorTotal ?? 0)
      const protoniumConsumedTotal = character?.protoniumConsumed.rank
      const protoniumPoolTotalMinusConsumed = protoniumPoolTotal - (protoniumConsumedTotal ?? 0)

      const updatedCharacter = {
        ...character,
        protoniumPool: {
            ...character.protoniumPool,
            rank: protoniumPoolTotalMinusConsumed
        }
    };

      try {
        const characterRef = doc(collectionRef, character.id);
        updateDoc(characterRef, updatedCharacter);
      } catch (error) {
        console.error(error);
      }
      
    }

    function setSelectedCharacter(id: string) {
        const selectedCharacter = characters.find(character => character.id === id)
        setCharacter(selectedCharacter)
    }

    const characterContextValue: CharacterContextProps = {
        characters,
        character,
        loading,
        addCharacter,
        deleteCharacter,
        editCharacter,
        setSelectedCharacter
    }

    return (
        <CharacterContext.Provider value={characterContextValue}>
            {!loading && children}             
        </CharacterContext.Provider>
    )
}


// Update Helpers
// function updateById<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>) {
//   return arr.map(x => (x.id === id ? { ...x, ...patch } : x));
// }


// setCharacter(c => ({
//   ...c,
//   powers: {
//     ...c.powers,
//     powers: updateById(c.powers.powers, powerId, { rank: newRank })
//   }
// }));



//Editing changes Stored Collections as maps
// type EntityMap<T extends { id: string }> = Record<string, T>;

// powers: EntityMap<Power>;

// powers: { ...c.powers, [id]: { ...c.powers[id], rank: newRank } }

// export function updateById<T extends { id: string }>(
//   list: T[],
//   id: string,
//   patch: Partial<T>
// ): T[] {
//   return list.map(x => (x.id === id ? { ...x, ...patch } : x));
// }


// setCharacter(c => ({
//   ...c,
//   attributes: {
//     ...c.attributes,
//     primary: {
//       ...c.attributes.primary,
//       strength: { ...c.attributes.primary.strength, rank: newRank }
//     }
//   }
// }));


// type PrimaryKey = keyof PrimaryAttributes;

// function updatePrimaryRank(c: Character, key: PrimaryKey, rank: number): Character {
//   return {
//     ...c,
//     attributes: {
//       ...c.attributes,
//       primary: {
//         ...c.attributes.primary,
//         [key]: { ...c.attributes.primary[key], rank }
//       }
//     }
//   };
// }
