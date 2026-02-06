export const enumStyleOptions = ["union", "enum", "as-const"] as const;
export type EnumStyle = (typeof enumStyleOptions)[number];

/**
 * Resolve the effective enum style from options.
 * `enumStyle` takes precedence over `useEnumType` for backward compatibility.
 */
export function getEnumStyle(opts: {
  enumStyle?: EnumStyle;
  useEnumType?: boolean;
}): EnumStyle {
  if (opts.enumStyle) return opts.enumStyle;
  if (opts.useEnumType) return "enum";
  return "union";
}
