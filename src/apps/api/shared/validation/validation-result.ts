export interface ValidationIssue {
  readonly message: string;
  readonly path: string;
}

export interface ValidationSuccess<TValue> {
  readonly data: TValue;
  readonly success: true;
}

export interface ValidationFailure {
  readonly issues: readonly ValidationIssue[];
  readonly success: false;
}

export type ValidationResult<TValue> = ValidationSuccess<TValue> | ValidationFailure;
