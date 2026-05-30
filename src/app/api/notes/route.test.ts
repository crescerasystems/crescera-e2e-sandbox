// Tests for POST /api/notes endpoint
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { create, deleteNote, list } from "../../../lib/notes-store";

// Helper to create a mock request
type MockRequestInit = {
  method: string;
  headers?: Record<string, string>;
  json?: () => Promise<unknown>;
};

function createMockRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
    json: () => Promise.resolve(body),
  } as unknown as Request;
}

describe("POST /api/notes", () => {
  beforeEach(() => {
    // Clear the store before each test
    const allNotes = list();
    allNotes.forEach((note) => {
      deleteNote(note.id);
    });
  });

  afterEach(() => {
    // Clear rate limits after each test
    // We can't directly access the rateLimits Map, but we can reset by using different IPs
  });

  it("should return 201 and create note with valid title and body", async () => {
    const mockRequest = createMockRequest({
      title: "My Test Note",
      body: "This is the content of my note",
    }, {
      "x-forwarded-for": "192.168.1.1",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data.title).toBe("My Test Note");
    expect(data.body).toBe("This is the content of my note");
    expect(data).toHaveProperty("createdAt");
    expect(data).toHaveProperty("updatedAt");
  });

  it("should return 400 when title is missing", async () => {
    const mockRequest = createMockRequest({
      body: "This is the content",
    }, {
      "x-forwarded-for": "192.168.1.2",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("title and body are required");
  });

  it("should return 400 when body is missing", async () => {
    const mockRequest = createMockRequest({
      title: "My Note",
    }, {
      "x-forwarded-for": "192.168.1.3",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("title and body are required");
  });

  it("should return 400 when title is empty string", async () => {
    const mockRequest = createMockRequest({
      title: "",
      body: "This is the content",
    }, {
      "x-forwarded-for": "192.168.1.4",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it("should return 400 when body is empty string", async () => {
    const mockRequest = createMockRequest({
      title: "My Note",
      body: "",
    }, {
      "x-forwarded-for": "192.168.1.5",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it("should return 400 when title is not a string", async () => {
    const mockRequest = createMockRequest({
      title: 123,
      body: "This is the content",
    }, {
      "x-forwarded-for": "192.168.1.6",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it("should return 400 when body is not a string", async () => {
    const mockRequest = createMockRequest({
      title: "My Note",
      body: 123,
    }, {
      "x-forwarded-for": "192.168.1.7",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it("should return 400 when request body is not an object", async () => {
    const mockRequest = createMockRequest("not an object", {
      "x-forwarded-for": "192.168.1.8",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it("should return 400 when request body is null", async () => {
    const mockRequest = createMockRequest(null, {
      "x-forwarded-for": "192.168.1.9",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it("should trim whitespace from title and body", async () => {
    const mockRequest = createMockRequest({
      title: "  My Note  ",
      body: "  This is the content  ",
    }, {
      "x-forwarded-for": "192.168.1.10",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.title).toBe("My Note");
    expect(data.body).toBe("This is the content");
  });

  it("should return 413 when payload is too large", async () => {
    const largeBody = "x".repeat(33 * 1024); // 33 KB, exceeds 32 KB limit
    const mockRequest = createMockRequest(
      {
        title: "Large Note",
        body: largeBody,
      },
      {
        "content-length": "33792", // 33 KB
        "x-forwarded-for": "192.168.1.11",
      }
    );

    const response = await POST(mockRequest);
    expect(response.status).toBe(413);

    const data = await response.json();
    expect(data.error).toBe("Payload too large");
  });

  it("should handle rate limiting (basic test)", async () => {
    // This is a basic test - in a real scenario, we'd need to mock the IP
    // For now, we just verify the endpoint doesn't crash with rate limiting
    const mockRequest = createMockRequest(
      {
        title: "Note 1",
        body: "Content 1",
      },
      {
        "x-forwarded-for": "192.168.1.12",
      }
    );

    // First few requests should succeed
    for (let i = 0; i < 5; i++) {
      const response = await POST(mockRequest);
      expect(response.status).toBe(201);
    }
  });

  it("should return 400 when JSON is invalid", async () => {
    // Create a mock request that throws when json() is called
    const mockRequest = {
      headers: {
        get: () => null,
      },
      json: () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid JSON payload");
  });
});
