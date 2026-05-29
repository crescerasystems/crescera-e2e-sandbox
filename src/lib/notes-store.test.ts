import { describe, it, expect, beforeEach } from "vitest";
import { NotesStore } from "./notes-store";

describe("NotesStore", () => {
  let store: NotesStore;

  beforeEach(() => {
    store = new NotesStore();
  });

  it("should create a note", () => {
    const note = store.create("Test Note", "Test Content");
    expect(note).toBeDefined();
    expect(note.title).toBe("Test Note");
    expect(note.content).toBe("Test Content");
    expect(note.id).toBeDefined();
    expect(note.createdAt).toBeInstanceOf(Date);
    expect(note.updatedAt).toBeInstanceOf(Date);
  });

  it("should list all notes", () => {
    const note1 = store.create("Note 1", "Content 1");
    const note2 = store.create("Note 2", "Content 2");
    const notes = store.list();
    expect(notes).toHaveLength(2);
    expect(notes).toContainEqual(note1);
    expect(notes).toContainEqual(note2);
  });

  it("should get a note by ID", () => {
    const note = store.create("Test Note", "Test Content");
    const retrievedNote = store.get(note.id);
    expect(retrievedNote).toBeDefined();
    expect(retrievedNote?.id).toBe(note.id);
    expect(retrievedNote?.title).toBe("Test Note");
  });

  it("should return undefined for non-existent note ID", () => {
    const nonExistentNote = store.get("non-existent-id");
    expect(nonExistentNote).toBeUndefined();
  });

  it("should delete a note by ID", () => {
    const note = store.create("Test Note", "Test Content");
    const result = store.delete(note.id);
    expect(result).toBe(true);
    expect(store.list()).toHaveLength(0);
  });

  it("should return false when deleting non-existent note ID", () => {
    const result = store.delete("non-existent-id");
    expect(result).toBe(false);
  });
});
