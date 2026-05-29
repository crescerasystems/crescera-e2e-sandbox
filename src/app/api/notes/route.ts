import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { slugify } from "../../../lib/strings";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Request body validation schema
const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  content: z.string().min(1, "Content is required").max(10000, "Content must be 10,000 characters or less"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    if (id) {
      // GET /api/notes?id=<id> - Get single note by ID
      const note = await prisma.note.findUnique({
        where: { id },
      });
      
      if (!note) {
        return NextResponse.json(
          { error: "Note not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(note);
    } else {
      // GET /api/notes - Get all notes
      const notes = await prisma.note.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      return NextResponse.json(notes);
    }
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateNoteSchema.parse(body);

    // Generate slug from title
    const slug = slugify(validatedData.title);

    // Check if slug already exists (add suffix if needed)
    let uniqueSlug = slug;
    let suffix = 1;
    while (await prisma.note.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${suffix}`;
      suffix++;
    }

    // Create the note in database
    const note = await prisma.note.create({
      data: {
        title: validatedData.title,
        slug: uniqueSlug,
        content: validatedData.content,
        // In a real app, you'd get userId from session
        // For now, we'll use a placeholder
        userId: "placeholder-user-id",
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    // Check if it's a Zod validation error
    if (error.name === "ZodError") {
      // Use zod-validation-error to properly format errors
      const validationError = fromZodError(error);
      const details = validationError.details;
      
      return NextResponse.json(
        {
          errors: details.map((detail: any) => ({
            path: detail.path.join("."),
            message: detail.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }
    
    // Check if note exists first
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });
    
    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    
    // Delete the note
    await prisma.note.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
