"use client";

import { usePendingVideosBanner } from "./use-pending-videos-banner";

/**
 * "You have 3 videos waiting…" under the navbar on every page. On the PC, "Process now"
 * lists them with Generate (reads the video, then opens the review screen) and Remove;
 * on a phone it's a reminder that they'll be ready on the PC.
 */
export default function PendingVideosBanner() {
  const {
    isVisible,
    dismiss,
    message,
    canGenerate,
    isExpanded,
    toggleExpanded,
    items,
    generate,
    isGenerating,
    removePendingVideo,
    isRemoving,
    errorMessage,
  } = usePendingVideosBanner();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-[rgba(61,107,79,0.2)] bg-green-tint-bg px-5 py-3 sm:px-10">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-ink">{message}</span>
          <div className="flex shrink-0 items-center gap-4">
            {canGenerate && (
              <button
                type="button"
                onClick={toggleExpanded}
                className="font-sans text-[13px] font-semibold text-green underline"
              >
                {isExpanded ? "Hide" : "Process now"}
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="text-lg leading-none text-tan hover:text-ink"
            >
              ×
            </button>
          </div>
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
                {item.isGenerating ? (
                  <span className="shrink-0 text-xs text-tan">
                    Reading the video — about 30 seconds…
                  </span>
                ) : (
                  <div className="flex shrink-0 items-center gap-3 text-[13px]">
                    <button
                      type="button"
                      onClick={() => generate(item.url)}
                      disabled={isGenerating}
                      className="rounded-md bg-green px-3 py-1.5 font-semibold text-white hover:bg-green-hover disabled:opacity-60"
                    >
                      Generate
                    </button>
                    <button
                      type="button"
                      onClick={() => removePendingVideo(item.id)}
                      disabled={isRemoving || isGenerating}
                      className="text-tan underline disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {errorMessage && (
          <p role="alert" className="mt-2 text-[13px] text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
