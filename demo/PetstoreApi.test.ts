import fs from "fs";
import { Api } from "./PetstoreApi";

const api = new Api();

(global as any).fetch = require("node-fetch");
(global as any).FormData = require("form-data");

describe("petstore.swagger.io", () => {
  let pet: any;
  let id = 0;

  beforeAll(async () => {
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

  it("should reject invalid ids", () => {
    const promise = api.getPetById(-130976);
    expect(promise).rejects.toThrow("Not Found");
    expect(promise).rejects.toHaveProperty("status", 404);
  });

  // petstore API seems to have changed. TODO: investigate and update test
  xit("should place orders", async () => {
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
