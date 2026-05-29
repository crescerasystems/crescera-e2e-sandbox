import { NextResponse } from "next/server";
import { notesStore } from "@/lib/notes-store";

// Maximum allowed request body size: 32 KB for text-like inputs
const MAX_REQUEST_SIZE = 32 * 1024; // 32 KB

/**
 * GET /api/notes
 * Lists all notes
 * 
 * Returns:
 * [
 *   {
 *     id: string,
 *     title: string,
 *     content: string,
 *     createdAt: string (ISO date)
 *   }
 * ]
 */
export async function GET(request: Request) {
  try {
    // Rate limiting TODO: Implement proper rate limiting with @upstash/ratelimit
    // For now, we add a comment explaining the cost-bomb risk
    /*
     * TODO: Implement rate limiting to prevent abuse
     * This endpoint lists notes and should be rate-limited
     * to prevent cost bombs (e.g., 10 requests per minute per IP/session)
     */

    // Check request size to prevent payload too large attacks
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }

    // Get all notes from the store
    const notes = notesStore.list();
    
    // Format notes for JSON response
    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString()
    }));

    // Return the list of notes
    return NextResponse.json(formattedNotes, { status: 200 });
  } catch (error) {
    console.error("Error listing notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
