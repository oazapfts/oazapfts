/**
 * Swagger Petstore
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import { Schema, Validator } from "jsonschema";
export const defaults: RequestOpts = {
    baseUrl: "https://petstore.swagger.io/v2"
};
export const servers = {
    server1: "https://petstore.swagger.io/v2",
    server2: "http://petstore.swagger.io/v2"
};
type Encoders = Array<(s: string) => string>;
export type RequestOpts = {
    baseUrl?: string;
    fetch?: typeof fetch;
    headers?: Record<string, string | undefined>;
    stripNullsBeforeValidation?: boolean;
} & Omit<RequestInit, "body" | "headers">;
type FetchRequestOpts = RequestOpts & {
    body?: string | FormData;
};
type JsonSchemaFormat = {
    json: object;
};
type TextSchemaFormat = {
    text: true;
};
type ResponseSchemaFormat = JsonSchemaFormat | TextSchemaFormat;
type ValidationOpts = {
    responseSchemas: {
        [code: string]: ResponseSchemaFormat;
    };
};
type JsonRequestOpts = RequestOpts & {
    body: object;
};
type MultipartRequestOpts = RequestOpts & {
    body: Record<string, string | Blob | undefined | any>;
};
export const _ = {
    validator: new Validator(),
    removeNulls(instance: {
        [key: string]: unknown;
    }, property: string): void {
        const value = instance[property];
        if (value === null || typeof value == "undefined") {
            delete instance[property];
        }
    },
    async fetch(url: string, validation: ValidationOpts, req: FetchRequestOpts = {}) {
        const { baseUrl, headers, fetch: customFetch, stripNullsBeforeValidation, ...init } = {
            ...defaults,
            ...req
        };
        const href = _.joinUrl(baseUrl, url);
        const anyResponsesUsesJsonFormat = Object.keys(Object.values(validation.responseSchemas)).some(responseFormat => responseFormat === "json");
        const extraHeaders = anyResponsesUsesJsonFormat
            ? { Accept: "application/json" }
            : {};
        const res = await (customFetch || fetch)(href, {
            ...init,
            headers: _.stripUndefined({
                ...headers,
                ...extraHeaders
            })
        });
        const responseSchemaFormat: ResponseSchemaFormat = validation.responseSchemas[res.status.toString()] ||
            validation.responseSchemas["default"];
        if (responseSchemaFormat === undefined) {
            throw new HttpError(res.status, `Response status ${res.status} does not have a schema defined.`, href);
        }
        const text = await res.text();
        if ("json" in responseSchemaFormat) {
            const responseJson = JSON.parse(text);
            const extraValidationOptions = stripNullsBeforeValidation
                ? { preValidateProperty: _.removeNulls }
                : {};
            const validationOptions = {
                allowUnknownAttributes: true,
                ...extraValidationOptions
            };
            const responseSchema: Schema = responseSchemaFormat["json"];
            const validationResponse = _.validator.validate(responseJson, responseSchema, validationOptions);
            if (validationResponse.valid) {
                return responseJson;
            }
            throw new HttpError(res.status, `Failed to validate schema of response with status ${res.status}\n` +
                `Messages:\n` +
                `  - ${validationResponse.errors
                    .map(err => err.stack)
                    .join("\n  - ")}\n\n` +
                `Body:\n${text}`, href);
        }
        return text;
    },
    json({ body, headers, ...req }: JsonRequestOpts) {
        return {
            ...req,
            body: JSON.stringify(body),
            headers: {
                ...headers,
                "Content-Type": "application/json"
            }
        };
    },
    form({ body, headers, ...req }: JsonRequestOpts) {
        return {
            ...req,
            body: QS.form(body),
            headers: {
                ...headers,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
    },
    multipart({ body, ...req }: MultipartRequestOpts) {
        const data = new FormData();
        Object.entries(body).forEach(([name, value]) => {
            data.append(name, value);
        });
        return {
            ...req,
            body: data
        };
    },
    /**
     * Deeply remove all properties with undefined values.
     */
    stripUndefined<T>(obj: T) {
        return obj && JSON.parse(JSON.stringify(obj));
    },
    // Encode param names and values as URIComponent
    encodeReserved: [encodeURIComponent, encodeURIComponent],
    allowReserved: [encodeURIComponent, encodeURI],
    /**
     * Creates a tag-function to encode template strings with the given encoders.
     */
    encode(encoders: Encoders, delimiter = ",") {
        const q = (v: any, i: number) => {
            const encoder = encoders[i % encoders.length];
            if (typeof v === "object") {
                if (Array.isArray(v)) {
                    return v.map(encoder).join(delimiter);
                }
                const flat = Object.entries(v).reduce((flat, entry) => [...flat, ...entry], [] as any);
                return flat.map(encoder).join(delimiter);
            }
            return encoder(String(v));
        };
        return (strings: TemplateStringsArray, ...values: any[]) => {
            return strings.reduce((prev, s, i) => {
                return `${prev}${s}${q(values[i] || "", i)}`;
            }, "");
        };
    },
    /**
     * Separate array values by the given delimiter.
     */
    delimited(delimiter = ",") {
        return (params: Record<string, any>, encoders = _.encodeReserved) => Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([name, value]) => _.encode(encoders, delimiter) `${name}=${value}`)
            .join("&");
    },
    joinUrl(...parts: Array<string | undefined>) {
        return parts
            .filter(Boolean)
            .join("/")
            .replace(/([^:]\/)\/+/, "$1");
    }
};
/**
 * Functions to serialize query parameters in different styles.
 */
export const QS = {
    /**
     * Join params using an ampersand and prepends a questionmark if not empty.
     */
    query(...params: string[]) {
        const s = params.join("&");
        return s && `?${s}`;
    },
    /**
     * Serializes nested objects according to the `deepObject` style specified in
     * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#style-values
     */
    deep(params: Record<string, any>, [k, v] = _.encodeReserved): string {
        const qk = _.encode([s => s, k]);
        const qv = _.encode([s => s, v]);
        // don't add index to arrays
        // https://github.com/expressjs/body-parser/issues/289
        const visit = (obj: any, prefix = ""): string => Object.entries(obj)
            .filter(([, v]) => v !== undefined)
            .map(([prop, v]) => {
            const index = Array.isArray(obj) ? "" : prop;
            const key = prefix ? qk `${prefix}[${index}]` : prop;
            if (typeof v === "object") {
                return visit(v, key);
            }
            return qv `${key}=${v}`;
        })
            .join("&");
        return visit(params);
    },
    /**
     * Property values of type array or object generate separate parameters
     * for each value of the array, or key-value-pair of the map.
     * For other types of properties this property has no effect.
     * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#encoding-object
     */
    explode(params: Record<string, any>, encoders = _.encodeReserved): string {
        const q = _.encode(encoders);
        return Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([name, value]) => {
            if (Array.isArray(value)) {
                return value.map(v => q `${name}=${v}`).join("&");
            }
            if (typeof value === "object") {
                return QS.explode(value, encoders);
            }
            return q `${name}=${value}`;
        })
            .join("&");
    },
    form: _.delimited(),
    pipe: _.delimited("|"),
    space: _.delimited("%20")
};
export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string, url: string) {
        super(`${url} - ${message} (${status})`);
        this.status = status;
    }
}
export type ApiResult<Fn> = Fn extends (...args: any) => Promise<infer T> ? T : never;
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
    status?: "available" | "pending" | "sold";
};
export type ApiResponse = {
    code?: number;
    "type"?: string;
    message?: string;
};
export type Order = {
    id?: number;
    petId?: number;
    quantity?: number;
    shipDate?: string;
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
    userStatus?: number;
};
/**
 * Update an existing pet
 */
export async function updatePet(pet: Pet, opts?: RequestOpts) {
    return await _.fetch("/pet", { responseSchemas: { "400": { "text": true }, "404": { "text": true }, "405": { "text": true } } }, _.json({
        ...opts,
        method: "PUT",
        body: pet
    })) as string | string | string;
}
/**
 * Add a new pet to the store
 */
export async function addPet(pet: Pet, opts?: RequestOpts) {
    return await _.fetch("/pet", { responseSchemas: { "405": { "text": true } } }, _.json({
        ...opts,
        method: "POST",
        body: pet
    })) as string;
}
/**
 * Finds Pets by status
 */
export async function findPetsByStatus(status: ("available" | "pending" | "sold")[], opts?: RequestOpts) {
    return await _.fetch(`/pet/findByStatus${QS.query(QS.explode({
        status
    }))}`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "array", "items": { "required": ["name", "photoUrls"], "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "category": { "type": "object", "properties": { "id": { "type": "integer",
                                        "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "name": { "type": "string" } } }, "name": { "type": "string" }, "photoUrls": { "type": "array", "items": { "type": "string" } }, "tags": { "type": "array", "items": { "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000,
                                            "maximum": 9223372036854776000
                                        }, "name": { "type": "string" } } } }, "status": { "type": "string", "description": "pet status in the store", "enum": ["available", "pending", "sold"] } } }, "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true } } }, {
        ...opts
    }) as Pet[] | string;
}
/**
 * Finds Pets by tags
 */
export async function findPetsByTags(tags: string[], opts?: RequestOpts) {
    return await _.fetch(`/pet/findByTags${QS.query(QS.explode({
        tags
    }))}`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "array", "items": { "required": ["name", "photoUrls"], "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "category": { "type": "object", "properties": { "id": { "type": "integer",
                                        "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "name": { "type": "string" } } }, "name": { "type": "string" }, "photoUrls": { "type": "array", "items": { "type": "string" } }, "tags": { "type": "array", "items": { "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000,
                                            "maximum": 9223372036854776000
                                        }, "name": { "type": "string" } } } }, "status": { "type": "string", "description": "pet status in the store", "enum": ["available", "pending", "sold"] } } }, "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true } } }, {
        ...opts
    }) as Pet[] | string;
}
/**
 * Find pet by ID
 */
export async function getPetById(petId: number, opts?: RequestOpts) {
    return await _.fetch(`/pet/${petId}`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "required": ["name", "photoUrls"], "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "category": { "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "name": { "type": "string" } } }, "name": { "type": "string" }, "photoUrls": { "type": "array", "items": { "type": "string" } }, "tags": { "type": "array", "items": { "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": -9223372036854776000, "maximum": 9223372036854776000 }, "name": { "type": "string" } } } }, "status": {
                            "type": "string", "description": "pet status in the store", "enum": ["available", "pending", "sold"] } }, "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true }, "404": { "text": true } } }, {
        ...opts
    }) as Pet | string | string;
}
/**
 * Updates a pet in the store with form data
 */
export async function updatePetWithForm(petId: number, body: {
    name?: string;
    status?: string;
}, opts?: RequestOpts) {
    return await _.fetch(`/pet/${petId}`, { responseSchemas: { "405": { "text": true } } }, _.form({
        ...opts,
        method: "POST",
        body
    })) as string;
}
/**
 * Deletes a pet
 */
export async function deletePet(petId: number, { apiKey }: {
    apiKey?: string;
} = {}, opts?: RequestOpts) {
    return await _.fetch(`/pet/${petId}`, { responseSchemas: { "400": { "text": true }, "404": { "text": true } } }, {
        ...opts,
        method: "DELETE",
        headers: {
            ...opts && opts.headers,
            api_key: apiKey
        }
    }) as string | string;
}
/**
 * uploads an image
 */
export async function uploadFile(petId: number, body: {
    additionalMetadata?: string;
    file?: Blob;
}, opts?: RequestOpts) {
    return await _.fetch(`/pet/${petId}/uploadImage`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "object", "properties": { "code": { "type": "integer", "format": "int32", "minimum": -2147483648, "maximum": 2147483647 },
                        "type": { "type": "string" }, "message": { "type": "string" } }, "$schema": "http://json-schema.org/draft-04/schema#" } } } }, _.multipart({
        ...opts,
        method: "POST",
        body
    })) as ApiResponse;
}
/**
 * Returns pet inventories by status
 */
export async function getInventory(opts?: RequestOpts) {
    return await _.fetch("/store/inventory", { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "object", "additionalProperties": { "type": "integer", "format": "int32", "minimum": -2147483648, "maximum": 2147483647
                    },
                    "$schema": "http://json-schema.org/draft-04/schema#" } } } }, {
        ...opts
    }) as {
        [key: string]: number;
    };
}
/**
 * Place an order for a pet
 */
export async function placeOrder(order: Order, opts?: RequestOpts) {
    return await _.fetch("/store/order", { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": //www.npmjs.com/package/oazapfts
                            -9223372036854776000, "maximum": 9223372036854776000 }, "petId": { "type": "integer", "format": "int64", "minimum": -9223372036854776000,
                            "maximum": 9223372036854776000 }, "quantity": { "type": "integer", "format": "int32", "minimum": -2147483648, "maximum": 2147483647 },
                        "shipDate": { "type": "string", "format": "date-time" }, "status": { "type": "string", "description": "Order Status", "enum": ["placed", "approved",
                                "delivered"] }, "complete": { "type": "boolean",
                            "default": false } }, "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true } } }, _.json({
        ...opts,
        method: "POST",
        body: order
    })) as Order | string;
}
/**
 * Find purchase order by ID
 */
export async function getOrderById(orderId: number, opts?: RequestOpts) {
    return await _.fetch(`/store/order/${orderId}`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": //www.npmjs.com/package/oazapfts
                            -9223372036854776000, "maximum": 9223372036854776000 }, "petId": { "type": "integer", "format": "int64", "minimum": -9223372036854776000,
                            "maximum": 9223372036854776000 }, "quantity": { "type": "integer", "format": "int32", "minimum": -2147483648, "maximum": 2147483647 },
                        "shipDate": { "type": "string", "format": "date-time" }, "status": { "type": "string", "description": "Order Status", "enum": ["placed", "approved",
                                "delivered"] }, "complete": { "type": "boolean",
                            "default": false } }, "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true }, "404": { "text": true } } }, {
        ...opts
    }) as Order | string | string;
}
/**
 * Delete purchase order by ID
 */
export async function deleteOrder(orderId: number, opts?: RequestOpts) {
    return await _.fetch(`/store/order/${orderId}`, { responseSchemas: { "400": { "text": true }, "404": { "text": true } } }, {
        ...opts,
        method: "DELETE"
    }) as string | string;
}
/**
 * Create user
 */
export async function createUser(user: User, opts?: RequestOpts) {
    return await _.fetch("/user", { responseSchemas: { "default": { "text": true } } }, _.json({
        ...opts,
        method: "POST",
        body: user
    })) as string;
}
/**
 * Creates list of users with given input array
 */
export async function createUsersWithArrayInput(body: User[], opts?: RequestOpts) {
    return await _.fetch("/user/createWithArray", { responseSchemas: { "default": { "text": true } } }, _.json({
        ...opts,
        method: "POST",
        body
    })) as string;
}
/**
 * Creates list of users with given input array
 */
export async function createUsersWithListInput(body: User[], opts?: RequestOpts) {
    return await _.fetch("/user/createWithList", { responseSchemas: { "default": { "text": true } } }, _.json({
        ...opts,
        method: "POST",
        body
    })) as string;
}
/**
 * Logs user into the system
 */
export async function loginUser(username: string, password: string, opts?: RequestOpts) {
    return await _.fetch(`/user/login${QS.query(QS.form({
        username,
        password
    }))}`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "string", "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true } } }, {
        ...opts
    }) as string | string;
}
/**
 * Logs out current logged in user session
 */
export async function logoutUser(opts?: RequestOpts) {
    return await _.fetch("/user/logout", { responseSchemas: { "default": { "text": true } } }, {
        ...opts
    }) as string;
}
/**
 * Get user by user name
 */
export async function getUserByName(username: string, opts?: RequestOpts) {
    return await _.fetch(`/user/${username}`, { responseSchemas: { "200": { "json": /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */ /**
                 * DO NOT MODIFY - This file has been generated using oazapfts.
                 * See https://www.npmjs.com/package/oazapfts
                 */
                {
                    "type": "object", "properties": { "id": { "type": "integer", "format": "int64", "minimum": //www.npmjs.com/package/oazapfts
                            -9223372036854776000, "maximum": 9223372036854776000 }, "username": { "type": "string" }, "firstName": { "type": "string" }, "lastName": { "type": "string" },
                        "email": { "type": "string" }, "password": { "type": "string" }, "phone": { "type": "string"
                        }, "userStatus": { "type": "integer", "description": "User Status", "format": "int32", "minimum": -2147483648, "maximum": 2147483647
                        } }, "$schema": "http://json-schema.org/draft-04/schema#" } }, "400": { "text": true }, "404": { "text": true } } }, {
        ...opts
    }) as User | string | string;
}
/**
 * Updated user
 */
export async function updateUser(username: string, user: User, opts?: RequestOpts) {
    return await _.fetch(`/user/${username}`, { responseSchemas: { "400": { "text": true }, "404": { "text": true } } }, _.json({
        ...opts,
        method: "PUT",
        body: user
    })) as string | string;
}
/**
 * Delete user
 */
export async function deleteUser(username: string, opts?: RequestOpts) {
    return await _.fetch(`/user/${username}`, { responseSchemas: { "400": { "text": true }, "404": { "text": true } } }, {
        ...opts,
        method: "DELETE"
    }) as string | string;
}
export async function customizePet({ furColor, color, xColorOptions }: {
    furColor?: string;
    color?: string;
    xColorOptions?: string;
} = {}, opts?: RequestOpts) {
    return await _.fetch(`/pet/customize${QS.query(QS.form({
        "fur.color": furColor,
        color
    }))}`, { responseSchemas: { "204": { "text": true } } }, {
        ...opts,
        method: "POST",
        headers: {
            ...opts && opts.headers,
            "x-color-options": xColorOptions
        }
    }) as string;
}
