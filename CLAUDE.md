@AGENTS.md

## Code organization conventions

- Keep page/component files focused on composition and rendering. Business logic — state, effects, event handlers, derived values — belongs in a custom hook (`use*`), not inlined in the component body.
- A hook used by only one component lives next to it or in that route's folder; a hook used by 2+ places lives in `src/hooks/`.
- Any logic or markup duplicated across 2+ files must be extracted into a shared hook (`src/hooks/`), utility (`src/lib/`), or component (`src/components/common/`) rather than copy-pasted. Reuse the existing extraction if one already covers the case.
- When an import is used only as a type (interfaces, type aliases, type-only usages of a class), import it with `import type` instead of importing the module itself.
- A type used by 2+ files belongs in a shared `types.ts` (root of `src/`, or a `types/` folder if it grows) rather than being defined in one file and imported into others. A type used by only one file can stay local to it.
- A route/component-local file of constants (columns, options, etc.) used by only that route or component should just be named `const.ts` next to it — don't overcomplicate the name (e.g. no need for `ingredients-columns.ts`).

## Code style

- Always wrap `if` bodies in braces, even for a single statement — no one-line `if (x) return y;`:

  ```ts
  if (unauthorized) {
    return unauthorized;
  }
  ```

## Error handling

- Never swallow an error into a placeholder value (`.catch(() => null)`, an empty `catch {}`, returning `false`/`[]` silently). Every caught exception must be logged with `captureException(error, "what was being attempted")` from `src/lib/capture-exception.ts` — not a raw `console.error` — and then handled explicitly (return an error response, a fallback, or rethrow).
- Pass whatever was caught straight to `captureException` — it accepts any thrown value (Error, string, object, array, null…) and serializes it safely. Don't `JSON.stringify` or format errors yourself: `JSON.stringify(new Error("x"))` is `"{}"`, and it throws on circular objects and BigInt.
- Route handlers read and validate their JSON body with `parseJsonBody(request, schema)` from `src/lib/parse-json-body.ts`, which logs invalid JSON and returns a ready-made 400 (`INVALID_JSON` / `INVALID_BODY`):

  ```ts
  const parsed = await parseJsonBody(request, requestSchema);
  if (!parsed.success) {
    return parsed.response;
  }
  ```

## API errors: backend is technical, frontend chooses the words

- Every route handler error is `apiError(code, technicalMessage)` from `src/lib/api-error.ts`, returning `{ code, error }`. `code` is a stable `ApiErrorCode` (in `src/types.ts`; the code also sets the HTTP status). `error` is for debugging — be as technical as useful, and never write user-facing copy there. New error case → add a code to `ApiErrorCode` and `STATUS_BY_CODE`.
- The frontend never displays the API's `error` text. Fetches call `handleApiError(res)` from `src/lib/api-request-error.ts`; hooks turn the failure into words with `toUserMessage(error, SCREEN_ERROR_MESSAGES)` from `src/lib/user-error-messages.ts`, where `SCREEN_ERROR_MESSAGES` maps codes to that screen's wording in its `const.ts`. Unmapped codes fall back to the generic / session-expired messages.
