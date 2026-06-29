export class ApplicationError extends Error {
  public constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}
