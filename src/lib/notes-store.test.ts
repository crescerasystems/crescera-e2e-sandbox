import { describe, it, expect, beforeEach } from "vitest";
import { notesStore } from "./notes-store";

describe("NotesStore", () => {
  beforeEach(() => {
    // Clear the store before each test
    const notes = notesStore.list();
    notes.forEach((note) => notesStore.delete(note.id));
  });

  it("should create a note", () => {
    const note = notesStore.create("Test Note", "Test Content");
    expect(note).toBeDefined();
    expect(note.title).toBe("Test Note");
    expect(note.content).toBe("Test Content");
    expect(note.id).toBeDefined();
    expect(note.createdAt).toBeInstanceOf(Date);
  });

  it("should list all notes", () => {
    const note1 = notesStore.create("Note 1", "Content 1");
    const note2 = notesStore.create("Note 2", "Content 2");
    const notes = notesStore.list();
    expect(notes).toHaveLength(2);
    expect(notes).toContainEqual(note1);
    expect(notes).toContainEqual(note2);
  });

  it("should get a note by ID", () => {
    const note = notesStore.create("Test Note", "Test Content");
    const retrievedNote = notesStore.get(note.id);
    expect(retrievedNote).toBeDefined();
    expect(retrievedNote?.id).toBe(note.id);
  });

  it("should return undefined for non-existent note ID", () => {
    const retrievedNote = notesStore.get("non-existent-id");
    expect(retrievedNote).toBeUndefined();
  });

  it("should delete a note by ID", () => {
    const note = notesStore.create("Test Note", "Test Content");
    const isDeleted = notesStore.delete(note.id);
    expect(isDeleted).toBe(true);
    const retrievedNote = notesStore.get(note.id);
    expect(retrievedNote).toBeUndefined();
  });

  it("should return false when deleting non-existent note ID", () => {
    const isDeleted = notesStore.delete("non-existent-id");
    expect(isDeleted).toBe(false);
  });
});
