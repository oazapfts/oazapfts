import { ApiResponse } from "./runtime";

/**
 * Type to access a response's data property for a given status.
 */
export type DataType<T extends ApiResponse, S extends number> = T extends {
  status: S;
}
  ? T["data"]
  : never;

/**
 * Object with methods to handle possible status codes of an ApiResponse.
 */
export type ResponseHandler<T extends ApiResponse> = {
  [P in T["status"]]?: (res: DataType<T, P>) => any;
} & {
  default?: (status: number, data: any) => any;
};

export type FunctionReturnType<T> = T extends (args: any[]) => any
  ? ReturnType<T>
  : never;

/**
 * Utility function to handle different status codes.
 *
 * Example:
 *
 * const userId = await handle(api.register({ email, password }), {
 *   200: (user: User) => user.id,
 *   400: (err: string) => console.log(err),
 * })
 **/
export async function handle<
  T extends ApiResponse,
  H extends ResponseHandler<T>
>(promise: Promise<T>, handler: H): Promise<FunctionReturnType<H[keyof H]>> {
  const { status, data } = await promise;
  const statusHandler = (handler as any)[status];
  if (statusHandler) return statusHandler(data);
  if (handler.default) return handler.default(status, data);
  throw new HttpError(status, data);
}

export const SUCCESS_CODES = [200, 201, 202, 204] as const;
export type SuccessCodes = typeof SUCCESS_CODES[number];

export type SuccessResponse<T extends ApiResponse> = DataType<T, SuccessCodes>;

/**
 * Utility function to directly return any successful response
 * and throw a HttpError otherwise.
 *
 * Example:
 *
 * try {
 *   const userId = await ok(api.register({ email, password }));
 * }
 * catch (err) {
 *   console.log(err.status)
 * }
 */
export async function ok<T extends ApiResponse>(
  promise: Promise<T>
): Promise<SuccessResponse<T>> {
  const res = await promise;
  if (SUCCESS_CODES.some((s) => s == res.status)) return res.data;
  throw new HttpError(res.status, res.data);
}

export type Args<T> = T extends (...args: infer U) => any ? U : any;
export type ApiFunction = (...args: any[]) => Promise<ApiResponse>;
export type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer V>
  ? V
  : never;

export type OkResponse<T extends ApiFunction> = SuccessResponse<
  AsyncReturnType<T>
>;

export type Okify<T extends ApiFunction> = (
  ...args: Args<T>
) => Promise<OkResponse<T>>;

/**
 * Utility function to wrap an API function with `ok(...)`.
 */
export function okify<T extends ApiFunction>(fn: T): Okify<T> {
  return (...args: Args<T>) => ok(fn(...args));
}

type OptimisticApi<T> = {
  [K in keyof T]: T[K] extends ApiFunction ? Okify<T[K]> : T[K];
};

/**
 * Utility to `okify` each function of an API.
 */
export function optimistic<T extends Record<string, ApiFunction | unknown>>(
  api: T
): OptimisticApi<T> {
  const okApi: any = {};
  Object.entries(api).forEach(([key, value]) => {
    okApi[key] = typeof value === "function" ? okify(value as any) : value;
  });
  return okApi;
}

export class HttpError extends Error {
  status: number;
  data?: any;
  constructor(status: number, data: any) {
    super(`Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}
