export class ResolverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResolverError";
  }
}
