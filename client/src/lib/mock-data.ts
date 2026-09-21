export type Recipe = {
  id: string;
  title: string;
  category: string;
  calories: string;
  calorieConfidence: "estimated" | "exact";
  calorieNote: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
};

export const mockRecipes: Recipe[] = [
  {
    id: "brown-butter-pasta-with-sage",
    title: "Brown Butter Pasta with Sage",
    category: "Pasta",
    calories: "≈ 640 kcal",
    calorieConfidence: "exact",
    calorieNote: "every ingredient matched your list",
    servings: 4,
    prepMinutes: 20,
    cookMinutes: 30,
    description:
      "A quick weeknight pasta finished in nutty brown butter with garlic and fresh sage — restaurant flavor with almost no effort.",
    ingredients: [
      "250g pasta",
      "2 tbsp unsalted butter",
      "4 cloves garlic, minced",
      "Fresh sage, salt & pepper to taste",
    ],
    instructions: [
      "Bring a large pot of salted water to a boil.",
      "Cook pasta until al dente, about 9 minutes.",
      "Meanwhile, melt butter in a skillet over medium heat until browned and nutty.",
      "Toss pasta with brown butter, garlic, and sage; season to taste.",
    ],
    tags: ["pasta", "vegetarian", "quick", "italian", "weeknight"],
  },
  {
    id: "weeknight-chicken-stir-fry",
    title: "Weeknight Chicken Stir-Fry",
    category: "Asian",
    calories: "≈ 520 kcal",
    calorieConfidence: "estimated",
    calorieNote: "1 ingredient used a generic fallback value",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 15,
    description:
      "A fast, colorful stir-fry that comes together in one pan — great for using up whatever vegetables are in the fridge.",
    ingredients: [
      "500g chicken breast, sliced thin",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "2 cups mixed vegetables (bell pepper, broccoli, carrot)",
      "2 cloves garlic, minced",
      "1 tsp fresh ginger, grated",
    ],
    instructions: [
      "Marinate chicken in soy sauce for 10 minutes.",
      "Heat sesame oil in a wok over high heat.",
      "Stir-fry chicken until cooked through, about 5 minutes; set aside.",
      "Stir-fry vegetables with garlic and ginger until crisp-tender.",
      "Return chicken to the wok, toss together, and serve hot.",
    ],
    tags: ["chicken", "stir-fry", "asian", "quick", "weeknight"],
  },
  {
    id: "classic-guacamole",
    title: "Classic Guacamole",
    category: "Appetizer",
    calories: "≈ 180 kcal",
    calorieConfidence: "estimated",
    calorieNote: "avocado ripeness affects the estimate",
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 0,
    description:
      "Simple, bright guacamole — ripe avocados, lime, and just enough heat. Best made right before serving.",
    ingredients: [
      "3 ripe avocados",
      "1 lime, juiced",
      "1/2 red onion, finely diced",
      "1 jalapeño, seeded and minced",
      "2 tbsp cilantro, chopped",
      "Salt to taste",
    ],
    instructions: [
      "Halve and pit the avocados, then scoop the flesh into a bowl.",
      "Mash to your preferred texture with a fork.",
      "Fold in lime juice, onion, jalapeño, and cilantro.",
      "Season with salt and serve immediately.",
    ],
    tags: ["avocado", "appetizer", "vegan", "no-cook", "mexican"],
  },
  {
    id: "overnight-oats",
    title: "Overnight Oats",
    category: "Breakfast",
    calories: "≈ 310 kcal",
    calorieConfidence: "exact",
    calorieNote: "every ingredient matched your list",
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 0,
    description:
      "A make-ahead breakfast that's ready the moment you wake up — creamy, lightly sweet, and easy to customize with toppings.",
    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup milk",
      "1/4 cup yogurt",
      "1 tbsp honey",
      "1/2 tsp vanilla extract",
      "Toppings: berries, nuts, or seeds",
    ],
    instructions: [
      "Combine oats, milk, yogurt, honey, and vanilla in a jar.",
      "Stir well, cover, and refrigerate overnight.",
      "In the morning, stir again and add toppings before serving.",
    ],
    tags: ["breakfast", "make-ahead", "oats", "vegetarian", "no-cook"],
  },
];

export const mockIngredients = [
  { id: "1", name: "Pasta (dry)", brand: "Barilla", calories: "350 kcal / 100g" },
  { id: "2", name: "Unsalted butter", brand: "Generic", calories: "717 kcal / 100g" },
  { id: "3", name: "Garlic", brand: "Generic", calories: "149 kcal / 100g" },
  { id: "4", name: "Parmesan", brand: "Kraft", calories: "431 kcal / 100g" },
];

export const suggestionChips = [
  "What can I make with chicken and spinach?",
  "Quick 20-minute dinners",
  "Show me my pasta recipes",
];

export const recipeCategories = [
  "Pasta",
  "Breakfast",
  "Appetizer",
  "Asian",
  "Dessert",
  "Salad",
];
