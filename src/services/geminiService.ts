import { GoogleGenAI, Type } from "@google/genai";
import { MealItem, MealCategory, DietType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateMealImage(mealName: string, description: string, retryCount = 0): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-quality, professional food photography shot of ${mealName}. ${description}. The lighting should be bright and natural, making the food look delicious and healthy. White background or clean kitchen setting.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // Handle rate limiting (429)
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000 + Math.random() * 1000;
        console.warn(`Rate limit hit for ${mealName}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
        return generateMealImage(mealName, description, retryCount + 1);
      }
    }
    console.error(`Error generating image for ${mealName}:`, error);
  }
  return undefined;
}

/**
 * Calculates a rotation index based on the current date.
 * The index changes every 2 weeks.
 */
function getRotationIndex(): number {
  const referenceDate = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
  return Math.floor((now - referenceDate) / twoWeeksInMs);
}

export async function fetchMeals(category: MealCategory, dietType: DietType): Promise<MealItem[]> {
  const rotationIndex = getRotationIndex();
  
  const categoryLabel = category === 'Juices' ? 'healthy juice or smoothie recipes' : `healthy ${category} food items`;
  
  const prompt = `Provide a list of 10 ${categoryLabel} for a ${dietType} diet. 
  This is rotation set #${rotationIndex}. Please provide a unique set of items different from previous rotations if possible.
  For each item, include:
  - name
  - description (brief)
  - calories (approximate number)
  - protein (approximate grams as a string, e.g., "15g")
  - benefits (a list of 2-3 key health benefits)
  - instructions (a list of 4-6 step-by-step preparation instructions)
  
  Return the data as a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        seed: rotationIndex, // Use the rotation index as a seed for consistency within the 2-week window
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.STRING },
              benefits: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
            },
            required: ["name", "description", "calories", "protein", "benefits", "instructions"]
          }
        }
      }
    });

    const meals = JSON.parse(response.text || "[]");
    
    // Generate images for each meal with a slight stagger to avoid immediate rate limits
    const mealsWithImages = await Promise.all(
      meals.map(async (meal: any, index: number) => {
        // Add a small initial delay based on index
        await sleep(index * 500);
        const imageUrl = await generateMealImage(meal.name, meal.description);
        return {
          ...meal,
          id: meal.id || `${category}-${dietType}-${index}`,
          category,
          dietType,
          reviews: [],
          imageUrl
        };
      })
    );

    return mealsWithImages;
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
}
