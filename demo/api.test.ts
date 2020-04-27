import fs from "fs";
import * as api from "./api";
import { ok, handle } from "oazapfts/index";

api.defaults.baseUrl = `${process.env.SERVER_URL}/v2`;

(global as any).fetch = require("node-fetch");
(global as any).FormData = require("form-data");

describe("petstore", () => {
  it("should get pets by id", async () => {
    const pet = await ok(api.getPetById(1));
    expect(pet).toMatchObject({ id: 1, name: "doggie" });
  });

  it("should throw if status != 200", async () => {
    const promise = ok(
      api.getPetById(1, { headers: { Prefer: "statusCode=404" } })
    );
    expect(promise).rejects.toHaveProperty("status", 404);
  });

  it("should foo", async () => {
    const order = await ok(
      api.placeOrder({
        petId: 1,
        status: "placed",
        quantity: 1,
      })
    );
    expect(order).toMatchObject({
      quantity: 1,
      status: "placed",
    });
  });

  it.skip("should upload files", async () => {
    const res = await api.uploadFile(1, {
      additionalMetadata: "test",
      file: fs.readFileSync(__dirname + "/pet.jpg") as any,
    });
    console.log(res);
    expect(res.status).toBe(200);
  });
});
