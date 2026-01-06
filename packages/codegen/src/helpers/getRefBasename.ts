/**
 * Get the last path component of the given ref.
 */
export function getRefBasename(ref: string) {
  return ref.replace(/.+\//, "");
}
