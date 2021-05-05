import { INote } from "./types";
import "./prefer-color-scheme";
import * as NoteService from "./NoteService";

const currentVersion = "0.1.0";

class App {
  editor = document.getElementById("editor") as HTMLTextAreaElement;
  noteBtns = document.getElementById("noteBtns");
  lastModified = document.getElementById("lastModified");
  downloadNoteBtn = document.getElementById("downloadNoteBtn") as HTMLButtonElement;
  deleteNoteBtn = document.getElementById("deleteNoteBtn") as HTMLButtonElement;
  navToggleBtn = document.getElementById("navToggleBtn") as HTMLButtonElement;
  backBtn = document.getElementById("backBtn") as HTMLButtonElement;
  addNoteBtn = document.getElementById("addNoteBtn") as HTMLButtonElement;
  fontSS = document.getElementById("fontSS") as HTMLLinkElement;

  activeNoteId: string;
  activeNoteBtn: HTMLButtonElement;

  constructor() {
    const version = localStorage.getItem("version") ?? currentVersion;
    if (version !== currentVersion) {
      // run migrations if data is an older version
    }
    localStorage.setItem("version", currentVersion);

    const notes = NoteService.getNotes();

    notes.map((note) => {
      this.createButton(note);
    });

    if (!notes.length) {
      this.createBlankNote();
    } else {
      this.loadNote(notes[0].id);
    }

    this.noteBtns.querySelector(".note-btn").classList.add("note-btn--active");

    this.editor.addEventListener("keyup", (event) => this.handleKeyUp(event));

    this.addNoteBtn.addEventListener("click", this.createBlankNote);

    this.downloadNoteBtn?.addEventListener("click", this.saveCurrentNoteToFile);

    this.navToggleBtn.addEventListener("click", () => {
      document.body.classList.add("menu-open");
    });

    this.backBtn.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
    });

    this.deleteNoteBtn.addEventListener("click", () => {
      const response = confirm("Are you sure you want to delete this note?");
      if(response) {
        this.deleteActiveNote();
      }
    });

    window.onbeforeunload = () => {
      NoteService.clean();
    };
  }

  private loadNote(id: string) {
    this.activeNoteId = id;
    const note = NoteService.getNoteById(id);
    this.editor.value = note.content;
    this.editor.focus();
    this.editor.scrollTo(0, 0);
    this.activeNoteBtn = this.noteBtns.querySelector(`[data-id=${note.id}]`) as HTMLButtonElement;
    this.lastModified.innerText = note.dateUpdated
      ? `Updated: ${new Date(note.dateUpdated).toLocaleString()}`
      : "";
    document.body.classList.remove("menu-open");
    this.updatePageTitle(note);

  }

  private generateButtonText(note: INote) {
    const trimmed = note.content.trim();
    const res = trimmed
      ? trimmed.substr(0, trimmed.indexOf("\n") > -1 ? trimmed.indexOf("\n") : 100)
      : "📄 blank";
    return res;
  }

  private createButton(note: INote) {
    const btn = document.createElement("button");
    btn.classList.add("note-btn");
    if (note.id === this.activeNoteId) {
      btn.classList.add("note-btn--active");
    }
    btn.innerText = this.generateButtonText(note);
    btn.setAttribute("data-id", note.id);
    btn.addEventListener("click", () => {
      this.loadNote(note.id);
      Array.from(this.noteBtns.querySelectorAll(".note-btn--active")).forEach((btn) => {
        btn.classList.remove("note-btn--active");
      });
      btn.classList.add("note-btn--active");
    });
    this.noteBtns.appendChild(btn);
  }

  private createBlankNote = () => {
    const newNote = NoteService.createBlankNote();
    this.createButton(newNote);
    this.loadNote(newNote.id);
  };

  private saveCurrentNoteToFile = () => {
    const content = this.editor.value as string;
    const blob = new Blob([content], { type:"text/plain;charset=UTF-8"});
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "note.txt";
    a.click();
    URL.revokeObjectURL(blobUrl)
  };

  private handleKeyUp(e: Event) {
    const note = NoteService.updateNote(this.activeNoteId, e.target.value);
    this.lastModified.innerText = `Updated: ${new Date(note.dateUpdated).toLocaleString()}`
    this.activeNoteBtn.innerText = this.generateButtonText(note);
    this.updatePageTitle(note);
  }

  private deleteActiveNote() {
    const note = NoteService.getNoteById(this.activeNoteId);
    NoteService.deleteNote(note);
    const notes = NoteService.getNotes();
    document.querySelector(`.note-btn[data-id=${this.activeNoteId}]`).remove();
    
    if(notes.length === 0) {
      this.createBlankNote();
    }else {
      this.loadNote(notes[0].id);
    }
  }

  private updatePageTitle(note: INote) {
    document.title = `Notepad / ${this.generateButtonText(note)}`;
  }
}

new App();
