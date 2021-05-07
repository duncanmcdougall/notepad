import { INote } from "./types";

export const getNotes = (): INote[] => {
  const result = JSON.parse(localStorage.getItem("notes")) as INote[];
  if (!!result) {
    return result.sort((a, b) => (a.dateCreated < b.dateCreated ? -1 : 1));
  }
  return [];
};

export const getNoteById = (id: string): INote => {
  return getNotes().find((note) => note.id === id);
};

export const createBlankNote = (): INote => {
  const newNote = {
    id: generateNoteID(),
    content: "",
    dateCreated: new Date().toUTCString(),
  };
  const notes = [...getNotes(), newNote];
  localStorage.setItem("notes", JSON.stringify(notes));

  return newNote;
};

export const updateNote = (noteId: string, content: string) => {
  const notes = getNotes();
  const noteToUpdate = notes.find((n) => n.id === noteId);
  noteToUpdate.content = content;
  noteToUpdate.dateUpdated = new Date().toUTCString();
  setNotes(notes);
  return noteToUpdate;
};

export const deleteNote = (noteToDelete: INote) => {
  const otherNotes = getNotes().filter((note) => note.id !== noteToDelete.id);
  setNotes(otherNotes);
};

/**
 * Removes all blank notes
 */
export const clean = () => {
  const notes = getNotes().filter((note) => !!note.content);
  setNotes(notes);
};

const setNotes = (notes: INote[]) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

const generateNoteID = () => "_" + Math.random().toString(36).substr(2, 9);
