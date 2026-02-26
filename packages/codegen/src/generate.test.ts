import { describe, it, expect } from "vitest";
import * as generate from "./generate";

describe("generate", () => {
  it("exports all functions", () => {
    expect(generate).toMatchObject({
      createDefaultsStatement: expect.any(Function),
      createImportStatement: expect.any(Function),
      createServersStatement: expect.any(Function),
      generateApi: expect.any(Function),
      generateClientMethod: expect.any(Function),
      getOperationName: expect.any(Function),
      getOperationNames: expect.any(Function),
      getRefAlias: expect.any(Function),
      getResponseType: expect.any(Function),
      getSchemaFromContent: expect.any(Function),
      getTypeFromResponses: expect.any(Function),
      getTypeFromSchema: expect.any(Function),
    });
  });
});
