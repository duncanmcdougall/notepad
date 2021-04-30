import { INote } from "./types";
import { generateID } from "./utils";

const currentVersion = "1.0.0";

class App {
  editor = document.getElementById("editor") as HTMLTextAreaElement;
  noteBtns = document.getElementById("noteBtns");
  lastModified = document.getElementById("lastModified");
  activeNoteId: string;
  activeNoteBtn: HTMLButtonElement;

  constructor() {
    const version = localStorage.getItem("version") ?? currentVersion;
    if (version !== currentVersion) {
      // run migrations if data is an older version
      // ...
      localStorage.setItem("version", currentVersion);
    }

    this.editor.addEventListener("keyup", (event) => this.handleKeyUp(event));

    const notes = this.getNotes();

    notes.map((note) => {
      this.createButton(note);
    });

    if (!notes.length) {
      this.createNote();
    } else {
      this.loadNote(notes[0].id);
    }

    this.noteBtns.querySelector("button").classList.add("active");

    document.querySelector("#addNoteBtn").addEventListener("click", () => {
      this.createNote();
      this.editor.focus();
    });
  }

  private getNotes(): INote[] {
    return JSON.parse(localStorage.getItem("notes")) ?? [];
  }

  private loadNote(id: string) {
    this.activeNoteId = id;
    const note = this.getNotes().find((note) => note.id === id);
    this.editor.value = note.content;
    this.editor.focus();
    this.activeNoteBtn = (this.noteBtns.querySelector(
      `[data-id=${note.id}]`
    ) as HTMLButtonElement);
    this.lastModified.innerText = note.lastModified ? `Updated: ${new Date(note.lastModified).toLocaleString()}` : "";
  }

  private generateButtonText(note: INote) {
    return `📑 ${note.content ? note.content.trim().substring(0, 10).trim() : "blank"}`;
  }

  private createButton(note: INote) {
    const btn = document.createElement("button");
    if (note.id === this.activeNoteId) {
      btn.classList.add("active");
    }
    btn.innerText = this.generateButtonText(note);
    btn.setAttribute("data-id", note.id);
    btn.addEventListener("click", () => {
      this.loadNote(note.id);
      Array.from(this.noteBtns.querySelectorAll(".active")).forEach((btn) => {
        btn.classList.remove("active");
      });
      btn.classList.add("active");
    });
    this.noteBtns.appendChild(btn);
  }

  private setNotes = (notes) => {
    localStorage.setItem("notes", JSON.stringify(notes));
  };

  private createNote = () => {
    const newNote: INote = { id: generateID(), content: "" };
    this.setNotes([...this.getNotes(), newNote]);
    this.loadNote(newNote.id);
    this.createButton(newNote);
  };

  private handleKeyUp(e: Event) {
    const notes = this.getNotes();
    const note = notes.find((note) => note.id === this.activeNoteId);
    note.content = e.target.value as string;
    note.lastModified = new Date().toISOString();
    this.lastModified.innerText = note.lastModified ? `Updated: ${new Date(note.lastModified).toLocaleString()}` : "";
    this.setNotes(notes);
    const btnText = this.generateButtonText(note);
    if(btnText !== this.activeNoteBtn.innerText) {
      this.activeNoteBtn.innerText = btnText;
    }
  }
}

new App();
