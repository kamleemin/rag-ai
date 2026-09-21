export type ExtractionResult = {
  caption: string;
  transcript: string | null;
};

export type ParsedIngredient = {
  name: string;
  amount: string;
  unit: string;
};

export type ParsedRecipe = {
  title: string | null;
  description: string | null;
  servings: string | null;
  prepMinutes: string | null;
  cookMinutes: string | null;
  ingredients: ParsedIngredient[];
  instructions: string | null;
  category: string | null;
};

export type ExtractTikTokRequest = {
  url: string;
};

export type ExtractTikTokResponse = {
  extraction: ExtractionResult;
  recipe: ParsedRecipe | null;
};
