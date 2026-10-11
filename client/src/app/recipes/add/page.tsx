"use client";

import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/page-header";
import SegmentedTabs from "@/components/common/segmented-tabs";
import RecipeForm from "@/components/recipe/recipe-form";
import { ADD_RECIPE_TABS, AddRecipeTab } from "./const";
import { useAddRecipeForm } from "./use-add-recipe-form";
import GeneratingRecipe from "./generating-recipe";

export default function AddRecipePage() {
  const {
    tab,
    setTab,
    videoUrl,
    setVideoUrl,
    isGenerating,
    generateErrorMessage,
    submitVideoLink,
    saveManualRecipe,
    isSavingRecipe,
    saveRecipeErrorMessage,
    handleVideoLinkKeyDown,
  } = useAddRecipeForm();

  if (isGenerating) {
    return (
      <main className="flex-1">
        <PageHeader backHref="/recipes" title="Add a Recipe" />
        <GeneratingRecipe />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <PageHeader backHref="/recipes" title="Add a Recipe" />

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        <SegmentedTabs tabs={ADD_RECIPE_TABS} value={tab} onChange={setTab} className="mb-7" />

        {tab === AddRecipeTab.Video && (
          <div className="rounded-[10px] border border-border bg-white px-8 py-7">
            <h3 className="mb-2 font-serif text-lg font-semibold text-ink">
              Paste a video link
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-body-text">
              Paste a TikTok link — the tool will extract and structure the
              recipe automatically. You&apos;ll review and confirm every
              field before it&apos;s saved; anything that couldn&apos;t be
              read is simply left blank.
            </p>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="https://www.tiktok.com/@chef/video/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={handleVideoLinkKeyDown}
                className="h-auto min-w-[220px] flex-1 rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
              />
              <button
                type="button"
                onClick={submitVideoLink}
                className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover"
              >
                Generate
              </button>
            </div>
            {generateErrorMessage && (
              <p className="mt-3 text-[13px] text-red-600">
                {generateErrorMessage}
              </p>
            )}
          </div>
        )}

        {tab === AddRecipeTab.Manual && (
          <RecipeForm
            submitLabel="Save Recipe"
            cancelLabel="Clear form"
            onSubmit={saveManualRecipe}
            isSubmitting={isSavingRecipe}
            submitError={saveRecipeErrorMessage}
          />
        )}
      </div>
    </main>
  );
}
