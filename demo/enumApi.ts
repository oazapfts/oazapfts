/**
 * Swagger Petstore
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts/lib/runtime";
import * as QS from "oazapfts/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
  baseUrl: "https://petstore.swagger.io/v2",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
  server1: "https://petstore.swagger.io/v2",
  server2: "http://petstore.swagger.io/v2",
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
  status?: Status;
  animal?: true;
  size?: Size;
  typeId?: TypeId;
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
  status?: Status2;
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
  userStatus?: number;
  category?: Category2;
};
export type Schema = string;
export type Schema2 = number;
export type Option = ("one" | "two" | "three")[];
export type Product = {
  name: string;
  description: string;
  currency: string;
};
export type ProductRead = {
  id: string;
  name: string;
  description: string;
  currency: string;
  producerID: string;
};
export type ProductWrite = {
  name: string;
  description: string;
  hidden?: boolean;
  currency: string;
};
export type PagedListOfProduct = {
  items: Product[];
  totalPages: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
};
export type PagedListOfProductRead = {
  items: ProductRead[];
  totalPages: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
};
export type PagedListOfProductWrite = {
  items: ProductWrite[];
  totalPages: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
};
export type ReadWriteMixed = {};
export type ReadWriteMixedRead = {
  message: string;
};
export type ReadWriteMixedWrite = {
  email: string;
  password: string;
};
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
    name?: string;
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
    headers: {
      ...(opts && opts.headers),
      api_key: apiKey,
    },
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
      headers: {
        ...(opts && opts.headers),
        "x-color-options": xColorOptions,
      },
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
        data: PagedListOfProductRead;
      }
    | {
        status: 210;
        data: ProductRead & {
          producerId: string;
        };
      }
  >("/issue-446", {
    ...opts,
  });
}
export function productsCreateMany(
  body?: PagedListOfProductWrite | Pet,
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
  readWriteMixed?: ReadWriteMixedWrite,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<{
    status: 200;
    data: ReadWriteMixedRead;
  }>(
    "issue-453",
    oazapfts.json({
      ...opts,
      method: "POST",
      body: readWriteMixed,
    }),
  );
}
export enum Status {
  Available = "available",
  Pending = "pending",
  Sold = "sold",
  Private = "private",
  $10Percent = "10percent",
}
export enum Size {
  P = "P",
  M = "M",
  G = "G",
  $0 = "0",
}
export enum TypeId {
  Dog = 1,
  Cat = 2,
  Tiger = 3,
  Mouse = 4,
  House = 6,
  $3HeadedMonkey = 8,
}
export enum Status2 {
  Placed = "placed",
  Approved = "approved",
  Delivered = "delivered",
}
export enum Category2 {
  Rich = "rich",
  Wealthy = "wealthy",
  Poor = "poor",
}
export enum EnumToRef {
  Monkey = "monkey",
  Dog = "dog",
  Cat = "cat",
}
