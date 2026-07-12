export type FoodPreset = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
};

export const FOOD_PRESETS: FoodPreset[] = [
  { name: "Chicken Breast (Cooked)", calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "100g" },
  { name: "Egg (Whole, Large)", calories: 70, protein: 6, carbs: 0.4, fats: 5, serving: "1 piece (50g)" },
  { name: "Egg White (Large)", calories: 17, protein: 3.6, carbs: 0.2, fats: 0.1, serving: "1 piece (33g)" },
  { name: "White Rice (Cooked)", calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "100g" },
  { name: "Brown Rice (Cooked)", calories: 111, protein: 2.6, carbs: 23, fats: 0.9, serving: "100g" },
  { name: "Whey Protein Powder", calories: 120, protein: 24, carbs: 3, fats: 1.5, serving: "1 scoop (30g)" },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.3, serving: "1 medium (118g)" },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, serving: "1 medium (182g)" },
  { name: "Avocado", calories: 240, protein: 3, carbs: 12, fats: 22, serving: "1 medium (150g)" },
  { name: "Greek Yogurt (Non-fat)", calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: "100g" },
  { name: "Greek Yogurt (Whole Milk)", calories: 97, protein: 9, carbs: 4, fats: 5, serving: "100g" },
  { name: "Salmon Fillet (Cooked)", calories: 206, protein: 22, carbs: 0, fats: 12, serving: "100g" },
  { name: "Tuna (Canned in Water)", calories: 116, protein: 26, carbs: 0, fats: 0.8, serving: "100g" },
  { name: "Lean Beef (90/10, Cooked)", calories: 217, protein: 26, carbs: 0, fats: 12, serving: "100g" },
  { name: "Paneer (Indian Cottage Cheese)", calories: 265, protein: 18, carbs: 1.2, fats: 20, serving: "100g" },
  { name: "Tofu (Firm)", calories: 83, protein: 10, carbs: 2.3, fats: 5.3, serving: "100g" },
  { name: "Cottage Cheese (Low-fat)", calories: 82, protein: 11, carbs: 3.1, fats: 2.3, serving: "100g" },
  { name: "Whole Milk (3.25% Fat)", calories: 149, protein: 8, carbs: 12, fats: 8, serving: "1 glass (244g)" },
  { name: "Skim Milk (Non-fat)", calories: 83, protein: 8.3, carbs: 12.2, fats: 0.2, serving: "1 glass (245g)" },
  { name: "Peanut Butter (Smooth)", calories: 94, protein: 4, carbs: 3.1, fats: 8.1, serving: "1 tbsp (16g)" },
  { name: "Almonds (Raw)", calories: 164, protein: 6, carbs: 6.1, fats: 14.1, serving: "1 handful (28g)" },
  { name: "Walnuts", calories: 185, protein: 4.3, carbs: 3.9, fats: 18.5, serving: "1 handful (28g)" },
  { name: "Rolled Oats (Raw)", calories: 150, protein: 5, carbs: 27, fats: 2.5, serving: "40g" },
  { name: "Sweet Potato (Baked)", calories: 90, protein: 2, carbs: 21, fats: 0.2, serving: "100g" },
  { name: "White Potato (Boiled)", calories: 86, protein: 2, carbs: 20, fats: 0.1, serving: "100g" },
  { name: "Whole Wheat Bread", calories: 75, protein: 3.5, carbs: 14, fats: 0.9, serving: "1 slice (32g)" },
  { name: "White Bread", calories: 80, protein: 2.5, carbs: 15, fats: 1, serving: "1 slice (30g)" },
  { name: "Broccoli (Raw)", calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4, serving: "100g" },
  { name: "Spinach (Raw)", calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, serving: "100g" },
  { name: "Olive Oil (Extra Virgin)", calories: 119, protein: 0, carbs: 0, fats: 13.5, serving: "1 tbsp (13.5g)" },
  { name: "Butter (Salted)", calories: 102, protein: 0.1, carbs: 0, fats: 11.5, serving: "1 tbsp (14g)" },
  { name: "Honey", calories: 64, protein: 0.1, carbs: 17.3, fats: 0, serving: "1 tbsp (21g)" },
  { name: "Chicken Thigh (Cooked)", calories: 209, protein: 26, carbs: 0, fats: 10.9, serving: "100g" },
  { name: "Bacon (Pork, Cooked)", calories: 54, protein: 4, carbs: 0.1, fats: 4.2, serving: "1 slice (8g)" },
  { name: "Cheddar Cheese", calories: 113, protein: 7, carbs: 0.4, fats: 9.3, serving: "1 slice (28g)" },
  { name: "Chickpeas (Canned)", calories: 119, protein: 7, carbs: 20.3, fats: 2.1, serving: "100g" },
  { name: "Lentils (Cooked)", calories: 116, protein: 9, carbs: 20, fats: 0.4, serving: "100g" },
  { name: "Quinoa (Cooked)", calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9, serving: "100g" },
  { name: "Chia Seeds", calories: 137, protein: 4.7, carbs: 11.9, fats: 8.6, serving: "1 tbsp (28g)" },
  { name: "Flax Seeds (Ground)", calories: 37, protein: 1.3, carbs: 2, fats: 3, serving: "1 tbsp (7g)" },
  { name: "Blueberries (Fresh)", calories: 57, protein: 0.7, carbs: 14.5, fats: 0.3, serving: "1 cup (148g)" },
  { name: "Strawberries (Fresh)", calories: 49, protein: 1, carbs: 11.7, fats: 0.5, serving: "1 cup (152g)" },
  { name: "Orange", calories: 62, protein: 1.2, carbs: 15.4, fats: 0.2, serving: "1 medium (131g)" },
  { name: "Pineapple (Fresh)", calories: 82, protein: 0.9, carbs: 21.6, fats: 0.2, serving: "1 cup (165g)" },
  { name: "Watermelon", calories: 46, protein: 0.9, carbs: 11.5, fats: 0.2, serving: "1 cup (152g)" },
  { name: "Pasta (Penne, Cooked)", calories: 131, protein: 5, carbs: 25, fats: 1.1, serving: "100g" },
  { name: "Granola (Fruit & Nut)", calories: 200, protein: 4.5, carbs: 32, fats: 6.5, serving: "50g" },
  { name: "Mixed Berries (Frozen)", calories: 70, protein: 1, carbs: 17, fats: 0.5, serving: "1 cup (140g)" },
  { name: "Coconut Oil", calories: 117, protein: 0, carbs: 0, fats: 13.6, serving: "1 tbsp (13.6g)" },
  { name: "Sirloin Steak (Cooked)", calories: 244, protein: 29, carbs: 0, fats: 14, serving: "100g" },
  { name: "Shrimp (Cooked)", calories: 99, protein: 24, carbs: 0.2, fats: 0.3, serving: "100g" },
  { name: "Protein Bar (Chocolate)", calories: 220, protein: 20, carbs: 22, fats: 7, serving: "1 bar (60g)" }
];
