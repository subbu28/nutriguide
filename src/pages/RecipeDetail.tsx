import { useParams } from 'react-router-dom';

export function RecipeDetail() {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Recipe Details</h1>
      <p className="text-stone-500">Recipe ID: {id}</p>
    </div>
  );
}
