import { INote } from "./types";

export const getNotes = (): INote[] => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith("note_"));
  const allNotes = keys.map(getNoteById);
  return allNotes.sort((a, b) => (a.dateCreated < b.dateCreated ? -1 : 1));
};

export const getNoteById = (id: string): INote => {
  return JSON.parse(localStorage.getItem(id));
};

export const createBlankNote = (): INote => {
  const newNote = {
    id: generateNoteID(),
    content: "",
    dateCreated: new Date().toISOString(),
  };

  localStorage.setItem(newNote.id, JSON.stringify(newNote));
  return newNote;
};

export const updateNote = (noteId: string, content: string) => {
  const note = getNoteById(noteId);
  note.content = content;
  note.dateUpdated = new Date().toISOString();
  localStorage.setItem(noteId, JSON.stringify(note));
  return note;
};

export const deleteNoteById = (nodeId: string) => {
  localStorage.removeItem(nodeId);
};

export const totalNotes = () => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith("note_"));
  return keys.length;
}

export const getFirstNote = () => {
  const allNotes = getNotes();
  return allNotes.length >= 0 ? allNotes[0] : null;
}

/**
 * Removes all blank notes
 */
export const clean = () => {
  const notes = getNotes().filter((note) => !note.content);
  notes.forEach(toDelete => {
    deleteNoteById(toDelete.id);
  })
};

const generateNoteID = () => "note_" + Math.random().toString(36).substr(2, 9);
