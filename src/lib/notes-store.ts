/**
 * In-memory notes store for the application.
 * Provides basic CRUD operations for notes.
 */

export type Note = {
  /** Unique identifier for the note */
  id: string;
  /** Title of the note */
  title: string;
  /** Content of the note */
  content: string;
  /** When the note was created */
  createdAt: Date;
  /** When the note was last updated */
  updatedAt: Date;
};

/**
 * In-memory store for managing notes.
 * Uses a Map for O(1) lookups and maintains insertion order.
 */
export class NotesStore {
  private notes: Map<string, Note>;
  private counter: number;

  constructor() {
    this.notes = new Map();
    this.counter = 0;
  }

  /**
   * Create a new note with the given title and content.
   * @param title - The title of the note
   * @param content - The content of the note
   * @returns The created note object
   */
  create(title: string, content: string): Note {
    const id = (++this.counter).toString();
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
   * @returns Array of all notes, in insertion order
   */
  list(): Note[] {
    return Array.from(this.notes.values());
  }

  /**
   * Get a specific note by its ID.
   * @param id - The ID of the note to retrieve
   * @returns The note object, or undefined if not found
   */
  get(id: string): Note | undefined {
    return this.notes.get(id);
  }

  /**
   * Delete a note by its ID.
   * @param id - The ID of the note to delete
   * @returns true if the note was found and deleted, false otherwise
   */
  delete(id: string): boolean {
    return this.notes.delete(id);
  }
}

/**
 * Singleton instance of the notes store for convenience.
 * Useful for simple applications that need a single shared store.
 */
export const notesStore = new NotesStore();
