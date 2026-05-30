import { describe, it, expect, beforeEach } from "vitest";
import { createNote, listNotes, getNote, deleteNote, _internal } from "./notes-store";

describe("notes-store", () => {
  beforeEach(() => {
    // Clear the store before each test
    _internal.notesStore.clear();
  });

  it("should create a note with correct structure", () => {
    const title = "Test Note";
    const body = "This is a test note body"; // C2: field named 'body'
    
    const note = createNote(title, body);
    
    expect(note).toBeDefined();
    expect(note.id).toBeTypeOf("string");
    expect(note.id.length).toBeGreaterThan(0);
    expect(note.title).toBe(title);
    expect(note.body).toBe(body); // C2: verifying 'body' field
    expect(note.createdAt).toBeInstanceOf(Date);
    expect(note.updatedAt).toBeInstanceOf(Date);
  });

  it("should list all notes", () => {
    const note1 = createNote("Note 1", "Body 1");
    const note2 = createNote("Note 2", "Body 2");
    
    const notes = listNotes();
    
    expect(notes).toHaveLength(2);
    expect(notes).toContainEqual(note1);
    expect(notes).toContainEqual(note2);
  });

  it("should get a note by ID", () => {
    const createdNote = createNote("Test", "Test body");
    
    const retrievedNote = getNote(createdNote.id);
    
    expect(retrievedNote).toBeDefined();
    expect(retrievedNote?.id).toBe(createdNote.id);
    expect(retrievedNote?.title).toBe("Test");
    expect(retrievedNote?.body).toBe("Test body"); // C2: verifying 'body' field
  });

  it("should return undefined for non-existent note ID", () => {
    const nonExistentId = "non-existent-id";
    const note = getNote(nonExistentId);
    
    expect(note).toBeUndefined();
  });

  it("should delete a note by ID", () => {
    const createdNote = createNote("To Delete", "Delete me");
    
    const deleted = deleteNote(createdNote.id);
    
    expect(deleted).toBe(true);
    expect(getNote(createdNote.id)).toBeUndefined();
    expect(listNotes()).toHaveLength(0);
  });

  it("should return false when deleting non-existent note", () => {
    const deleted = deleteNote("non-existent-id");
    
    expect(deleted).toBe(false);
  });

  it("should generate unique IDs for each note", () => {
    const note1 = createNote("Note 1", "Body 1");
    const note2 = createNote("Note 2", "Body 2");
    
    expect(note1.id).not.toBe(note2.id);
  });
});
