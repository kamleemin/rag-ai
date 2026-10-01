import type { UseMutationOptions } from "@tanstack/react-query";

export type EditableRow = { id: string; [key: string]: string };

export type Column = {
  key: string;
  label: string;
  placeholder?: string;
};

/** Stable error identifiers the API returns — the frontend decides the wording for each. */
export type ApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_BODY"
  | "INVALID_ID"
  | "UNAUTHORIZED"
  | "WRONG_PASSWORD"
  | "NOT_FOUND"
  | "EXTRACTION_FAILED"
  | "EXTRACTION_SERVICE_UNREACHABLE";

/** Every API error response. `error` is technical and may change — never show it to users. */
export type ApiErrorResponse = { code: ApiErrorCode; error: string };

/**
 * Options a screen hook can pass to a src/requests/ mutation hook — everything except
 * mutationFn, which the request file supplies (e.g. { onSuccess: () => router.push(...) }).
 */
export type RequestMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  "mutationFn"
>;
