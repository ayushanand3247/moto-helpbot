/** Convert a subsystem name to a URL slug â€” no server imports */
export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/** Reverse a slug back to a guessable name (approximate) */
export function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

