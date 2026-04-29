// Mock data for development when backend is not available

// Demo Login Credentials
export const mockCredentials = {
  email: 'demo@nutriguide.com',
  password: 'demo123',
  // Alternative accounts
  accounts: [
    { email: 'demo@nutriguide.com', password: 'demo123', name: 'Demo User' },
    { email: 'jane@example.com', password: 'jane123', name: 'Jane Smith' },
    { email: 'john@example.com', password: 'john123', name: 'John Smith' }
  ]
};

export const mockMeals = [
  // Breakfast
  {
    id: '1',
    name: 'Oatmeal with Berries',
    category: 'Breakfast',
    dietType: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400',
    calories: 280,
    protein: 8,
    carbs: 45,
    fat: 6,
    description: 'Healthy oatmeal topped with fresh berries and honey'
  },
  {
    id: '2',
    name: 'Avocado Toast',
    category: 'Breakfast',
    dietType: 'Vegan',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    calories: 320,
    protein: 10,
    carbs: 35,
    fat: 18,
    description: 'Whole grain toast with mashed avocado and cherry tomatoes'
  },
  {
    id: '3',
    name: 'Protein Pancakes',
    category: 'Breakfast',
    dietType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    calories: 380,
    protein: 25,
    carbs: 42,
    fat: 10,
    description: 'Fluffy pancakes made with protein powder and topped with banana'
  },
  {
    id: '4',
    name: 'Greek Yogurt Bowl',
    category: 'Breakfast',
    dietType: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    calories: 250,
    protein: 15,
    carbs: 30,
    fat: 8,
    description: 'Greek yogurt with granola, nuts, and fresh fruit'
  },
  
  // Lunch
  {
    id: '5',
    name: 'Grilled Chicken Salad',
    category: 'Lunch',
    dietType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    calories: 350,
    protein: 35,
    carbs: 20,
    fat: 12,
    description: 'Fresh mixed greens with grilled chicken breast and balsamic dressing'
  },
  {
    id: '6',
    name: 'Quinoa Buddha Bowl',
    category: 'Lunch',
    dietType: 'Vegan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    calories: 420,
    protein: 14,
    carbs: 55,
    fat: 16,
    description: 'Quinoa with roasted vegetables, chickpeas, and tahini dressing'
  },
  {
    id: '7',
    name: 'Turkey Wrap',
    category: 'Lunch',
    dietType: 'Balanced',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
    calories: 380,
    protein: 28,
    carbs: 38,
    fat: 14,
    description: 'Whole wheat wrap with turkey, lettuce, tomato, and hummus'
  },
  {
    id: '8',
    name: 'Tuna Poke Bowl',
    category: 'Lunch',
    dietType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400',
    calories: 410,
    protein: 32,
    carbs: 45,
    fat: 10,
    description: 'Fresh tuna with rice, edamame, and sesame dressing'
  },

  // Dinner
  {
    id: '9',
    name: 'Salmon with Vegetables',
    category: 'Dinner',
    dietType: 'Keto',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    calories: 420,
    protein: 40,
    carbs: 15,
    fat: 22,
    description: 'Grilled salmon with roasted broccoli and asparagus'
  },
  {
    id: '10',
    name: 'Chicken Stir Fry',
    category: 'Dinner',
    dietType: 'Balanced',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    calories: 450,
    protein: 35,
    carbs: 48,
    fat: 14,
    description: 'Chicken breast with mixed vegetables and brown rice'
  },
  {
    id: '11',
    name: 'Vegetarian Pasta',
    category: 'Dinner',
    dietType: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    calories: 480,
    protein: 18,
    carbs: 65,
    fat: 16,
    description: 'Whole wheat pasta with marinara sauce and vegetables'
  },
  {
    id: '12',
    name: 'Beef Tacos',
    category: 'Dinner',
    dietType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    calories: 520,
    protein: 38,
    carbs: 42,
    fat: 22,
    description: 'Lean ground beef tacos with fresh toppings'
  },

  // Juices & Smoothies
  {
    id: '13',
    name: 'Green Detox Smoothie',
    category: 'Juices',
    dietType: 'Vegan',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400',
    calories: 180,
    protein: 4,
    carbs: 35,
    fat: 3,
    description: 'Spinach, kale, banana, and almond milk smoothie'
  },
  {
    id: '14',
    name: 'Berry Protein Shake',
    category: 'Juices',
    dietType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
    calories: 280,
    protein: 25,
    carbs: 32,
    fat: 6,
    description: 'Mixed berries with protein powder and Greek yogurt'
  },
  {
    id: '15',
    name: 'Tropical Fruit Juice',
    category: 'Juices',
    dietType: 'Vegan',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    calories: 220,
    protein: 2,
    carbs: 52,
    fat: 1,
    description: 'Fresh mango, pineapple, and orange juice blend'
  },
  {
    id: '16',
    name: 'Carrot Ginger Juice',
    category: 'Juices',
    dietType: 'Vegan',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
    calories: 150,
    protein: 3,
    carbs: 32,
    fat: 1,
    description: 'Fresh carrot and ginger juice with a hint of lemon'
  }
];

export const mockUser = {
  id: '1',
  email: 'demo@nutriguide.com',
  name: 'Demo User',
  avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4F46E5&color=fff',
  isPremium: false,
  createdAt: new Date('2026-01-01').toISOString()
};

export const mockFavorites = [
  mockMeals[0], // Oatmeal with Berries
  mockMeals[4], // Grilled Chicken Salad
  mockMeals[8]  // Salmon with Vegetables
];

export const mockMealPlans = [
  {
    id: '1',
    name: 'Weekly Meal Plan',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    meals: [
      { day: 'Monday', breakfast: mockMeals[0], lunch: mockMeals[4], dinner: mockMeals[8] },
      { day: 'Tuesday', breakfast: mockMeals[1], lunch: mockMeals[5], dinner: mockMeals[9] },
      { day: 'Wednesday', breakfast: mockMeals[2], lunch: mockMeals[6], dinner: mockMeals[10] }
    ]
  }
];

export const mockFamily = {
  id: '1',
  name: 'Smith Family',
  inviteCode: 'SMITH2026',
  members: [
    { ...mockUser, role: 'OWNER' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'MEMBER', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=EC4899&color=fff' },
    { id: '3', name: 'John Smith', email: 'john@example.com', role: 'MEMBER', avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=10B981&color=fff' }
  ]
};

export const mockRecipes = [
  {
    id: '1',
    title: 'Grilled Chicken Salad',
    description: 'A healthy and delicious grilled chicken salad with fresh vegetables',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'Easy',
    category: 'Lunch',
    dietType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    ingredients: [
      '2 chicken breasts',
      '4 cups mixed greens',
      '1 cup cherry tomatoes',
      '1/2 cucumber, sliced',
      '1/4 red onion, sliced',
      '2 tbsp olive oil',
      '1 tbsp balsamic vinegar',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Season chicken breasts with salt and pepper',
      'Grill chicken for 6-7 minutes per side until cooked through',
      'Let chicken rest for 5 minutes, then slice',
      'Combine greens, tomatoes, cucumber, and onion in a bowl',
      'Top with sliced chicken',
      'Drizzle with olive oil and balsamic vinegar',
      'Serve immediately'
    ],
    nutrition: {
      calories: 350,
      protein: 35,
      carbs: 20,
      fat: 12,
      fiber: 5
    },
    author: mockUser,
    likes: 24,
    saves: 12,
    reviews: 8
  },
  {
    id: '2',
    title: 'Quinoa Buddha Bowl',
    description: 'Nutritious vegan bowl packed with quinoa, roasted vegetables, and tahini dressing',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    category: 'Lunch',
    dietType: 'Vegan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    ingredients: [
      '1 cup quinoa',
      '2 cups vegetable broth',
      '1 sweet potato, cubed',
      '1 cup chickpeas',
      '2 cups kale',
      '1 avocado',
      '1/4 cup tahini',
      '2 tbsp lemon juice',
      '1 clove garlic',
      'Salt and pepper'
    ],
    instructions: [
      'Cook quinoa in vegetable broth according to package directions',
      'Roast sweet potato cubes at 400°F for 25 minutes',
      'Roast chickpeas with spices for 20 minutes',
      'Massage kale with a bit of olive oil',
      'Make tahini dressing by mixing tahini, lemon juice, garlic, and water',
      'Assemble bowls with quinoa, roasted vegetables, chickpeas, and kale',
      'Top with sliced avocado and drizzle with tahini dressing'
    ],
    nutrition: {
      calories: 420,
      protein: 14,
      carbs: 55,
      fat: 16,
      fiber: 12
    },
    author: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    likes: 45,
    saves: 32,
    reviews: 15
  },
  {
    id: '3',
    title: 'Salmon with Roasted Vegetables',
    description: 'Perfectly cooked salmon with colorful roasted vegetables',
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    difficulty: 'Easy',
    category: 'Dinner',
    dietType: 'Keto',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
    ingredients: [
      '2 salmon fillets (6 oz each)',
      '2 cups broccoli florets',
      '1 cup asparagus',
      '1 red bell pepper, sliced',
      '2 tbsp olive oil',
      '1 lemon',
      'Fresh dill',
      'Salt and pepper'
    ],
    instructions: [
      'Preheat oven to 425°F',
      'Arrange vegetables on a baking sheet, drizzle with olive oil',
      'Season with salt and pepper',
      'Roast vegetables for 15 minutes',
      'Place salmon on the baking sheet with vegetables',
      'Season salmon with salt, pepper, and lemon juice',
      'Roast for another 10-12 minutes until salmon is cooked',
      'Garnish with fresh dill and lemon wedges'
    ],
    nutrition: {
      calories: 420,
      protein: 40,
      carbs: 15,
      fat: 22,
      fiber: 6
    },
    author: mockUser,
    likes: 67,
    saves: 45,
    reviews: 22
  }
];

export const mockReviews = [
  {
    id: '1',
    recipeId: '1',
    user: { id: '2', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=EC4899&color=fff' },
    rating: 5,
    comment: 'Absolutely delicious! Made this for lunch and my whole family loved it. The balsamic dressing is perfect.',
    helpful: 12,
    createdAt: new Date('2026-04-20').toISOString()
  },
  {
    id: '2',
    recipeId: '1',
    user: { id: '3', name: 'John Smith', avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=10B981&color=fff' },
    rating: 4,
    comment: 'Great recipe! I added some feta cheese and it was even better. Will make again.',
    helpful: 8,
    createdAt: new Date('2026-04-22').toISOString()
  },
  {
    id: '3',
    recipeId: '2',
    user: mockUser,
    rating: 5,
    comment: 'This buddha bowl is my new favorite! So filling and nutritious. The tahini dressing is amazing.',
    helpful: 15,
    createdAt: new Date('2026-04-25').toISOString()
  },
  {
    id: '4',
    recipeId: '3',
    user: { id: '2', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=EC4899&color=fff' },
    rating: 5,
    comment: 'Perfect keto dinner! The salmon was cooked to perfection and the vegetables were delicious.',
    helpful: 20,
    createdAt: new Date('2026-04-26').toISOString()
  }
];

export const mockShoppingLists = [
  {
    id: '1',
    name: 'Weekly Groceries',
    createdAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Chicken breast', quantity: '2 lbs', category: 'Protein', checked: false },
      { id: '2', name: 'Mixed greens', quantity: '2 bags', category: 'Vegetables', checked: true },
      { id: '3', name: 'Cherry tomatoes', quantity: '1 pint', category: 'Vegetables', checked: false },
      { id: '4', name: 'Quinoa', quantity: '1 lb', category: 'Grains', checked: false },
      { id: '5', name: 'Sweet potato', quantity: '3 large', category: 'Vegetables', checked: false },
      { id: '6', name: 'Salmon fillets', quantity: '4 pieces', category: 'Protein', checked: false },
      { id: '7', name: 'Broccoli', quantity: '2 heads', category: 'Vegetables', checked: true },
      { id: '8', name: 'Olive oil', quantity: '1 bottle', category: 'Pantry', checked: true },
      { id: '9', name: 'Avocado', quantity: '4', category: 'Produce', checked: false },
      { id: '10', name: 'Greek yogurt', quantity: '32 oz', category: 'Dairy', checked: false }
    ]
  },
  {
    id: '2',
    name: 'Meal Prep Sunday',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '11', name: 'Brown rice', quantity: '2 lbs', category: 'Grains', checked: true },
      { id: '12', name: 'Ground turkey', quantity: '3 lbs', category: 'Protein', checked: true },
      { id: '13', name: 'Bell peppers', quantity: '6', category: 'Vegetables', checked: true },
      { id: '14', name: 'Onions', quantity: '3', category: 'Vegetables', checked: true },
      { id: '15', name: 'Eggs', quantity: '2 dozen', category: 'Protein', checked: true }
    ]
  }
];

export const mockMealHistory = [
  {
    id: '1',
    meal: mockMeals[0],
    consumedAt: new Date().toISOString(),
    mealType: 'Breakfast',
    rating: 5,
    notes: 'Perfect start to the day!'
  },
  {
    id: '2',
    meal: mockMeals[4],
    consumedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    mealType: 'Lunch',
    rating: 4,
    notes: 'Very filling and tasty'
  },
  {
    id: '3',
    meal: mockMeals[8],
    consumedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    mealType: 'Dinner',
    rating: 5,
    notes: 'Amazing dinner, will make again'
  },
  {
    id: '4',
    meal: mockMeals[1],
    consumedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    mealType: 'Breakfast',
    rating: 5,
    notes: 'Love avocado toast!'
  },
  {
    id: '5',
    meal: mockMeals[13],
    consumedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mealType: 'Snack',
    rating: 4,
    notes: 'Refreshing and healthy'
  }
];

export const mockNotifications = [
  {
    id: '1',
    type: 'FAMILY_INVITE',
    title: 'New Family Member',
    message: 'John Smith joined your family',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'MEAL_SUGGESTION',
    title: 'New Meal Suggestion',
    message: 'Jane suggested "Grilled Chicken Salad" for dinner',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'POLL_CREATED',
    title: 'New Poll',
    message: 'What should we have for dinner tomorrow?',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'RECIPE_LIKED',
    title: 'Recipe Liked',
    message: 'Jane liked your recipe "Salmon with Vegetables"',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

export const mockPolls = [
  {
    id: '1',
    question: 'What should we have for dinner tonight?',
    options: [
      { id: '1', text: 'Grilled Chicken Salad', votes: 2 },
      { id: '2', text: 'Salmon with Vegetables', votes: 3 },
      { id: '3', text: 'Vegetarian Pasta', votes: 1 }
    ],
    createdBy: mockUser,
    endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    totalVotes: 6
  },
  {
    id: '2',
    question: 'Breakfast preference for Sunday?',
    options: [
      { id: '4', text: 'Oatmeal with Berries', votes: 1 },
      { id: '5', text: 'Protein Pancakes', votes: 4 },
      { id: '6', text: 'Avocado Toast', votes: 2 }
    ],
    createdBy: { id: '2', name: 'Jane Smith' },
    endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    totalVotes: 7
  }
];
