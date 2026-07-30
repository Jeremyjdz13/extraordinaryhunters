'use client'
import { useAuth } from "../features/auth/context/AuthContext"
import { 
          doc, 
          getDoc, 
          setDoc, 
          collection, 
          getDocs,
          getDocsFromServer,
    
        } from 'firebase/firestore'
import { 
        useState, 
        useEffect, 
        useContext,
        ReactNode,
    } from 'react'
import { db } from "@/config/firebaseconfig"
import { ref, getDatabase, get } from 'firebase/database'
import React from "react"
import { v4 as uuidv4 } from 'uuid';
import { serverTimestamp } from 'firebase/firestore';


type UserList = {
    users: UserData[]
}

type UserData = {
    id: string
    gameMaster: boolean
    editor: boolean
    player: boolean
    admin: boolean
    displayName: string | null
    email: string | null
    emailVerified: boolean
    createdAt: string
    lastLoginAt: string
} 

type ProfileContextProps = {
    user: UserData | undefined
    userList: UserList[]
    loading: boolean
}

const ProfileContext = React.createContext<ProfileContextProps>({
    user: undefined,
    userList: [],
    loading: true
})


export function useUserData() {
    const context = useContext(ProfileContext)
    if (!context) {
        throw new Error("useUserData must be used within an UserProvider")
    }
    return context
}

export function ProfileProvider({ children }: { children: ReactNode }) {

    const { currentUser, loading } = useAuth()
    const [user, setUser] = useState<UserData | undefined>()
    const [userList, setUserList] = useState<UserList[]>([])
 
    useEffect(() => {
        if (loading) {
          console.log(loading, 'Still initializing, do nothing');
          return; // still initializing, do nothing.
        }
        if (!currentUser) {
            // no user signed in!
            console.log('No user signed in!');
            setUser(undefined);
            // setLoading(false);
            return;
          }
        // user is logged in
        const profileDoc = doc(db, 'users', currentUser.uid);

        getDoc(profileDoc)
        .then((docSnapshot) => {
          if (!docSnapshot.exists()) {
            // didn't find a profile for this user
            console.log(docSnapshot, "not found")
            setDoc(profileDoc, {
              id: currentUser.uid,
              gameMaster: false,
              admin: false,
              editor: false,
              player: true,
              displayName: currentUser.displayName,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified,
              createdAt: currentUser.metadata.creationTime,
              lastLoginAt: currentUser.metadata.lastSignInTime,
            }).catch((error) =>
              console.log('Failed to initialize default profile', error)
            );
          } else {
            // Check to see currentUser.profile match displayName in database if not update attribute.
            const data = docSnapshot.data() as {
              id: string;
              gameMaster: boolean;
              editor: boolean;
              admin: boolean;
              player: boolean;
              displayName: string | null;
              email: string | null;
              emailVerified: boolean;
              createdAt: string;
              lastLoginAt: string;
            };
            const displayNameCheck = data.displayName === currentUser.displayName;
            const editor = data.editor;
            const admin = data.admin;
            const gameMaster = data.gameMaster;
            const player = data.player
              
            if (!displayNameCheck) {
              setDoc(profileDoc, {
                id: currentUser.uid,
                gameMaster: gameMaster,
                editor: editor,
                admin: admin,
                player: player,
                displayName: currentUser.displayName,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified,
                createdAt: currentUser.metadata.creationTime,
                lastLoginAt: currentUser.metadata.lastSignInTime,
              }).catch((error) =>
                console.log('Failed to update profile', error)
              );
            } else {
              console.log('Setting Profile');
              setUser(data);
              // setLoading(false);
            }
          }
        })
        .catch((error) => console.log('Error getting profile document', error));
  
      return () => {}; // no cleanup needed for Firestore

  }, [currentUser, loading]);


  useEffect(() => {
    if(!currentUser) return;

    const getUsers = async () => {
        const users: UserList[] = [];
        const querySnapshot = await getDocs(collection(db, "users"));
          
        querySnapshot.forEach((doc) => {
            const user = {users: [{id: doc.id, ...doc.data()} as UserData]} as UserList;
            users.push(user)
        })
        setUserList(users)

    }
    getUsers()

  }, [currentUser]);

 
  useEffect(() => {
    if (!currentUser) return;
  
    const migrateCharacterDocs = async () => {
      try {
        const realtimeDb = getDatabase();
        const characterRefs = ref(realtimeDb, `users/${currentUser.uid}/characters`);
  
        const snapshot = await get(characterRefs);
        if (snapshot.exists()) {
          const characters = JSON.parse(snapshot.val());
          console.log("Characters found in Realtime Database:", characters);
          const characterDocs = characters.map((character: any) => ({
            id: character.id,
            alias: character.alias,
            agility: character.primaryAttributes[2],
            backgrounds: character.backgrounds,
            backgroundStory: {
              id: uuidv4(),
              title: 'Background Story',
              markdown: 'Write your background story here.',
              tagIds: [],
            },
            bashing: {
              id: uuidv4(),
              name: 'Bashing',
              rank: 0,
            },
            campaign: [],
            combat: character.combatSkills.map(({...skill} : any) => ({
              ...skill,
              description: 'Coming Soon!',
              })
            ),
            createdAt: serverTimestamp(),
            death: {
              id: uuidv4(),
              name: 'Death',
              rank: 0,
            },
            endurance: character.primaryAttributes[3],
            experience: character.secondaryAttributes[3],
            fight: character.primaryAttributes[0],
            flaws: character.flaws.map(({...flaw} : any) => ({
              ...flaw,
              description: 'What about this flaw makes you want to reassure the gm it really is a flaw and not some hidden benefit?',
            })
          ),
            imageUrl: character.imageUrl,
            initiative: {
              id: uuidv4(),
              name: 'Initiative',
              rank: 0,
            },
            intuition: character.primaryAttributes[5],
            inventory: [
                ...character.equipmentItems.map((item: any) => ({
                  ...item,
                  isArmor: false,
                  isComponent: false,
                  isProtoniumGenerator: false,
                  isTalisman: false,
                  isWeapon:false,
                  isResistance: false,
                  isActive: false,
                  isSpellBook: false,
                  quantity: 1,
                })),
                ...character.talismans.map((item: any) => ({
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
            karma: character.secondaryAttributes[2],
            lethal: {
              id: uuidv4(),
              name: 'Lethal',
              rank: 0,
            },
            merits: character.merits.map(({...merit} : any) => ({
              ...merit,
              description: 'What about this merits makes you want to tell your friends about it?',
            })
          ),
            mental:  character.mentalSkills.map(({...skill} : any) => ({
              ...skill,
              description: 'Coming soon!',
              })
            ),
            name: character.name,
            nature: character.nature,
            physical:  character.physicalSkills.map(({...skill} : any) => ({
              ...skill,
              description: 'Coming soon!',
              })
            ),
            powers: character.powers.map(({...power} : any) => ({
                ...power,
                isResistance: false,
                stuntIds: [],
              })
            ),
            professional:  character.professionalSkills.map(({...skill} : any) => ({
              ...skill,
              description: 'Coming soon!',
              })
            ),
            protonium: character.secondaryAttributes[5],
            protoniumPool: {
              id: uuidv4(),
              name: 'Protonium Pool',
              rank: 0,
            },
            protoniumConsumed: {
              id: uuidv4(),
              name: 'Consumed Protonium',
              rank: 0,
            },
            psyche: character.primaryAttributes[6],
            reason: character.primaryAttributes[4],
            rollTally: [
              {
                id: uuidv4(),
                rollDate: '',
                name: 'Roll Tally',
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
                statsUsed: [{
                    name: 'Stat Used',
                    rank: 0,
                  },
                  {
                    name: 'Stat Used',
                    rank: 0,
                  }
                ]
              }
            ],
            resistances: [
              {isColdResistant: false},
              {isHeatResistant: false},
              {isMagicResistant: false},
              {isElectricityResistant: false},
              {isToxicResistant: false},
              {isRadiationResistant: false},
              {isPsychicResistant: false},
              {isForceResistant: false},
              {isAcidResistant: false},
            ],
            spellbooks: [],
            spells: character.spellbook.map(({rank, purchased, ...item }: any) => ({
              ...item,
              attempts: rank,
              castingTime: "instant",
              duration: "string", 
              rank: rank = 0,
              range: 'self',
              componentIds: [],
              isMastered: false,
              isArmor: false,
              isComponent: false,
              isAreaOfEffect: false,
              isPurchased: purchased,
              isTargeted: false,
              isActive: false,
              isWeapon: false,
              isResistance: false
            })),
            strength: character.primaryAttributes[1],
            stunts: character.powerStunts.map(({rank, ...item}: any) => ({
              ...item, 
              attempts: rank,
              chargeTime: "instant",
              duration: "instant",
              range: 'self',
              rank: rank = 0,
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
          }));
  
          // Firestore write logic
          const charactersRef = collection(db, "users", currentUser.uid, "characters");
  
          const writePromises = characterDocs.map(async (character: any) => {
            if (!character.id) {
              console.error("Skipping character without an ID:", character);
              return; // Skip this character if no ID exists
            }
  
            const docRef = doc(charactersRef, character.id);
            const docSnap = await getDoc(docRef);
  
            if (docSnap.exists()) {
              console.log(`Character ${character.id} already exists. Skipping.`);
              return; // Skip if character already exists in Firestore
            } else {
              await setDoc(docRef, character); // Add character to Firestore
              console.log(`Character ${character.id} successfully written!`);
            }
          });
            
          await Promise.all(writePromises);
        } else {
          console.log("No characters found in Realtime Database.");
        }
      } catch (error) {
        console.error("Error adding documents:", error);
      }
    };
  
    migrateCharacterDocs();
  }, [currentUser]);
  // collect Notes from the realtime database and convert to filestore documents.
  useEffect(() => {
    if(!currentUser) return;

    const migrateNoteDocs = async () => {
      try {
        const realtimeDb = getDatabase();
        const journalRefs = ref(realtimeDb, `users/${currentUser.uid}/journal`);
  
        const snapshot = await get(journalRefs);
        if (snapshot.exists()) {
          const notes = JSON.parse(snapshot.val());
          console.log('Notes found:', notes);
  
          // Convert notes to Firestore documents
          const journalDocs = notes.map(({ creationDate, editDate, body, ...note }: any) => {
            return {
              ...note,
              markdown: body,
              createdAt: creationDate,
              lastUpdate: editDate,
              tagIds: []
            };
          });
  
          // Firestore collection reference
          const journalCollectionRef = collection(db, 'users', currentUser.uid, 'notes');
  
          // Create writePromises for all notes
          const writePromises = journalDocs.map(async (note: any) => {
            if (!note.id) {
              console.error("Skipping note without an ID:", note);
              return; // Skip this note if no ID exists
            }
  
            const docRef = doc(journalCollectionRef, note.id);
            const docSnap = await getDoc(docRef);
  
            if (docSnap.exists()) {
              console.log(`Note ${note.id} already exists. Skipping.`);
              return; // Skip if note already exists in Firestore
            } else {
              await setDoc(docRef, note); // Add note to Firestore
              console.log(`Note ${note.id} successfully written!`);
            }
          });
  
          // Wait for all promises to resolve
          await Promise.all(writePromises);
          // console.log("All notes successfully written!");
        } else {
          console.log('No notes found in Realtime Database.');
        }
      } catch (error) {
        console.error('Error retrieving user or adding notes:', error);
      }
    };
  
    migrateNoteDocs();

  }, [currentUser]);

  const value: ProfileContextProps = {
    user,
    userList,
    loading,
  };

  return <ProfileContext.Provider value={value}>
          {!loading && children}
        </ProfileContext.Provider>;
}

// function serverTimestamp() {
//   throw new Error("Function not implemented.")
// }
