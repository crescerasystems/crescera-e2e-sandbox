// In-memory notes store
// This module provides CRUD operations for notes without persistence to a database.
// Notes are stored in memory and will be lost when the server restarts.

/**
 * Note type definition
 */
export type Note = {
  id: string;
  title: string;
  body: string; // C2: field MUST be named 'body', not 'content'
  createdAt: Date;
  updatedAt: Date;
};

// In-memory store using a Map for O(1) lookups by ID
const notesStore = new Map<string, Note>();

/**
 * Create a new note
 * @param title - The title of the note
 * @param body - The content of the note (C2: field named 'body')
 * @returns The created note with generated ID and timestamps
 */
export function createNote(title: string, body: string): Note {
  const id = generateId();
  const now = new Date();
  
  const note: Note = {
    id,
    title,
    body, // C2: using 'body' field name
    createdAt: now,
    updatedAt: now,
  };
  
  notesStore.set(id, note);
  return note;
}

/**
 * List all notes
 * @returns Array of all notes in the store
 */
export function listNotes(): Note[] {
  return Array.from(notesStore.values());
}

/**
 * Get a note by ID
 * @param id - The ID of the note to retrieve
 * @returns The note if found, undefined otherwise
 */
export function getNote(id: string): Note | undefined {
  return notesStore.get(id);
}

/**
 * Delete a note by ID
 * @param id - The ID of the note to delete
 * @returns true if the note was found and deleted, false otherwise
 */
export function deleteNote(id: string): boolean {
  return notesStore.delete(id);
}

/**
 * Generate a simple unique ID
 * Uses timestamp + random number for uniqueness
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Export the store for testing purposes only
export const _internal = {
  notesStore,
};
