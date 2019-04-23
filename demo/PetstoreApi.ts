/**
 * DO NOT MODIFY - This file has been generated using oazapfts.
 */
type Encoders = Array<(s: string) => string>;
// Encode param names and values as URIComponent
const encodeReserved = [encodeURIComponent, encodeURIComponent];
// Allow reserved chars in param values
const allowReserved = [encodeURIComponent, encodeURI];
type RequestOpts = {
    headers?: Record<string, string | undefined>;
    method?: string;
};
type FetchRequestOpts = RequestOpts & {
    body?: string | FormData;
};
type JsonRequestOpts = RequestOpts & {
    body: object;
};
type MultipartRequestOpts = RequestOpts & {
    body: Record<string, string | Blob | undefined | any>;
};
export class Api {
    private _baseUrl: string;
    private _fetchOpts: RequestInit;
    constructor({ baseUrl = "https://petstore.swagger.io/v2", ...fetchOpts }: {
        baseUrl?: string;
    } & RequestInit = {}) {
        this._baseUrl = baseUrl;
        this._fetchOpts = fetchOpts;
    }
    private async _fetch(url: string, req: FetchRequestOpts = {}) {
        // remove headers with undefined keys...
        const headers = req.headers && JSON.parse(JSON.stringify(req.headers));
        const res = await fetch(this._baseUrl + url, {
            ...this._fetchOpts,
            ...req,
            headers
        });
        return res.text();
    }
    private async _fetchJson(url: string, req: FetchRequestOpts = {}) {
        const res = await this._fetch(url, {
            ...req,
            headers: {
                ...req.headers,
                Accept: "application/json"
            }
        });
        return JSON.parse(res);
    }
    private _json({ body, headers, ...req }: JsonRequestOpts) {
        return {
            ...req,
            body: JSON.stringify(body),
            headers: {
                ...headers,
                "Content-Type": "application/json"
            }
        };
    }
    private _form({ body, headers, ...req }: JsonRequestOpts) {
        return {
            ...req,
            body: QS.form(body),
            headers: {
                ...headers,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
    }
    private _multipart({ body, ...req }: MultipartRequestOpts) {
        const data = new FormData();
        Object.entries(body).forEach(([name, value]) => {
            data.append(name, value);
        });
        return {
            ...req,
            body: data
        };
    }
    /**
     * Update an existing pet
     */
    async updatePet(pet: Pet) {
        return await this._fetch("/pet", this._json({
            method: "PUT",
            body: pet
        }));
    }
    /**
     * Add a new pet to the store
     */
    async addPet(pet: Pet) {
        return await this._fetch("/pet", this._json({
            method: "POST",
            body: pet
        })) as string;
    }
    /**
     * Finds Pets by status
     */
    async findPetsByStatus(status: ("available" | "pending" | "sold")[]) {
        return await this._fetchJson(`/pet/findByStatus${QS.query(QS.explode({ status }))}`) as Pet[];
    }
    /**
     * Finds Pets by tags
     */
    async findPetsByTags(tags: string[]) {
        return await this._fetchJson(`/pet/findByTags${QS.query(QS.explode({ tags }))}`) as Pet[];
    }
    /**
     * Find pet by ID
     */
    async getPetById(petId: number) {
        return await this._fetchJson(`/pet/${petId}`) as Pet;
    }
    /**
     * Updates a pet in the store with form data
     */
    async updatePetWithForm(petId: number, body: {
        name?: string;
        status?: string;
    }) {
        return await this._fetch(`/pet/${petId}`, this._form({
            method: "POST",
            body
        })) as string;
    }
    /**
     * Deletes a pet
     */
    async deletePet(petId: number, { api_key }: {
        api_key?: string;
    } = {}) {
        return await this._fetch(`/pet/${petId}`, {
            method: "DELETE",
            headers: {
                api_key
            }
        });
    }
    /**
     * uploads an image
     */
    async uploadFile(petId: number, body: {
        additionalMetadata?: string;
        file?: Blob;
    }) {
        return await this._fetchJson(`/pet/${petId}/uploadImage`, this._multipart({
            method: "POST",
            body
        })) as ApiResponse;
    }
    /**
     * Returns pet inventories by status
     */
    async getInventory() {
        return await this._fetchJson("/store/inventory") as {
            [key: string]: number;
        };
    }
    /**
     * Place an order for a pet
     */
    async placeOrder(order: Order) {
        return await this._fetchJson("/store/order", this._json({
            method: "POST",
            body: order
        })) as Order;
    }
    /**
     * Find purchase order by ID
     */
    async getOrderById(orderId: number) {
        return await this._fetchJson(`/store/order/${orderId}`) as Order;
    }
    /**
     * Delete purchase order by ID
     */
    async deleteOrder(orderId: number) {
        return await this._fetch(`/store/order/${orderId}`, {
            method: "DELETE"
        });
    }
    /**
     * Create user
     */
    async createUser(user: User) {
        return await this._fetch("/user", this._json({
            method: "POST",
            body: user
        })) as string;
    }
    /**
     * Creates list of users with given input array
     */
    async createUsersWithArrayInput(body: User[]) {
        return await this._fetch("/user/createWithArray", this._json({
            method: "POST",
            body
        })) as string;
    }
    /**
     * Creates list of users with given input array
     */
    async createUsersWithListInput(body: User[]) {
        return await this._fetch("/user/createWithList", this._json({
            method: "POST",
            body
        })) as string;
    }
    /**
     * Logs user into the system
     */
    async loginUser(username: string, password: string) {
        return await this._fetchJson(`/user/login${QS.query(QS.form({ username, password }))}`) as string;
    }
    /**
     * Logs out current logged in user session
     */
    async logoutUser() {
        return await this._fetch("/user/logout") as string;
    }
    /**
     * Get user by user name
     */
    async getUserByName(username: string) {
        return await this._fetchJson(`/user/${username}`) as User;
    }
    /**
     * Updated user
     */
    async updateUser(username: string, user: User) {
        return await this._fetch(`/user/${username}`, this._json({
            method: "PUT",
            body: user
        }));
    }
    /**
     * Delete user
     */
    async deleteUser(username: string) {
        return await this._fetch(`/user/${username}`, {
            method: "DELETE"
        });
    }
}
/**
 * Creates a tag-function to encode template strings with the given encoders.
 */
function encode(encoders: Encoders, delimiter = ",") {
    const q = (v: any, i: number) => {
        const encoder = encoders[i % encoders.length];
        if (Array.isArray(v)) {
            return v.map(encoder).join(delimiter);
        }
        return encoder(String(v));
    };
    return (strings: TemplateStringsArray, ...values: any[]) => {
        return strings.reduce((prev, s, i) => {
            return `${prev}${s}${q(values[i] || "", i)}`;
        }, "");
    };
}
/**
 * Separate array values by the given delimiter.
 */
function delimited(delimiter = ",") {
    return (params: Record<string, any>, encoders = encodeReserved) => Object.entries(params)
        .map(([name, value]) => encode(encoders, delimiter) `${name}=${value}`)
        .join("&");
}
/**
 * Functions to serialize query paramters in different styles.
 */
export const QS = {
    encode,
    encodeReserved,
    allowReserved,
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
    deep(params: Record<string, any>, [k, v] = encodeReserved): string {
        const qk = encode([s => s, k]);
        const qv = encode([s => s, v]);
        const visit = (obj: any, prefix = ""): string => Object.entries(obj)
            .map(([prop, v]) => {
            const key = prefix ? qk `${prefix}[${prop}]` : prop;
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
    explode(params: Record<string, any>, encoders = encodeReserved): string {
        const q = encode(encoders);
        return Object.entries(params)
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
    form: delimited(),
    pipe: delimited("|"),
    space: delimited("%20")
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
    status?: "available" | "pending" | "sold";
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
