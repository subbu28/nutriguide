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
