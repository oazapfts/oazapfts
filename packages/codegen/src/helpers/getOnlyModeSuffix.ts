import { OnlyMode } from "../context";

const onlyModeSuffixes: Record<OnlyMode, string> = {
  readOnly: "Read",
  writeOnly: "Write",
};

export function getOnlyModeSuffix(onlyMode?: OnlyMode) {
  if (!onlyMode) return "";
  return onlyModeSuffixes[onlyMode];
}
