import fs from "fs";
import { generateApi } from "../src";

(global as any).fetch = require("node-fetch");
(global as any).FormData = require("form-data");
describe("petstore.swagger.io", () => {
  let pet: any;
  let api: any;
  let id = 0;

  beforeAll(async () => {
    const code = await generateApi(require("./petstore.json"));
    fs.writeFileSync(__dirname + "/PetstoreApi.ts", code);
    const { Api } = require("./PetstoreApi");
    api = new Api();
    const pets = await api.findPetsByStatus(["available"]);
    expect(pets.length).toBeGreaterThan(0);
    [pet] = pets;
    id = pet.id || 0;
    expect(id).toBeTruthy();
  });

  it("should get pets by id", async () => {
    const pet2 = await api.getPetById(id);
    expect(pet2).toMatchObject(pet);
  });

  it("should place orders", async () => {
    expect(id).toBeGreaterThan(0);
    const order = await api.placeOrder({
      petId: id,
      status: "placed",
      quantity: 1
    });
    expect(order).toMatchObject({
      quantity: 1,
      status: "placed"
    });
  });

  it("should upload files", async () => {
    const res = await api.uploadFile(id, {
      additionalMetadata: "test",
      file: fs.readFileSync(__dirname + "/pet.jpg") as any
    });
    expect(res.code).toBe(200);
  });
});
