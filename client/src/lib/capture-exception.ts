export type SerializedError = {
  name: string;
  message: string;
  stack?: string;
  cause?: SerializedError;
  /** Extra fields on the error, e.g. a database error's `code` or an HTTP error's `status`. */
  details?: unknown;
};

// Errors can wrap each other through `cause`; stop following the chain at some point.
const MAX_CAUSE_DEPTH = 5;

/**
 * JSON.stringify that never throws: handles circular references, BigInt, Map/Set,
 * nested Errors (which JSON.stringify would turn into "{}"), and values it would
 * otherwise drop (undefined, functions, symbols).
 */
function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  try {
    const json = JSON.stringify(value, (_key, item: unknown) => {
      if (typeof item === "bigint") {
        return `${item}n`;
      }
      if (typeof item === "function" || typeof item === "symbol") {
        return String(item);
      }
      if (item instanceof Error) {
        return serializeError(item);
      }
      if (item instanceof Map) {
        return Object.fromEntries(item);
      }
      if (item instanceof Set) {
        return [...item];
      }
      if (typeof item === "object" && item !== null) {
        if (seen.has(item)) {
          return "[Circular]";
        }
        seen.add(item);
      }
      return item;
    });
    // JSON.stringify returns undefined for a top-level undefined / function / symbol.
    return json ?? String(value);
  } catch {
    // The logger itself can't report through captureException without recursing,
    // so fall back to the built-in description ("[object Object]", "Symbol(x)"…).
    return Object.prototype.toString.call(value);
  }
}

function describeType(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "Array";
  }
  if (typeof value === "object") {
    return value.constructor?.name ?? "Object";
  }
  return typeof value;
}

/** Turns anything that was thrown — Error, string, object, array, number, null… — into one shape. */
export function serializeError(error: unknown, depth = 0): SerializedError {
  if (error instanceof Error) {
    // Own enumerable extras only — name/message/stack are non-enumerable on Error.
    const details = { ...(error as Error & Record<string, unknown>) };
    delete details.cause;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause !== undefined && depth < MAX_CAUSE_DEPTH
        ? { cause: serializeError(error.cause, depth + 1) }
        : {}),
      ...(Object.keys(details).length > 0
        ? { details: JSON.parse(safeStringify(details)) as unknown }
        : {}),
    };
  }
  if (typeof error === "string") {
    return { name: "Error", message: error };
  }
  // Objects and arrays need the safe stringify; plain values (42, null, Symbol(x)…) just String().
  const message =
    typeof error === "object" && error !== null ? safeStringify(error) : String(error);
  return { name: describeType(error), message };
}

/**
 * The one place caught errors are reported. Every `catch` logs through here instead of
 * swallowing the error (e.g. turning it into `null`), so failures always show up in the
 * Vercel / terminal logs. Accepts anything that was thrown, not just Error objects.
 * Swap the body for an error tracker (Sentry etc.) later without touching the call sites.
 */
export function captureException(error: unknown, context: string): void {
  const serialized = serializeError(error);

  if (process.env.NODE_ENV === "production") {
    // One JSON line per error, so Vercel's log search can filter by context or name.
    console.error(safeStringify({ level: "error", context, error: serialized }));
    return;
  }

  // Development: readable in the terminal, with the stack on its own lines.
  const headline = serialized.stack ?? `${serialized.name}: ${serialized.message}`;
  const extras = {
    ...(serialized.cause ? { cause: serialized.cause } : {}),
    ...(serialized.details !== undefined ? { details: serialized.details } : {}),
  };
  if (Object.keys(extras).length > 0) {
    console.error(`[${context}] ${headline}`, extras);
  } else {
    console.error(`[${context}] ${headline}`);
  }
}
