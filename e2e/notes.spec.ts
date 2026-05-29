import { test, expect } from "@playwright/test";

/**
 * E2E test for the Notes create flow.
 * Tests that a user can create a new note and see it appear in the list.
 */
test.describe("Notes create flow", () => {
  test("should create a new note and display it in the list", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");
    
    // Wait for the page to load and the create form to be visible
    await expect(page.getByRole("heading", { name: "Create Note" })).toBeVisible();
    
    // Fill out the note form
    const testTitle = "Test Note " + Date.now(); // Unique title to avoid conflicts
    const testContent = "This is the content of my test note.";
    
    await page.getByLabel("Title").fill(testTitle);
    await page.getByLabel("Content").fill(testContent);
    
    // Submit the form
    await page.getByRole("button", { name: "Create Note" }).click();
    
    // Wait for the form submission to complete (button becomes enabled again)
    await expect(page.getByRole("button", { name: "Create Note" })).toBeEnabled();
    
    // Verify the form was reset
    await expect(page.getByLabel("Title")).toHaveValue("");
    await expect(page.getByLabel("Content")).toHaveValue("");
    
    // Verify the new note appears in the list
    // The note should be at the top of the list (most recent first)
    const firstNoteTitle = page.getByTestId("note-title").first();
    const firstNoteContent = page.getByTestId("note-content").first();
    
    await expect(firstNoteTitle).toHaveText(testTitle);
    await expect(firstNoteContent).toHaveText(testContent);
    
    // Verify the note has a delete button
    const firstNoteDeleteButton = page.getByTestId("delete-button").first();
    await expect(firstNoteDeleteButton).toBeVisible();
  });
  
  test("should show validation error when title is empty", async ({ page }) => {
    await page.goto("/");
    
    // Try to submit without filling the title
    await page.getByLabel("Content").fill("Some content");
    await page.getByRole("button", { name: "Create Note" }).click();
    
    // Verify validation error appears
    await expect(page.getByText("Title is required")).toBeVisible();
    
    // Verify note was not created (form should not be reset)
    await expect(page.getByLabel("Content")).toHaveValue("Some content");
  });
  
  test("should show validation error when content is empty", async ({ page }) => {
    await page.goto("/");
    
    // Try to submit without filling the content
    await page.getByLabel("Title").fill("Test Title");
    await page.getByRole("button", { name: "Create Note" }).click();
    
    // Verify validation error appears
    await expect(page.getByText("Content is required")).toBeVisible();
    
    // Verify note was not created (form should not be reset)
    await expect(page.getByLabel("Title")).toHaveValue("Test Title");
  });
});
