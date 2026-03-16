export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Juices';
export type DietType = 'Vegetarian' | 'Non-Vegetarian';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MealItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: string;
  benefits: string[];
  category: MealCategory;
  dietType: DietType;
  reviews: Review[];
  imageUrl?: string;
  instructions?: string[];
}
