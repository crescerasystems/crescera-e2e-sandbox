import { describe, it, expect, beforeEach } from "vitest";
import { NotesStore } from "./notes-store";

describe("NotesStore", () => {
  let store: NotesStore;

  beforeEach(() => {
    store = new NotesStore();
  });

  describe("create", () => {
    it("creates a note with title and content", () => {
      const note = store.create("Test Note", "Test Content");
      
      expect(note).toBeDefined();
      expect(note.id).toBe("1");
      expect(note.title).toBe("Test Note");
      expect(note.content).toBe("Test Content");
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it("auto-increments IDs for multiple notes", () => {
      const note1 = store.create("First", "Content 1");
      const note2 = store.create("Second", "Content 2");
      
      expect(note1.id).toBe("1");
      expect(note2.id).toBe("2");
    });
  });

  describe("list", () => {
    it("returns an empty array when no notes exist", () => {
      expect(store.list()).toEqual([]);
    });

    it("returns all created notes in insertion order", () => {
      const note1 = store.create("First", "Content 1");
      const note2 = store.create("Second", "Content 2");
      
      const notes = store.list();
      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe(note1.id);
      expect(notes[1].id).toBe(note2.id);
    });
  });

  describe("get", () => {
    it("returns undefined for non-existent note", () => {
      expect(store.get("999")).toBeUndefined();
    });

    it("returns the correct note by ID", () => {
      const createdNote = store.create("Test", "Content");
      const retrievedNote = store.get(createdNote.id);
      
      expect(retrievedNote).toBeDefined();
      expect(retrievedNote?.id).toBe(createdNote.id);
      expect(retrievedNote?.title).toBe("Test");
    });
  });

  describe("delete", () => {
    it("returns false when note does not exist", () => {
      expect(store.delete("999")).toBe(false);
    });

    it("removes the note and returns true", () => {
      const note = store.create("To Delete", "Content");
      
      expect(store.delete(note.id)).toBe(true);
      expect(store.get(note.id)).toBeUndefined();
      expect(store.list()).toHaveLength(0);
    });

    it("does not affect other notes", () => {
      const note1 = store.create("Keep 1", "Content 1");
      const note2 = store.create("Delete Me", "Content 2");
      const note3 = store.create("Keep 2", "Content 3");
      
      expect(store.delete(note2.id)).toBe(true);
      
      const remaining = store.list();
      expect(remaining).toHaveLength(2);
      expect(remaining[0].id).toBe(note1.id);
      expect(remaining[1].id).toBe(note3.id);
    });
  });
});
