export class ClientContractError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ClientContractError";
  }
}
