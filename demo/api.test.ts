import fs from "fs";
import { findPetsByStatus, getPetById, placeOrder, uploadFile } from "./api";

(global as any).fetch = require("node-fetch");
(global as any).FormData = require("form-data");

describe("petstore.swagger.io", () => {
  let pet: any;
  let id = 0;

  beforeAll(async () => {
    const pets = await findPetsByStatus(["available"]);
    expect(pets.length).toBeGreaterThan(0);
    [pet] = pets;
    id = pet.id || 0;
    expect(id).toBeTruthy();
  });

  // petstore API seems to have changed. TODO: investigate and update test
  xit("should get pets by id", async () => {
    const pet2 = await getPetById(id);
    expect(pet2).toMatchObject(pet);
  });

  it("should reject invalid ids", async () => {
    const notFound = await getPetById(-130976);
    expect(notFound).toMatchInlineSnapshot(`
      Object {
        "code": 1,
        "message": "Pet not found",
        "type": "error",
      }
    `);
  });

  // petstore API seems to have changed. TODO: investigate and update test
  xit("should place orders", async () => {
    expect(id).toBeGreaterThan(0);
    const order = await placeOrder({
      petId: id,
      status: "placed",
      quantity: 1
    });
    expect(order).toMatchObject({
      quantity: 1,
      status: "placed"
    });
  });

  xit("should upload files", async () => {
    const res = await uploadFile(id, {
      additionalMetadata: "test",
      file: fs.readFileSync(__dirname + "/pet.jpg") as any
    });
    expect(res.code).toBe(200);
  });
});
