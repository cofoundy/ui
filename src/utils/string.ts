/**
 * Get initials from a name string
 * @param name - Full name to extract initials from
 * @returns Up to 2 uppercase initials
 * @example getInitials("John Doe") // "JD"
 * @example getInitials("Alice") // "A"
 */
export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated string with "..." if exceeded
 * @example truncate("Hello World", 8) // "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to title case
 * @param str - String to convert
 * @returns Title cased string
 * @example toTitleCase("hello world") // "Hello World"
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
