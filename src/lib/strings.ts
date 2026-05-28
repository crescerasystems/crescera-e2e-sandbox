import kebabCase from "lodash/kebabCase";

/** Normalize an arbitrary label into a URL-safe slug. */
export function slugify(label: string): string {
  return kebabCase(label);
}
