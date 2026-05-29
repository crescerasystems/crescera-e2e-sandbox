// In-memory notes store module
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

class NotesStore {
  private notes: Map<string, Note>;

  constructor() {
    this.notes = new Map();
  }

  /**
   * Create a new note.
   * @param title The title of the note.
   * @param content The content of the note.
   * @returns The created note.
   */
  create(title: string, content: string): Note {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const note: Note = { id, title, content, createdAt };
    this.notes.set(id, note);
    return note;
  }

  /**
   * List all notes.
   * @returns An array of all notes.
   */
  list(): Note[] {
    return Array.from(this.notes.values());
  }

  /**
   * Get a note by its ID.
   * @param id The ID of the note.
   * @returns The note if found, otherwise undefined.
   */
  get(id: string): Note | undefined {
    return this.notes.get(id);
  }

  /**
   * Delete a note by its ID.
   * @param id The ID of the note.
   * @returns True if the note was deleted, otherwise false.
   */
  delete(id: string): boolean {
    return this.notes.delete(id);
  }
}

export const notesStore = new NotesStore();
