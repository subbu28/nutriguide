import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.vote.deleteMany();
  await prisma.mealSuggestion.deleteMany();
  await prisma.mealPoll.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.family.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Smith',
      isPremium: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      isPremium: false,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'mike@example.com',
      password: hashedPassword,
      name: 'Mike Johnson',
      isPremium: false,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'demo@nutriguide.com',
      password: hashedPassword,
      name: 'Demo User',
      isPremium: true,
    },
  });

  console.log('✅ Created 4 users');

  // Create families
  const family1 = await prisma.family.create({
    data: {
      name: 'The Smith Family',
      inviteCode: 'SMITH123',
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'OWNER' },
          { userId: user2.id, role: 'ADMIN' },
          { userId: user4.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const family2 = await prisma.family.create({
    data: {
      name: 'Healthy Eaters Club',
      inviteCode: 'HEALTH99',
      ownerId: user3.id,
      members: {
        create: [
          { userId: user3.id, role: 'OWNER' },
          { userId: user4.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Created 2 families');

  // Create favorites for demo user
  const sampleMeals = [
    {
      mealId: 'meal-001',
      mealName: 'Avocado Toast with Poached Eggs',
      category: 'Breakfast',
      dietType: 'Vegetarian',
      mealData: {
        id: 'meal-001',
        name: 'Avocado Toast with Poached Eggs',
        description: 'Creamy avocado on whole grain toast topped with perfectly poached eggs',
        calories: 380,
        protein: '14g',
        benefits: ['High in healthy fats', 'Good source of protein', 'Rich in fiber'],
        category: 'Breakfast',
        dietType: 'Vegetarian',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        instructions: ['Toast bread', 'Mash avocado', 'Poach eggs', 'Assemble and season'],
      },
    },
    {
      mealId: 'meal-002',
      mealName: 'Grilled Salmon Salad',
      category: 'Lunch',
      dietType: 'Non-Vegetarian',
      mealData: {
        id: 'meal-002',
        name: 'Grilled Salmon Salad',
        description: 'Fresh grilled salmon over mixed greens with lemon vinaigrette',
        calories: 420,
        protein: '35g',
        benefits: ['Rich in Omega-3', 'High protein', 'Low carb'],
        category: 'Lunch',
        dietType: 'Non-Vegetarian',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        instructions: ['Season salmon', 'Grill 4 mins each side', 'Prepare salad', 'Add dressing'],
      },
    },
    {
      mealId: 'meal-003',
      mealName: 'Quinoa Buddha Bowl',
      category: 'Dinner',
      dietType: 'Vegetarian',
      mealData: {
        id: 'meal-003',
        name: 'Quinoa Buddha Bowl',
        description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
        calories: 450,
        protein: '18g',
        benefits: ['Complete protein', 'High fiber', 'Antioxidant rich'],
        category: 'Dinner',
        dietType: 'Vegetarian',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        instructions: ['Cook quinoa', 'Roast vegetables', 'Make tahini sauce', 'Assemble bowl'],
      },
    },
    {
      mealId: 'meal-004',
      mealName: 'Green Detox Smoothie',
      category: 'Juices',
      dietType: 'Vegetarian',
      mealData: {
        id: 'meal-004',
        name: 'Green Detox Smoothie',
        description: 'Refreshing blend of spinach, cucumber, apple, and ginger',
        calories: 120,
        protein: '3g',
        benefits: ['Detoxifying', 'Immune boosting', 'Hydrating'],
        category: 'Juices',
        dietType: 'Vegetarian',
        imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400',
        instructions: ['Add all ingredients to blender', 'Blend until smooth', 'Serve cold'],
      },
    },
  ];

  for (const meal of sampleMeals) {
    await prisma.favorite.create({
      data: {
        userId: user4.id,
        ...meal,
      },
    });
  }

  // Add some favorites for other users too
  await prisma.favorite.create({
    data: {
      userId: user1.id,
      ...sampleMeals[0],
    },
  });

  await prisma.favorite.create({
    data: {
      userId: user2.id,
      ...sampleMeals[2],
    },
  });

  console.log('✅ Created favorites');

  // Create meal polls
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const poll1 = await prisma.mealPoll.create({
    data: {
      familyId: family1.id,
      category: 'DINNER',
      date: tomorrow,
      closesAt: new Date(tomorrow.getTime() - 2 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  });

  // Add suggestions to poll
  const suggestion1 = await prisma.mealSuggestion.create({
    data: {
      pollId: poll1.id,
      userId: user1.id,
      mealId: 'meal-005',
      mealName: 'Chicken Stir Fry',
      mealData: {
        id: 'meal-005',
        name: 'Chicken Stir Fry',
        description: 'Quick and healthy chicken stir fry with vegetables',
        calories: 380,
        protein: '32g',
      },
    },
  });

  const suggestion2 = await prisma.mealSuggestion.create({
    data: {
      pollId: poll1.id,
      userId: user2.id,
      mealId: 'meal-006',
      mealName: 'Vegetable Pasta',
      mealData: {
        id: 'meal-006',
        name: 'Vegetable Pasta',
        description: 'Whole wheat pasta with roasted vegetables',
        calories: 420,
        protein: '14g',
      },
    },
  });

  const suggestion3 = await prisma.mealSuggestion.create({
    data: {
      pollId: poll1.id,
      userId: user4.id,
      mealId: 'meal-003',
      mealName: 'Quinoa Buddha Bowl',
      mealData: sampleMeals[2].mealData,
    },
  });

  // Add votes
  await prisma.vote.create({
    data: { pollId: poll1.id, suggestionId: suggestion1.id, userId: user1.id },
  });
  await prisma.vote.create({
    data: { pollId: poll1.id, suggestionId: suggestion1.id, userId: user4.id },
  });
  await prisma.vote.create({
    data: { pollId: poll1.id, suggestionId: suggestion2.id, userId: user2.id },
  });

  console.log('✅ Created polls and votes');

  // Create chat messages
  const messagesData = [
    { userId: user1.id, familyId: family1.id, content: 'Hey everyone! What should we have for dinner tomorrow?', type: 'TEXT' },
    { userId: user2.id, familyId: family1.id, content: 'I was thinking something light and healthy!', type: 'TEXT' },
    { userId: user4.id, familyId: family1.id, content: 'How about a Buddha Bowl? I found a great recipe!', type: 'TEXT' },
    { userId: user1.id, familyId: family1.id, content: 'That sounds delicious! Let me add it to the poll.', type: 'TEXT' },
    { userId: user2.id, familyId: family1.id, content: '👍 Great idea!', type: 'TEXT' },
  ];

  for (let i = 0; i < messagesData.length; i++) {
    await prisma.message.create({
      data: {
        ...messagesData[i],
        createdAt: new Date(Date.now() - (messagesData.length - i) * 60000), // 1 min apart
      },
    });
  }

  // Family 2 messages
  await prisma.message.create({
    data: {
      userId: user3.id,
      familyId: family2.id,
      content: 'Welcome to Healthy Eaters Club! Share your favorite recipes here.',
      type: 'TEXT',
    },
  });

  console.log('✅ Created chat messages');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user4.id,
        type: 'POLL_CREATED',
        title: 'New Meal Poll',
        body: 'John created a new poll for tomorrow\'s dinner',
        data: { pollId: poll1.id, familyId: family1.id },
        read: false,
      },
      {
        userId: user4.id,
        type: 'POLL_ENDING',
        title: 'Poll Ending Soon',
        body: 'The dinner poll closes in 2 hours',
        data: { pollId: poll1.id },
        read: false,
      },
      {
        userId: user4.id,
        type: 'FAMILY_INVITE',
        title: 'Welcome!',
        body: 'You joined The Smith Family',
        data: { familyId: family1.id },
        read: true,
      },
      {
        userId: user1.id,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        body: 'Demo User sent a message in The Smith Family',
        data: { familyId: family1.id },
        read: false,
      },
    ],
  });

  console.log('✅ Created notifications');

  // Create subscription for premium user
  await prisma.subscription.create({
    data: {
      userId: user4.id,
      stripeSubscriptionId: 'sub_demo_123',
      stripePriceId: 'price_demo_123',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created subscription');

  // Create sample recipes with proper structure
  const sampleRecipes = [
    {
      authorId: user4.id,
      title: 'Mediterranean Grilled Chicken',
      description: 'Juicy grilled chicken marinated in Mediterranean herbs and spices',
      instructions: '1. Marinate chicken in olive oil, garlic, lemon juice, and herbs for 2 hours\n2. Preheat grill to medium-high\n3. Grill chicken 6-7 minutes per side\n4. Rest for 5 minutes before serving',
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: 'EASY' as const,
      cuisine: 'Mediterranean',
      tags: ['chicken', 'grilled', 'healthy', 'high-protein'],
      images: ['https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400'],
      calories: 320,
      protein: 42,
      carbs: 4,
      fat: 16,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'chicken breasts', amount: 4, unit: 'pieces' },
        { name: 'olive oil', amount: 3, unit: 'tbsp' },
        { name: 'garlic cloves', amount: 2, unit: 'pieces' },
        { name: 'lemon', amount: 1, unit: 'whole' },
        { name: 'oregano', amount: 1, unit: 'tsp' },
        { name: 'thyme', amount: 1, unit: 'tsp' },
      ],
    },
    {
      authorId: user1.id,
      title: 'Classic Beef Tacos',
      description: 'Authentic Mexican-style beef tacos with fresh toppings',
      instructions: '1. Brown beef in a skillet\n2. Add taco seasoning and water, simmer 5 minutes\n3. Warm taco shells\n4. Assemble tacos with beef and toppings',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'EASY' as const,
      cuisine: 'Mexican',
      tags: ['beef', 'tacos', 'mexican', 'quick'],
      images: ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'],
      calories: 380,
      protein: 24,
      carbs: 28,
      fat: 20,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'ground beef', amount: 1, unit: 'lb' },
        { name: 'taco seasoning', amount: 1, unit: 'packet' },
        { name: 'taco shells', amount: 8, unit: 'pieces' },
        { name: 'lettuce', amount: 1, unit: 'cup' },
        { name: 'tomatoes', amount: 2, unit: 'whole' },
        { name: 'cheese', amount: 1, unit: 'cup' },
      ],
    },
    {
      authorId: user2.id,
      title: 'Creamy Mushroom Risotto',
      description: 'Rich and creamy Italian risotto with sautéed mushrooms',
      instructions: '1. Sauté mushrooms, set aside\n2. Toast rice with shallots\n3. Add wine, stir until absorbed\n4. Add broth gradually, stirring constantly\n5. Fold in mushrooms, butter, and parmesan',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: 'MEDIUM' as const,
      cuisine: 'Italian',
      tags: ['risotto', 'mushroom', 'vegetarian', 'italian'],
      images: ['https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400'],
      calories: 420,
      protein: 12,
      carbs: 58,
      fat: 16,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'arborio rice', amount: 1.5, unit: 'cups' },
        { name: 'chicken broth', amount: 4, unit: 'cups' },
        { name: 'mushrooms', amount: 8, unit: 'oz' },
        { name: 'white wine', amount: 0.5, unit: 'cup' },
        { name: 'parmesan cheese', amount: 1, unit: 'cup' },
        { name: 'butter', amount: 2, unit: 'tbsp' },
      ],
    },
    {
      authorId: user4.id,
      title: 'Thai Green Curry',
      description: 'Aromatic Thai curry with vegetables and coconut milk',
      instructions: '1. Fry curry paste in coconut cream\n2. Add protein, cook through\n3. Pour in remaining coconut milk\n4. Add vegetables and seasonings\n5. Simmer until vegetables are tender',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: 'MEDIUM' as const,
      cuisine: 'Asian',
      tags: ['thai', 'curry', 'spicy', 'coconut'],
      images: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400'],
      calories: 380,
      protein: 28,
      carbs: 18,
      fat: 24,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'green curry paste', amount: 3, unit: 'tbsp' },
        { name: 'coconut milk', amount: 2, unit: 'cans' },
        { name: 'chicken breast', amount: 1, unit: 'lb' },
        { name: 'bamboo shoots', amount: 1, unit: 'cup' },
        { name: 'bell peppers', amount: 2, unit: 'pieces' },
        { name: 'thai basil', amount: 1, unit: 'cup' },
      ],
    },
    {
      authorId: user3.id,
      title: 'Quinoa Buddha Bowl',
      description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
      instructions: '1. Cook quinoa according to package\n2. Roast sweet potato and chickpeas\n3. Massage kale with olive oil\n4. Make tahini dressing\n5. Assemble bowls with all components',
      prepTime: 15,
      cookTime: 30,
      servings: 2,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['vegan', 'healthy', 'buddha-bowl', 'quinoa'],
      images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'],
      calories: 450,
      protein: 18,
      carbs: 52,
      fat: 20,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'quinoa', amount: 1, unit: 'cup' },
        { name: 'sweet potato', amount: 1, unit: 'large' },
        { name: 'chickpeas', amount: 1, unit: 'can' },
        { name: 'kale', amount: 2, unit: 'cups' },
        { name: 'avocado', amount: 1, unit: 'whole' },
        { name: 'tahini', amount: 3, unit: 'tbsp' },
      ],
    },
    {
      authorId: user1.id,
      title: 'Spaghetti Carbonara',
      description: 'Classic Roman pasta with eggs, cheese, and pancetta',
      instructions: '1. Cook pasta al dente\n2. Fry pancetta until crispy\n3. Mix egg yolks with cheese\n4. Toss hot pasta with pancetta\n5. Add egg mixture off heat, toss quickly',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'MEDIUM' as const,
      cuisine: 'Italian',
      tags: ['pasta', 'italian', 'carbonara', 'classic'],
      images: ['https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'],
      calories: 520,
      protein: 24,
      carbs: 58,
      fat: 22,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'spaghetti', amount: 400, unit: 'g' },
        { name: 'pancetta', amount: 200, unit: 'g' },
        { name: 'egg yolks', amount: 4, unit: 'pieces' },
        { name: 'pecorino romano', amount: 100, unit: 'g' },
        { name: 'black pepper', amount: 1, unit: 'tsp' },
      ],
    },
    {
      authorId: user4.id,
      title: 'Honey Garlic Salmon',
      description: 'Pan-seared salmon with a sweet and savory honey garlic glaze',
      instructions: '1. Season salmon with salt and pepper\n2. Sear salmon skin-side up 4 minutes\n3. Flip and cook 3 more minutes\n4. Make honey garlic sauce in same pan\n5. Drizzle sauce over salmon',
      prepTime: 5,
      cookTime: 15,
      servings: 4,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['salmon', 'seafood', 'healthy', 'quick'],
      images: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'],
      calories: 380,
      protein: 36,
      carbs: 18,
      fat: 18,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'salmon fillets', amount: 4, unit: 'pieces' },
        { name: 'honey', amount: 4, unit: 'tbsp' },
        { name: 'garlic cloves', amount: 3, unit: 'pieces' },
        { name: 'soy sauce', amount: 2, unit: 'tbsp' },
        { name: 'butter', amount: 2, unit: 'tbsp' },
        { name: 'lemon', amount: 1, unit: 'whole' },
      ],
    },
    {
      authorId: user2.id,
      title: 'Vegetable Stir Fry',
      description: 'Colorful vegetables wok-fried in a savory sauce',
      instructions: '1. Prep all vegetables\n2. Heat wok until smoking\n3. Stir fry vegetables in batches\n4. Add sauce and toss\n5. Serve over rice',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'EASY' as const,
      cuisine: 'Asian',
      tags: ['vegetarian', 'stir-fry', 'healthy', 'quick'],
      images: ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'],
      calories: 180,
      protein: 6,
      carbs: 24,
      fat: 8,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'broccoli', amount: 2, unit: 'cups' },
        { name: 'bell peppers', amount: 2, unit: 'pieces' },
        { name: 'snap peas', amount: 1, unit: 'cup' },
        { name: 'carrots', amount: 2, unit: 'pieces' },
        { name: 'soy sauce', amount: 3, unit: 'tbsp' },
        { name: 'sesame oil', amount: 1, unit: 'tbsp' },
      ],
    },
    // Breakfast recipes
    {
      authorId: user1.id,
      title: 'Fluffy Pancakes',
      description: 'Light and fluffy American-style pancakes perfect for weekend breakfast',
      instructions: '1. Mix dry ingredients\n2. Combine wet ingredients separately\n3. Fold wet into dry, don\'t overmix\n4. Cook on griddle until bubbles form\n5. Flip and cook until golden',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['breakfast', 'pancakes', 'sweet', 'family-friendly'],
      images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'],
      calories: 350,
      protein: 8,
      carbs: 52,
      fat: 12,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'all-purpose flour', amount: 2, unit: 'cups' },
        { name: 'milk', amount: 1.5, unit: 'cups' },
        { name: 'eggs', amount: 2, unit: 'pieces' },
        { name: 'butter', amount: 3, unit: 'tbsp' },
        { name: 'baking powder', amount: 2, unit: 'tsp' },
        { name: 'maple syrup', amount: 4, unit: 'tbsp' },
      ],
    },
    {
      authorId: user2.id,
      title: 'Avocado Toast with Eggs',
      description: 'Trendy and nutritious breakfast with creamy avocado and poached eggs',
      instructions: '1. Toast sourdough bread\n2. Mash avocado with lime and salt\n3. Poach eggs until whites are set\n4. Spread avocado on toast\n5. Top with eggs and seasonings',
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['breakfast', 'healthy', 'avocado', 'eggs'],
      images: ['https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400'],
      calories: 320,
      protein: 14,
      carbs: 28,
      fat: 18,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'sourdough bread', amount: 2, unit: 'slices' },
        { name: 'avocado', amount: 1, unit: 'whole' },
        { name: 'eggs', amount: 2, unit: 'pieces' },
        { name: 'lime', amount: 0.5, unit: 'whole' },
        { name: 'red pepper flakes', amount: 0.5, unit: 'tsp' },
      ],
    },
    // Snacks recipes
    {
      authorId: user3.id,
      title: 'Crispy Baked Chickpeas',
      description: 'Crunchy, protein-packed snack with customizable seasonings',
      instructions: '1. Drain and dry chickpeas thoroughly\n2. Toss with olive oil and seasonings\n3. Spread on baking sheet\n4. Bake at 400°F for 30-40 minutes\n5. Shake pan halfway through',
      prepTime: 5,
      cookTime: 35,
      servings: 4,
      difficulty: 'EASY' as const,
      cuisine: 'Mediterranean',
      tags: ['snacks', 'healthy', 'vegan', 'protein'],
      images: ['https://images.unsplash.com/photo-1515543904323-de53ea5ad4c8?w=400'],
      calories: 140,
      protein: 6,
      carbs: 18,
      fat: 5,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'chickpeas', amount: 2, unit: 'cans' },
        { name: 'olive oil', amount: 2, unit: 'tbsp' },
        { name: 'paprika', amount: 1, unit: 'tsp' },
        { name: 'garlic powder', amount: 0.5, unit: 'tsp' },
        { name: 'cumin', amount: 0.5, unit: 'tsp' },
      ],
    },
    {
      authorId: user4.id,
      title: 'Energy Protein Balls',
      description: 'No-bake energy bites perfect for pre-workout or afternoon snacking',
      instructions: '1. Mix oats, nut butter, and honey\n2. Add chocolate chips and protein powder\n3. Chill mixture for 30 minutes\n4. Roll into 1-inch balls\n5. Store in refrigerator',
      prepTime: 15,
      cookTime: 0,
      servings: 12,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['snacks', 'no-bake', 'protein', 'energy'],
      images: ['https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'],
      calories: 95,
      protein: 4,
      carbs: 12,
      fat: 4,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'rolled oats', amount: 1, unit: 'cup' },
        { name: 'peanut butter', amount: 0.5, unit: 'cup' },
        { name: 'honey', amount: 3, unit: 'tbsp' },
        { name: 'chocolate chips', amount: 0.25, unit: 'cup' },
        { name: 'protein powder', amount: 2, unit: 'tbsp' },
      ],
    },
    // Juices recipes
    {
      authorId: user1.id,
      title: 'Green Detox Juice',
      description: 'Refreshing green juice packed with vitamins and antioxidants',
      instructions: '1. Wash all produce thoroughly\n2. Cut into juicer-sized pieces\n3. Juice cucumber and celery first\n4. Add apple and spinach\n5. Finish with ginger and lemon',
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['juices', 'detox', 'healthy', 'green'],
      images: ['https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400'],
      calories: 85,
      protein: 2,
      carbs: 20,
      fat: 0,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'cucumber', amount: 1, unit: 'whole' },
        { name: 'celery stalks', amount: 4, unit: 'pieces' },
        { name: 'green apple', amount: 1, unit: 'whole' },
        { name: 'spinach', amount: 2, unit: 'cups' },
        { name: 'ginger', amount: 1, unit: 'inch' },
        { name: 'lemon', amount: 0.5, unit: 'whole' },
      ],
    },
    {
      authorId: user2.id,
      title: 'Immune Booster Orange Carrot Juice',
      description: 'Vitamin C-rich juice to strengthen your immune system',
      instructions: '1. Peel oranges and carrots\n2. Cut into pieces\n3. Juice carrots first\n4. Add oranges and turmeric\n5. Stir and serve immediately',
      prepTime: 8,
      cookTime: 0,
      servings: 2,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['juices', 'immune-boost', 'vitamin-c', 'healthy'],
      images: ['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400'],
      calories: 120,
      protein: 2,
      carbs: 28,
      fat: 0,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'oranges', amount: 3, unit: 'whole' },
        { name: 'carrots', amount: 4, unit: 'pieces' },
        { name: 'turmeric root', amount: 1, unit: 'inch' },
        { name: 'ginger', amount: 0.5, unit: 'inch' },
      ],
    },
    // Smoothies recipes
    {
      authorId: user3.id,
      title: 'Berry Blast Smoothie',
      description: 'Antioxidant-rich mixed berry smoothie with creamy yogurt base',
      instructions: '1. Add frozen berries to blender\n2. Pour in milk and yogurt\n3. Add honey for sweetness\n4. Blend until smooth\n5. Pour and top with fresh berries',
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['smoothies', 'berries', 'healthy', 'breakfast'],
      images: ['https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400'],
      calories: 180,
      protein: 8,
      carbs: 32,
      fat: 3,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'mixed berries', amount: 2, unit: 'cups' },
        { name: 'Greek yogurt', amount: 0.5, unit: 'cup' },
        { name: 'almond milk', amount: 1, unit: 'cup' },
        { name: 'honey', amount: 1, unit: 'tbsp' },
        { name: 'chia seeds', amount: 1, unit: 'tbsp' },
      ],
    },
    {
      authorId: user4.id,
      title: 'Tropical Mango Smoothie',
      description: 'Creamy tropical smoothie with mango, pineapple, and coconut',
      instructions: '1. Add frozen mango and pineapple\n2. Pour coconut milk\n3. Add banana for creaminess\n4. Blend until silky smooth\n5. Garnish with coconut flakes',
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['smoothies', 'tropical', 'mango', 'coconut'],
      images: ['https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400'],
      calories: 220,
      protein: 3,
      carbs: 42,
      fat: 6,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'frozen mango', amount: 1.5, unit: 'cups' },
        { name: 'pineapple chunks', amount: 0.5, unit: 'cup' },
        { name: 'coconut milk', amount: 1, unit: 'cup' },
        { name: 'banana', amount: 1, unit: 'whole' },
        { name: 'coconut flakes', amount: 2, unit: 'tbsp' },
      ],
    },
    {
      authorId: user1.id,
      title: 'Peanut Butter Banana Protein Smoothie',
      description: 'Filling post-workout smoothie packed with protein and healthy fats',
      instructions: '1. Add banana and peanut butter\n2. Pour in milk and protein powder\n3. Add cocoa if desired\n4. Blend until creamy\n5. Top with banana slices',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      difficulty: 'EASY' as const,
      cuisine: 'American',
      tags: ['smoothies', 'protein', 'post-workout', 'peanut-butter'],
      images: ['https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400'],
      calories: 380,
      protein: 28,
      carbs: 38,
      fat: 14,
      privacy: 'PUBLIC' as const,
      ingredients: [
        { name: 'banana', amount: 1, unit: 'whole' },
        { name: 'peanut butter', amount: 2, unit: 'tbsp' },
        { name: 'protein powder', amount: 1, unit: 'scoop' },
        { name: 'almond milk', amount: 1, unit: 'cup' },
        { name: 'cocoa powder', amount: 1, unit: 'tbsp' },
      ],
    },
  ];

  for (const recipe of sampleRecipes) {
    const { ingredients, ...recipeData } = recipe;
    await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: {
          create: ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          })),
        },
      },
    });
  }

  console.log('✅ Created 17 sample recipes (meals, breakfast, snacks, juices, smoothies)');

  console.log('\n========================================');
  console.log('🎉 Database seeded successfully!');
  console.log('========================================\n');
  console.log('📧 SAMPLE CREDENTIALS:');
  console.log('----------------------------------------');
  console.log('Demo Account (Premium):');
  console.log('  Email:    demo@nutriguide.com');
  console.log('  Password: password123');
  console.log('');
  console.log('John Smith (Premium, Family Owner):');
  console.log('  Email:    john@example.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Jane Smith (Family Admin):');
  console.log('  Email:    jane@example.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Mike Johnson (Family Owner):');
  console.log('  Email:    mike@example.com');
  console.log('  Password: password123');
  console.log('----------------------------------------');
  console.log('');
  console.log('📋 INVITE CODES:');
  console.log('  The Smith Family: SMITH123');
  console.log('  Healthy Eaters Club: HEALTH99');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
