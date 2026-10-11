"use client";

import { Input } from "@/components/ui/input";
import type { OpenFoodFactsProduct } from "@/types";
import { useOpenFoodFactsSearch } from "./use-open-food-facts-search";

/** Search box and results; "Use" hands a product to the form below. */
export default function OpenFoodFactsSearch({
  onUseProduct,
}: {
  onUseProduct: (product: OpenFoodFactsProduct) => void;
}) {
  const {
    searchText,
    setSearchText,
    canSearch,
    search,
    handleSearchKeyDown,
    isSearching,
    searchErrorMessage,
    results,
  } = useOpenFoodFactsSearch();

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="e.g. bread flour"
          className="h-auto min-w-[200px] flex-1 rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
        />
        <button
          type="button"
          onClick={search}
          disabled={!canSearch}
          className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover disabled:opacity-60"
        >
          {isSearching ? "Searching…" : "Search"}
        </button>
      </div>

      {searchErrorMessage && (
        <p role="alert" className="mb-4 text-[13px] text-red-600">
          {searchErrorMessage}
        </p>
      )}
      {results && results.length === 0 && (
        <p className="mb-4 text-[13px] text-body-text">
          No products with calories found — try other words, or type it in.
        </p>
      )}
      {results && results.length > 0 && (
        <ul className="mb-2 max-h-[360px] divide-y divide-border overflow-y-auto rounded-lg border border-border bg-white">
          {results.map(({ product, title, quantity, nutrients }) => (
            <li key={product.code} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm text-ink">
                  {title}
                  {quantity && <span className="text-tan"> · {quantity}</span>}
                </div>
                <div className="text-xs text-tan-tint-text">{nutrients} per 100 g</div>
              </div>
              <button
                type="button"
                onClick={() => onUseProduct(product)}
                className="shrink-0 rounded-md border border-border px-3.5 py-2 font-sans text-[13px] font-semibold text-ink"
              >
                Use
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
