import React from 'react';
import { motion } from 'motion/react';
import { Flame, Dumbbell, Wheat, Droplets } from 'lucide-react';

interface NutrientData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface NutritionChartProps {
  data: NutrientData[];
  labels: string[];
  targetCalories?: number;
}

export const NutritionChart: React.FC<NutritionChartProps> = ({
  data,
  labels,
  targetCalories = 2000,
}) => {
  const maxCalories = Math.max(...data.map(d => d.calories), targetCalories);
  
  const totals = data.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbohydrates: acc.carbohydrates + d.carbohydrates,
      fat: acc.fat + d.fat,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  const avgCalories = data.length > 0 ? totals.calories / data.length : 0;

  return (
    <div className="space-y-6">
      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-200 rounded-lg">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">Calories</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">{Math.round(totals.calories)}</div>
          <div className="text-xs text-orange-500">avg {Math.round(avgCalories)}/day</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-200 rounded-lg">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Protein</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{Math.round(totals.protein)}g</div>
          <div className="text-xs text-emerald-500">avg {Math.round(totals.protein / (data.length || 1))}g/day</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-200 rounded-lg">
              <Wheat className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Carbs</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">{Math.round(totals.carbohydrates)}g</div>
          <div className="text-xs text-amber-500">avg {Math.round(totals.carbohydrates / (data.length || 1))}g/day</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-200 rounded-lg">
              <Droplets className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Fat</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{Math.round(totals.fat)}g</div>
          <div className="text-xs text-purple-500">avg {Math.round(totals.fat / (data.length || 1))}g/day</div>
        </motion.div>
      </div>

      {/* Calorie Bar Chart */}
      <div className="p-4 bg-white rounded-2xl border border-stone-100">
        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">
          Daily Calories
        </h4>
        <div className="flex items-end gap-2 h-40">
          {data.map((day, idx) => {
            const height = (day.calories / maxCalories) * 100;
            const isOverTarget = day.calories > targetCalories;
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className={`w-full rounded-t-lg relative group cursor-pointer ${
                    isOverTarget
                      ? 'bg-gradient-to-t from-red-400 to-red-300'
                      : 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                  }`}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {Math.round(day.calories)} kcal
                  </div>
                </motion.div>
                <span className="text-[10px] font-medium text-stone-400">{labels[idx]}</span>
              </div>
            );
          })}
        </div>
        
        {/* Target line */}
        <div className="relative mt-2">
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-300"
            style={{ bottom: `${(targetCalories / maxCalories) * 160}px` }}
          />
          <div className="flex items-center justify-end gap-2 text-xs text-stone-400">
            <span className="w-3 h-0.5 bg-emerald-300" />
            Target: {targetCalories} kcal
          </div>
        </div>
      </div>

      {/* Macro Distribution */}
      <div className="p-4 bg-white rounded-2xl border border-stone-100">
        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">
          Macro Distribution
        </h4>
        <div className="flex h-4 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totals.protein * 4 / (totals.protein * 4 + totals.carbohydrates * 4 + totals.fat * 9)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totals.carbohydrates * 4 / (totals.protein * 4 + totals.carbohydrates * 4 + totals.fat * 9)) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-amber-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totals.fat * 9 / (totals.protein * 4 + totals.carbohydrates * 4 + totals.fat * 9)) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-purple-500"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-stone-500">Protein {Math.round((totals.protein * 4 / (totals.protein * 4 + totals.carbohydrates * 4 + totals.fat * 9)) * 100)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-stone-500">Carbs {Math.round((totals.carbohydrates * 4 / (totals.protein * 4 + totals.carbohydrates * 4 + totals.fat * 9)) * 100)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-stone-500">Fat {Math.round((totals.fat * 9 / (totals.protein * 4 + totals.carbohydrates * 4 + totals.fat * 9)) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
