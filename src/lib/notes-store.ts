// In-memory notes store
// This module provides CRUD operations for notes using an in-memory store.
// Persistence to database is out of scope per spec constraints.

interface Note {
  id: string;
  body: string; // Field name MUST be 'body' per spec constraint C2
  createdAt: Date;
  updatedAt: Date;
}

let notes: Note[] = [];

/**
 * Create a new note with the given body text.
 * Returns the created note with generated id and timestamps.
 */
export function create(body: string): Note {
  const newNote: Note = {
    id: generateId(),
    body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  notes.push(newNote);
  return { ...newNote }; // Return a copy to prevent external mutation
}

/**
 * List all notes in the store.
 * Returns a deep copy of the notes array to prevent external mutation.
 */
export function list(): Note[] {
  return notes.map((note) => ({ ...note }));
}

/**
 * Get a specific note by ID.
 * Returns a copy of the note if found, or undefined if not found.
 */
export function get(id: string): Note | undefined {
  const note = notes.find((note) => note.id === id);
  return note ? { ...note } : undefined;
}

/**
 * Delete a note by ID.
 * Returns true if the note was found and deleted, false otherwise.
 */
export function deleteNote(id: string): boolean {
  const initialLength = notes.length;
  notes = notes.filter((note) => note.id !== id);
  return notes.length !== initialLength;
}

/**
 * Generate a simple unique ID for notes.
 * Uses timestamp + random number to minimize collisions.
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
