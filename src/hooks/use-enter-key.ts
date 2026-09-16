import type { KeyboardEvent } from "react";

export function useEnterKey(action: () => void) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };
}
