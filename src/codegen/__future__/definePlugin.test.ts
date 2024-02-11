import {
  defineOazapftsPlugin,
  isOazapftsPlugin,
  IS_OAZAPFTS_PLUGIN,
} from "./definePlugin";

describe("defineOazapftsPlugin", () => {
  it("should return an object", () => {
    const result = defineOazapftsPlugin({
      name: "test",
    });
    expect(result).toBeInstanceOf(Object);
  });
  it("should have a unique key on it", () => {
    const result = defineOazapftsPlugin({
      name: "test",
    });
    expect(result[IS_OAZAPFTS_PLUGIN]).toBe(true);
  });
  it("Applies false unique symbol when not correct", () => {
    const result = defineOazapftsPlugin({
      name: "",
    });
    expect(result[IS_OAZAPFTS_PLUGIN]).toBe(false);
  });
});

describe("isOazapftsPlugin", () => {
  it("should be true when a plugin is correctly defined", () => {
    const result = isOazapftsPlugin(
      defineOazapftsPlugin({
        name: "test",
      }),
    );
    expect(result).toBe(true);
  });
  it("should be false when definition is not correct", () => {
    const result = isOazapftsPlugin(
      defineOazapftsPlugin({
        name: "",
      }),
    );
    expect(result).toBe(false);
  });
});
