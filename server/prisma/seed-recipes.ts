import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const juiceRecipes = [
  {
    title: 'Classic Orange Juice',
    description: 'Fresh squeezed orange juice bursting with vitamin C',
    instructions: '1. Wash oranges\n2. Cut in half\n3. Juice using a citrus juicer\n4. Strain if desired\n5. Serve chilled',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'citrus', 'vitamin-c', 'breakfast'],
    images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'],
    calories: 112, protein: 2, carbs: 26, fat: 0,
    ingredients: [
      { name: 'oranges', amount: 4, unit: 'whole' },
      { name: 'ice cubes', amount: 4, unit: 'pieces' },
    ],
  },
  {
    title: 'Carrot Ginger Zinger',
    description: 'Energizing carrot juice with a spicy ginger kick',
    instructions: '1. Wash and peel carrots\n2. Cut ginger\n3. Juice carrots and ginger\n4. Add lemon juice\n5. Stir and serve',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'carrot', 'ginger', 'immune-boost'],
    images: ['https://images.unsplash.com/photo-1623428454614-abaf0c0e7bad?w=400'],
    calories: 95, protein: 2, carbs: 22, fat: 0,
    ingredients: [
      { name: 'carrots', amount: 6, unit: 'pieces' },
      { name: 'ginger root', amount: 2, unit: 'inch' },
      { name: 'lemon', amount: 0.5, unit: 'whole' },
    ],
  },
  {
    title: 'Beet Berry Blast',
    description: 'Vibrant beet juice with mixed berries for antioxidants',
    instructions: '1. Wash and peel beets\n2. Add berries to juicer\n3. Juice beets\n4. Mix together\n5. Add honey if desired',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'beet', 'berries', 'antioxidant'],
    images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'],
    calories: 130, protein: 3, carbs: 30, fat: 0,
    ingredients: [
      { name: 'beets', amount: 2, unit: 'medium' },
      { name: 'mixed berries', amount: 1, unit: 'cup' },
      { name: 'apple', amount: 1, unit: 'whole' },
    ],
  },
  {
    title: 'Cucumber Mint Cooler',
    description: 'Refreshing and hydrating cucumber juice with fresh mint',
    instructions: '1. Wash cucumber\n2. Add mint leaves\n3. Juice together\n4. Add lime juice\n5. Serve over ice',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'cucumber', 'mint', 'hydrating'],
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'],
    calories: 45, protein: 1, carbs: 10, fat: 0,
    ingredients: [
      { name: 'cucumber', amount: 2, unit: 'whole' },
      { name: 'fresh mint', amount: 0.25, unit: 'cup' },
      { name: 'lime', amount: 1, unit: 'whole' },
    ],
  },
  {
    title: 'Apple Celery Detox',
    description: 'Cleansing juice combining sweet apple with celery',
    instructions: '1. Wash all produce\n2. Cut apple into quarters\n3. Juice celery first\n4. Add apple\n5. Stir and serve',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'apple', 'celery', 'detox'],
    images: ['https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400'],
    calories: 85, protein: 1, carbs: 20, fat: 0,
    ingredients: [
      { name: 'green apples', amount: 2, unit: 'whole' },
      { name: 'celery stalks', amount: 6, unit: 'pieces' },
      { name: 'lemon', amount: 0.5, unit: 'whole' },
    ],
  },
  {
    title: 'Pineapple Paradise',
    description: 'Tropical pineapple juice with a hint of coconut',
    instructions: '1. Cut pineapple into chunks\n2. Juice pineapple\n3. Add coconut water\n4. Mix well\n5. Serve chilled',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'pineapple', 'tropical', 'coconut'],
    images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'],
    calories: 132, protein: 1, carbs: 33, fat: 0,
    ingredients: [
      { name: 'pineapple', amount: 0.5, unit: 'whole' },
      { name: 'coconut water', amount: 0.5, unit: 'cup' },
    ],
  },
  {
    title: 'Watermelon Refresher',
    description: 'Light and hydrating watermelon juice perfect for summer',
    instructions: '1. Cut watermelon into cubes\n2. Remove seeds\n3. Blend until smooth\n4. Strain if desired\n5. Add mint and serve',
    prepTime: 8, cookTime: 0, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'watermelon', 'summer', 'hydrating'],
    images: ['https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400'],
    calories: 46, protein: 1, carbs: 12, fat: 0,
    ingredients: [
      { name: 'watermelon', amount: 4, unit: 'cups' },
      { name: 'fresh mint', amount: 6, unit: 'leaves' },
      { name: 'lime', amount: 0.5, unit: 'whole' },
    ],
  },
  {
    title: 'Pomegranate Power',
    description: 'Rich antioxidant pomegranate juice with apple',
    instructions: '1. Remove pomegranate seeds\n2. Cut apple\n3. Juice together\n4. Strain well\n5. Serve fresh',
    prepTime: 15, cookTime: 0, servings: 2, difficulty: 'MEDIUM' as const,
    cuisine: 'American', tags: ['juices', 'pomegranate', 'antioxidant', 'healthy'],
    images: ['https://images.unsplash.com/photo-1541344999736-4a86d30c6e9f?w=400'],
    calories: 134, protein: 2, carbs: 32, fat: 1,
    ingredients: [
      { name: 'pomegranate', amount: 2, unit: 'whole' },
      { name: 'apple', amount: 1, unit: 'whole' },
    ],
  },
  {
    title: 'Kale Spinach Green Machine',
    description: 'Nutrient-dense green juice for energy and vitality',
    instructions: '1. Wash greens thoroughly\n2. Juice kale and spinach\n3. Add cucumber and apple\n4. Mix with lemon\n5. Drink immediately',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'green', 'kale', 'spinach', 'healthy'],
    images: ['https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400'],
    calories: 78, protein: 3, carbs: 18, fat: 0,
    ingredients: [
      { name: 'kale', amount: 2, unit: 'cups' },
      { name: 'spinach', amount: 2, unit: 'cups' },
      { name: 'cucumber', amount: 1, unit: 'whole' },
      { name: 'green apple', amount: 1, unit: 'whole' },
    ],
  },
  {
    title: 'Grapefruit Sunrise',
    description: 'Tangy grapefruit juice with orange for a citrus burst',
    instructions: '1. Halve grapefruits\n2. Juice grapefruits\n3. Add orange juice\n4. Sweeten with honey\n5. Serve chilled',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'grapefruit', 'citrus', 'breakfast'],
    images: ['https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400'],
    calories: 96, protein: 2, carbs: 24, fat: 0,
    ingredients: [
      { name: 'grapefruit', amount: 2, unit: 'whole' },
      { name: 'orange', amount: 1, unit: 'whole' },
      { name: 'honey', amount: 1, unit: 'tsp' },
    ],
  },
  {
    title: 'Tomato Veggie Juice',
    description: 'Savory tomato juice with celery and herbs',
    instructions: '1. Wash all vegetables\n2. Quarter tomatoes\n3. Juice all vegetables\n4. Season with salt and pepper\n5. Add hot sauce if desired',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'tomato', 'savory', 'vegetable'],
    images: ['https://images.unsplash.com/photo-1623227866882-c005c26dfe41?w=400'],
    calories: 52, protein: 2, carbs: 11, fat: 0,
    ingredients: [
      { name: 'tomatoes', amount: 4, unit: 'whole' },
      { name: 'celery', amount: 2, unit: 'stalks' },
      { name: 'bell pepper', amount: 0.5, unit: 'whole' },
    ],
  },
  {
    title: 'Mango Lassi Juice',
    description: 'Indian-inspired mango juice with a creamy twist',
    instructions: '1. Peel and pit mangoes\n2. Juice mangoes\n3. Mix with yogurt\n4. Add cardamom\n5. Blend until smooth',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'Indian', tags: ['juices', 'mango', 'lassi', 'creamy'],
    images: ['https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400'],
    calories: 165, protein: 4, carbs: 35, fat: 2,
    ingredients: [
      { name: 'mangoes', amount: 2, unit: 'whole' },
      { name: 'yogurt', amount: 0.5, unit: 'cup' },
      { name: 'cardamom', amount: 0.25, unit: 'tsp' },
    ],
  },
  {
    title: 'Lemon Ginger Shot',
    description: 'Intense immunity-boosting shot with lemon and ginger',
    instructions: '1. Juice lemons\n2. Juice fresh ginger\n3. Add cayenne pepper\n4. Mix with honey\n5. Take as a shot',
    prepTime: 5, cookTime: 0, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'shot', 'immunity', 'ginger'],
    images: ['https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=400'],
    calories: 25, protein: 0, carbs: 7, fat: 0,
    ingredients: [
      { name: 'lemons', amount: 2, unit: 'whole' },
      { name: 'ginger', amount: 3, unit: 'inch' },
      { name: 'cayenne', amount: 0.125, unit: 'tsp' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Peach Nectar Delight',
    description: 'Sweet and velvety peach juice with vanilla',
    instructions: '1. Wash and pit peaches\n2. Juice peaches\n3. Add vanilla extract\n4. Sweeten to taste\n5. Serve cold',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'peach', 'sweet', 'summer'],
    images: ['https://images.unsplash.com/photo-1546548970-71785318a17b?w=400'],
    calories: 98, protein: 2, carbs: 24, fat: 0,
    ingredients: [
      { name: 'peaches', amount: 4, unit: 'whole' },
      { name: 'vanilla extract', amount: 0.25, unit: 'tsp' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Cranberry Apple Twist',
    description: 'Tart cranberry juice balanced with sweet apple',
    instructions: '1. Wash cranberries and apples\n2. Juice cranberries first\n3. Add apple juice\n4. Mix together\n5. Sweeten if needed',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'cranberry', 'apple', 'tart'],
    images: ['https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400'],
    calories: 115, protein: 1, carbs: 29, fat: 0,
    ingredients: [
      { name: 'cranberries', amount: 1, unit: 'cup' },
      { name: 'apples', amount: 3, unit: 'whole' },
      { name: 'lemon', amount: 0.5, unit: 'whole' },
    ],
  },
  {
    title: 'Turmeric Golden Milk Juice',
    description: 'Anti-inflammatory turmeric juice with warming spices',
    instructions: '1. Juice turmeric and ginger\n2. Mix with orange juice\n3. Add black pepper\n4. Stir in honey\n5. Drink warm or cold',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'Indian', tags: ['juices', 'turmeric', 'anti-inflammatory', 'golden'],
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400'],
    calories: 72, protein: 1, carbs: 17, fat: 0,
    ingredients: [
      { name: 'turmeric root', amount: 2, unit: 'inch' },
      { name: 'ginger', amount: 1, unit: 'inch' },
      { name: 'orange', amount: 2, unit: 'whole' },
      { name: 'black pepper', amount: 0.125, unit: 'tsp' },
    ],
  },
  {
    title: 'Passion Fruit Punch',
    description: 'Exotic passion fruit juice with citrus notes',
    instructions: '1. Cut passion fruits in half\n2. Scoop out pulp\n3. Blend with orange juice\n4. Strain seeds\n5. Serve chilled',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['juices', 'passion-fruit', 'tropical', 'exotic'],
    images: ['https://images.unsplash.com/photo-1546173159-315724a31696?w=400'],
    calories: 97, protein: 2, carbs: 23, fat: 1,
    ingredients: [
      { name: 'passion fruit', amount: 4, unit: 'whole' },
      { name: 'orange juice', amount: 1, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
];

const smoothieRecipes = [
  {
    title: 'Classic Strawberry Banana',
    description: 'Timeless combination of sweet strawberries and creamy banana',
    instructions: '1. Add frozen strawberries\n2. Add banana\n3. Pour in milk\n4. Blend until smooth\n5. Pour and enjoy',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'strawberry', 'banana', 'classic'],
    images: ['https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400'],
    calories: 185, protein: 5, carbs: 38, fat: 2,
    ingredients: [
      { name: 'frozen strawberries', amount: 1.5, unit: 'cups' },
      { name: 'banana', amount: 1, unit: 'whole' },
      { name: 'milk', amount: 1, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Green Power Smoothie',
    description: 'Nutrient-packed green smoothie with spinach and avocado',
    instructions: '1. Add spinach first\n2. Add banana and avocado\n3. Pour almond milk\n4. Blend until creamy\n5. Add more liquid if needed',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'green', 'healthy', 'spinach'],
    images: ['https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400'],
    calories: 220, protein: 6, carbs: 28, fat: 10,
    ingredients: [
      { name: 'spinach', amount: 2, unit: 'cups' },
      { name: 'avocado', amount: 0.5, unit: 'whole' },
      { name: 'banana', amount: 1, unit: 'whole' },
      { name: 'almond milk', amount: 1.5, unit: 'cups' },
    ],
  },
  {
    title: 'Chocolate Peanut Butter Dream',
    description: 'Indulgent chocolate smoothie with rich peanut butter',
    instructions: '1. Add frozen banana\n2. Add cocoa and peanut butter\n3. Pour milk\n4. Blend until thick\n5. Top with cocoa nibs',
    prepTime: 5, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'chocolate', 'peanut-butter', 'indulgent'],
    images: ['https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400'],
    calories: 380, protein: 14, carbs: 42, fat: 18,
    ingredients: [
      { name: 'frozen banana', amount: 1, unit: 'whole' },
      { name: 'peanut butter', amount: 2, unit: 'tbsp' },
      { name: 'cocoa powder', amount: 2, unit: 'tbsp' },
      { name: 'milk', amount: 1, unit: 'cup' },
    ],
  },
  {
    title: 'Blueberry Antioxidant Blast',
    description: 'Superfood blueberry smoothie loaded with antioxidants',
    instructions: '1. Add frozen blueberries\n2. Add yogurt\n3. Pour juice\n4. Blend smooth\n5. Sprinkle with granola',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'blueberry', 'antioxidant', 'superfood'],
    images: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400'],
    calories: 165, protein: 7, carbs: 32, fat: 2,
    ingredients: [
      { name: 'frozen blueberries', amount: 1.5, unit: 'cups' },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup' },
      { name: 'apple juice', amount: 0.5, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Mango Coconut Paradise',
    description: 'Tropical escape with creamy mango and coconut',
    instructions: '1. Add frozen mango chunks\n2. Pour coconut milk\n3. Add lime juice\n4. Blend until silky\n5. Garnish with coconut',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'mango', 'coconut', 'tropical'],
    images: ['https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400'],
    calories: 245, protein: 3, carbs: 38, fat: 10,
    ingredients: [
      { name: 'frozen mango', amount: 2, unit: 'cups' },
      { name: 'coconut milk', amount: 1, unit: 'cup' },
      { name: 'lime juice', amount: 1, unit: 'tbsp' },
      { name: 'shredded coconut', amount: 2, unit: 'tbsp' },
    ],
  },
  {
    title: 'Acai Berry Bowl Smoothie',
    description: 'Brazilian superfood acai blended thick for a bowl',
    instructions: '1. Add frozen acai packet\n2. Add mixed berries\n3. Pour juice\n4. Blend thick\n5. Top with granola and fruit',
    prepTime: 8, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'acai', 'bowl', 'superfood'],
    images: ['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400'],
    calories: 295, protein: 5, carbs: 58, fat: 6,
    ingredients: [
      { name: 'frozen acai', amount: 1, unit: 'packet' },
      { name: 'mixed berries', amount: 0.5, unit: 'cup' },
      { name: 'apple juice', amount: 0.25, unit: 'cup' },
      { name: 'granola', amount: 0.25, unit: 'cup' },
    ],
  },
  {
    title: 'Peach Oat Breakfast Smoothie',
    description: 'Filling breakfast smoothie with oats and peaches',
    instructions: '1. Soak oats briefly\n2. Add frozen peaches\n3. Add yogurt and milk\n4. Blend until smooth\n5. Add cinnamon on top',
    prepTime: 7, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'peach', 'breakfast', 'oats'],
    images: ['https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400'],
    calories: 285, protein: 12, carbs: 48, fat: 5,
    ingredients: [
      { name: 'frozen peaches', amount: 1, unit: 'cup' },
      { name: 'rolled oats', amount: 0.25, unit: 'cup' },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup' },
      { name: 'milk', amount: 0.5, unit: 'cup' },
    ],
  },
  {
    title: 'Cherry Almond Delight',
    description: 'Sweet cherry smoothie with almond butter richness',
    instructions: '1. Add frozen cherries\n2. Add almond butter\n3. Pour almond milk\n4. Blend until creamy\n5. Top with sliced almonds',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'cherry', 'almond', 'nutty'],
    images: ['https://images.unsplash.com/photo-1546548970-71785318a17b?w=400'],
    calories: 265, protein: 8, carbs: 32, fat: 12,
    ingredients: [
      { name: 'frozen cherries', amount: 1.5, unit: 'cups' },
      { name: 'almond butter', amount: 2, unit: 'tbsp' },
      { name: 'almond milk', amount: 1, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Raspberry Lemonade Smoothie',
    description: 'Refreshing tangy raspberry smoothie with lemon',
    instructions: '1. Add frozen raspberries\n2. Squeeze fresh lemon\n3. Add yogurt\n4. Blend smooth\n5. Sweeten to taste',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'raspberry', 'lemonade', 'refreshing'],
    images: ['https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400'],
    calories: 145, protein: 6, carbs: 28, fat: 2,
    ingredients: [
      { name: 'frozen raspberries', amount: 1.5, unit: 'cups' },
      { name: 'lemon juice', amount: 2, unit: 'tbsp' },
      { name: 'vanilla yogurt', amount: 0.5, unit: 'cup' },
      { name: 'honey', amount: 2, unit: 'tbsp' },
    ],
  },
  {
    title: 'Vanilla Protein Power',
    description: 'High-protein post-workout vanilla smoothie',
    instructions: '1. Add protein powder\n2. Add banana\n3. Pour milk\n4. Add vanilla\n5. Blend and drink',
    prepTime: 3, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'protein', 'vanilla', 'workout'],
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400'],
    calories: 320, protein: 32, carbs: 35, fat: 6,
    ingredients: [
      { name: 'vanilla protein powder', amount: 1, unit: 'scoop' },
      { name: 'banana', amount: 1, unit: 'whole' },
      { name: 'milk', amount: 1, unit: 'cup' },
      { name: 'vanilla extract', amount: 0.5, unit: 'tsp' },
    ],
  },
  {
    title: 'Pineapple Ginger Zing',
    description: 'Tropical pineapple smoothie with digestive ginger',
    instructions: '1. Add frozen pineapple\n2. Grate fresh ginger\n3. Add coconut water\n4. Blend until smooth\n5. Add mint garnish',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'pineapple', 'ginger', 'digestive'],
    images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'],
    calories: 135, protein: 1, carbs: 34, fat: 0,
    ingredients: [
      { name: 'frozen pineapple', amount: 2, unit: 'cups' },
      { name: 'fresh ginger', amount: 1, unit: 'inch' },
      { name: 'coconut water', amount: 1, unit: 'cup' },
    ],
  },
  {
    title: 'Kiwi Spinach Refresher',
    description: 'Vibrant green smoothie with tangy kiwi flavor',
    instructions: '1. Peel and slice kiwis\n2. Add spinach\n3. Add banana\n4. Pour juice\n5. Blend until green',
    prepTime: 7, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'kiwi', 'spinach', 'green'],
    images: ['https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400'],
    calories: 155, protein: 3, carbs: 36, fat: 1,
    ingredients: [
      { name: 'kiwis', amount: 3, unit: 'whole' },
      { name: 'spinach', amount: 1, unit: 'cup' },
      { name: 'banana', amount: 1, unit: 'whole' },
      { name: 'apple juice', amount: 0.5, unit: 'cup' },
    ],
  },
  {
    title: 'Coffee Mocha Energizer',
    description: 'Caffeinated smoothie with espresso and chocolate',
    instructions: '1. Brew and chill espresso\n2. Add frozen banana\n3. Add cocoa powder\n4. Pour milk\n5. Blend until frothy',
    prepTime: 8, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'coffee', 'mocha', 'energy'],
    images: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'],
    calories: 195, protein: 6, carbs: 32, fat: 5,
    ingredients: [
      { name: 'espresso', amount: 1, unit: 'shot' },
      { name: 'frozen banana', amount: 1, unit: 'whole' },
      { name: 'cocoa powder', amount: 1, unit: 'tbsp' },
      { name: 'milk', amount: 0.75, unit: 'cup' },
    ],
  },
  {
    title: 'Cantaloupe Cream Dream',
    description: 'Light and refreshing cantaloupe melon smoothie',
    instructions: '1. Cube fresh cantaloupe\n2. Add vanilla yogurt\n3. Add honey\n4. Blend smooth\n5. Serve chilled',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'cantaloupe', 'melon', 'light'],
    images: ['https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400'],
    calories: 125, protein: 5, carbs: 25, fat: 1,
    ingredients: [
      { name: 'cantaloupe', amount: 2, unit: 'cups' },
      { name: 'vanilla yogurt', amount: 0.5, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
      { name: 'ice', amount: 0.5, unit: 'cup' },
    ],
  },
  {
    title: 'Apple Pie Smoothie',
    description: 'Tastes like apple pie in a glass with warm spices',
    instructions: '1. Add diced apple\n2. Add oats and spices\n3. Pour milk\n4. Add vanilla\n5. Blend until smooth',
    prepTime: 5, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'apple', 'pie', 'cinnamon'],
    images: ['https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400'],
    calories: 225, protein: 8, carbs: 42, fat: 4,
    ingredients: [
      { name: 'apple', amount: 1, unit: 'whole' },
      { name: 'rolled oats', amount: 0.25, unit: 'cup' },
      { name: 'cinnamon', amount: 0.5, unit: 'tsp' },
      { name: 'milk', amount: 1, unit: 'cup' },
      { name: 'vanilla', amount: 0.5, unit: 'tsp' },
    ],
  },
  {
    title: 'Blackberry Lavender Bliss',
    description: 'Unique floral smoothie with blackberries and lavender',
    instructions: '1. Add frozen blackberries\n2. Add dried lavender\n3. Pour milk\n4. Blend until purple\n5. Strain if desired',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'MEDIUM' as const,
    cuisine: 'American', tags: ['smoothies', 'blackberry', 'lavender', 'floral'],
    images: ['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400'],
    calories: 145, protein: 4, carbs: 28, fat: 2,
    ingredients: [
      { name: 'frozen blackberries', amount: 1.5, unit: 'cups' },
      { name: 'dried lavender', amount: 0.5, unit: 'tsp' },
      { name: 'milk', amount: 1, unit: 'cup' },
      { name: 'honey', amount: 2, unit: 'tbsp' },
    ],
  },
  {
    title: 'Papaya Lime Tropical',
    description: 'Exotic papaya smoothie with zesty lime',
    instructions: '1. Scoop papaya flesh\n2. Add lime juice\n3. Pour coconut milk\n4. Blend smooth\n5. Garnish with lime',
    prepTime: 8, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['smoothies', 'papaya', 'lime', 'tropical'],
    images: ['https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400'],
    calories: 175, protein: 2, carbs: 32, fat: 6,
    ingredients: [
      { name: 'papaya', amount: 2, unit: 'cups' },
      { name: 'lime juice', amount: 2, unit: 'tbsp' },
      { name: 'coconut milk', amount: 0.75, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
];

const snackRecipes = [
  {
    title: 'Classic Hummus',
    description: 'Creamy chickpea dip with tahini and garlic',
    instructions: '1. Drain chickpeas\n2. Blend with tahini and garlic\n3. Add lemon juice\n4. Drizzle olive oil\n5. Season and serve',
    prepTime: 10, cookTime: 0, servings: 8, difficulty: 'EASY' as const,
    cuisine: 'Mediterranean', tags: ['snacks', 'hummus', 'dip', 'healthy'],
    images: ['https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400'],
    calories: 166, protein: 8, carbs: 14, fat: 10,
    ingredients: [
      { name: 'chickpeas', amount: 2, unit: 'cans' },
      { name: 'tahini', amount: 0.25, unit: 'cup' },
      { name: 'garlic', amount: 2, unit: 'cloves' },
      { name: 'lemon juice', amount: 3, unit: 'tbsp' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
    ],
  },
  {
    title: 'Guacamole',
    description: 'Fresh avocado dip with lime and cilantro',
    instructions: '1. Mash avocados\n2. Dice onion and tomato\n3. Chop cilantro\n4. Add lime juice\n5. Season and mix',
    prepTime: 10, cookTime: 0, servings: 6, difficulty: 'EASY' as const,
    cuisine: 'Mexican', tags: ['snacks', 'guacamole', 'avocado', 'dip'],
    images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400'],
    calories: 150, protein: 2, carbs: 8, fat: 13,
    ingredients: [
      { name: 'avocados', amount: 3, unit: 'whole' },
      { name: 'lime', amount: 1, unit: 'whole' },
      { name: 'red onion', amount: 0.25, unit: 'cup' },
      { name: 'tomato', amount: 1, unit: 'whole' },
      { name: 'cilantro', amount: 0.25, unit: 'cup' },
    ],
  },
  {
    title: 'Trail Mix Energy Bites',
    description: 'No-bake bites with nuts, seeds, and dried fruit',
    instructions: '1. Mix oats and nut butter\n2. Add honey and seeds\n3. Fold in dried fruit\n4. Roll into balls\n5. Refrigerate 1 hour',
    prepTime: 15, cookTime: 0, servings: 12, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'energy', 'no-bake', 'trail-mix'],
    images: ['https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'],
    calories: 125, protein: 4, carbs: 16, fat: 6,
    ingredients: [
      { name: 'rolled oats', amount: 1, unit: 'cup' },
      { name: 'almond butter', amount: 0.5, unit: 'cup' },
      { name: 'honey', amount: 3, unit: 'tbsp' },
      { name: 'mixed seeds', amount: 0.25, unit: 'cup' },
      { name: 'dried cranberries', amount: 0.25, unit: 'cup' },
    ],
  },
  {
    title: 'Caprese Skewers',
    description: 'Italian appetizer with tomato, mozzarella, and basil',
    instructions: '1. Cut mozzarella into cubes\n2. Halve cherry tomatoes\n3. Thread on skewers\n4. Add basil leaves\n5. Drizzle with balsamic',
    prepTime: 15, cookTime: 0, servings: 6, difficulty: 'EASY' as const,
    cuisine: 'Italian', tags: ['snacks', 'caprese', 'italian', 'appetizer'],
    images: ['https://images.unsplash.com/photo-1608877907149-a206d75ba011?w=400'],
    calories: 95, protein: 6, carbs: 3, fat: 7,
    ingredients: [
      { name: 'fresh mozzarella', amount: 8, unit: 'oz' },
      { name: 'cherry tomatoes', amount: 1, unit: 'pint' },
      { name: 'fresh basil', amount: 24, unit: 'leaves' },
      { name: 'balsamic glaze', amount: 2, unit: 'tbsp' },
    ],
  },
  {
    title: 'Spiced Roasted Almonds',
    description: 'Crunchy roasted almonds with warming spices',
    instructions: '1. Toss almonds with oil\n2. Add spices\n3. Spread on baking sheet\n4. Roast at 350°F 15 mins\n5. Cool before serving',
    prepTime: 5, cookTime: 15, servings: 8, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'almonds', 'roasted', 'spiced'],
    images: ['https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400'],
    calories: 170, protein: 6, carbs: 6, fat: 15,
    ingredients: [
      { name: 'raw almonds', amount: 2, unit: 'cups' },
      { name: 'olive oil', amount: 1, unit: 'tbsp' },
      { name: 'cumin', amount: 1, unit: 'tsp' },
      { name: 'paprika', amount: 0.5, unit: 'tsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
    ],
  },
  {
    title: 'Greek Yogurt Parfait',
    description: 'Layered yogurt with granola and fresh berries',
    instructions: '1. Spoon yogurt in glass\n2. Add granola layer\n3. Add berry layer\n4. Repeat layers\n5. Drizzle with honey',
    prepTime: 5, cookTime: 0, servings: 1, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'yogurt', 'parfait', 'healthy'],
    images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'],
    calories: 285, protein: 18, carbs: 38, fat: 7,
    ingredients: [
      { name: 'Greek yogurt', amount: 1, unit: 'cup' },
      { name: 'granola', amount: 0.33, unit: 'cup' },
      { name: 'mixed berries', amount: 0.5, unit: 'cup' },
      { name: 'honey', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Bruschetta',
    description: 'Toasted bread topped with tomatoes and basil',
    instructions: '1. Dice tomatoes\n2. Mix with garlic and basil\n3. Toast baguette slices\n4. Rub with garlic\n5. Top and drizzle oil',
    prepTime: 15, cookTime: 5, servings: 6, difficulty: 'EASY' as const,
    cuisine: 'Italian', tags: ['snacks', 'bruschetta', 'italian', 'appetizer'],
    images: ['https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400'],
    calories: 120, protein: 3, carbs: 18, fat: 4,
    ingredients: [
      { name: 'baguette', amount: 1, unit: 'whole' },
      { name: 'tomatoes', amount: 4, unit: 'whole' },
      { name: 'garlic', amount: 3, unit: 'cloves' },
      { name: 'fresh basil', amount: 0.25, unit: 'cup' },
      { name: 'olive oil', amount: 3, unit: 'tbsp' },
    ],
  },
  {
    title: 'Veggie Sticks with Ranch',
    description: 'Fresh cut vegetables with creamy ranch dip',
    instructions: '1. Cut vegetables into sticks\n2. Mix ranch ingredients\n3. Season to taste\n4. Arrange veggies on platter\n5. Serve with dip',
    prepTime: 15, cookTime: 0, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'vegetables', 'ranch', 'healthy'],
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'],
    calories: 145, protein: 3, carbs: 12, fat: 10,
    ingredients: [
      { name: 'carrots', amount: 4, unit: 'whole' },
      { name: 'celery', amount: 4, unit: 'stalks' },
      { name: 'cucumber', amount: 1, unit: 'whole' },
      { name: 'Greek yogurt', amount: 0.5, unit: 'cup' },
      { name: 'ranch seasoning', amount: 1, unit: 'tbsp' },
    ],
  },
  {
    title: 'Edamame with Sea Salt',
    description: 'Steamed soybeans with flaky sea salt',
    instructions: '1. Boil salted water\n2. Cook edamame 5 mins\n3. Drain well\n4. Toss with oil\n5. Sprinkle sea salt',
    prepTime: 2, cookTime: 5, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'Asian', tags: ['snacks', 'edamame', 'healthy', 'protein'],
    images: ['https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=400'],
    calories: 120, protein: 11, carbs: 9, fat: 5,
    ingredients: [
      { name: 'frozen edamame', amount: 1, unit: 'lb' },
      { name: 'sea salt', amount: 1, unit: 'tsp' },
      { name: 'sesame oil', amount: 1, unit: 'tsp' },
    ],
  },
  {
    title: 'Apple Nachos',
    description: 'Sliced apples with peanut butter and toppings',
    instructions: '1. Slice apples thin\n2. Arrange on plate\n3. Drizzle peanut butter\n4. Add chocolate chips\n5. Sprinkle granola',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'apple', 'sweet', 'fun'],
    images: ['https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400'],
    calories: 245, protein: 6, carbs: 38, fat: 10,
    ingredients: [
      { name: 'apples', amount: 2, unit: 'whole' },
      { name: 'peanut butter', amount: 3, unit: 'tbsp' },
      { name: 'chocolate chips', amount: 2, unit: 'tbsp' },
      { name: 'granola', amount: 0.25, unit: 'cup' },
    ],
  },
  {
    title: 'Cheese Quesadilla Bites',
    description: 'Mini quesadilla triangles with melted cheese',
    instructions: '1. Place cheese on tortilla\n2. Fold in half\n3. Cook until golden\n4. Cut into triangles\n5. Serve with salsa',
    prepTime: 5, cookTime: 8, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'Mexican', tags: ['snacks', 'quesadilla', 'cheese', 'quick'],
    images: ['https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400'],
    calories: 195, protein: 9, carbs: 18, fat: 10,
    ingredients: [
      { name: 'flour tortillas', amount: 4, unit: 'whole' },
      { name: 'shredded cheese', amount: 1, unit: 'cup' },
      { name: 'salsa', amount: 0.5, unit: 'cup' },
    ],
  },
  {
    title: 'Stuffed Dates',
    description: 'Medjool dates filled with almond butter and nuts',
    instructions: '1. Pit the dates\n2. Fill with almond butter\n3. Top with almonds\n4. Sprinkle sea salt\n5. Chill if desired',
    prepTime: 10, cookTime: 0, servings: 6, difficulty: 'EASY' as const,
    cuisine: 'Mediterranean', tags: ['snacks', 'dates', 'sweet', 'energy'],
    images: ['https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'],
    calories: 165, protein: 3, carbs: 28, fat: 6,
    ingredients: [
      { name: 'Medjool dates', amount: 12, unit: 'pieces' },
      { name: 'almond butter', amount: 3, unit: 'tbsp' },
      { name: 'almonds', amount: 12, unit: 'pieces' },
      { name: 'sea salt', amount: 0.125, unit: 'tsp' },
    ],
  },
  {
    title: 'Cucumber Bites',
    description: 'Cool cucumber rounds with cream cheese and dill',
    instructions: '1. Slice cucumber thick\n2. Top with cream cheese\n3. Add smoked salmon\n4. Garnish with dill\n5. Season with pepper',
    prepTime: 15, cookTime: 0, servings: 8, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'cucumber', 'light', 'elegant'],
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'],
    calories: 45, protein: 3, carbs: 2, fat: 3,
    ingredients: [
      { name: 'cucumber', amount: 2, unit: 'whole' },
      { name: 'cream cheese', amount: 4, unit: 'oz' },
      { name: 'smoked salmon', amount: 4, unit: 'oz' },
      { name: 'fresh dill', amount: 2, unit: 'tbsp' },
    ],
  },
  {
    title: 'Popcorn Three Ways',
    description: 'Air-popped popcorn with savory seasonings',
    instructions: '1. Pop the popcorn\n2. Drizzle with butter\n3. Add your choice of seasoning\n4. Toss to coat\n5. Serve warm',
    prepTime: 3, cookTime: 5, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'popcorn', 'movie-night', 'savory'],
    images: ['https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400'],
    calories: 95, protein: 2, carbs: 15, fat: 4,
    ingredients: [
      { name: 'popcorn kernels', amount: 0.5, unit: 'cup' },
      { name: 'butter', amount: 2, unit: 'tbsp' },
      { name: 'salt', amount: 0.5, unit: 'tsp' },
    ],
  },
  {
    title: 'Zucchini Chips',
    description: 'Crispy baked zucchini rounds with parmesan',
    instructions: '1. Slice zucchini thin\n2. Coat with egg wash\n3. Dip in parmesan mix\n4. Bake at 425°F 25 mins\n5. Serve crispy',
    prepTime: 15, cookTime: 25, servings: 4, difficulty: 'MEDIUM' as const,
    cuisine: 'American', tags: ['snacks', 'zucchini', 'chips', 'healthy'],
    images: ['https://images.unsplash.com/photo-1515543904323-de53ea5ad4c8?w=400'],
    calories: 85, protein: 5, carbs: 6, fat: 5,
    ingredients: [
      { name: 'zucchini', amount: 2, unit: 'whole' },
      { name: 'parmesan', amount: 0.5, unit: 'cup' },
      { name: 'breadcrumbs', amount: 0.25, unit: 'cup' },
      { name: 'egg', amount: 1, unit: 'whole' },
    ],
  },
  {
    title: 'Ants on a Log',
    description: 'Classic celery with peanut butter and raisins',
    instructions: '1. Wash and cut celery\n2. Fill with peanut butter\n3. Place raisins on top\n4. Arrange on plate\n5. Serve immediately',
    prepTime: 10, cookTime: 0, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'kids', 'celery', 'classic'],
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'],
    calories: 155, protein: 5, carbs: 18, fat: 8,
    ingredients: [
      { name: 'celery stalks', amount: 8, unit: 'pieces' },
      { name: 'peanut butter', amount: 0.5, unit: 'cup' },
      { name: 'raisins', amount: 0.25, unit: 'cup' },
    ],
  },
  {
    title: 'Sweet Potato Fries',
    description: 'Crispy baked sweet potato fries with dipping sauce',
    instructions: '1. Cut sweet potatoes\n2. Toss with oil and spices\n3. Spread on baking sheet\n4. Bake at 425°F 25 mins\n5. Flip halfway',
    prepTime: 15, cookTime: 25, servings: 4, difficulty: 'EASY' as const,
    cuisine: 'American', tags: ['snacks', 'sweet-potato', 'fries', 'baked'],
    images: ['https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400'],
    calories: 165, protein: 2, carbs: 28, fat: 5,
    ingredients: [
      { name: 'sweet potatoes', amount: 2, unit: 'large' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
      { name: 'paprika', amount: 1, unit: 'tsp' },
      { name: 'garlic powder', amount: 0.5, unit: 'tsp' },
    ],
  },
];

async function main() {
  console.log('🍹 Adding 50+ Juices, Smoothies, and Snacks to database...\n');

  // Get a user to assign as author
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found. Please run the main seed first.');
    process.exit(1);
  }

  const allRecipes = [
    ...juiceRecipes,
    ...smoothieRecipes,
    ...snackRecipes,
  ];

  let created = 0;
  for (const recipe of allRecipes) {
    const { ingredients, ...recipeData } = recipe;
    
    // Check if recipe already exists
    const existing = await prisma.recipe.findFirst({
      where: { title: recipe.title },
    });
    
    if (existing) {
      console.log(`⏭️  Skipping "${recipe.title}" (already exists)`);
      continue;
    }
    
    await prisma.recipe.create({
      data: {
        ...recipeData,
        authorId: user.id,
        privacy: 'PUBLIC',
        ingredients: {
          create: ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          })),
        },
      },
    });
    created++;
    console.log(`✅ Created: ${recipe.title}`);
  }

  console.log(`\n========================================`);
  console.log(`🎉 Added ${created} new recipes!`);
  console.log(`   - Juices: ${juiceRecipes.length}`);
  console.log(`   - Smoothies: ${smoothieRecipes.length}`);
  console.log(`   - Snacks: ${snackRecipes.length}`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
