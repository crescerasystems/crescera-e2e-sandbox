import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Maximum allowed request body size: 32 KB for text-like inputs
const MAX_REQUEST_SIZE = 32 * 1024; // 32 KB

/**
 * POST /api/notes
 * Creates a new note for the authenticated user
 * 
 * Request body:
 * {
 *   title: string (required, max 100 chars)
 *   content: string (required, max 10000 chars)
 * }
 * 
 * Returns:
 * {
 *   id: string
 *   title: string
 *   content: string
 *   createdAt: string (ISO date)
 *   updatedAt: string (ISO date)
 * }
 */
export async function POST(request: Request) {
  try {
    // Rate limiting TODO: Implement proper rate limiting with @upstash/ratelimit
    // For now, we add a comment explaining the cost-bomb risk
    /*
     * TODO: Implement rate limiting to prevent abuse
     * This endpoint creates notes in the database and should be rate-limited
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

    // Get the request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (typeof body.title !== "string" || body.title.length > 100) {
      return NextResponse.json(
        { error: "Title must be a string and cannot exceed 100 characters" },
        { status: 400 }
      );
    }

    if (typeof body.content !== "string" || body.content.length > 10000) {
      return NextResponse.json(
        { error: "Content must be a string and cannot exceed 10000 characters" },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create the note in the database
    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return the created note
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
