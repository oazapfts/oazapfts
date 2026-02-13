export function getAtPath(obj: unknown, path: string[]) {
  let current: unknown = obj;
  for (const key of path) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}
