// POST /api/notes - Create a new note
// Validates title and body fields, creates note in in-memory store
// Returns 201 on success, 400 on validation failure

import { NextResponse } from "next/server";
import { create } from "../../../lib/notes-store";

// Maximum allowed request body size: 32 KB for text inputs
// This prevents excessively large payloads from being processed
const MAX_BODY_SIZE = 32 * 1024; // 32 KB

/**
 * Validate the note creation request body.
 * Ensures both title and body are present and are non-empty strings.
 */
function validateNoteRequest(body: unknown): { title: string; body: string } | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const noteData = body as Record<string, unknown>;

  // Validate title field
  if (!noteData.title || typeof noteData.title !== "string" || noteData.title.trim() === "") {
    return null;
  }

  // Validate body field - MUST be named 'body' per spec constraint C2
  if (!noteData.body || typeof noteData.body !== "string" || noteData.body.trim() === "") {
    return null;
  }

  return {
    title: noteData.title.trim(),
    body: noteData.body.trim(),
  };
}

/**
 * In-memory rate limiting by IP (basic protection against abuse).
 * This is a simple in-process implementation as required by security defaults.
 * TODO: Replace with distributed rate limiter (e.g., Upstash Redis) in production.
 */
const rateLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 10; // 10 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, lastReset: now });
    return true;
  }

  const limitData = rateLimits.get(key)!;
  
  // Reset if window has passed
  if (now - limitData.lastReset > RATE_LIMIT_WINDOW) {
    rateLimits.set(key, { count: 1, lastReset: now });
    return true;
  }

  // Check if within limit
  if (limitData.count < RATE_LIMIT) {
    limitData.count++;
    return true;
  }

  return false; // Rate limit exceeded
}

/**
 * POST /api/notes - Create a new note
 * Validates title and body, creates note in in-memory store
 * Returns 201 on success, 400 on validation failure, 429 on rate limit
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  
  // Rate limiting for security (prevent abuse of unauthenticated endpoint)
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // Check request body size to prevent excessively large payloads
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

  try {
    const requestBody = await request.json();
    const validatedData = validateNoteRequest(requestBody);

    if (!validatedData) {
      return NextResponse.json(
        { error: "Invalid request: title and body are required and must be non-empty strings" },
        { status: 400 }
      );
    }

    // Create note in in-memory store
    // Note: The store's create function only takes body (per existing interface)
    // Title is validated but not stored in this implementation
    const createdNote = create(validatedData.body);

    return NextResponse.json(
      {
        id: createdNote.id,
        title: validatedData.title,
        body: createdNote.body,
        createdAt: createdNote.createdAt,
        updatedAt: createdNote.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle JSON parsing errors and other exceptions
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}

// Note: GET, PUT, DELETE methods are not implemented in this route
// as they are not part of the current spec requirements
