"use client";

import { usePendingVideosBanner } from "./use-pending-videos-banner";

/**
 * "You have 3 videos waiting…" — on the PC, "Process now" lists them with Generate and
 * Remove; on a phone it only says they'll be ready on the PC.
 */
export default function PendingVideosBanner({
  canGenerate,
  isServerUnreachable,
  onGenerate,
}: {
  canGenerate: boolean;
  isServerUnreachable: boolean;
  onGenerate: (url: string) => void;
}) {
  const {
    count,
    countLabel,
    isExpanded,
    toggleExpanded,
    items,
    removePendingVideo,
    isRemoving,
    removeErrorMessage,
  } = usePendingVideosBanner();

  if (count === 0) {
    return null;
  }

  return (
    <div className="mb-7 rounded-lg border border-[rgba(61,107,79,0.2)] bg-green-tint-bg px-4.5 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] text-ink">
          {isServerUnreachable
            ? `You have ${countLabel} waiting — open Kamasak on your PC to turn them into recipes.`
            : `You have ${countLabel} waiting to be turned into recipes.`}
        </span>
        {canGenerate && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="shrink-0 font-sans text-[13px] font-semibold text-green underline"
          >
            {isExpanded ? "Hide" : "Process now"}
          </button>
        )}
      </div>

      {canGenerate && isExpanded && (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate text-[13px] text-ink underline decoration-border"
              >
                {item.label}
              </a>
              <div className="flex shrink-0 items-center gap-3 text-[13px]">
                <button
                  type="button"
                  onClick={() => onGenerate(item.url)}
                  className="rounded-md bg-green px-3 py-1.5 font-semibold text-white hover:bg-green-hover"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => removePendingVideo(item.id)}
                  disabled={isRemoving}
                  className="text-tan underline disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {removeErrorMessage && (
        <p role="alert" className="mt-2 text-[13px] text-red-600">
          {removeErrorMessage}
        </p>
      )}
    </div>
  );
}
