import { NextResponse, NextRequest } from "next/server";
import { notesStore } from "@/lib/notes-store";

// Maximum allowed request body size: 32 KB for text-like inputs
const MAX_REQUEST_SIZE = 32 * 1024; // 32 KB

/**
 * GET /api/notes/:id
 * Gets a specific note by ID
 * 
 * Returns:
 * {
 *   id: string,
 *   title: string,
 *   content: string,
 *   createdAt: string (ISO date)
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting TODO: Implement proper rate limiting with @upstash/ratelimit
    // For now, we add a comment explaining the cost-bomb risk
    /*
     * TODO: Implement rate limiting to prevent abuse
     * This endpoint gets a single note and should be rate-limited
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

    const { id } = await params;
    
    // Get the note by ID from the store
    const note = notesStore.get(id);
    
    // If note not found, return 404
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Format note for JSON response
    const formattedNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString()
    };

    // Return the note
    return NextResponse.json(formattedNote, { status: 200 });
  } catch (error) {
    console.error("Error getting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
