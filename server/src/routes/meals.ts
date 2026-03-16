import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config/index.js';
import * as MealDB from '../services/mealdb.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Juices';
type DietType = 'Vegetarian' | 'Non-Vegetarian';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for MealDB data
const mealCache = new Map<string, { meals: any[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (reduced for freshness)

async function generateMealImage(mealName: string, description: string, retryCount = 0): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: {
        parts: [{
          text: `A high-quality, professional food photography shot of ${mealName}. ${description}. Bright natural lighting, delicious and healthy appearance. Clean white background.`,
        }],
      },
      config: {
        responseModalities: ['image', 'text'],
      } as any,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('429')) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000 + Math.random() * 1000;
        await sleep(delay);
        return generateMealImage(mealName, description, retryCount + 1);
      }
    }
    console.error(`Error generating image for ${mealName}:`, error);
  }
  return undefined;
}

function getRotationIndex(): number {
  const referenceDate = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
  return Math.floor((now - referenceDate) / twoWeeksInMs);
}

// Static recipes database for fallback when Gemini is not configured
function getStaticRecipes(cuisine: string, category: string, dietType: string): any[] {
  const recipes: Record<string, Record<string, Record<string, any[]>>> = {
    British: {
      Vegetarian: {
        Breakfast: [
          { name: 'Vegetarian Full English', description: 'Classic breakfast with veggie sausages, beans, grilled tomatoes, mushrooms', calories: 450, protein: '18g', benefits: ['High fiber', 'Good protein', 'Sustained energy'], 
            imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
            ingredients: [{ name: 'Veggie sausages', measure: '2 pieces' }, { name: 'Baked beans', measure: '200g' }, { name: 'Cherry tomatoes', measure: '6 pieces' }, { name: 'Mushrooms', measure: '100g' }, { name: 'Toast', measure: '2 slices' }, { name: 'Olive oil', measure: '1 tbsp' }],
            instructions: ['Heat olive oil in a large pan over medium heat', 'Add veggie sausages and cook for 8-10 minutes, turning occasionally until golden', 'Meanwhile, halve the tomatoes and add to the pan, cooking cut-side down for 3 minutes', 'Add sliced mushrooms to the pan and cook until softened, about 5 minutes', 'Heat baked beans in a small saucepan until bubbling', 'Toast the bread until golden brown', 'Arrange everything on a warm plate and serve immediately'] },
          { name: 'Eggs Benedict Florentine', description: 'Poached eggs on muffin with spinach and hollandaise', calories: 380, protein: '16g', benefits: ['High protein', 'Rich in iron', 'Good fats'],
            imageUrl: 'https://images.unsplash.com/photo-1608039829572-f56e0f5e5e22?w=800',
            ingredients: [{ name: 'English muffin', measure: '1 whole' }, { name: 'Eggs', measure: '2 large' }, { name: 'Fresh spinach', measure: '100g' }, { name: 'Butter', measure: '100g' }, { name: 'Egg yolks', measure: '2 for sauce' }, { name: 'Lemon juice', measure: '1 tbsp' }, { name: 'White vinegar', measure: '1 tbsp' }],
            instructions: ['Make hollandaise: melt butter, whisk egg yolks with lemon juice over double boiler, slowly drizzle in butter whisking constantly', 'Wilt spinach in a pan with a little butter, season with salt and pepper', 'Split and toast the English muffin halves', 'Bring a pot of water to simmer, add vinegar, create a whirlpool and gently drop eggs in', 'Poach eggs for 3 minutes for runny yolks', 'Place spinach on muffin halves, top with poached eggs', 'Spoon hollandaise sauce over and serve immediately'] },
          { name: 'Welsh Rarebit', description: 'Savory cheese sauce on toast with mustard', calories: 320, protein: '14g', benefits: ['High calcium', 'Good protein', 'Comfort food'],
            imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800',
            ingredients: [{ name: 'Mature cheddar', measure: '200g grated' }, { name: 'Thick bread slices', measure: '2 pieces' }, { name: 'English mustard', measure: '1 tsp' }, { name: 'Worcestershire sauce', measure: '1 tsp' }, { name: 'Butter', measure: '25g' }, { name: 'Flour', measure: '25g' }, { name: 'Milk', measure: '100ml' }, { name: 'Ale or beer', measure: '2 tbsp' }],
            instructions: ['Melt butter in a saucepan, stir in flour to make a roux', 'Gradually add milk, stirring constantly until smooth', 'Add ale, mustard, and Worcestershire sauce', 'Remove from heat and stir in grated cheese until melted', 'Toast bread on one side under the grill', 'Turn bread over and spread cheese mixture on untoasted side', 'Grill until bubbling and golden brown', 'Serve immediately while hot and melty'] },
          { name: 'Porridge with Berries', description: 'Creamy Scottish oats with honey and fresh berries', calories: 280, protein: '8g', benefits: ['Heart healthy', 'High fiber', 'Sustained energy'],
            imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800',
            ingredients: [{ name: 'Rolled oats', measure: '50g' }, { name: 'Milk', measure: '300ml' }, { name: 'Mixed berries', measure: '100g' }, { name: 'Honey', measure: '1 tbsp' }, { name: 'Pinch of salt', measure: 'to taste' }, { name: 'Cinnamon', measure: '1/4 tsp' }],
            instructions: ['Add oats, milk, and a pinch of salt to a saucepan', 'Bring to a gentle simmer over medium heat, stirring frequently', 'Cook for 4-5 minutes until oats are creamy and tender', 'Add a splash more milk if too thick', 'Pour into a warm bowl', 'Top with fresh berries and a sprinkle of cinnamon', 'Drizzle with honey and serve immediately'] },
        ],
        Lunch: [
          { name: 'Ploughman\'s Lunch', description: 'Cheese, pickles, crusty bread, and salad', calories: 520, protein: '22g', benefits: ['Balanced meal', 'Good protein', 'Fiber rich'],
            imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800',
            ingredients: [{ name: 'Mature cheddar', measure: '100g' }, { name: 'Crusty bread', measure: '2 thick slices' }, { name: 'Branston pickle', measure: '2 tbsp' }, { name: 'Pickled onions', measure: '3 pieces' }, { name: 'Apple', measure: '1 small' }, { name: 'Mixed salad leaves', measure: '50g' }, { name: 'Butter', measure: '15g' }],
            instructions: ['Cut cheddar into thick slices or wedges', 'Slice the crusty bread and butter generously', 'Wash and dry salad leaves, arrange on plate', 'Quarter the apple and remove core', 'Arrange cheese, bread, apple on the plate', 'Add a generous spoonful of Branston pickle', 'Add pickled onions on the side', 'Serve with a cold drink'] },
          { name: 'Vegetable Pasty', description: 'Cornish-style pasty with root vegetables', calories: 480, protein: '12g', benefits: ['Filling', 'Root vegetable nutrition', 'Portable'],
            imageUrl: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=800',
            ingredients: [{ name: 'Shortcrust pastry', measure: '400g' }, { name: 'Potatoes', measure: '200g diced' }, { name: 'Swede', measure: '100g diced' }, { name: 'Onion', measure: '1 medium' }, { name: 'Carrot', measure: '1 medium' }, { name: 'Butter', measure: '30g' }, { name: 'Thyme', measure: '1 tsp' }, { name: 'Egg', measure: '1 for glaze' }],
            instructions: ['Preheat oven to 200°C/400°F', 'Dice all vegetables into small 1cm cubes', 'Mix vegetables with thyme, salt, pepper, and small pieces of butter', 'Roll out pastry and cut into 20cm circles', 'Place filling on one half of each circle', 'Fold pastry over and crimp edges to seal', 'Brush with beaten egg', 'Bake for 45-50 minutes until golden brown'] },
          { name: 'Cheese and Onion Pie', description: 'Rich cheese and caramelized onion in pastry', calories: 450, protein: '16g', benefits: ['Calcium rich', 'Satisfying', 'Comfort food'],
            imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
            ingredients: [{ name: 'Puff pastry', measure: '375g' }, { name: 'Onions', measure: '3 large' }, { name: 'Mature cheddar', measure: '200g' }, { name: 'Butter', measure: '30g' }, { name: 'Thyme', measure: '1 tsp' }, { name: 'Egg', measure: '1 for glaze' }, { name: 'Cream', measure: '50ml' }],
            instructions: ['Slice onions thinly and cook slowly in butter for 30 minutes until caramelized', 'Let onions cool slightly, then mix with grated cheese, thyme, and cream', 'Line a pie dish with half the pastry', 'Add the cheese and onion filling', 'Top with remaining pastry and seal edges', 'Brush with beaten egg and make a small hole in center', 'Bake at 200°C for 35-40 minutes until golden'] },
        ],
        Dinner: [
          { name: 'Vegetable Wellington', description: 'Mushroom and spinach in puff pastry', calories: 520, protein: '14g', benefits: ['Elegant', 'Rich in vitamins', 'Satisfying'],
            imageUrl: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800',
            ingredients: [{ name: 'Puff pastry', measure: '500g' }, { name: 'Chestnut mushrooms', measure: '400g' }, { name: 'Spinach', measure: '200g' }, { name: 'Garlic', measure: '3 cloves' }, { name: 'Cream cheese', measure: '150g' }, { name: 'Thyme', measure: '2 tsp' }, { name: 'Egg', measure: '1 for glaze' }, { name: 'Dijon mustard', measure: '1 tbsp' }],
            instructions: ['Finely chop mushrooms and cook until all moisture evaporates', 'Add garlic, thyme, and cook 2 more minutes', 'Wilt spinach and squeeze out excess water', 'Mix mushrooms, spinach, and cream cheese, season well', 'Roll out pastry into a large rectangle', 'Spread mustard down the center, add filling', 'Roll up and seal edges, place seam-side down', 'Score top decoratively, brush with egg, bake at 200°C for 35 minutes'] },
          { name: 'Cauliflower Cheese', description: 'Roasted cauliflower in creamy cheese sauce', calories: 380, protein: '18g', benefits: ['High calcium', 'Low carb', 'Vitamin C'],
            imageUrl: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=800',
            ingredients: [{ name: 'Cauliflower', measure: '1 large head' }, { name: 'Mature cheddar', measure: '200g' }, { name: 'Butter', measure: '40g' }, { name: 'Flour', measure: '40g' }, { name: 'Milk', measure: '500ml' }, { name: 'English mustard', measure: '1 tsp' }, { name: 'Breadcrumbs', measure: '30g' }],
            instructions: ['Cut cauliflower into florets and steam for 8-10 minutes until just tender', 'Make sauce: melt butter, stir in flour, gradually add milk whisking constantly', 'Simmer sauce until thick, remove from heat', 'Stir in most of the cheese and mustard', 'Place cauliflower in baking dish, pour over sauce', 'Top with remaining cheese and breadcrumbs', 'Grill until golden and bubbling, about 10 minutes'] },
          { name: 'Glamorgan Sausages', description: 'Welsh cheese and leek sausages with mash', calories: 420, protein: '16g', benefits: ['High protein', 'Traditional', 'Comfort food'],
            imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800',
            ingredients: [{ name: 'Caerphilly cheese', measure: '200g grated' }, { name: 'Leeks', measure: '2 medium' }, { name: 'Fresh breadcrumbs', measure: '150g' }, { name: 'Eggs', measure: '2 (1 for mix, 1 for coating)' }, { name: 'Mustard powder', measure: '1 tsp' }, { name: 'Fresh parsley', measure: '2 tbsp' }, { name: 'Flour', measure: 'for coating' }],
            instructions: ['Finely chop leeks and cook gently in butter until soft', 'Mix cooled leeks with cheese, breadcrumbs, parsley, and mustard', 'Bind with one beaten egg, season well', 'Shape mixture into 8 sausages', 'Dip each in flour, then beaten egg, then breadcrumbs', 'Chill for 30 minutes to firm up', 'Pan fry in oil until golden on all sides', 'Serve with creamy mashed potatoes and onion gravy'] },
        ],
        Juices: [
          { name: 'Apple Ginger Pressé', description: 'Fresh apple juice with warming ginger', calories: 120, protein: '1g', benefits: ['Digestive aid', 'Immune boost', 'Refreshing'],
            imageUrl: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800',
            ingredients: [{ name: 'Fresh apples', measure: '4 large' }, { name: 'Fresh ginger', measure: '3cm piece' }, { name: 'Lemon juice', measure: '1 tbsp' }, { name: 'Sparkling water', measure: '100ml' }, { name: 'Ice cubes', measure: 'handful' }],
            instructions: ['Wash and quarter apples, removing any bruised parts', 'Peel and roughly chop the ginger', 'Juice apples and ginger together', 'Strain through a fine sieve for smooth texture', 'Add lemon juice and stir', 'Pour over ice and top with sparkling water', 'Serve immediately while fresh'] },
          { name: 'Elderflower Cordial', description: 'Classic British floral drink with lemon', calories: 80, protein: '0g', benefits: ['Refreshing', 'Traditional', 'Light'],
            imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800',
            ingredients: [{ name: 'Elderflower cordial', measure: '50ml' }, { name: 'Sparkling water', measure: '200ml' }, { name: 'Fresh lemon', measure: '2 slices' }, { name: 'Fresh mint', measure: '4 leaves' }, { name: 'Ice cubes', measure: 'handful' }],
            instructions: ['Fill a tall glass with ice cubes', 'Pour elderflower cordial over the ice', 'Top up with cold sparkling water', 'Squeeze in juice from lemon slices', 'Add lemon slices to the glass', 'Lightly bruise mint leaves and add', 'Stir gently and serve immediately'] },
          { name: 'Blackcurrant Smoothie', description: 'Berry smoothie with British blackcurrants', calories: 150, protein: '4g', benefits: ['Vitamin C', 'Antioxidants', 'Energy'],
            imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800',
            ingredients: [{ name: 'Blackcurrants', measure: '150g frozen' }, { name: 'Greek yogurt', measure: '150g' }, { name: 'Honey', measure: '1 tbsp' }, { name: 'Milk', measure: '100ml' }, { name: 'Vanilla extract', measure: '1/2 tsp' }],
            instructions: ['Add frozen blackcurrants to blender', 'Add Greek yogurt and milk', 'Drizzle in honey and vanilla extract', 'Blend on high until completely smooth', 'Taste and add more honey if needed', 'Pour into a chilled glass', 'Serve immediately with a straw'] },
        ],
      },
      'Non-Vegetarian': {
        Breakfast: [
          { name: 'Full English Breakfast', description: 'Bacon, sausages, eggs, beans, black pudding', calories: 850, protein: '42g', benefits: ['High protein', 'Sustained energy', 'Traditional'],
            imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
            ingredients: [{ name: 'Back bacon', measure: '3 rashers' }, { name: 'Pork sausages', measure: '2 pieces' }, { name: 'Eggs', measure: '2 large' }, { name: 'Baked beans', measure: '200g' }, { name: 'Black pudding', measure: '2 slices' }, { name: 'Mushrooms', measure: '4 large' }, { name: 'Tomatoes', measure: '2 halved' }, { name: 'Toast', measure: '2 slices' }],
            instructions: ['Preheat grill to high and oven to low for keeping warm', 'Start sausages first as they take longest - grill for 15-20 minutes, turning', 'Add bacon to grill after 10 minutes, cook until crispy', 'Fry black pudding slices for 2 minutes each side', 'Grill tomatoes cut-side up and fry mushrooms in butter', 'Heat beans in a small pan', 'Fry eggs in remaining fat to your liking', 'Arrange everything on a warm plate with buttered toast'] },
          { name: 'Smoked Salmon Scrambled Eggs', description: 'Scottish smoked salmon with creamy eggs', calories: 420, protein: '28g', benefits: ['Omega-3s', 'High protein', 'Brain health'],
            imageUrl: 'https://images.unsplash.com/photo-1482049016gy16-scrambled-eggs?w=800',
            ingredients: [{ name: 'Smoked salmon', measure: '100g' }, { name: 'Eggs', measure: '3 large' }, { name: 'Butter', measure: '30g' }, { name: 'Cream', measure: '2 tbsp' }, { name: 'Chives', measure: '1 tbsp chopped' }, { name: 'Sourdough bread', measure: '2 slices' }, { name: 'Fresh dill', measure: 'for garnish' }],
            instructions: ['Beat eggs with cream, salt, and pepper', 'Melt butter in a non-stick pan over low heat', 'Add eggs and stir gently with a spatula', 'Keep stirring, scraping the bottom, for creamy curds', 'Remove from heat while still slightly wet', 'Toast and butter the sourdough', 'Pile scrambled eggs on toast', 'Top with smoked salmon, chives, and dill'] },
          { name: 'Kedgeree', description: 'Smoked haddock, rice, and eggs', calories: 480, protein: '32g', benefits: ['High protein', 'Omega-3s', 'Filling'],
            imageUrl: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800',
            ingredients: [{ name: 'Smoked haddock', measure: '300g' }, { name: 'Basmati rice', measure: '200g' }, { name: 'Eggs', measure: '3 large' }, { name: 'Onion', measure: '1 medium' }, { name: 'Curry powder', measure: '2 tsp' }, { name: 'Butter', measure: '50g' }, { name: 'Fresh parsley', measure: '3 tbsp' }, { name: 'Cream', measure: '100ml' }],
            instructions: ['Poach haddock in milk for 8 minutes until it flakes easily', 'Cook rice according to packet instructions, drain well', 'Boil eggs for 7 minutes, cool and quarter', 'Fry sliced onion in butter until soft', 'Add curry powder and cook for 1 minute', 'Flake fish, removing any bones and skin', 'Add rice, fish, cream, and most of the parsley', 'Top with egg quarters and remaining parsley'] },
        ],
        Lunch: [
          { name: 'Coronation Chicken', description: 'Curried chicken mayo sandwich', calories: 520, protein: '28g', benefits: ['High protein', 'Portable', 'Flavorful'],
            imageUrl: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=800',
            ingredients: [{ name: 'Cooked chicken breast', measure: '300g' }, { name: 'Mayonnaise', measure: '150g' }, { name: 'Greek yogurt', measure: '50g' }, { name: 'Curry powder', measure: '2 tsp' }, { name: 'Mango chutney', measure: '2 tbsp' }, { name: 'Raisins', measure: '30g' }, { name: 'Bread', measure: '4 slices' }, { name: 'Lettuce', measure: 'few leaves' }],
            instructions: ['Dice or shred the cooked chicken', 'Mix mayonnaise, yogurt, curry powder, and mango chutney', 'Fold in chicken pieces and raisins', 'Season with salt and pepper to taste', 'Butter bread slices', 'Add lettuce leaves to bread', 'Spoon coronation chicken mixture on top', 'Close sandwich and cut diagonally'] },
          { name: 'Scotch Egg', description: 'Boiled egg wrapped in sausage meat, breaded', calories: 450, protein: '24g', benefits: ['High protein', 'Portable', 'Filling'],
            imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800',
            ingredients: [{ name: 'Eggs', measure: '5 (4 to wrap, 1 for coating)' }, { name: 'Sausage meat', measure: '450g' }, { name: 'Plain flour', measure: '50g' }, { name: 'Breadcrumbs', measure: '100g' }, { name: 'Fresh sage', measure: '1 tsp' }, { name: 'Vegetable oil', measure: 'for frying' }],
            instructions: ['Boil 4 eggs for 6 minutes for soft yolk, cool in ice water', 'Mix sausage meat with sage and seasoning', 'Carefully peel the eggs', 'Divide meat into 4 portions, flatten each', 'Wrap each egg completely in sausage meat', 'Roll in flour, then beaten egg, then breadcrumbs', 'Deep fry at 170°C for 8 minutes until golden', 'Drain on paper towels, serve warm or cold'] },
          { name: 'Pork Pie', description: 'Traditional raised pie with seasoned pork', calories: 480, protein: '22g', benefits: ['High protein', 'Traditional', 'Filling'],
            imageUrl: 'https://images.unsplash.com/photo-1620476214170-1d8080f65cdb?w=800',
            ingredients: [{ name: 'Pork shoulder', measure: '500g diced' }, { name: 'Hot water crust pastry', measure: '500g' }, { name: 'Bacon', measure: '100g' }, { name: 'Sage', measure: '1 tsp' }, { name: 'Anchovy paste', measure: '1 tsp' }, { name: 'Gelatin', measure: '2 sheets' }, { name: 'Chicken stock', measure: '200ml' }],
            instructions: ['Mix diced pork with chopped bacon, sage, anchovy, salt, and pepper', 'Line a pie tin with warm hot water crust pastry', 'Pack meat filling tightly into pastry case', 'Add pastry lid, crimp edges, make a hole in top', 'Brush with egg wash and bake at 180°C for 90 minutes', 'Dissolve gelatin in warm stock', 'When pie is cool, pour jelly through the hole', 'Refrigerate until jelly sets, serve cold'] },
        ],
        Dinner: [
          { name: 'Roast Beef Yorkshire Pudding', description: 'Sunday roast with all trimmings', calories: 680, protein: '45g', benefits: ['High protein', 'Iron rich', 'Traditional'],
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
            ingredients: [{ name: 'Beef rib roast', measure: '1.5kg' }, { name: 'Eggs', measure: '3' }, { name: 'Flour', measure: '100g' }, { name: 'Milk', measure: '100ml' }, { name: 'Beef dripping', measure: '4 tbsp' }, { name: 'Roasting vegetables', measure: '500g' }, { name: 'Red wine', measure: '200ml' }, { name: 'Beef stock', measure: '500ml' }],
            instructions: ['Remove beef from fridge 1 hour before cooking', 'Season generously and roast at 220°C for 20 minutes', 'Reduce to 160°C, cook 15 mins per 500g for medium-rare', 'Make Yorkshire batter: whisk eggs, flour, milk, rest 30 mins', 'Heat dripping in muffin tin until smoking, add batter', 'Bake Yorkshires at 220°C for 25 minutes until risen', 'Rest beef for 20 minutes under foil', 'Make gravy from pan juices, wine, and stock'] },
          { name: 'Fish and Chips', description: 'Beer-battered cod with chips', calories: 850, protein: '35g', benefits: ['Omega-3s', 'Comfort food', 'Traditional'],
            imageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800',
            ingredients: [{ name: 'Cod fillets', measure: '2 x 200g' }, { name: 'Large potatoes', measure: '4' }, { name: 'Self-raising flour', measure: '200g' }, { name: 'Cold beer', measure: '300ml' }, { name: 'Vegetable oil', measure: 'for frying' }, { name: 'Mushy peas', measure: '200g' }, { name: 'Tartare sauce', measure: '4 tbsp' }, { name: 'Lemon wedges', measure: '2' }],
            instructions: ['Cut potatoes into thick chips, rinse and dry thoroughly', 'Par-fry chips at 130°C for 8 minutes, drain', 'Make batter: whisk flour, beer, and salt until smooth', 'Heat oil to 180°C for final frying', 'Fry chips again until golden and crispy', 'Dust fish in flour, dip in batter, let excess drip', 'Carefully lower fish into hot oil, fry 6-8 minutes', 'Serve with mushy peas, tartare sauce, and lemon'] },
          { name: 'Shepherd\'s Pie', description: 'Lamb mince with mashed potato top', calories: 580, protein: '32g', benefits: ['High protein', 'Comfort food', 'Balanced'],
            imageUrl: 'https://images.unsplash.com/photo-1600626333392-59e7ae63e926?w=800',
            ingredients: [{ name: 'Lamb mince', measure: '500g' }, { name: 'Potatoes', measure: '800g' }, { name: 'Onion', measure: '1 large' }, { name: 'Carrots', measure: '2 medium' }, { name: 'Peas', measure: '100g' }, { name: 'Lamb stock', measure: '300ml' }, { name: 'Worcestershire sauce', measure: '2 tbsp' }, { name: 'Butter', measure: '50g' }, { name: 'Rosemary', measure: '2 sprigs' }],
            instructions: ['Brown lamb mince in batches, set aside', 'Fry diced onion and carrots until softened', 'Add lamb back with rosemary, stock, and Worcestershire', 'Simmer for 30 minutes until thick', 'Boil potatoes until tender, mash with butter and milk', 'Add peas to lamb mixture in last 5 minutes', 'Transfer lamb to baking dish, top with mash', 'Fork the top and bake at 200°C for 30 minutes until golden'] },
        ],
        Juices: [
          { name: 'Apple Ginger Pressé', description: 'Fresh apple juice with warming ginger', calories: 120, protein: '1g', benefits: ['Digestive aid', 'Immune boost', 'Refreshing'],
            imageUrl: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800',
            ingredients: [{ name: 'Fresh apples', measure: '4 large' }, { name: 'Fresh ginger', measure: '3cm piece' }, { name: 'Lemon juice', measure: '1 tbsp' }, { name: 'Sparkling water', measure: '100ml' }, { name: 'Ice cubes', measure: 'handful' }],
            instructions: ['Wash and quarter apples, removing any bruised parts', 'Peel and roughly chop the ginger', 'Juice apples and ginger together', 'Strain through a fine sieve', 'Add lemon juice and stir', 'Pour over ice and top with sparkling water', 'Serve immediately'] },
          { name: 'Pimm\'s Mocktail', description: 'Non-alcoholic summer drink', calories: 90, protein: '0g', benefits: ['Refreshing', 'Low calorie', 'Summer favorite'],
            imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800',
            ingredients: [{ name: 'Ginger ale', measure: '200ml' }, { name: 'Lemonade', measure: '100ml' }, { name: 'Cucumber', measure: '4 slices' }, { name: 'Strawberries', measure: '3 halved' }, { name: 'Orange', measure: '2 slices' }, { name: 'Mint', measure: '4 leaves' }, { name: 'Ice', measure: 'plenty' }],
            instructions: ['Fill a large glass or jug with ice', 'Add cucumber slices and strawberry halves', 'Pour in ginger ale and lemonade', 'Add orange slices', 'Lightly bruise mint leaves and add', 'Stir gently to combine', 'Serve immediately with a straw'] },
          { name: 'Bone Broth Tonic', description: 'Warming beef bone broth with herbs', calories: 45, protein: '8g', benefits: ['Gut health', 'Joint support', 'High protein'],
            imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
            ingredients: [{ name: 'Beef bone broth', measure: '300ml' }, { name: 'Fresh ginger', measure: '1cm piece' }, { name: 'Turmeric', measure: '1/4 tsp' }, { name: 'Black pepper', measure: 'pinch' }, { name: 'Fresh thyme', measure: '2 sprigs' }, { name: 'Sea salt', measure: 'to taste' }],
            instructions: ['Heat bone broth in a small saucepan', 'Grate ginger directly into the broth', 'Add turmeric and black pepper', 'Simmer gently for 5 minutes', 'Strain into a warm mug', 'Garnish with fresh thyme', 'Season with sea salt and serve'] },
        ],
      },
    },
    American: {
      Vegetarian: {
        Breakfast: [
          { name: 'Fluffy Pancakes', description: 'Buttermilk pancakes with maple syrup', calories: 450, protein: '10g', benefits: ['Energy boost', 'Comfort food', 'Customizable'], instructions: ['Mix batter', 'Cook on griddle', 'Flip when bubbles form', 'Serve with syrup'] },
          { name: 'Avocado Toast', description: 'Sourdough with avocado and poached eggs', calories: 380, protein: '14g', benefits: ['Healthy fats', 'High fiber', 'Filling'], instructions: ['Toast bread', 'Mash avocado', 'Poach eggs', 'Assemble'] },
          { name: 'Belgian Waffles', description: 'Crispy waffles with berries and cream', calories: 480, protein: '8g', benefits: ['Energy rich', 'Fruit serving', 'Indulgent'], instructions: ['Make batter', 'Cook in iron', 'Add cream', 'Top with berries'] },
          { name: 'Veggie Omelette', description: 'Three-egg omelette with peppers and cheese', calories: 320, protein: '22g', benefits: ['High protein', 'Low carb', 'Vegetable rich'], instructions: ['Sauté veggies', 'Beat eggs', 'Cook omelette', 'Add cheese'] },
        ],
        Lunch: [
          { name: 'Veggie Burger', description: 'Black bean burger with all the fixings', calories: 480, protein: '18g', benefits: ['Plant protein', 'Fiber rich', 'Satisfying'], instructions: ['Form patties', 'Grill', 'Toast buns', 'Add toppings'] },
          { name: 'Grilled Cheese', description: 'Classic grilled cheese with tomato soup', calories: 520, protein: '16g', benefits: ['Calcium rich', 'Comfort food', 'Quick meal'], instructions: ['Butter bread', 'Add cheese', 'Grill golden', 'Serve with soup'] },
          { name: 'Caesar Salad', description: 'Romaine with parmesan and croutons', calories: 350, protein: '12g', benefits: ['Low calorie', 'Fresh vegetables', 'Light meal'], instructions: ['Chop lettuce', 'Make dressing', 'Add croutons', 'Top with parmesan'] },
        ],
        Dinner: [
          { name: 'Mac and Cheese', description: 'Creamy baked macaroni with three cheeses', calories: 580, protein: '22g', benefits: ['Comfort food', 'High calcium', 'Filling'], instructions: ['Cook pasta', 'Make cheese sauce', 'Combine', 'Bake until bubbly'] },
          { name: 'Vegetable Pot Pie', description: 'Creamy vegetables in flaky crust', calories: 520, protein: '14g', benefits: ['Vegetable rich', 'Comfort food', 'Filling'], instructions: ['Sauté vegetables', 'Make sauce', 'Fill pie', 'Bake golden'] },
          { name: 'Eggplant Parmesan', description: 'Breaded eggplant with marinara and cheese', calories: 480, protein: '18g', benefits: ['Rich in fiber', 'Antioxidants', 'Classic'], instructions: ['Bread eggplant', 'Fry golden', 'Layer with sauce', 'Bake with cheese'] },
        ],
        Juices: [
          { name: 'Green Detox Smoothie', description: 'Kale, spinach, apple, ginger', calories: 150, protein: '4g', benefits: ['Detoxifying', 'Vitamin rich', 'Energy boost'], instructions: ['Add greens', 'Add apple', 'Blend smooth', 'Serve fresh'] },
          { name: 'Classic Lemonade', description: 'Fresh-squeezed with mint', calories: 120, protein: '0g', benefits: ['Vitamin C', 'Refreshing', 'Hydrating'], instructions: ['Squeeze lemons', 'Make syrup', 'Mix with water', 'Add mint'] },
          { name: 'PB Banana Shake', description: 'Peanut butter banana protein shake', calories: 350, protein: '12g', benefits: ['High protein', 'Energy boost', 'Post-workout'], instructions: ['Blend banana', 'Add peanut butter', 'Add milk', 'Blend smooth'] },
        ],
      },
      'Non-Vegetarian': {
        Breakfast: [
          { name: 'Bacon and Eggs', description: 'Crispy bacon with sunny-side eggs', calories: 550, protein: '32g', benefits: ['High protein', 'Sustained energy', 'Classic'], instructions: ['Fry bacon', 'Cook eggs', 'Toast bread', 'Serve with hash browns'] },
          { name: 'Eggs Benedict', description: 'Poached eggs, ham, hollandaise on muffin', calories: 480, protein: '24g', benefits: ['High protein', 'Indulgent', 'Brunch favorite'], instructions: ['Toast muffins', 'Warm ham', 'Poach eggs', 'Add hollandaise'] },
          { name: 'Breakfast Burrito', description: 'Eggs, bacon, cheese, salsa in tortilla', calories: 620, protein: '28g', benefits: ['Portable', 'High protein', 'Filling'], instructions: ['Scramble eggs', 'Cook bacon', 'Warm tortilla', 'Roll burrito'] },
        ],
        Lunch: [
          { name: 'Classic Cheeseburger', description: 'Beef patty with cheese and fixings', calories: 680, protein: '35g', benefits: ['High protein', 'Satisfying', 'American classic'], instructions: ['Form patties', 'Grill', 'Toast buns', 'Add toppings'] },
          { name: 'BLT Sandwich', description: 'Bacon, lettuce, tomato on toast', calories: 480, protein: '18g', benefits: ['Quick meal', 'Balanced', 'Classic'], instructions: ['Cook bacon', 'Toast bread', 'Layer ingredients', 'Add mayo'] },
          { name: 'Buffalo Wings', description: 'Crispy wings in spicy buffalo sauce', calories: 580, protein: '42g', benefits: ['High protein', 'Party favorite', 'Spicy kick'], instructions: ['Fry wings', 'Make sauce', 'Toss together', 'Serve with blue cheese'] },
        ],
        Dinner: [
          { name: 'BBQ Ribs', description: 'Slow-cooked pork ribs with smoky sauce', calories: 750, protein: '45g', benefits: ['High protein', 'American BBQ', 'Tender'], instructions: ['Rub with spices', 'Slow cook', 'Brush with sauce', 'Finish on grill'] },
          { name: 'Grilled Steak', description: 'Prime ribeye with garlic butter', calories: 650, protein: '52g', benefits: ['Iron rich', 'High protein', 'Satisfying'], instructions: ['Season steak', 'Grill to temp', 'Rest', 'Top with butter'] },
          { name: 'Fried Chicken', description: 'Southern-style crispy fried chicken', calories: 720, protein: '48g', benefits: ['Comfort food', 'High protein', 'Southern classic'], instructions: ['Marinate in buttermilk', 'Dredge in flour', 'Deep fry', 'Serve with mash'] },
        ],
        Juices: [
          { name: 'Chocolate Protein Shake', description: 'Rich chocolate with whey protein', calories: 320, protein: '30g', benefits: ['Muscle building', 'Post-workout', 'High protein'], instructions: ['Blend milk', 'Add protein', 'Add cocoa', 'Serve cold'] },
          { name: 'Arnold Palmer', description: 'Half iced tea, half lemonade', calories: 100, protein: '0g', benefits: ['Refreshing', 'Low calorie', 'Hydrating'], instructions: ['Brew tea', 'Make lemonade', 'Mix equal parts', 'Serve over ice'] },
          { name: 'Strawberry Milkshake', description: 'Classic diner-style shake', calories: 420, protein: '8g', benefits: ['Calcium rich', 'Energy boost', 'Nostalgic'], instructions: ['Blend ice cream', 'Add strawberries', 'Add milk', 'Top with cream'] },
        ],
      },
    },
    Indian: {
      Vegetarian: {
        Breakfast: [
          { name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', calories: 350, protein: '8g', benefits: ['Probiotic', 'Low fat', 'Filling'], instructions: ['Make batter', 'Prepare masala', 'Spread on griddle', 'Fill and fold'] },
          { name: 'Poha', description: 'Flattened rice with peanuts and spices', calories: 280, protein: '6g', benefits: ['Light', 'Easy to digest', 'Quick meal'], instructions: ['Soak poha', 'Temper spices', 'Add peanuts', 'Garnish with coriander'] },
          { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil stew', calories: 300, protein: '10g', benefits: ['Steamed healthy', 'Protein rich', 'Probiotic'], instructions: ['Steam idlis', 'Make sambar', 'Prepare chutney', 'Serve hot'] },
          { name: 'Aloo Paratha', description: 'Stuffed potato flatbread with yogurt', calories: 380, protein: '9g', benefits: ['Energy rich', 'Filling', 'Traditional'], instructions: ['Make filling', 'Roll paratha', 'Cook with ghee', 'Serve with curd'] },
        ],
        Lunch: [
          { name: 'Dal Makhani', description: 'Creamy black lentils with butter', calories: 420, protein: '18g', benefits: ['High protein', 'Iron rich', 'Comfort food'], instructions: ['Cook lentils', 'Simmer with spices', 'Add cream', 'Serve with naan'] },
          { name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', calories: 380, protein: '22g', benefits: ['Iron rich', 'High protein', 'Calcium'], instructions: ['Blanch spinach', 'Fry paneer', 'Make gravy', 'Combine'] },
          { name: 'Chole Bhature', description: 'Spicy chickpeas with fried bread', calories: 580, protein: '16g', benefits: ['High fiber', 'Plant protein', 'Punjabi classic'], instructions: ['Cook chickpeas', 'Make bhatura', 'Deep fry', 'Serve together'] },
        ],
        Dinner: [
          { name: 'Vegetable Biryani', description: 'Aromatic rice with mixed vegetables', calories: 450, protein: '12g', benefits: ['Aromatic', 'Complete meal', 'Festive'], instructions: ['Cook vegetables', 'Parboil rice', 'Layer', 'Dum cook'] },
          { name: 'Malai Kofta', description: 'Cheese dumplings in creamy gravy', calories: 520, protein: '16g', benefits: ['Rich', 'Celebratory', 'Protein rich'], instructions: ['Make kofta', 'Deep fry', 'Prepare gravy', 'Combine'] },
          { name: 'Paneer Tikka Masala', description: 'Grilled paneer in spiced tomato sauce', calories: 480, protein: '24g', benefits: ['High protein', 'Restaurant style', 'Flavorful'], instructions: ['Marinate paneer', 'Grill tikka', 'Make masala', 'Combine'] },
        ],
        Juices: [
          { name: 'Mango Lassi', description: 'Creamy yogurt smoothie with mango', calories: 220, protein: '6g', benefits: ['Probiotic', 'Vitamin C', 'Cooling'], instructions: ['Blend mango', 'Add yogurt', 'Add cardamom', 'Serve chilled'] },
          { name: 'Masala Chaas', description: 'Spiced buttermilk with cumin', calories: 60, protein: '3g', benefits: ['Digestive', 'Cooling', 'Low calorie'], instructions: ['Blend yogurt', 'Add cumin', 'Add mint', 'Serve cold'] },
          { name: 'Jaljeera', description: 'Tangy cumin-mint digestive drink', calories: 45, protein: '1g', benefits: ['Digestive', 'Cooling', 'Refreshing'], instructions: ['Mix powder', 'Add lemon', 'Add mint', 'Serve cold'] },
          { name: 'Fresh Sugarcane Juice', description: 'Freshly pressed with ginger and lemon', calories: 180, protein: '0g', benefits: ['Natural energy', 'Hydrating', 'Mineral rich'], instructions: ['Press sugarcane', 'Add ginger', 'Add lemon', 'Serve fresh'] },
        ],
      },
      'Non-Vegetarian': {
        Breakfast: [
          { name: 'Keema Paratha', description: 'Flatbread stuffed with spiced mince', calories: 450, protein: '22g', benefits: ['High protein', 'Filling', 'Traditional'], instructions: ['Cook keema', 'Make dough', 'Stuff paratha', 'Cook with ghee'] },
          { name: 'Egg Bhurji', description: 'Indian spiced scrambled eggs', calories: 280, protein: '18g', benefits: ['High protein', 'Quick meal', 'Spicy'], instructions: ['Sauté onions', 'Add eggs', 'Scramble with spices', 'Garnish'] },
          { name: 'Chicken Tikka Roll', description: 'Grilled chicken in paratha wrap', calories: 420, protein: '28g', benefits: ['High protein', 'Portable', 'Flavorful'], instructions: ['Grill tikka', 'Warm paratha', 'Add chutney', 'Roll'] },
        ],
        Lunch: [
          { name: 'Butter Chicken', description: 'Tandoori chicken in creamy tomato sauce', calories: 520, protein: '35g', benefits: ['High protein', 'Restaurant favorite', 'Creamy'], instructions: ['Grill chicken', 'Make sauce', 'Add chicken', 'Finish with cream'] },
          { name: 'Mutton Rogan Josh', description: 'Kashmiri lamb curry with aromatics', calories: 480, protein: '38g', benefits: ['Iron rich', 'High protein', 'Kashmiri'], instructions: ['Brown mutton', 'Add spices', 'Simmer', 'Garnish'] },
          { name: 'Fish Curry', description: 'Bengali-style fish in tomato gravy', calories: 380, protein: '32g', benefits: ['Omega-3', 'Light curry', 'Bengali'], instructions: ['Fry fish', 'Cook potatoes', 'Make gravy', 'Combine'] },
        ],
        Dinner: [
          { name: 'Chicken Biryani', description: 'Layered aromatic rice with spiced chicken', calories: 580, protein: '35g', benefits: ['Complete meal', 'Festive', 'Protein rich'], instructions: ['Marinate chicken', 'Parboil rice', 'Layer', 'Dum cook'] },
          { name: 'Tandoori Chicken', description: 'Yogurt-marinated chicken from tandoor', calories: 420, protein: '45g', benefits: ['High protein', 'Low carb', 'Grilled'], instructions: ['Marinate overnight', 'Preheat oven', 'Cook charred', 'Serve with chutney'] },
          { name: 'Lamb Korma', description: 'Rich lamb in cashew cream sauce', calories: 550, protein: '40g', benefits: ['High protein', 'Rich', 'Mughlai'], instructions: ['Brown lamb', 'Make cashew paste', 'Cook korma', 'Add cream'] },
        ],
        Juices: [
          { name: 'Sweet Lassi', description: 'Sweetened yogurt drink with rose water', calories: 180, protein: '5g', benefits: ['Probiotic', 'Cooling', 'Digestive'], instructions: ['Blend yogurt', 'Add sugar', 'Add rose water', 'Serve chilled'] },
          { name: 'Nimbu Pani', description: 'Indian lemonade with black salt', calories: 80, protein: '0g', benefits: ['Vitamin C', 'Electrolytes', 'Refreshing'], instructions: ['Squeeze lemons', 'Add salt', 'Add cumin', 'Mix with water'] },
          { name: 'Thandai', description: 'Spiced almond milk with saffron', calories: 250, protein: '8g', benefits: ['Cooling', 'Energy', 'Festival special'], instructions: ['Soak almonds', 'Grind with spices', 'Mix with milk', 'Serve cold'] },
        ],
      },
    },
  };

  // Generate recipes for cuisines not in the static database
  const defaultRecipes = generateDefaultRecipes(cuisine, category, dietType);
  
  // Try to get from static database first
  const cuisineData = recipes[cuisine];
  if (cuisineData && cuisineData[dietType as keyof typeof cuisineData]) {
    const dietData = cuisineData[dietType as keyof typeof cuisineData];
    const categoryData = dietData[category as keyof typeof dietData];
    if (categoryData && categoryData.length > 0) {
      return categoryData.map((recipe, index) => ({
        ...recipe,
        id: `static-${cuisine}-${category}-${dietType}-${index}`,
        category,
        dietType,
        cuisine,
        reviews: [],
        source: 'static',
        ingredients: recipe.instructions.map((i: string) => ({ name: i, measure: '' })),
      }));
    }
  }
  
  return defaultRecipes;
}

// Generate cuisine-specific default recipes
function generateDefaultRecipes(cuisine: string, category: string, dietType: string): any[] {
  const cuisineSpecificRecipes: Record<string, any> = {
    Chinese: {
      vegBreakfast: ['Congee with Vegetables', 'Scallion Pancakes', 'Steamed Buns with Red Bean', 'Soy Milk with Youtiao'],
      nonvegBreakfast: ['Pork Congee', 'Char Siu Bao', 'Dim Sum Platter', 'Century Egg Congee'],
      vegLunch: ['Mapo Tofu', 'Kung Pao Vegetables', 'Buddha\'s Delight', 'Vegetable Chow Mein'],
      nonvegLunch: ['Kung Pao Chicken', 'Sweet and Sour Pork', 'Beef Chow Fun', 'Peking Duck'],
      vegDinner: ['Hot Pot Vegetables', 'General Tso\'s Tofu', 'Stir-Fried Bok Choy', 'Vegetable Fried Rice'],
      nonvegDinner: ['Mongolian Beef', 'Orange Chicken', 'Shrimp Lo Mein', 'Crispy Duck'],
      juices: ['Chrysanthemum Tea', 'Lychee Juice', 'Watermelon Juice', 'Soy Milk'],
    },
    Japanese: {
      vegBreakfast: ['Tamagoyaki', 'Miso Soup with Tofu', 'Onigiri with Umeboshi', 'Natto Rice Bowl'],
      nonvegBreakfast: ['Salmon Onigiri', 'Tamago Kake Gohan', 'Grilled Fish Set', 'Oyakodon'],
      vegLunch: ['Vegetable Tempura', 'Inari Sushi', 'Yasai Udon', 'Edamame Bento'],
      nonvegLunch: ['Tonkatsu', 'Salmon Teriyaki', 'Chicken Katsu Curry', 'Ramen'],
      vegDinner: ['Vegetable Sukiyaki', 'Agedashi Tofu', 'Yasai Ramen', 'Vegetable Teppanyaki'],
      nonvegDinner: ['Wagyu Steak', 'Sashimi Platter', 'Yakitori', 'Unagi Don'],
      juices: ['Matcha Latte', 'Amazake', 'Calpis', 'Mugicha'],
    },
    Italian: {
      vegBreakfast: ['Cornetto con Cappuccino', 'Frittata di Verdure', 'Bruschetta Pomodoro', 'Ricotta Toast'],
      nonvegBreakfast: ['Prosciutto e Melone', 'Eggs Florentine', 'Pancetta Frittata', 'Italian Breakfast Panini'],
      vegLunch: ['Margherita Pizza', 'Caprese Salad', 'Pasta Primavera', 'Risotto ai Funghi'],
      nonvegLunch: ['Carbonara', 'Osso Buco', 'Chicken Parmigiana', 'Lasagna Bolognese'],
      vegDinner: ['Eggplant Parmigiana', 'Gnocchi al Pesto', 'Ravioli Ricotta', 'Minestrone Soup'],
      nonvegDinner: ['Saltimbocca', 'Frutti di Mare', 'Bistecca Fiorentina', 'Veal Piccata'],
      juices: ['Limonata', 'Blood Orange Juice', 'Chinotto', 'Granita di Limone'],
    },
    Mexican: {
      vegBreakfast: ['Chilaquiles Verdes', 'Huevos Rancheros', 'Breakfast Burrito', 'Molletes'],
      nonvegBreakfast: ['Machaca con Huevos', 'Chorizo Tacos', 'Breakfast Quesadilla', 'Carnitas Burrito'],
      vegLunch: ['Bean and Cheese Tacos', 'Vegetable Enchiladas', 'Quesadilla con Rajas', 'Elote'],
      nonvegLunch: ['Carne Asada Tacos', 'Chicken Tinga', 'Al Pastor', 'Barbacoa'],
      vegDinner: ['Vegetable Fajitas', 'Cheese Enchiladas', 'Stuffed Poblanos', 'Veggie Burrito Bowl'],
      nonvegDinner: ['Mole Poblano', 'Cochinita Pibil', 'Camarones al Ajillo', 'Chiles Rellenos'],
      juices: ['Horchata', 'Agua de Jamaica', 'Tamarindo', 'Agua Fresca de Sandia'],
    },
    Thai: {
      vegBreakfast: ['Jok (Rice Porridge)', 'Kai Jeow', 'Patongo with Soy Milk', 'Thai Toast'],
      nonvegBreakfast: ['Khao Tom Moo', 'Thai Omelette with Pork', 'Crispy Pork Congee', 'Grilled Pork Skewers'],
      vegLunch: ['Pad Thai Tofu', 'Green Curry Vegetables', 'Som Tam', 'Massaman Vegetables'],
      nonvegLunch: ['Tom Yum Goong', 'Pad See Ew', 'Panang Curry Chicken', 'Larb Gai'],
      vegDinner: ['Vegetable Pad Kra Pao', 'Tofu Satay', 'Red Curry Vegetables', 'Pad Pak Ruam'],
      nonvegDinner: ['Khao Pad Gai', 'Pla Rad Prik', 'Duck Red Curry', 'Grilled River Prawns'],
      juices: ['Thai Iced Tea', 'Coconut Water', 'Lemongrass Tea', 'Nam Manao'],
    },
    French: {
      vegBreakfast: ['Croissant aux Amandes', 'Pain au Chocolat', 'French Toast', 'Crêpes Sucré'],
      nonvegBreakfast: ['Croque Madame', 'Omelette aux Fines Herbes', 'Quiche Lorraine', 'Eggs en Cocotte'],
      vegLunch: ['Ratatouille', 'Quiche aux Légumes', 'Salade Niçoise Végétarienne', 'Soupe à l\'Oignon'],
      nonvegLunch: ['Coq au Vin', 'Croque Monsieur', 'Bouillabaisse', 'Steak Frites'],
      vegDinner: ['Gratin Dauphinois', 'Tarte Tatin', 'Soufflé au Fromage', 'Mushroom Bourguignon'],
      nonvegDinner: ['Boeuf Bourguignon', 'Duck Confit', 'Cassoulet', 'Sole Meunière'],
      juices: ['Citron Pressé', 'Diabolo Menthe', 'Jus de Pomme', 'Sirop de Grenadine'],
    },
    Greek: {
      vegBreakfast: ['Greek Yogurt with Honey', 'Tiganites', 'Bougatsa', 'Strapatsada'],
      nonvegBreakfast: ['Eggs with Feta', 'Loukaniko with Eggs', 'Bacon Strapatsada', 'Sausage Pita'],
      vegLunch: ['Greek Salad', 'Spanakopita', 'Dolmades', 'Falafel Gyros'],
      nonvegLunch: ['Chicken Souvlaki', 'Lamb Gyros', 'Moussaka', 'Pastitsio'],
      vegDinner: ['Gemista', 'Fasolada', 'Imam Bayildi', 'Briam'],
      nonvegDinner: ['Lamb Kleftiko', 'Grilled Octopus', 'Keftedes', 'Arnaki sto Fourno'],
      juices: ['Frappe', 'Lemon Soda', 'Greek Mountain Tea', 'Pomegranate Juice'],
    },
  };

  const data = cuisineSpecificRecipes[cuisine];
  let recipeNames: string[] = [];
  
  if (data) {
    const key = category === 'Juices' ? 'juices' : 
      `${dietType === 'Vegetarian' ? 'veg' : 'nonveg'}${category}`;
    recipeNames = data[key] || [];
  }
  
  // Generate default international recipes if cuisine not found
  if (recipeNames.length === 0) {
    if (category === 'Juices') {
      recipeNames = ['Fresh Fruit Smoothie', 'Green Detox Juice', 'Tropical Blend', 'Berry Blast'];
    } else if (dietType === 'Vegetarian') {
      recipeNames = [
        `${cuisine} Vegetable Curry`, `${cuisine} Fried Rice`, 
        `${cuisine} Vegetable Stir-Fry`, `${cuisine} Lentil Soup`
      ];
    } else {
      recipeNames = [
        `${cuisine} Grilled Chicken`, `${cuisine} Beef Stew`, 
        `${cuisine} Fish Curry`, `${cuisine} Lamb Kebab`
      ];
    }
  }

  // Image URLs by category and cuisine type
  const getImageUrl = (cat: string, diet: string, idx: number): string => {
    const images: Record<string, string[]> = {
      'Breakfast-Vegetarian': [
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800',
        'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800',
        'https://images.unsplash.com/photo-1459789034005-6c6f31e78c34?w=800',
      ],
      'Breakfast-Non-Vegetarian': [
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
        'https://images.unsplash.com/photo-1482049016gy16?w=800',
        'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800',
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
      ],
      'Lunch-Vegetarian': [
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
      ],
      'Lunch-Non-Vegetarian': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      ],
      'Dinner-Vegetarian': [
        'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800',
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800',
        'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800',
      ],
      'Dinner-Non-Vegetarian': [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        'https://images.unsplash.com/photo-1558030006-450675393462?w=800',
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
        'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800',
      ],
      'Juices': [
        'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800',
        'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800',
        'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
      ],
    };
    const key = cat === 'Juices' ? 'Juices' : `${cat}-${diet}`;
    const imgArray = images[key] || images['Dinner-Vegetarian'];
    return imgArray[idx % imgArray.length];
  };

  // Generate detailed ingredients based on recipe type
  const getIngredients = (name: string, diet: string): Array<{name: string, measure: string}> => {
    if (name.includes('Curry')) {
      return diet === 'Vegetarian' 
        ? [{ name: 'Mixed vegetables', measure: '400g' }, { name: 'Curry paste', measure: '3 tbsp' }, { name: 'Coconut milk', measure: '400ml' }, { name: 'Onion', measure: '1 large' }, { name: 'Garlic', measure: '4 cloves' }, { name: 'Ginger', measure: '2cm piece' }, { name: 'Rice', measure: '300g' }]
        : [{ name: 'Chicken thighs', measure: '500g' }, { name: 'Curry paste', measure: '3 tbsp' }, { name: 'Coconut milk', measure: '400ml' }, { name: 'Onion', measure: '1 large' }, { name: 'Garlic', measure: '4 cloves' }, { name: 'Fish sauce', measure: '1 tbsp' }, { name: 'Rice', measure: '300g' }];
    }
    if (name.includes('Stir-Fry') || name.includes('Fried Rice')) {
      return diet === 'Vegetarian'
        ? [{ name: 'Rice', measure: '400g cooked' }, { name: 'Mixed vegetables', measure: '300g' }, { name: 'Soy sauce', measure: '3 tbsp' }, { name: 'Sesame oil', measure: '1 tbsp' }, { name: 'Garlic', measure: '3 cloves' }, { name: 'Eggs', measure: '2' }, { name: 'Spring onions', measure: '4' }]
        : [{ name: 'Rice', measure: '400g cooked' }, { name: 'Chicken breast', measure: '300g' }, { name: 'Soy sauce', measure: '3 tbsp' }, { name: 'Oyster sauce', measure: '2 tbsp' }, { name: 'Garlic', measure: '3 cloves' }, { name: 'Eggs', measure: '2' }, { name: 'Spring onions', measure: '4' }];
    }
    if (name.includes('Smoothie') || name.includes('Juice')) {
      return [{ name: 'Fresh fruits', measure: '300g' }, { name: 'Yogurt or milk', measure: '200ml' }, { name: 'Honey', measure: '1 tbsp' }, { name: 'Ice cubes', measure: 'handful' }];
    }
    if (name.includes('Grilled Chicken')) {
      return [{ name: 'Chicken breast', measure: '2 pieces' }, { name: 'Olive oil', measure: '2 tbsp' }, { name: 'Lemon juice', measure: '2 tbsp' }, { name: 'Garlic', measure: '3 cloves' }, { name: 'Mixed herbs', measure: '2 tsp' }, { name: 'Salt and pepper', measure: 'to taste' }];
    }
    if (name.includes('Beef Stew')) {
      return [{ name: 'Beef chuck', measure: '600g' }, { name: 'Potatoes', measure: '400g' }, { name: 'Carrots', measure: '3' }, { name: 'Onion', measure: '2' }, { name: 'Beef stock', measure: '500ml' }, { name: 'Tomato paste', measure: '2 tbsp' }, { name: 'Red wine', measure: '200ml' }];
    }
    if (name.includes('Lamb Kebab')) {
      return [{ name: 'Lamb mince', measure: '500g' }, { name: 'Onion', measure: '1 grated' }, { name: 'Cumin', measure: '2 tsp' }, { name: 'Coriander', measure: '2 tsp' }, { name: 'Parsley', measure: '3 tbsp' }, { name: 'Garlic', measure: '3 cloves' }, { name: 'Pita bread', measure: '4' }];
    }
    return [{ name: 'Main ingredient', measure: '500g' }, { name: 'Vegetables', measure: '300g' }, { name: 'Aromatics', measure: 'as needed' }, { name: 'Spices', measure: '2 tbsp' }, { name: 'Oil', measure: '2 tbsp' }, { name: 'Salt and pepper', measure: 'to taste' }];
  };

  // Generate detailed instructions
  const getInstructions = (name: string, diet: string): string[] => {
    if (name.includes('Curry')) {
      return [
        'Dice onion and mince garlic and ginger',
        'Heat oil in a large pan and sauté onion until soft',
        'Add garlic, ginger, and curry paste, cook for 2 minutes',
        diet === 'Vegetarian' ? 'Add chopped vegetables and stir to coat' : 'Add chicken pieces and brown on all sides',
        'Pour in coconut milk and bring to a simmer',
        'Cook for 20-25 minutes until ' + (diet === 'Vegetarian' ? 'vegetables are tender' : 'chicken is cooked through'),
        'Season with salt and serve over steamed rice'
      ];
    }
    if (name.includes('Stir-Fry') || name.includes('Fried Rice')) {
      return [
        'Prepare all vegetables by chopping into bite-sized pieces',
        'Heat wok or large pan over high heat with oil',
        diet === 'Vegetarian' ? 'Add vegetables and stir-fry for 3-4 minutes' : 'Add protein and cook until browned, set aside',
        'Push ingredients to side, scramble eggs in center',
        'Add cold rice and break up any clumps',
        'Add soy sauce and toss everything together',
        'Garnish with spring onions and serve hot'
      ];
    }
    if (name.includes('Smoothie') || name.includes('Juice')) {
      return [
        'Wash and prepare all fruits, removing any stems or seeds',
        'Add fruits to blender with ice cubes',
        'Pour in yogurt or milk of choice',
        'Add honey or sweetener to taste',
        'Blend on high until completely smooth',
        'Pour into glasses and serve immediately'
      ];
    }
    return [
      'Gather and prepare all ingredients, chop vegetables evenly',
      'Heat cooking oil in a suitable pan over medium-high heat',
      'Add aromatics (garlic, onion, ginger) and cook until fragrant',
      'Add main ingredients and cook according to type',
      'Season with spices and adjust to taste',
      'Cook until everything is done to your preference',
      'Plate beautifully and serve hot with accompaniments'
    ];
  };

  return recipeNames.map((name, index) => ({
    id: `generated-${cuisine}-${category}-${dietType}-${index}`,
    name,
    description: `Traditional ${cuisine} ${dietType.toLowerCase()} ${category.toLowerCase()} dish prepared with authentic flavors and fresh ingredients`,
    calories: 300 + Math.floor(Math.random() * 300),
    protein: `${10 + Math.floor(Math.random() * 25)}g`,
    benefits: ['Rich in nutrients', 'Authentic traditional recipe', 'Balanced and satisfying meal'],
    imageUrl: getImageUrl(category, dietType, index),
    instructions: getInstructions(name, dietType),
    ingredients: getIngredients(name, dietType),
    category,
    dietType,
    cuisine,
    reviews: [],
    source: 'generated',
  }));
}

export async function mealsRoutes(fastify: FastifyInstance) {
  // Get meals by category, diet type, and cuisine
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { category = 'Breakfast', dietType = 'Vegetarian', cuisine = 'All', source = 'mealdb' } = request.query as {
      category?: MealCategory;
      dietType?: DietType;
      cuisine?: string;
      source?: 'mealdb' | 'gemini' | 'both';
    };

    const cacheKey = `${category}-${dietType}-${cuisine}-${source}`;
    const cached = mealCache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { meals: cached.meals, source: 'cache', cuisine };
    }

    try {
      let meals: any[] = [];
      let mealDbMeals: any[] = [];

      // Try TheMealDB first for real recipes (except Juices)
      if (category !== 'Juices' && cuisine !== 'All') {
        mealDbMeals = await MealDB.getMealsForAppCategory(category, dietType, cuisine);
        // Add cuisine info to MealDB meals
        mealDbMeals = mealDbMeals.map(meal => ({
          ...meal,
          cuisine: cuisine,
          source: 'mealdb'
        }));
      }

      // Generate AI recipes only if Gemini API is configured
      const geminiConfigured = config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key';
      
      if (geminiConfigured) {
        const recipeCount = category === 'Juices' ? 8 : Math.max(8, 10 - mealDbMeals.length);
        const rotationIndex = getRotationIndex();
        const cuisineLabel = cuisine !== 'All' ? cuisine : 'international';
        const existingNames = mealDbMeals.map(m => m.name).join(', ');
        
        let prompt: string;
        if (category === 'Juices') {
          prompt = `Generate ${recipeCount} authentic ${cuisineLabel} healthy drinks, juices, smoothies. Diet: ${dietType}. Include traditional drinks like lassi (India), horchata (Mexico), matcha (Japan). Return JSON array with: name, description, calories (number), protein (string), benefits (array), instructions (array), ingredients (array).`;
        } else {
          const dietContext = dietType === 'Vegetarian' 
            ? 'ONLY vegetarian - NO meat/fish/seafood' 
            : 'NON-vegetarian with meat/fish as main protein';
          prompt = `Generate ${recipeCount} authentic ${cuisineLabel} ${category.toLowerCase()} recipes. ${dietContext}. ${existingNames ? `Avoid: ${existingNames}` : ''} Rotation #${rotationIndex}. Return JSON array with: name (authentic), description, calories (number), protein (string), benefits (array), instructions (array), ingredients (array).`;
        }

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.STRING },
                    benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['name', 'description', 'calories', 'protein', 'benefits', 'instructions']
                }
              }
            }
          });

          const geminiMeals = JSON.parse(response.text || '[]');
          const formattedGeminiMeals = geminiMeals.map((meal: any, index: number) => ({
            ...meal,
            id: `gemini-${cuisine}-${category}-${dietType}-${index}-${Date.now()}`,
            category,
            dietType,
            cuisine: cuisine !== 'All' ? cuisine : 'International',
            reviews: [],
            imageUrl: undefined,
            source: 'gemini',
            ingredients: meal.ingredients?.map((i: string) => ({ name: i, measure: '' })) || []
          }));

          meals = [...mealDbMeals, ...formattedGeminiMeals];
        } catch (geminiError) {
          console.error('Gemini API error:', geminiError);
          meals = mealDbMeals;
        }
      } else {
        // Use static fallback recipes when Gemini is not configured
        meals = [...mealDbMeals, ...getStaticRecipes(cuisine, category, dietType)];
      }

      // Ensure we have at least some results
      if (meals.length === 0) {
        return reply.status(404).send({ 
          error: 'No recipes found', 
          message: `No ${dietType} ${category} recipes available for ${cuisine}. Please try another combination.` 
        });
      }

      // Shuffle results for variety but keep limit reasonable
      meals = meals.sort(() => Math.random() - 0.5).slice(0, 12);

      // Cache results
      mealCache.set(cacheKey, { meals, timestamp: Date.now() });

      return { meals, cuisine, totalCount: meals.length, dietType, category };
    } catch (error) {
      console.error('Error fetching meals:', error);
      return reply.status(500).send({ error: 'Failed to fetch meals' });
    }
  });

  // Get single meal by ID
  fastify.get('/:mealId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { mealId } = request.params as { mealId: string };
    
    try {
      // Check if it's a MealDB ID
      if (mealId.startsWith('mealdb-')) {
        const meal = await MealDB.getMealById(mealId);
        if (meal) {
          return { meal };
        }
      }
      
      // Check cache for non-MealDB meals
      for (const [, cached] of mealCache) {
        const found = cached.meals.find((m: any) => m.id === mealId);
        if (found) {
          return { meal: found };
        }
      }
      
      return reply.status(404).send({ error: 'Meal not found' });
    } catch (error) {
      console.error('Meal lookup error:', error);
      return reply.status(500).send({ error: 'Failed to fetch meal' });
    }
  });

  // Search meals - uses both MealDB and Gemini
  fastify.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, dietType = 'Vegetarian' } = request.query as { q?: string; dietType?: DietType };

    if (!q || q.length < 2) {
      return reply.status(400).send({ error: 'Search query must be at least 2 characters' });
    }

    try {
      // Search TheMealDB first
      const mealDbResults = await MealDB.searchMealsByName(q);
      
      // Filter by diet type
      let filteredResults = mealDbResults.filter(meal => {
        if (dietType === 'Vegetarian') {
          return meal.dietType === 'Vegetarian' || meal.dietType === 'Vegan';
        }
        return true;
      });

      // If we have enough results from MealDB, return them
      if (filteredResults.length >= 3) {
        return { meals: filteredResults.slice(0, 8), source: 'mealdb' };
      }

      // Supplement with Gemini AI results
      const prompt = `Search for healthy ${dietType} meals matching "${q}". 
      Return up to 5 relevant results with:
      - name, description, calories, protein, benefits, instructions
      Return as JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const geminiMeals = JSON.parse(response.text || '[]').map((meal: any, index: number) => ({
        ...meal,
        id: `search-${Date.now()}-${index}`,
        dietType,
        reviews: [],
        source: 'gemini'
      }));

      // Combine results
      const combinedMeals = [...filteredResults, ...geminiMeals].slice(0, 10);
      return { meals: combinedMeals, source: 'combined' };
    } catch (error) {
      console.error('Search error:', error);
      return reply.status(500).send({ error: 'Search failed' });
    }
  });

  // Get random meals
  fastify.get('/random', async (request: FastifyRequest, reply: FastifyReply) => {
    const { count = '5' } = request.query as { count?: string };
    const numMeals = Math.min(parseInt(count) || 5, 10);

    try {
      const meals = await MealDB.getMultipleRandomMeals(numMeals);
      return { meals };
    } catch (error) {
      console.error('Random meals error:', error);
      return reply.status(500).send({ error: 'Failed to fetch random meals' });
    }
  });

  // Get all available categories from MealDB
  fastify.get('/categories/all', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = await MealDB.getAllCategories();
      return { categories };
    } catch (error) {
      console.error('Categories error:', error);
      return reply.status(500).send({ error: 'Failed to fetch categories' });
    }
  });

  // Get all available cuisines/areas from MealDB
  fastify.get('/cuisines', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const areas = await MealDB.getAllAreas();
      return { cuisines: areas };
    } catch (error) {
      console.error('Cuisines error:', error);
      return reply.status(500).send({ error: 'Failed to fetch cuisines' });
    }
  });

  // Get meals by cuisine/area
  fastify.get('/cuisine/:area', async (request: FastifyRequest, reply: FastifyReply) => {
    const { area } = request.params as { area: string };

    try {
      const meals = await MealDB.getMealsByArea(area);
      return { meals, area };
    } catch (error) {
      console.error('Cuisine meals error:', error);
      return reply.status(500).send({ error: 'Failed to fetch meals by cuisine' });
    }
  });
}
