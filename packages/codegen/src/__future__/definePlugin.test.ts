import {describe, it, expect, vi, beforeEach} from "vitest";
import {
  defineOazapftsPlugin,
  OazapftsPlugin,
} from "./definePlugin";

vi.mock('./definePlugin',async (importOriginal)=>{
  const module = await importOriginal<typeof import('./definePlugin')>();
  beforeEach(()=>{
      Object.defineProperty(module.OazapftsPlugin, '__globalHooks',{
        value:new OazapftsPlugin.Hooks(),
      })
  })
  return {
    ...module,
  }
})

describe("defineOazapftsPlugin", () => {

  it("should call hooked methods", async () => {
    const mockFunction = vi.fn<unknown[], void>();
    await defineOazapftsPlugin(async (hooks)=>{
      hooks.cliArgs.tap('mockFunction', mockFunction);
    });

    await OazapftsPlugin.__globalHooks.cliArgs.promise(new OazapftsPlugin.CliContext());

    expect(mockFunction).toBeCalled();

  });
});
