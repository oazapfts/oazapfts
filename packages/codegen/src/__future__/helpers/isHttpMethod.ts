const HttpMethods = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "TRACE",
] as const;
export type HttpMethod = (typeof HttpMethods)[number];

export function isHttpMethod(method: string): method is HttpMethod {
  return HttpMethods.includes(method as HttpMethod);
}
