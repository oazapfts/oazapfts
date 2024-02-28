import {describe, it, expect, vi, beforeEach} from "vitest";
import {
  __globalHooks,
    __updateGlobalHooks,
    defineOazapftsPlugin,
    CliContext,
    Hooks,
} from "./definePlugin";

describe("defineOazapftsPlugin", () => {
  beforeEach(()=>{
    __updateGlobalHooks(new Hooks())
  })
  it("should call hooked method cliArgs", async () => {
    const mockFunction = vi.fn<unknown[], void>();
    expect(__globalHooks.cliArgs.isUsed()).toBeFalsy();
    await defineOazapftsPlugin(async (hooks)=>{
      hooks.cliArgs.tap('mockFunction', mockFunction);
    });
    await __globalHooks.cliArgs.promise(new CliContext());
    expect(mockFunction).toBeCalled();
  });

  it("should call cliArgs again", async () => {
    const mockFunction = vi.fn<unknown[], void>();
    expect(__globalHooks.cliArgs.isUsed()).toBeFalsy();
    await defineOazapftsPlugin(async (hooks)=>{
      hooks.cliArgs.tap('mockFunction', mockFunction);
    });
    await __globalHooks.cliArgs.promise(new CliContext());
    expect(mockFunction).toBeCalled();
  });

  it("should call hooked method cliValidateArgs", async () => {
    const mockFunction = vi.fn<unknown[], void>();
    await defineOazapftsPlugin(async (hooks)=>{
      hooks.cliValidateArgs.tap('mockFunction', mockFunction);
    });

    await __globalHooks.cliValidateArgs.promise(new CliContext());

    expect(mockFunction).toBeCalled();

  });
});
