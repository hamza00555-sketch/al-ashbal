/*
  Shared backend error types (Phase 1b scaffolding).
  Used by the data-access layer so callers can map failures to HTTP/UX states.
*/

export type BackendErrorCode =
  | "auth"
  | "permission"
  | "validation"
  | "not_found"
  | "conflict"
  | "not_implemented";

export class BackendError extends Error {
  readonly code: BackendErrorCode;
  /** Optional non-sensitive context (operation, ids) for logging — never tokens. */
  readonly context?: unknown;
  constructor(code: BackendErrorCode, message: string, context?: unknown) {
    super(message);
    this.name = "BackendError";
    this.code = code;
    this.context = context;
  }
}

/** Caller is not authenticated (no valid session/grant). */
export class BackendAuthError extends BackendError {
  constructor(message = "Not authenticated", context?: unknown) {
    super("auth", message, context);
    this.name = "BackendAuthError";
  }
}

/** Caller is authenticated but not allowed to perform this on this resource. */
export class BackendPermissionError extends BackendError {
  constructor(message = "Not permitted", context?: unknown) {
    super("permission", message, context);
    this.name = "BackendPermissionError";
  }
}

/** Input failed validation (bad shape, limit exceeded, bad transition). */
export class BackendValidationError extends BackendError {
  constructor(message = "Invalid input", context?: unknown) {
    super("validation", message, context);
    this.name = "BackendValidationError";
  }
}

export class BackendNotFoundError extends BackendError {
  constructor(message = "Not found", context?: unknown) {
    super("not_found", message, context);
    this.name = "BackendNotFoundError";
  }
}

/** Uniqueness / single-use / concurrent-use conflict (e.g. invitation reused). */
export class BackendConflictError extends BackendError {
  constructor(message = "Conflict", context?: unknown) {
    super("conflict", message, context);
    this.name = "BackendConflictError";
  }
}

/** Intentionally-unimplemented scaffolding (Phase 1b). Wire in later phases. */
export class NotImplementedBackendError extends BackendError {
  constructor(operation: string, context?: unknown) {
    super(
      "not_implemented",
      `Backend operation "${operation}" is not implemented yet (Phase 1b scaffolding).`,
      context,
    );
    this.name = "NotImplementedBackendError";
  }
}
