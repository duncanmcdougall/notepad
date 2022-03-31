import { INote } from "./types";

export const getNotes = (): INote[] => {
  const allNotes = Object.keys(localStorage)
    .filter((key) => key.startsWith("note_"))
    .map(getNoteById);
  return allNotes.sort((a, b) => (a.dateCreated < b.dateCreated ? -1 : 1));
};

export const getNoteById = (id: string): INote => JSON.parse(localStorage.getItem(id));

export const createBlankNote = (): INote => {
  const newNote = {
    id: generateNoteID(),
    content: "",
    dateCreated: new Date().toISOString(),
  };

  localStorage.setItem(newNote.id, JSON.stringify(newNote));
  return newNote;
};

export const createNoteWithText = (text: string): INote => {
  const newNote = {
    id: generateNoteID(),
    content: text,
    dateCreated: new Date().toISOString(),
  };

  localStorage.setItem(newNote.id, JSON.stringify(newNote));
  return newNote;
};

export const updateNote = (note: INote, content: string) => {
  note.content = content;
  note.dateUpdated = new Date().toISOString();
  localStorage.setItem(note.id, JSON.stringify(note));
};

export const deleteNote = (note: INote) => localStorage.removeItem(note.id);

export const totalNotes = () =>
  Object.keys(localStorage).filter((key) => key.startsWith("note_")).length;

export const getFirstNote = () => {
  const allNotes = getNotes();
  return allNotes.length >= 0 ? allNotes[0] : null;
};

/**
 * Removes all blank notes
 */
export const clean = () =>
  getNotes()
    .filter((note) => !note.content)
    .forEach(deleteNote);

const generateNoteID = () => "note_" + Math.random().toString(36).substr(2, 9);
