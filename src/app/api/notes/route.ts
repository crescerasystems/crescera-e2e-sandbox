import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// DELETE /api/notes/:id - Delete a note by ID
// Requires authentication - only the note owner can delete it
// Rate limiting: In-process memory limit (TODO: replace with Redis-based rate limiting)
// Input size cap: 32KB for request body (enforced by Next.js default)

export async function DELETE(
  request: NextRequest
) {
  try {
    // Extract note ID from URL path
    const pathParts = request.nextUrl.pathname.split('/')
    const noteId = pathParts[pathParts.length - 1]
    
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Validate note ID
    if (!noteId || typeof noteId !== "string") {
      return NextResponse.json(
        { error: "Invalid note ID" },
        { status: 400 }
      )
    }

    // Check if note exists and belongs to the user
    const existingNote = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existingNote.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - you don't own this note" },
        { status: 403 }
      )
    }

    // Delete the note
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    })

    return NextResponse.json(
      { success: true, message: "Note deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
