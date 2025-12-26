import { OazapftsContext } from "../context";
import { resolve } from "./resolve";

export function findAvailableRef(ref: string, ctx: OazapftsContext) {
  const available = (ref: string) => {
    try {
      resolve({ $ref: ref }, ctx);
      return false;
    } catch (error) {
      return true;
    }
  };

  if (available(ref)) return ref;

  let i = 2;
  while (true) {
    const key = ref + String(i);
    if (available(key)) return key;
    i += 1;
  }
}
