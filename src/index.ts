import { ApiResponse } from "./runtime";

/**
 * Type to access a response's data property for a given status.
 */
type DataType<T extends ApiResponse, S extends number> = T extends { status: S }
  ? T["data"]
  : never;

/**
 * Object with methods to handle possible status codes of an ApiResponse.
 */
type ResponseHandler<T extends ApiResponse> = {
  [P in T["status"]]: (res: DataType<T, P>) => any;
} & {
  default?: (status: number, data: any) => any;
};

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
>(promise: Promise<T>, handler: H): Promise<ReturnType<H[keyof H]>> {
  const { status, data } = await promise;
  const statusHandler = (handler as any)[status];
  if (statusHandler) return statusHandler(data);
  if (handler.default) return handler.default(status, data);
  throw new Error(`Unhandled status code: ${status}`);
}

const SUCCESS_CODES = [200, 201, 202, 204] as const;
type SuccessCodes = typeof SUCCESS_CODES[number];

type SuccessResponse<T extends ApiResponse> = Promise<
  DataType<T, SuccessCodes>
>;

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
): SuccessResponse<T> {
  const res = await promise;
  if (SUCCESS_CODES.some((s) => s == res.status)) return res.data;
  throw new HttpError(res.status, res.data);
}

type Args<T> = T extends (...args: infer U) => any ? U : any;
type ApiFunction = (...args: any[]) => Promise<ApiResponse>;
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer V>
  ? V
  : never;

/**
 * Utility function to wrap an API function with `ok(...)`.
 */
export function okify<T extends ApiFunction>(
  fn: T
): (...args: Args<T>) => SuccessResponse<AsyncReturnType<T>> {
  return (...args: Args<T>) => ok(fn(...args));
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
