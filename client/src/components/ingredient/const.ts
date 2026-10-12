type NutrientKey = "kcalPer100g" | "fatPer100g" | "carbsPer100g" | "fibrePer100g" | "proteinPer100g";

/** The form's number fields, in order. Only calories are required. */
export const NUTRIENT_FIELDS: { key: NutrientKey; label: string; suffix: string }[] = [
  { key: "kcalPer100g", label: "Calories *", suffix: "kcal/100g" },
  { key: "fatPer100g", label: "Fat", suffix: "g/100g" },
  { key: "carbsPer100g", label: "Carbs", suffix: "g/100g" },
  { key: "fibrePer100g", label: "Fibre", suffix: "g/100g" },
  { key: "proteinPer100g", label: "Protein", suffix: "g/100g" },
];

export const MISSING_FIELDS_MESSAGE = "Add a name and the calories per 100 g.";
export const INVALID_NUMBER_MESSAGE = "Nutrition values must be numbers, e.g. 13.3.";
