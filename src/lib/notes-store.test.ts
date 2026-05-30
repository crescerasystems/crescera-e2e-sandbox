import { describe, it, expect, beforeEach } from "vitest";
import { create, list, get, deleteNote } from "./notes-store";

describe("notes-store", () => {
  beforeEach(() => {
    // Clear the store before each test
    // Since it's in-memory, we need to reset it
    // We'll do this by calling delete on all notes
    const allNotes = list();
    allNotes.forEach((note) => {
      deleteNote(note.id);
    });
  });

  it("should create a note with body field", () => {
    const body = "This is my first note";
    const note = create(body);
    
    expect(note).toBeDefined();
    expect(note.id).toBeDefined();
    expect(note.body).toBe(body); // Verify field name is 'body' per spec
    expect(note.createdAt).toBeInstanceOf(Date);
    expect(note.updatedAt).toBeInstanceOf(Date);
  });

  it("should list all notes", () => {
    create("Note 1");
    create("Note 2");
    create("Note 3");
    
    const allNotes = list();
    expect(allNotes.length).toBe(3);
  });

  it("should get a specific note by ID", () => {
    const createdNote = create("Test note");
    const retrievedNote = get(createdNote.id);
    
    expect(retrievedNote).toBeDefined();
    expect(retrievedNote?.id).toBe(createdNote.id);
    expect(retrievedNote?.body).toBe("Test note");
  });

  it("should return undefined for non-existent note ID", () => {
    const nonExistentId = "non-existent-id";
    const result = get(nonExistentId);
    
    expect(result).toBeUndefined();
  });

  it("should delete a note by ID", () => {
    const note = create("Note to delete");
    const initialCount = list().length;
    
    const deleted = deleteNote(note.id);
    expect(deleted).toBe(true);
    expect(list().length).toBe(initialCount - 1);
    expect(get(note.id)).toBeUndefined();
  });

  it("should return false when deleting non-existent note", () => {
    const deleted = deleteNote("non-existent-id");
    expect(deleted).toBe(false);
  });

  it("should maintain separate note instances", () => {
    create("Note 1");
    create("Note 2");
    
    const notesList = list();
    notesList[0].body = "Modified"; // This should not affect the store
    
    const freshList = list();
    expect(freshList[0].body).toBe("Note 1"); // Original should be unchanged
  });
});
