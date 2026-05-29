import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Input validation schema
type CreateNoteInput = {
  title: string;
  content: string;
};

function validateNoteInput(input: unknown): input is CreateNoteInput {
  return (
    input !== null &&
    typeof input === "object" &&
    typeof (input as CreateNoteInput).title === "string" &&
    (input as CreateNoteInput).title.trim().length > 0 &&
    typeof (input as CreateNoteInput).content === "string" &&
    (input as CreateNoteInput).content.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    // Get the session to ensure user is authenticated
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    
    if (!validateNoteInput(body)) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: "Title and content are required and must be non-empty strings"
        },
        { status: 400 }
      );
    }

    // Create the note in the database
    const note = await prisma.note.create({
      data: {
        title: body.title.trim(),
        content: body.content.trim(),
        userId: session.user.id,
      },
    });

    // Return 201 Created with the created note
    return NextResponse.json(note, { status: 201 });
    
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
