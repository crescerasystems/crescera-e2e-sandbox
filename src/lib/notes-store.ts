// In-memory notes store with create, list, get, and delete operations

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NotesStore {
  private notes: Map<string, Note>;

  constructor() {
    this.notes = new Map<string, Note>();
  }

  /**
   * Create a new note and add it to the store.
   * @param title The title of the note.
   * @param content The content of the note.
   * @returns The created note.
   */
  create(title: string, content: string): Note {
    const id = this.generateId();
    const now = new Date();
    const note: Note = {
      id,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  /**
   * List all notes in the store.
   * @returns An array of all notes.
   */
  list(): Note[] {
    return Array.from(this.notes.values());
  }

  /**
   * Get a specific note by its ID.
   * @param id The ID of the note to retrieve.
   * @returns The note if found, otherwise undefined.
   */
  get(id: string): Note | undefined {
    return this.notes.get(id);
  }

  /**
   * Delete a note by its ID.
   * @param id The ID of the note to delete.
   * @returns True if the note was deleted, false if it did not exist.
   */
  delete(id: string): boolean {
    return this.notes.delete(id);
  }

  /**
   * Generate a unique ID for a note.
   * @returns A randomly generated ID.
   */
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

// Singleton instance for convenience
export const notesStore = new NotesStore();
