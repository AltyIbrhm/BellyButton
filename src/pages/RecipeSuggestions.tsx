import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  image?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  compatibilityScore?: number;
  dietaryTags: string[];
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  category: 'fridge' | 'needed';
  source: 'manual' | 'image' | 'detected';
}

const RecipeSuggestions: React.FC = () => {
  const location = useLocation();
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [fridgeIngredients, setFridgeIngredients] = useState<Ingredient[]>([]);
  const [neededIngredients, setNeededIngredients] = useState<Ingredient[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Get data from location state (passed from Home component)
  useEffect(() => {
    if (location.state) {
      setDietaryRestrictions(location.state.dietaryRestrictions || []);
      setFridgeIngredients(location.state.fridgeIngredients || []);
      setNeededIngredients(location.state.neededIngredients || []);
    }
  }, [location.state]);

  // Mock recipe database
  const allRecipes: Recipe[] = [
    {
      title: 'Mediterranean Quinoa Bowl',
      ingredients: ['quinoa', 'cherry tomatoes', 'cucumber', 'olives', 'feta cheese', 'olive oil', 'lemon'],
      instructions: [
        'Cook quinoa according to package instructions',
        'Chop vegetables and mix with quinoa',
        'Add crumbled feta and drizzle with olive oil and lemon',
      ],
      prepTime: '15 minutes',
      cookTime: '20 minutes',
      servings: 2,
      difficulty: 'easy',
      cuisine: 'Mediterranean',
      dietaryTags: ['vegetarian', 'gluten-free'],
    },
    {
      title: 'Vegan Buddha Bowl',
      ingredients: ['brown rice', 'sweet potato', 'kale', 'chickpeas', 'avocado', 'tahini', 'sesame seeds'],
      instructions: [
        'Cook brown rice and roast sweet potato cubes',
        'Massage kale with olive oil',
        'Assemble bowl with all ingredients and tahini dressing',
      ],
      prepTime: '20 minutes',
      cookTime: '30 minutes',
      servings: 2,
      difficulty: 'easy',
      cuisine: 'Asian',
      dietaryTags: ['vegan', 'gluten-free', 'dairy-free'],
    },
    {
      title: 'Keto Cauliflower Rice Stir-Fry',
      ingredients: ['cauliflower', 'chicken breast', 'broccoli', 'soy sauce', 'ginger', 'garlic', 'eggs'],
      instructions: [
        'Grate cauliflower into rice-like pieces',
        'Stir-fry chicken and vegetables',
        'Add cauliflower rice and scramble eggs',
      ],
      prepTime: '10 minutes',
      cookTime: '15 minutes',
      servings: 3,
      difficulty: 'medium',
      cuisine: 'Asian',
      dietaryTags: ['gluten-free', 'low-carb', 'keto'],
    },
    {
      title: 'Dairy-Free Pasta Primavera',
      ingredients: ['gluten-free pasta', 'zucchini', 'bell peppers', 'cherry tomatoes', 'olive oil', 'basil', 'nutritional yeast'],
      instructions: [
        'Cook gluten-free pasta',
        'Sauté vegetables in olive oil',
        'Toss with pasta and nutritional yeast',
      ],
      prepTime: '10 minutes',
      cookTime: '15 minutes',
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Italian',
      dietaryTags: ['dairy-free', 'gluten-free'],
    },
    {
      title: 'Low-Carb Zucchini Lasagna',
      ingredients: ['zucchini', 'ground turkey', 'marinara sauce', 'ricotta cheese', 'mozzarella', 'parmesan', 'basil'],
      instructions: [
        'Slice zucchini into thin strips',
        'Layer with turkey, sauce, and cheeses',
        'Bake until bubbly and golden',
      ],
      prepTime: '20 minutes',
      cookTime: '45 minutes',
      servings: 6,
      difficulty: 'medium',
      cuisine: 'Italian',
      dietaryTags: ['low-carb', 'gluten-free'],
    },
    {
      title: 'Vegan Chocolate Avocado Mousse',
      ingredients: ['avocado', 'cocoa powder', 'maple syrup', 'vanilla extract', 'almond milk', 'berries'],
      instructions: [
        'Blend avocado with cocoa and sweetener',
        'Add almond milk for creaminess',
        'Top with fresh berries',
      ],
      prepTime: '10 minutes',
      cookTime: '0 minutes',
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Dessert',
      dietaryTags: ['vegan', 'dairy-free', 'gluten-free'],
    },
  ];

  // Filter recipes based on dietary restrictions
  useEffect(() => {
    const filtered = allRecipes.filter(recipe => {
      if (dietaryRestrictions.length === 0) return true;
      return dietaryRestrictions.every(restriction => 
        recipe.dietaryTags.includes(restriction)
      );
    });
    setSuggestedRecipes(filtered);
  }, [dietaryRestrictions]);

  // Add missing ingredients to shopping list
  const addMissingIngredients = (recipe: Recipe) => {
    const availableIngredients = fridgeIngredients.map(item => item.name.toLowerCase());
    const missingIngredients = recipe.ingredients.filter(ingredient => 
      !availableIngredients.some(available => 
        available.includes(ingredient.toLowerCase()) || 
        ingredient.toLowerCase().includes(available)
      )
    );

    const newNeededIngredients: Ingredient[] = missingIngredients.map(ingredient => ({
      id: `${Date.now()}-${Math.random()}`,
      name: ingredient,
      quantity: '1',
      category: 'needed' as const,
      source: 'suggestion',
    }));

    setNeededIngredients(prev => {
      const existingNames = prev.map(item => item.name.toLowerCase());
      const uniqueNewIngredients = newNeededIngredients.filter(
        item => !existingNames.includes(item.name.toLowerCase())
      );
      return [...prev, ...uniqueNewIngredients];
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Recipe Suggestions</h1>
        <p className="text-gray-600 mb-4">
          Discover delicious recipes that match your dietary preferences
        </p>
        {dietaryRestrictions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dietaryRestrictions.map(restriction => (
              <span
                key={restriction}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
              >
                {restriction.replace('-', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recipe List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Suggested Recipes ({suggestedRecipes.length})
          </h2>
          
          <div className="space-y-4">
            {suggestedRecipes.map((recipe, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRecipe === recipe
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{recipe.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {recipe.dietaryTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {tag.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>Prep: {recipe.prepTime}</span>
                  <span>Cook: {recipe.cookTime}</span>
                  <span>Servings: {recipe.servings}</span>
                  <span className="capitalize">{recipe.difficulty}</span>
                </div>
                
                <div className="text-sm text-gray-700 mb-3">
                  <strong>Ingredients:</strong> {recipe.ingredients.slice(0, 4).join(', ')}
                  {recipe.ingredients.length > 4 && '...'}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addMissingIngredients(recipe);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Missing to Shopping List
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recipe Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recipe Details</h2>
          
          {selectedRecipe ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedRecipe.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>Prep: {selectedRecipe.prepTime}</span>
                  <span>Cook: {selectedRecipe.cookTime}</span>
                  <span>Servings: {selectedRecipe.servings}</span>
                  <span className="capitalize">{selectedRecipe.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRecipe.dietaryTags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Ingredients:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, index) => {
                    const isAvailable = fridgeIngredients.some(
                      item => item.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                              ingredient.toLowerCase().includes(item.name.toLowerCase())
                    );
                    return (
                      <li key={index} className={isAvailable ? 'text-green-700 font-medium' : 'text-gray-500'}>
                        {ingredient} {isAvailable && '✓'}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Instructions:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <button
                onClick={() => addMissingIngredients(selectedRecipe)}
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Missing Ingredients to Shopping List
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-500">Select a recipe to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestions; 