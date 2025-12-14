/**
 * Swagger Petstore
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
  headers: {},
  baseUrl: "https://petstore.swagger.io/v2",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
  server1: "https://petstore.swagger.io/v2",
  server2: ({
    protocol = "https",
    stage = "staging",
    version = "v1",
  }: {
    protocol: "http" | "https";
    stage: "test" | "staging" | "production";
    version: "v1" | "v2";
  }) => `${protocol}://${stage}.petstore.example.org/${version}`,
};
export type Category = {
  id?: number;
  name?: string;
};
export type Tag = {
  id?: number;
  name?: string;
};
export type Pet = {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold" | "private" | "10percent";
  activities?: ("running" | "playing" | "laying" | "begging")[];
  /** Always true for a pet */
  animal?: true;
  /** Size scale for pets */
  size?: "P" | "M" | "G" | "0";
  /** integer test case for #349 */
  typeId?: 1 | 2 | 3 | 4 | 6 | 8 | -1;
  /** string test case for #766 */
  channel?: "P" | "M" | "G";
};
export type ApiResponse = {
  code?: number;
  type?: string;
  message?: string;
};
export type Order = {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
};
export type User = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
  /** user category in the store */
  category?: "rich" | "wealthy" | "poor";
};
export type Schema = string;
export type Schema2 = number;
export type Option = ("one" | "two" | "three")[];
export type EnumToRef = "monkey" | "dog" | "cat";
export type Product = {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
  currency: string;
  producerID: string;
};
export type PagedListOfProduct = {
  items: Product[];
  totalPages: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
};
export type ReadWriteMixed = {
  email: string;
  password: string;
  message: string;
};
export type Issue542 = {
  playlist?: string;
  "media-protocol"?: "hls" | "mss" | "dash";
  "dashed-property"?: string;
};
export type Issue672 = {};
/**
 * Update an existing pet
 */
export function updatePet(pet: Pet, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 204;
        data: string;
      }
    | {
        status: 404;
        data: string;
      }
    | {
        status: number;
        data: {
          errors?: string[];
        };
      }
  >(
    "/pet",
    oazapfts.json({
      ...opts,
      method: "PUT",
      body: pet,
    }),
  );
}
/**
 * Add a new pet to the store
 */
export function addPet(pet: Pet, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: Pet;
      }
    | {
        status: 201;
        data: {
          id?: string;
        };
      }
  >(
    "/pet",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: pet,
    }),
  );
}
/**
 * This is a duplicate of the updatePet operation with the same operationId
 */
export function updatePet2(body: boolean, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchText(
    "/pet-duplicate",
    oazapfts.json({
      ...opts,
      method: "PUT",
      body,
    }),
  );
}
/**
 * Finds Pets by status
 */
export function findPetsByStatus(
  status: ("available" | "pending" | "sold")[],
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: Pet[];
      }
    | {
        status: 400;
        data: string;
      }
  >(
    `/pet/findByStatus${QS.query(
      QS.explode({
        status,
      }),
    )}`,
    {
      ...opts,
    },
  );
}
/**
 * Finds Pets by tags
 */
export function findPetsByTags(tags: string[], opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: Pet[];
      }
    | {
        status: 400;
        data: string;
      }
  >(
    `/pet/findByTags${QS.query(
      QS.explode({
        tags,
      }),
    )}`,
    {
      ...opts,
    },
  );
}
/**
 * Find pet by ID
 */
export function getPetById(petId: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: Pet;
      }
    | {
        status: 400;
        data: string;
      }
    | {
        status: 404;
      }
  >(`/pet/${encodeURIComponent(petId)}`, {
    ...opts,
  });
}
/**
 * Updates a pet in the store with form data
 */
export function updatePetWithForm(
  petId: number,
  body?: {
    /** Updated name of the pet */
    name?: string;
    /** Updated status of the pet */
    status?: string;
  },
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    `/pet/${encodeURIComponent(petId)}`,
    oazapfts.form({
      ...opts,
      method: "POST",
      body,
    }),
  );
}
/**
 * Deletes a pet
 */
export function deletePet(
  petId: number,
  {
    apiKey,
  }: {
    apiKey?: string;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(`/pet/${encodeURIComponent(petId)}`, {
    ...opts,
    method: "DELETE",
    headers: oazapfts.mergeHeaders(opts?.headers, {
      api_key: apiKey,
    }),
  });
}
/**
 * uploads an image
 */
export function uploadFiles(
  petId: number,
  body: {
    imageMeta: {
      name: string;
      description?: string;
    }[];
    /** files to upload */
    files: Blob[];
  },
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ApiResponse;
  }>(
    `/pet/${encodeURIComponent(petId)}/uploadImage`,
    oazapfts.multipart({
      ...opts,
      method: "POST",
      body,
    }),
  );
}
export function customizePet(
  petId: number,
  {
    furColor,
    color,
    xColorOptions,
  }: {
    furColor?: string;
    color?: string;
    xColorOptions?: boolean;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    `/pet/${encodeURIComponent(petId)}/customize${QS.query(
      QS.explode({
        "fur.color": furColor,
        color,
      }),
    )}`,
    {
      ...opts,
      method: "POST",
      headers: oazapfts.mergeHeaders(opts?.headers, {
        "x-color-options": xColorOptions,
      }),
    },
  );
}
/**
 * Returns pet inventories by status
 */
export function getInventory(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: {
      [key: string]: number;
    };
  }>("/store/inventory", {
    ...opts,
  });
}
/**
 * Place an order for a pet
 */
export function placeOrder(order: Order, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: Order;
      }
    | {
        status: 400;
        data: string;
      }
  >(
    "/store/order",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: order,
    }),
  );
}
/**
 * Find purchase order by ID
 */
export function getOrderById(orderId: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: Order;
      }
    | {
        status: 400;
        data: string;
      }
    | {
        status: 404;
        data: string;
      }
  >(`/store/order/${encodeURIComponent(orderId)}`, {
    ...opts,
  });
}
/**
 * Delete purchase order by ID
 */
export function deleteOrder(orderId: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchText(`/store/order/${encodeURIComponent(orderId)}`, {
    ...opts,
    method: "DELETE",
  });
}
/**
 * Create user
 */
export function createUser(user: User, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchText(
    "/user",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: user,
    }),
  );
}
/**
 * Creates list of users with given input array
 */
export function createUsersWithArrayInput(
  body: User[],
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    "/user/createWithArray",
    oazapfts.json({
      ...opts,
      method: "POST",
      body,
    }),
  );
}
/**
 * Creates list of users with given input array
 */
export function createUsersWithListInput(
  body: User[],
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    "/user/createWithList",
    oazapfts.json({
      ...opts,
      method: "POST",
      body,
    }),
  );
}
/**
 * Logs user into the system
 */
export function loginUser(
  username: string,
  password: string,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: string;
      }
    | {
        status: 400;
        data: string;
      }
  >(
    `/user/login${QS.query(
      QS.explode({
        username,
        password,
      }),
    )}`,
    {
      ...opts,
    },
  );
}
/**
 * Logs out current logged in user session
 */
export function logoutUser(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchText("/user/logout", {
    ...opts,
  });
}
/**
 * Get user by user name
 */
export function getUserByName(username: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: User;
      }
    | {
        status: 400;
        data: string;
      }
    | {
        status: 404;
        data: string;
      }
  >(`/user/${encodeURIComponent(username)}`, {
    ...opts,
  });
}
/**
 * Updated user
 */
export function updateUser(
  username: string,
  user: User,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    `/user/${encodeURIComponent(username)}`,
    oazapfts.json({
      ...opts,
      method: "PUT",
      body: user,
    }),
  );
}
/**
 * Delete user
 */
export function deleteUser(username: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchText(`/user/${encodeURIComponent(username)}`, {
    ...opts,
    method: "DELETE",
  });
}
export function getIssue31ByFoo(
  foo: string,
  {
    bar,
    baz,
    boo,
  }: {
    bar?: Schema;
    baz?: number;
    boo?: Schema2;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    `/issue31/${encodeURIComponent(foo)}${QS.query(
      QS.explode({
        bar,
        baz,
        boo,
      }),
    )}`,
    {
      ...opts,
    },
  );
}
export function getObjectParameters(
  {
    defaultArray,
    explodedFormArray,
    commaArray,
    defaultSpaceDelimited,
    explodedSpaceDelimited,
    spaceDelimited,
    defaultPipeDelimited,
    explodedPipeDelimited,
    pipeDelimited,
    defaultObject,
    explodedFormObject,
    commaObject,
    deepObject,
  }: {
    defaultArray?: Option;
    explodedFormArray?: Option;
    commaArray?: Option;
    defaultSpaceDelimited?: Option;
    explodedSpaceDelimited?: Option;
    spaceDelimited?: Option;
    defaultPipeDelimited?: Option;
    explodedPipeDelimited?: Option;
    pipeDelimited?: Option;
    defaultObject?: Tag;
    explodedFormObject?: Tag;
    commaObject?: Tag;
    deepObject?: Tag;
  } = {},
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchText(
    `/object-parameters${QS.query(
      QS.explode({
        defaultArray,
        explodedFormArray,
        defaultSpaceDelimited,
        explodedSpaceDelimited,
        defaultPipeDelimited,
        explodedPipeDelimited,
        defaultObject,
        explodedFormObject,
      }),
      QS.form({
        commaArray,
        commaObject,
      }),
      QS.space({
        spaceDelimited,
      }),
      QS.pipe({
        pipeDelimited,
      }),
      QS.deep({
        deepObject,
      }),
    )}`,
    {
      ...opts,
    },
  );
}
/**
 * uploads an image in png format
 */
export function uploadPng(body?: Blob, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ApiResponse;
  }>("/uploadPng", {
    ...opts,
    method: "POST",
    body,
  });
}
export function issue330(body?: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchText(
    "issue330",
    oazapfts.json({
      ...opts,
      method: "PUT",
      body,
    }),
  );
}
export function getIssue367(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: {
      foo?: EnumToRef;
    };
  }>("/issue367", {
    ...opts,
  });
}
export function productsGetAll(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200;
        data: PagedListOfProduct;
      }
    | {
        status: 210;
        data: Product & {
          producerId: string;
          hidden?: boolean;
        };
      }
  >("/issue-446", {
    ...opts,
  });
}
export function productsCreateMany(
  body?: PagedListOfProduct | Pet,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: {};
  }>(
    "/issue-446",
    oazapfts.json({
      ...opts,
      method: "POST",
      body,
    }),
  );
}
export function readWriteMixed(
  readWriteMixed?: ReadWriteMixed,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ReadWriteMixed;
  }>(
    "issue-453",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: readWriteMixed,
    }),
  );
}
export function dashInSchema(issue542?: Issue542, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200;
    data: {
      underscore_property?: "one" | "two" | "three";
    };
  }>(
    "/issue-542",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: issue542,
    }),
  );
}
export function undefinedDiscriminatorMapping(
  issue672: Issue672,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: Pet;
  }>(
    "/issue-672",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: issue672,
    }),
  );
}
