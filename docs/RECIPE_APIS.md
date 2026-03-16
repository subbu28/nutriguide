# Recipe APIs Reference

This document lists external recipe APIs that can be integrated with NutriGuide.

---

## Currently Integrated

### TheMealDB

| Property | Value |
|----------|-------|
| **Website** | https://www.themealdb.com |
| **API Docs** | https://www.themealdb.com/api.php |
| **Base URL** | `https://www.themealdb.com/api/json/v1/1` |
| **Auth** | API Key (free tier: `1`) |
| **Free Tier** | ✅ Unlimited (with key `1`) |
| **Rate Limit** | None specified |

**Endpoints Used:**
```
GET /search.php?s={name}     # Search by name
GET /lookup.php?i={id}       # Get by ID
GET /random.php              # Random meal
GET /filter.php?c={category} # Filter by category
GET /filter.php?a={area}     # Filter by area/cuisine
GET /categories.php          # List categories
GET /list.php?a=list         # List areas
```

**Features:**
- 300+ recipes
- Meal images
- Ingredients with measures
- Cooking instructions
- YouTube video links
- Category & cuisine filtering

---

## Recommended APIs

### Spoonacular

| Property | Value |
|----------|-------|
| **Website** | https://spoonacular.com |
| **API Docs** | https://spoonacular.com/food-api/docs |
| **Base URL** | `https://api.spoonacular.com` |
| **Auth** | API Key (header or query param) |
| **Free Tier** | 150 requests/day |
| **Pricing** | $29/mo for 1,500 calls |

**Key Endpoints:**
```
GET /recipes/complexSearch          # Advanced search
GET /recipes/{id}/information       # Recipe details
GET /recipes/{id}/nutritionWidget   # Nutrition info
GET /recipes/random                 # Random recipes
GET /recipes/findByIngredients      # Search by ingredients
GET /mealplanner/generate           # Generate meal plan
GET /food/ingredients/substitutes   # Ingredient substitutes
```

**Features:**
- 500,000+ recipes
- Detailed nutrition (50+ nutrients)
- Ingredient substitutes
- Wine pairing
- Meal planning
- Cost estimation per serving
- Diet/allergy filtering

**Sample Request:**
```bash
curl "https://api.spoonacular.com/recipes/complexSearch?apiKey=YOUR_KEY&query=pasta&diet=vegetarian"
```

---

### Edamam

| Property | Value |
|----------|-------|
| **Website** | https://www.edamam.com |
| **API Docs** | https://developer.edamam.com/edamam-docs-recipe-api |
| **Base URL** | `https://api.edamam.com/api/recipes/v2` |
| **Auth** | App ID + App Key |
| **Free Tier** | 10,000 calls/month |
| **Pricing** | Contact for pricing |

**Key Endpoints:**
```
GET /api/recipes/v2?type=public&q={query}  # Search recipes
GET /api/recipes/v2/{id}                    # Get recipe by ID
GET /api/nutrition-data                     # Nutrition analysis
```

**Features:**
- 2.3M+ recipes
- Detailed nutrition analysis
- Diet labels (keto, paleo, vegan, etc.)
- Health labels (gluten-free, dairy-free, etc.)
- Allergen detection
- Calorie range filtering

**Sample Request:**
```bash
curl "https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=YOUR_ID&app_key=YOUR_KEY"
```

---

### Tasty API (via RapidAPI)

| Property | Value |
|----------|-------|
| **Website** | https://rapidapi.com/apidojo/api/tasty |
| **Base URL** | `https://tasty.p.rapidapi.com` |
| **Auth** | RapidAPI Key (header) |
| **Free Tier** | 500 requests/month |
| **Pricing** | $0.01/request after free tier |

**Key Endpoints:**
```
GET /recipes/list          # List recipes
GET /recipes/get-more-info # Recipe details
GET /feeds/list            # Trending feeds
GET /tags/list             # Available tags
```

**Features:**
- Tasty/BuzzFeed recipes
- Video recipes with clips
- Step-by-step video instructions
- Trending recipes
- User ratings

**Sample Request:**
```bash
curl -X GET "https://tasty.p.rapidapi.com/recipes/list?from=0&size=20" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: tasty.p.rapidapi.com"
```

---

### Recipe Puppy

| Property | Value |
|----------|-------|
| **Website** | http://www.recipepuppy.com |
| **API Docs** | http://www.recipepuppy.com/about/api/ |
| **Base URL** | `http://www.recipepuppy.com/api/` |
| **Auth** | None |
| **Free Tier** | ✅ Free |
| **Rate Limit** | Not specified |

**Endpoints:**
```
GET /api/?i={ingredients}&q={query}&p={page}
```

**Features:**
- Simple ingredient-based search
- Links to original recipes
- No authentication required

**Note:** Limited features, good for simple use cases.

---

## Premium/Enterprise APIs

### Yummly

| Property | Value |
|----------|-------|
| **Website** | https://developer.yummly.com |
| **Auth** | API Key |
| **Pricing** | Contact sales |

**Features:**
- 2M+ recipes
- Personalization engine
- Nutrition data
- Shopping lists

---

### BigOven

| Property | Value |
|----------|-------|
| **Website** | https://api.bigoven.com |
| **Auth** | API Key |
| **Pricing** | $0.01/call |

**Features:**
- 1M+ recipes
- Grocery list generation
- Meal planning
- Recipe box (save favorites)

---

### Whisk

| Property | Value |
|----------|-------|
| **Website** | https://docs.whisk.com |
| **Pricing** | Enterprise |

**Features:**
- Recipe parsing from URLs
- Meal planning
- Shopping list generation
- Nutrition analysis

---

## Comparison Matrix

| API | Free Calls | Recipes | Nutrition | Videos | Meal Plans |
|-----|------------|---------|-----------|--------|------------|
| TheMealDB | Unlimited | 300+ | ❌ | YouTube | ❌ |
| Spoonacular | 150/day | 500K+ | ✅ | ❌ | ✅ |
| Edamam | 10K/mo | 2.3M+ | ✅✅ | ❌ | ❌ |
| Tasty | 500/mo | 5K+ | ❌ | ✅✅ | ❌ |
| Recipe Puppy | Unlimited | 100K+ | ❌ | ❌ | ❌ |

---

## Integration Priority

1. **Keep TheMealDB** - Free, good variety
2. **Add Spoonacular** - Best for nutrition data
3. **Add Edamam** - If detailed nutrition needed
4. **Add Tasty** - If video content wanted

---

## Environment Variables

```bash
# TheMealDB (current)
MEALDB_API_URL=https://www.themealdb.com/api/json/v1/1
MEALDB_API_KEY=1

# Spoonacular (recommended)
SPOONACULAR_API_URL=https://api.spoonacular.com
SPOONACULAR_API_KEY=your_key

# Edamam
EDAMAM_API_URL=https://api.edamam.com/api/recipes/v2
EDAMAM_APP_ID=your_app_id
EDAMAM_APP_KEY=your_app_key

# Tasty (RapidAPI)
TASTY_API_URL=https://tasty.p.rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key
```
