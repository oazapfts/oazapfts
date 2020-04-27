import { ApiResponse } from "./runtime";

type DataType<T extends ApiResponse, S extends number> = T extends { status: S }
  ? T["data"]
  : never;

type DefaultHandler = {
  default?: (status: number, data: any) => any;
};

type ResponseHandler<T extends ApiResponse> = {
  [P in T["status"]]: (res: DataType<T, P>) => any;
} &
  DefaultHandler;

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

type SuccessCodes = 200 | 201 | 202 | 204;

export async function ok<T extends ApiResponse>(
  promise: Promise<T>
): Promise<DataType<T, SuccessCodes>> {
  const res = await promise;
  if (res.status === 200) return res.data;
  throw new HttpError(res.status, res.data);
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
