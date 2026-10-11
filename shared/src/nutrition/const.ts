// Word lists for matching recipe ingredients to USDA foods. Singular, lowercase —
// they're compared against words() output, which singularizes ("cloves" → "clove").

// ---- Packaged / branded ingredients ----

// Sauces, condiments, seasoning mixes, broths, bread and other packaged foods vary by
// brand, so they're never looked up in USDA: they stay blank until you add your brand
// to your personal ingredient list. A term matches a run of words in the ingredient name.
// USDA's own categories can't be used for this: it files soy sauce under "Legumes" and
// ketchup under "Vegetables", but rolled oats under "Breakfast Cereals".
export const PACKAGED_TERMS = [
  // sauces and condiments
  "sauce", "ketchup", "mayonnaise", "mayo", "sriracha", "sambal", "gochujang", "mirin",
  "dressing", "marinade", "paste", "jam", "spread", "chili oil", "chilli oil",
  "chili crisp", "chilli crisp",
  // seasoning mixes, broths
  "seasoning", "mix", "broth", "stock", "bouillon", "cube",
  // bread, wraps, noodles, cereal, snacks
  "tortilla", "bread", "bun", "wrap", "noodle", "cereal", "cracker", "chip",
  // processed meats
  "sausage", "bacon", "ham",
  // anything bought ready
  "instant", "canned", "frozen", "premade", "storebought", "store bought", "ready made",
];

// "1 can chickpeas", "1 jar pesto" — measured by the package, so it's a packaged product.
export const PACKAGE_UNITS = [
  "can", "tin", "jar", "packet", "pack", "package", "sachet", "bottle", "box", "bag",
  "pouch", "carton",
];

// ---- Turning an ingredient name into a USDA search ----

// Words that describe the ingredient but don't appear in USDA's names
// ("extra virgin olive oil" → "Oil, olive, salad or cooking", "salmon fillet" → "Fish, salmon").
export const DESCRIPTOR_WORDS = [
  "fresh", "organic", "large", "small", "medium", "chopped", "minced", "diced", "sliced",
  "grated", "shredded", "extra", "virgin", "boneless", "skinless", "finely", "roughly",
  "optional", "jasmine", "basmati", "rolled", "old", "fashioned", "fillet",
  "a", "of", "to", "taste", "and", "or",
];

// Recipe names USDA files under a different name.
export const NAME_SYNONYMS: Record<string, string> = {
  spaghetti: "pasta", penne: "pasta", linguine: "pasta", fettuccine: "pasta",
  fusilli: "pasta", rigatoni: "pasta", macaroni: "pasta", farfalle: "pasta",
  "green onion": "scallion", "spring onion": "scallion",
  "chili flake": "spices pepper red", "chilli flake": "spices pepper red",
  "red chili flake": "spices pepper red", "red chilli flake": "spices pepper red",
  "red pepper flake": "spices pepper red",
};

// ---- Ranking USDA's results so the plain food comes first ----

// Dishes, preparations and variants — the plain ingredient is what a recipe measures.
export const PENALTY_WORDS = [
  "with", "salad", "soup", "prepared", "cooked", "fried", "roasted", "baked", "boiled",
  "braised", "stewed", "canned", "frozen", "dehydrated", "imitation", "reduced", "low",
  "free", "light", "diet", "babyfood", "restaurant", "fast", "human", "infant", "formula",
  "industrial", "substitute", "flavored", "topping", "nonfat", "lowfat", "skim", "powder",
  "chocolate", "strawberry", "sweetened", "smoked", "cured",
];

// The plain form of a food: "Egg, whole, raw", "Pasta, dry", "Milk, whole".
export const PLAIN_WORDS = ["raw", "whole", "dry", "plain"];

// How USDA marks its generic, all-varieties entry: "Tomatoes, red, ripe, raw, year round
// average", "Avocados, raw, all commercial varieties", "Rice, white, long-grain, regular".
export const GENERIC_WORDS = ["average", "commercial", "variety", "regular"];

// "Dry" is the plain form of pasta, rice and beans, but dried milk, egg or cream is powder.
export const POWDER_WHEN_DRY = ["milk", "egg", "cream", "buttermilk", "yogurt", "whey"];

// Phrases that look like penalty words but aren't: plain milk is "with added vitamin D",
// plain olive oil is "salad or cooking".
export const HARMLESS_PHRASES = [/with added [^,]*/gi, /salad or cooking/gi];
