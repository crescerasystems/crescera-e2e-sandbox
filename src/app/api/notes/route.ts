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
