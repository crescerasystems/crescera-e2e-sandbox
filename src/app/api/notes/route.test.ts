import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "../../../lib/prisma";

describe("/api/notes POST", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a note with valid data", async () => {
    const mockNote = {
      id: "test-id",
      title: "Test Note",
      slug: "test-note",
      content: "Test content",
      userId: "placeholder-user-id",
      createdAt: new Date("2026-05-29T21:58:39.659Z"),
      updatedAt: new Date("2026-05-29T21:58:39.659Z"),
    };

    vi.spyOn(prisma.note, "findUnique").mockResolvedValue(null);
    vi.spyOn(prisma.note, "create").mockResolvedValue(mockNote);

    const request = new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Note", content: "Test content" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe(mockNote.id);
    expect(data.title).toBe(mockNote.title);
    expect(data.slug).toBe(mockNote.slug);
    expect(data.content).toBe(mockNote.content);
    expect(data.userId).toBe(mockNote.userId);
    // Dates are serialized to strings in JSON
    expect(new Date(data.createdAt)).toEqual(mockNote.createdAt);
    expect(new Date(data.updatedAt)).toEqual(mockNote.updatedAt);
  });

  it("should return 400 for invalid data - missing title", async () => {
    const request = new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Test content" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toHaveLength(1);
    expect(data.errors[0].path).toBe("title");
  });

  it("should return 400 for invalid data - missing content", async () => {
    const request = new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Note" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toHaveLength(1);
    expect(data.errors[0].path).toBe("content");
  });

  it("should generate unique slug when duplicate exists", async () => {
    const existingNote = {
      id: "1",
      title: "Test",
      slug: "test-note",
      content: "",
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.note, "findUnique")
      .mockResolvedValueOnce(existingNote) // First call finds existing
      .mockResolvedValueOnce(null); // Second call with suffix doesn't find

    const mockNote = {
      id: "test-id",
      title: "Test Note",
      slug: "test-note-1",
      content: "Test content",
      userId: "placeholder-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.note, "create").mockResolvedValue(mockNote);

    const request = new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Note", content: "Test content" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.slug).toBe("test-note-1");
  });

  it("should return 500 for internal server error", async () => {
    vi.spyOn(prisma.note, "findUnique").mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Note", content: "Test content" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
