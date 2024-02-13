import {describe, it, expect} from "vitest";
import {
  defineOazapftsPlugin,
} from "./definePlugin";

describe("defineOazapftsPlugin", () => {
  it("should return an object", () => {
    const result = defineOazapftsPlugin({
      name: "test",
    });
    expect(result).toBeInstanceOf(Object);
  });
});
