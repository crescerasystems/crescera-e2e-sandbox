import { describe, it, expect } from "vitest";
import { slugify } from "./strings";

/**
 * Guards the planted lodash-backed slug helper. Beyond proving the vitest
 * harness runs (so `npm test` exits 0 on a clean checkout), this pins the
 * helper's behavior so the security-driven lodash bump (4.17.20 ->
 * >= 4.17.21) is verified to keep `kebabCase` working, not silently break
 * the import.
 */
describe("slugify", () => {
  it("kebab-cases a multi-word label", () => {
    expect(slugify("My First Note")).toBe("my-first-note");
  });

  it("normalizes punctuation and casing", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("handles an empty string", () => {
    expect(slugify("")).toBe("");
  });
});
