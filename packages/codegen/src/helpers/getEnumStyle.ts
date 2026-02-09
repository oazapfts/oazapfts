export const enumStyleOptions = ["union", "enum", "as-const"] as const;
export type EnumStyle = (typeof enumStyleOptions)[number];

/**
 * Resolve the effective enum style from options.
 * `enumStyle` takes precedence over the deprecated `useEnumType`.
 */
export function getEnumStyle(opts: {
  enumStyle?: EnumStyle;
  useEnumType?: boolean;
}): EnumStyle {
  if (opts.enumStyle !== undefined) return opts.enumStyle;
  if (opts.useEnumType) return "enum";
  return "union";
}
