import { ok, handle, okify, optimistic } from "oazapfts/lib/index";
import * as api from "./api";
import * as optimisticApi from "./optimisticApi";

api.defaults.baseUrl = `${process.env.SERVER_URL}/v2`;
optimisticApi.defaults.baseUrl = `${process.env.SERVER_URL}/v2`;

(global as any).fetch = require("node-fetch");
(global as any).FormData = require("form-data");

describe("ok", () => {
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

  it("should post json", async () => {
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

  it("should type response as Pet|string", async () => {
    const pet = await ok(api.addPet({ name: "doggie", photoUrls: [] }));
    //@ts-expect-error
    expect(pet.name).toBe("doggie");
  });
});

describe("handle", () => {
  it("should call the matching handler", async () => {
    const res = await handle(api.updatePet({ name: "Gizmo", photoUrls: [] }), {
      204() {
        return "204 called";
      },
    });
    expect(res).toBe("204 called");
  });

  it("should call the default handler", async () => {
    const res = await handle(
      api.updatePet({} as any), // provoke 404 error
      {
        default(status, data) {
          return "default called";
        },
      }
    );
    expect(res).toBe("default called");
  });

  it("should throw if status is unhandled", async () => {
    const promise = handle(api.updatePet({ name: "Gizmo", photoUrls: [] }), {});
    await expect(promise).rejects.toHaveProperty("status", 204);
  });
});

describe("okify", () => {
  it("should okify a single function", async () => {
    const getPetById = okify(api.getPetById);
    const pet = await getPetById(1);
    expect(pet).toMatchObject({ id: 1, name: "doggie" });
  });
});

describe("optimistic", () => {
  it("should okify all functions", async () => {
    const optimisticApi = optimistic(api);
    const pet = await optimisticApi.getPetById(1);
    expect(pet).toMatchObject({ id: 1, name: "doggie" });
  });
});

describe("--optimistic", () => {
  it("should get pets by id", async () => {
    const pet = await optimisticApi.getPetById(1);
    expect(pet).toMatchObject({ id: 1, name: "doggie" });
  });

  it("should throw if status != 200", async () => {
    const promise = optimisticApi.getPetById(1, {
      headers: { Prefer: "statusCode=404" },
    });
    expect(promise).rejects.toHaveProperty("status", 404);
  });

  it("should post json", async () => {
    const order = await optimisticApi.placeOrder({
      petId: 1,
      status: "placed",
      quantity: 1,
    });

    expect(order).toMatchObject({
      quantity: 1,
      status: "placed",
    });
  });

  it("should type response as Pet|string", async () => {
    const pet = await optimisticApi.addPet({ name: "doggie", photoUrls: [] });
    //@ts-expect-error
    expect(pet.name).toBe("doggie");
  });
});
