'use client'
import React, { useState, useEffect, useContext, ReactNode, useMemo } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from "uuid";
import { noteTemplate, tagTemplate } from '../../../context/DefaultDataTemplates'
import { Note, NoteData, RawNote, RawNoteData, Tag } from './/NoteDataTypes'
import firebase_app from '@/config/firebaseconfig'


type NoteContextProps = {
    notes: RawNote[]
    tags: Tag[]
    selectedNote: RawNote | undefined
    createNote: (note: RawNoteData) => void
    updateNote: (id: string, note: RawNoteData) => void
    selectNote: (id: string) => void
    deleteNote: (id: string) => void
}

const NoteContext = React.createContext<NoteContextProps | undefined>(undefined)

export function useNote(): NoteContextProps | undefined {
    return useContext(NoteContext)
}

export function NoteProvider({ children }: { children: ReactNode}) {
    const db = getFirestore(firebase_app)
    const { currentUser, loading: loadingUser } = useAuth()
    const [notes, setNotes] = useState<RawNote[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
   
    if(!currentUser) {
        return <></>
    }

    const notesRef = collection(db, 'users', currentUser.uid, 'notes');
    const tagsRef = collection(db, 'users', currentUser.uid, 'tags');
   

    useEffect(() => {

        if(loadingUser) {
            return;
        }

        if(!currentUser) {
            setNotes([])
            setTags([])
            setLoading(false)
            return
        }

        getDocs(notesRef)
        .then((querySnapshot) => {
            const noteData = querySnapshot.docs.map((doc) => doc.data() as Note[]);
            if(noteData.length === 0){
            
            setDoc(doc(notesRef, noteTemplate.id), noteTemplate).then(() => {
                console.log("Note template successfully written!");
                setNotes([noteTemplate] as any);
                console.log("Adding a character")
            })
                .catch((error) => 
                    console.log('Failed to initialize default characters', error)
                )
            } else {
                setNotes(noteData as any)
                console.log("Note document successfully retrieved from database!");
            }
            setLoading(false);        
        })
        .catch((error) => {
            console.error('Error retrieving notes:', error);
            setLoading(false);
        })
        
        getDocs(tagsRef)
        .then((querySnapshot) => {
            const tagData = querySnapshot.docs.map((doc) => doc.data() as Tag[]);
            if(tagData.length === 0){
            
                setDoc(doc(tagsRef, tagTemplate.id), tagTemplate).then(() => {
                console.log("Tag template successfully written!");
                setTags([tagTemplate] as any);
            })
                .catch((error) => 
                    console.log('Failed to initialize default characters', error)
                )
            } else {
                setTags(tagData as any)
                console.log("Tag document successfully retrieved from database!");
            }
            setLoading(false);        
        })
        .catch((error) => {
            console.error('Error retrieving tags:', error);
            setLoading(false);
        })
      

    },[currentUser, loadingUser, notesRef, tagsRef])

   
    useEffect(() => {

        if(loadingUser) {
            return;
        }

        if(!currentUser) {
            setNotes([])
            setTags([])
            setLoading(false)
            return
        }

        const unsubscribe = onSnapshot(notesRef, (querySnapshot) => {
          const updatedNotes: Note[] = [];
          querySnapshot.forEach((doc) => {
            if (doc.exists()) {
              const data = doc.data();
              updatedNotes.push(data as Note);
              console.log(data, "Data");
            } else {
              console.log("Document deleted");
            }
          });
      
          // Merge the updatedNotes with the existing notes
          setNotes([...notes, ...updatedNotes]);
        });
      
        return () => unsubscribe();
      }, [currentUser, loadingUser, notes, notesRef]);
    
    const notesWithTags = useMemo(() => {
        return notes?.map(note => {
            const noteTags = note.tagIds || []
            return {
                ...note,
                tags: tags.filter(tag => noteTags.includes(tag.id))
            }
        }
        )
    }
    , [notes, tags])


    async function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    
        const collectionRef = collection(db, 'users', currentUser!.uid, 'notes')
        const querySnapshot = await getDocs(collectionRef)
        
        let noteCollectionDocId = ''
        querySnapshot.forEach((doc) => {
            if(doc.data().id === id){
                noteCollectionDocId = doc.id
            }
        })

        const docRef = doc(db, 'users', currentUser!.uid, 'notes', noteCollectionDocId );

        await setDoc(docRef, {
            tags: tags.map((tag: any) => tag.id),
            ...data,
        })
        .then(() => {
            console.log('Document successfully updated!');
        })
        .catch((error) => {
            console.error('Error updating document:', error);
        });
    }

    function onCreateNote({ tags, ...data }: NoteData) {
        setDoc(doc(notesRef, data.id), {
          tags: tags.map((tag: any) => tag.id),
          ...data,
        })
          .then(() => {
            console.log('Note document successfully created!');
          })
          .catch((error) => {
            console.error('Error creating note document:', error);
          });
      }
      
    function onAddTag(tag: Tag) {
        setDoc(doc(tagsRef, tag.id), {
            ...tag,
          })
            .then(() => {
              console.log('Note document successfully created!');
            })
            .catch((error) => {
              console.error('Error creating note document:', error);
            });
        
    }

   async function onDeleteNote (id: string) {
        await deleteDoc(doc(db, "users", currentUser!.uid, "notes", id));
    }

    async function onUpdateTag(id: string, label: string) {
        const collectionRef = collection(db, 'users', currentUser!.uid, 'tags')
        const querySnapshot = await getDocs(collectionRef)
        
        let tagCollectionDocId = ''

        querySnapshot.forEach((doc) => {
            if(doc.data().id === id){
                tagCollectionDocId = doc.id
            }
        })

        const docRef = doc(db, 'users', currentUser!.uid, 'tags', tagCollectionDocId );

        await setDoc(docRef, {
            id,
            label
        })
        .then(() => {
            console.log('Document successfully updated!');
        })
        .catch((error) => {
            console.error('Error updating document:', error);
        });
    }

    async function onDeleteTag(id: string) {
        await deleteDoc(doc(db, "users", currentUser!.uid, "tags", id));
            
    }
    const noteContextValue: NoteContextProps = {
        notes,
        tags,
        onUpdateNote,
        onCreateNote,
        onDeleteNote,
        onUpdateTag,
        onDeleteTag,
        onAddTag,
        notesWithTags
    }

    return (
        <NoteContext.Provider value={noteContextValue}>
            {children}
        </NoteContext.Provider>
    )
}


 