import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import logo from '../assets/logo.jpg';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  category: 'fridge' | 'needed';
  source: 'manual' | 'image' | 'detected' | 'suggestion';
}

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

interface ChatMessage {
  sender: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

interface DetectedIngredient {
  name: string;
  confidence: number;
  quantity?: string;
}

type IngredientCategory = 'fridge' | 'needed';

const Home: React.FC = () => {
  // State for ingredients
  const [fridgeIngredients, setFridgeIngredients] = useState<Ingredient[]>([]);
  const [neededIngredients, setNeededIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<{
    name: string;
    quantity: string;
    category: IngredientCategory;
  }>({
    name: '',
    quantity: '',
    category: 'fridge',
  });

  // State for images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageAnalysisLoading, setImageAnalysisLoading] = useState(false);
  const [imageAnalysisMessage, setImageAnalysisMessage] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [imageAnalysisDebug, setImageAnalysisDebug] = useState<string | null>(null);

  // State for recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  // State for dietary restrictions
  const [showDietaryModal, setShowDietaryModal] = useState(true);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  // State for chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Image preview effect
  useEffect(() => {
    if (images.length === 0) {
      setImagePreviews([]);
      return;
    }
    const newPreviews = images.map(img => URL.createObjectURL(img));
    setImagePreviews(newPreviews);
    // Cleanup
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  // Real image analysis function using OpenAI Vision API
  const analyzeImage = async (file: File): Promise<DetectedIngredient[]> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3000/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImageAnalysisDebug(
        `API Response:\n${JSON.stringify(data, null, 2)}\n` +
        (data.rawResponse ? `\nRaw OpenAI Response:\n${data.rawResponse}` : '')
      );
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      // Convert the API response to our DetectedIngredient format
      return data.ingredients.map((ingredient: any) => ({
        name: ingredient.name,
        confidence: ingredient.confidence || 0.8,
        quantity: ingredient.quantity || '1',
      }));
    } catch (error) {
      setImageAnalysisDebug(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error analyzing image:', error);
      // Return empty array if analysis fails
      return [];
    }
  };

  // Add ingredient
  const addIngredient = () => {
    if (!newIngredient.name.trim()) return;
    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      quantity: newIngredient.quantity,
      category: newIngredient.category,
      source: 'manual',
    };
    if (newIngredient.category === 'fridge') {
      setFridgeIngredients(prev => [...prev, ingredient]);
    } else {
      setNeededIngredients(prev => [...prev, ingredient]);
    }
    setNewIngredient({ name: '', quantity: '', category: 'fridge' });
  };

  // Remove ingredient
  const removeIngredient = (id: string, category: IngredientCategory) => {
    if (category === 'fridge') {
      setFridgeIngredients(prev => prev.filter(item => item.id !== id));
    } else {
      setNeededIngredients(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle image upload and analysis
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    
    // Analyze each uploaded image
    setImageAnalysisLoading(true);
    setImageAnalysisMessage(null);
    setImageAnalysisDebug(null); // Clear debug info at start
    
    for (const file of files) {
      try {
        const detectedIngredients = await analyzeImage(file);
        
        if (detectedIngredients.length === 0) {
          setImageAnalysisMessage('No ingredients detected in this image. Please try another one.');
          console.log('No ingredients detected in image or analysis failed');
          // You could add a user notification here
        }
        
        // Add detected ingredients to fridge
        const newIngredients: Ingredient[] = detectedIngredients
          .filter(item => item.confidence > 0.7) // Only high confidence detections
          .map(item => ({
            id: `${Date.now()}-${Math.random()}`,
            name: item.name,
            quantity: item.quantity || '1',
            category: 'fridge' as const,
            source: 'image',
          }));
        
        setFridgeIngredients(prev => {
          // Avoid duplicates by checking names
          const existingNames = prev.map(item => item.name.toLowerCase());
          const uniqueNewIngredients = newIngredients.filter(
            item => !existingNames.includes(item.name.toLowerCase())
          );
          return [...prev, ...uniqueNewIngredients];
        });
      } catch (error) {
        console.error('Error analyzing image:', error);
        setImageAnalysisMessage('Failed to analyze image. Please try again.');
        // You could add a user notification here for failed analysis
      }
    }
    
    setImageAnalysisLoading(false);
  };

  // Remove image
  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculate recipe compatibility score
  const calculateRecipeScore = (recipe: Recipe, availableIngredients: Ingredient[]): number => {
    const availableNames = availableIngredients.map(item => item.name.toLowerCase());
    const recipeIngredients = recipe.ingredients.map(item => item.toLowerCase());
    
    const matchingIngredients = recipeIngredients.filter(ingredient =>
      availableNames.some(available => available.includes(ingredient) || ingredient.includes(available))
    );
    
    return (matchingIngredients.length / recipeIngredients.length) * 100;
  };

  // Filter recipes based on available ingredients and dietary restrictions
  const filterRecipes = (recipes: Recipe[], availableIngredients: Ingredient[]): Recipe[] => {
    return recipes
      .map(recipe => ({
        ...recipe,
        compatibilityScore: calculateRecipeScore(recipe, availableIngredients),
      }))
      .filter(recipe => {
        // Check ingredient compatibility
        const ingredientCompatible = recipe.compatibilityScore > 30;
        
        // Check dietary restrictions
        const dietaryCompatible = dietaryRestrictions.length === 0 || 
          dietaryRestrictions.every(restriction => 
            recipe.dietaryTags.includes(restriction)
          );
        
        return ingredientCompatible && dietaryCompatible;
      })
      .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
  };

  // Curated recipe suggestions database
  const recipeSuggestions: Recipe[] = [
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
  const getFilteredSuggestions = () => {
    if (dietaryRestrictions.length === 0) return recipeSuggestions;
    return recipeSuggestions.filter(recipe => 
      dietaryRestrictions.every(restriction => 
        recipe.dietaryTags.includes(restriction)
      )
    );
  };

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

  // Load recipe suggestions on component mount and when dietary restrictions change
  useEffect(() => {
    const filtered = getFilteredSuggestions();
    setRecipes(filtered);
    setFilteredRecipes(filtered);
    if (filtered.length > 0) {
      setSelectedRecipe(filtered[0]);
    }
  }, [dietaryRestrictions]);

  // Generate recipes based on uploaded images
  const generateRecipesFromImages = async () => {
    if (images.length === 0) return;
    
    setRecipeLoading(true);
    setRecipes([]);
    setSelectedRecipe(null);
    
    // Simulate API call
    setTimeout(() => {
      const imageBasedRecipes: Recipe[] = [
        {
          title: 'Fridge Surprise Frittata',
          ingredients: ['eggs', 'cheese', 'mixed veggies', 'leftover meats', 'milk'],
          instructions: [
            'Preheat oven to 375°F (190°C)',
            'Whisk eggs and cheese, stir in chopped veggies and meats',
            'Pour into greased baking dish and bake 25-30 min',
          ],
          prepTime: '10 minutes',
          cookTime: '30 minutes',
          servings: 4,
          difficulty: 'easy',
          cuisine: 'Italian',
          dietaryTags: ['vegetarian'],
        },
        {
          title: 'Clean-Out-the-Fridge Stir Fry',
          ingredients: ['rice', 'mixed vegetables', 'soy sauce', 'protein of choice', 'garlic', 'ginger'],
          instructions: [
            'Cook rice as directed',
            'Stir-fry veggies and protein in a wok',
            'Add rice and soy sauce, stir to combine',
          ],
          prepTime: '15 minutes',
          cookTime: '15 minutes',
          servings: 3,
          difficulty: 'medium',
          cuisine: 'Asian',
          dietaryTags: ['gluten-free'],
        },
        {
          title: 'Healthy Chicken Stir-Fry',
          ingredients: ['chicken breast', 'broccoli', 'carrots', 'soy sauce', 'ginger', 'garlic'],
          instructions: [
            'Cut chicken into bite-sized pieces',
            'Heat oil in a large wok or skillet',
            'Stir-fry chicken until golden brown',
            'Add vegetables and stir-fry for 3-4 minutes',
            'Add soy sauce and seasonings',
          ],
          prepTime: '15 minutes',
          cookTime: '10 minutes',
          servings: 4,
          difficulty: 'medium',
          cuisine: 'Asian',
          dietaryTags: ['gluten-free', 'dairy-free'],
        },
        {
          title: 'Quinoa Buddha Bowl',
          ingredients: ['quinoa', 'sweet potato', 'kale', 'avocado', 'chickpeas', 'tahini'],
          instructions: [
            'Cook quinoa according to package instructions',
            'Roast sweet potato cubes at 400°F for 25 minutes',
            'Massage kale with olive oil and lemon juice',
            'Assemble bowl with quinoa, vegetables, and tahini dressing',
          ],
          prepTime: '20 minutes',
          cookTime: '25 minutes',
          servings: 2,
          difficulty: 'easy',
          cuisine: 'Mediterranean',
          dietaryTags: ['vegan', 'gluten-free', 'dairy-free'],
        },
        {
          title: 'Tomato Basil Pasta',
          ingredients: ['pasta', 'tomatoes', 'basil', 'garlic', 'olive oil', 'parmesan'],
          instructions: [
            'Cook pasta according to package instructions',
            'Sauté garlic in olive oil',
            'Add tomatoes and cook until softened',
            'Toss with pasta, basil, and parmesan',
          ],
          prepTime: '10 minutes',
          cookTime: '15 minutes',
          servings: 4,
          difficulty: 'easy',
          cuisine: 'Italian',
          dietaryTags: ['vegetarian'],
        },
        {
          title: 'Mushroom Risotto',
          ingredients: ['arborio rice', 'mushrooms', 'onions', 'garlic', 'white wine', 'parmesan'],
          instructions: [
            'Sauté onions and garlic',
            'Add rice and toast slightly',
            'Gradually add broth while stirring',
            'Add mushrooms and finish with parmesan',
          ],
          prepTime: '15 minutes',
          cookTime: '25 minutes',
          servings: 3,
          difficulty: 'hard',
          cuisine: 'Italian',
          dietaryTags: ['vegetarian'],
        },
      ];

      // Filter recipes based on dietary restrictions and add compatibility scores
      const filteredImageRecipes = (dietaryRestrictions.length === 0 
        ? imageBasedRecipes 
        : imageBasedRecipes.filter(recipe => 
            dietaryRestrictions.every(restriction => 
              recipe.dietaryTags.includes(restriction)
            )
          )).map(recipe => ({
            ...recipe,
            compatibilityScore: calculateRecipeScore(recipe, fridgeIngredients)
          }));

      setRecipes(filteredImageRecipes);
      setFilteredRecipes(filteredImageRecipes);
      
      if (filteredImageRecipes.length > 0) {
        setSelectedRecipe(filteredImageRecipes[0]);
      }
      
      setRecipeLoading(false);
    }, 2000);
  };

  // Chat functions
  const sendChatMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      sender: 'user',
      message,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        sender: 'assistant',
        message: data.reply || "I'm here to help you with healthy recipes and nutrition advice! What would you like to know?",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const botMessage: ChatMessage = {
        sender: 'assistant',
        message: "I'm here to help you with healthy recipes and nutrition advice! What would you like to know?",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  // Get compatibility color
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <img 
            src={logo} 
            alt="HealthyBot Logo" 
            className="w-16 h-16 rounded-full object-cover shadow-lg border-4 border-gradient-to-r from-green-400 to-blue-500"
          />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              HealthyBot
            </h1>
            <p className="text-gray-600 text-lg">Your AI Kitchen Assistant</p>
          </div>
        </div>
      </div>
      {/* Dietary Restrictions Modal */}
      {showDietaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to HealthyBot!</h3>
              <p className="text-gray-600">Let's personalize your recipe recommendations</p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 mb-3">Select your dietary preferences:</h4>
              
              {[
                { id: 'vegetarian', label: 'Vegetarian', description: 'No meat, fish, or poultry' },
                { id: 'vegan', label: 'Vegan', description: 'No animal products' },
                { id: 'gluten-free', label: 'Gluten-Free', description: 'No wheat, barley, or rye' },
                { id: 'dairy-free', label: 'Dairy-Free', description: 'No milk, cheese, or dairy products' },
                { id: 'low-carb', label: 'Low-Carb', description: 'Reduced carbohydrate intake' },
                { id: 'keto', label: 'Keto', description: 'Very low-carb, high-fat diet' },
              ].map((diet) => (
                <label key={diet.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dietaryRestrictions.includes(diet.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDietaryRestrictions(prev => [...prev, diet.id]);
                      } else {
                        setDietaryRestrictions(prev => prev.filter(r => r !== diet.id));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{diet.label}</span>
                    <p className="text-sm text-gray-500">{diet.description}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDietaryModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Cooking
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Side - Ingredient Input & Image Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                What's in Your Kitchen?
              </h2>
              <button
                onClick={() => setShowDietaryModal(true)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-md"
              >
                {dietaryRestrictions.length > 0 ? `Dietary: ${dietaryRestrictions.length}` : 'Set Dietary'}
              </button>
            </div>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Upload Fridge Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-500 file:to-blue-500 file:text-white hover:file:from-green-600 hover:file:to-blue-600"
              />
              {imageAnalysisLoading && (
                <div className="mt-3 flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Analyzing images with AI...</span>
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={src}
                        alt={`upload-${idx}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 group-hover:visible"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imageAnalysisMessage && (
                <p className="text-sm text-gray-500 mt-3">{imageAnalysisMessage}</p>
              )}
              {imageAnalysisDebug && (
                <div className="mt-3">
                  <button
                    className="text-xs text-blue-600 underline mb-1"
                    onClick={() => setDebugOpen(v => !v)}
                    type="button"
                  >
                    {debugOpen ? 'Hide' : 'Show'} Debug Console
                  </button>
                  {debugOpen && (
                    <pre className="bg-gray-100 text-xs p-2 rounded max-h-64 overflow-auto border border-gray-300">
                      {imageAnalysisDebug}
                    </pre>
                  )}
                </div>
              )}
              
              {/* Generate Recipes from Images Button */}
              {images.length > 0 && (
                <button
                  onClick={generateRecipesFromImages}
                  disabled={recipeLoading}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                >
                  {recipeLoading ? 'Generating Recipes from Images...' : 'Generate Recipes from Images'}
                </button>
              )}
            </div>

            {/* Add Ingredient Form */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={newIngredient.name}
                  onChange={e =>
                    setNewIngredient(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={newIngredient.quantity}
                  onChange={e =>
                    setNewIngredient(prev => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  value={newIngredient.category}
                  onChange={e =>
                    setNewIngredient(prev => ({
                      ...prev,
                      category: e.target.value as IngredientCategory,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="fridge">In Fridge</option>
                  <option value="needed">Need to Buy</option>
                </select>
                <button
                  onClick={addIngredient}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-md"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Fridge Ingredients */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                In Your Fridge ({fridgeIngredients.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fridgeIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between bg-green-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{ingredient.name}</span>
                      {ingredient.source === 'image' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          AI Detected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{ingredient.quantity}</span>
                      <button
                        onClick={() => removeIngredient(ingredient.id, 'fridge')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {fridgeIngredients.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No ingredients added yet</p>
                )}
              </div>
            </div>

            {/* Needed Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Need to Buy</h3>
              <div className="space-y-2">
                {neededIngredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium">{ingredient.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{ingredient.quantity}</span>
                      <button
                        onClick={() => removeIngredient(ingredient.id, 'needed')}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {neededIngredients.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No ingredients needed yet</p>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFridgeIngredients([]);
                setNeededIngredients([]);
                setImages([]);
                setRecipes([]);
                setFilteredRecipes([]);
                setSelectedRecipe(null);
                setNewIngredient({ name: '', quantity: '', category: 'fridge' });
              }}
              className="w-full mt-4 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
            >
              Reset Everything
            </button>


          </div>
        </div>

        {/* Right Side - Recipe Display */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {recipeLoading ? 'Generating Recipes...' : 
             recipes.length > 0 && recipes[0].title === 'Mediterranean Quinoa Bowl' ? 
             'Recipe Suggestions' : 'Recommended Recipes'} ({filteredRecipes.length})
          </h2>
          
          {filteredRecipes.length > 0 ? (
            <div className="space-y-4">
              {filteredRecipes.map((recipe, index) => (
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
                      {recipes.length > 0 && recipes[0].title === 'Mediterranean Quinoa Bowl' ? (
                        // Show dietary tags for recipe suggestions
                        recipe.dietaryTags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {tag.replace('-', ' ')}
                          </span>
                        ))
                      ) : (
                        // Show compatibility score for image-based recipes
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${getCompatibilityColor(recipe.compatibilityScore || 0)}`}>
                          {Math.round(recipe.compatibilityScore || 0)}% Match
                        </div>
                      )}
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
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-500">No recipe suggestions available for your dietary preferences. Try adjusting your dietary restrictions!</p>
            </div>
          )}

          {/* Selected Recipe Details */}
          {selectedRecipe && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{selectedRecipe.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {recipes.length > 0 && recipes[0].title === 'Mediterranean Quinoa Bowl' ? (
                    // Show dietary tags for recipe suggestions
                    selectedRecipe.dietaryTags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {tag.replace('-', ' ')}
                      </span>
                    ))
                  ) : (
                    // Show compatibility score for image-based recipes
                    <div className={`px-3 py-1 rounded text-sm font-semibold ${getCompatibilityColor(selectedRecipe.compatibilityScore || 0)}`}>
                      {Math.round(selectedRecipe.compatibilityScore || 0)}% Match
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-800">Ingredients:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
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
                  <strong className="text-gray-800">Instructions:</strong>
                  <ol className="list-decimal list-inside text-sm text-gray-700 mt-1">
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
            </div>
          )}
        </div>
      </div>

      {/* Chatbot - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Toggle Button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}

        {/* Chat Window */}
        {chatOpen && (
          <div className="w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">H</span>
                </div>
                <span className="font-semibold">HealthyBot Assistant</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🤖</div>
                  <p>Hello! I'm here to help with healthy recipes and nutrition advice.</p>
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask me about healthy recipes..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>


    </div>
  );
};

export default Home;
