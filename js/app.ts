import { INote } from "./types";
import "./prefer-color-scheme";
import * as NoteService from "./NoteService";
import { runMigrations } from "./migrations";

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
  toggleFullWidthBtn = document.getElementById("toggleFullWidthBtn") as HTMLButtonElement;
  toggleWordWrapBtn = document.getElementById("toggleWordWrapBtn") as HTMLButtonElement;

  activeNote: INote;
  activeNoteBtn: HTMLButtonElement;

  constructor() {
    runMigrations();

    // Full Width/Narrow setting
    !!localStorage.getItem("narrow") && document.body.classList.add("narrow");
    this.toggleFullWidthBtn.addEventListener("click", () => {
      const narrow = document.body.classList.toggle("narrow");
      narrow ? localStorage.setItem("narrow", "1") : localStorage.removeItem("narrow");
    });

    !!localStorage.getItem("nowrap") && document.body.classList.add("nowrap");
    this.toggleWordWrapBtn.addEventListener("click", () => {
      const narrow = document.body.classList.toggle("nowrap");
      narrow ? localStorage.setItem("nowrap", "1") : localStorage.removeItem("nowrap");
    });

    const notes = NoteService.getNotes();

    notes.map((note) => {
      this.createButton(note);
    });

    const note = NoteService.getNoteById(localStorage.getItem("activeNoteId"));
    if (!!note) {
      this.loadNote(note);
    } else if (!notes.length) {
      this.createBlankNote();
    } else {
      this.loadNote(NoteService.getFirstNote());
    }

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
      if (response) {
        this.deleteActiveNote();
      }
    });

    window.onbeforeunload = () => {
      NoteService.clean();
    };

    setTimeout(() => {
      document.body.classList.remove("preload");
    }, 500);
  }

  private loadNote(note: INote) {
    this.activeNote = note;
    this.editor.value = note.content;
    this.editor.focus();
    this.editor.scrollTo(0, 0);
    this.activeNoteBtn = this.noteBtns.querySelector(`[data-id=${note.id}]`) as HTMLButtonElement;
    this.lastModified.innerText = note.dateUpdated
      ? `Updated: ${new Date(note.dateUpdated).toLocaleString()}`
      : "";
    document.body.classList.remove("menu-open");
    this.updatePageTitle();
    localStorage.setItem("activeNoteId", note.id);
    Array.from(this.noteBtns.querySelectorAll(".note-btn--active")).forEach((btn) => {
      btn.classList.remove("note-btn--active");
    });
    this.activeNoteBtn.classList.add("note-btn--active");
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
    btn.innerText = this.generateButtonText(note);
    btn.setAttribute("data-id", note.id);
    btn.addEventListener("click", () => {
      const noteToOpen = NoteService.getNoteById(note.id);
      this.loadNote(noteToOpen);
    });
    this.noteBtns.appendChild(btn);
  }

  private createBlankNote = () => {
    const newNote = NoteService.createBlankNote();
    this.createButton(newNote);
    this.loadNote(newNote);
  };

  private saveCurrentNoteToFile = () => {
    const content = this.editor.value as string;
    const blob = new Blob([content], { type: "text/plain;charset=UTF-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "note.txt";
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  private handleKeyUp(e: Event) {
    NoteService.updateNote(this.activeNote, e.target.value);
    this.lastModified.innerText = `Updated: ${new Date(
      this.activeNote.dateUpdated
    ).toLocaleString()}`;
    this.activeNoteBtn.innerText = this.generateButtonText(this.activeNote);
    this.updatePageTitle();
  }

  private deleteActiveNote() {
    NoteService.deleteNote(this.activeNote);
    document.querySelector(`.note-btn[data-id=${this.activeNote.id}]`).remove();

    const firstNote = NoteService.getFirstNote();

    if (!!firstNote) {
      this.loadNote(firstNote);
    } else {
      this.createBlankNote();
    }
  }

  private updatePageTitle() {
    document.title = `Notepad / ${this.generateButtonText(this.activeNote)}`;
  }
}

new App();
