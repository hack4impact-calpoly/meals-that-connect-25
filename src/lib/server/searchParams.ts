import "server-only";

export function normalizeAllowedValue<T extends string>(value: string, allowedValues: readonly T[]): T | null {
  const normalizedValue = value.trim().toLowerCase();

  return allowedValues.find((allowedValue) => allowedValue.toLowerCase() === normalizedValue) ?? null;
}
// Used so that queries are a little more forgiving.
// Can normalize whitespace and capitalization to a list of allowed values.

export function getNormalizedParams<T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowedValues: readonly T[],
): T[] {
  return searchParams
    .getAll(key)
    .map((value) => normalizeAllowedValue(value, allowedValues))
    .filter((value): value is T => Boolean(value));
}
