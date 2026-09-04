/**
 * Utility functions for handling date and time conversions between
 * HTML5 <input type="datetime-local"> (local browser time)
 * and PostgreSQL / Prisma DateTime (UTC).
 *
 * The primary timezone for TLS business operations is Asia/Bangkok (UTC+7).
 */

/**
 * Parses date inputs received by API endpoints.
 * - If input is already an ISO string with timezone or ends with 'Z', parses directly.
 * - If input is in "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss" format without timezone offset,
 *   it defaults to Bangkok timezone (+07:00).
 * - Returns a Date object or null.
 */
export function parseDateInput(val) {
  if (!val) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    // Matches YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss without timezone offset or Z
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const d = new Date(`${trimmed}+07:00`);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  return null;
}

/**
 * Converts a Date, ISO string, or timestamp into the "YYYY-MM-DDTHH:mm" format
 * expected by <input type="datetime-local">, using the user's local timezone.
 */
export function toInputDateTime(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

/**
 * Converts a local datetime-local string (e.g., from <input type="datetime-local">)
 * to a full UTC ISO 8601 string ("...Z") for API submission.
 * Returns null if the value is empty or invalid.
 */
export function toISOStringOrNull(dateVal) {
  if (!dateVal) return null;
  if (typeof dateVal === "string") {
    const trimmed = dateVal.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal.toISOString();
  }
  return null;
}
