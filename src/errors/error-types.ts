export type ErrorType = "tmux" | "unclassified";

export class SpacesError {
  public message: string;
  public errorType: ErrorType;

  public constructor(message: string, type?: ErrorType) {
    this.message = message;
    this.errorType = type ?? "unclassified";
  }
}

export class TmuxError extends SpacesError {
  public constructor(message: string) {
    super(message, "tmux");
  }
}
