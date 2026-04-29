// Mock data for development when backend is not available

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
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'MEMBER' }
  ]
};
