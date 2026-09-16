import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnterKey } from "@/hooks/use-enter-key";
import { PATHNAMES } from "@/lib/pathnames";

export function useHomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function goToRecipes() {
    router.push(PATHNAMES.recipes);
  }

  function handleAsk(e: React.SubmitEvent) {
    e.preventDefault();
    goToRecipes();
  }

  const handleInputKeyDown = useEnterKey(goToRecipes);

  return { query, setQuery, handleAsk, handleInputKeyDown };
}
