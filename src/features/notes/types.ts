export type Note = {
    id: string
} & NoteData

export type RawNote = {
    id: string
} & RawNoteData

export type RawNoteData = {
    id: string
    title: string
    markdown: string
    tagIds: string[]
}
export type NoteData = {
    id: string
    title: string
    markdown: string
    imageUrl: string
    tagIds: Tag[]
    createdAt: Date
    lastUpdate: Date
}

export type Tag = {
    id: string
    label: string
}