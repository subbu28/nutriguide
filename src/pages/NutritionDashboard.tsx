import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Target,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Coffee,
  Sun,
  Moon,
  GlassWater,
  Heart,
  Globe,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

// Extend api client with analytics methods
declare module '../lib/api' {
  interface ApiClient {
    getNutritionAnalytics(period: 'week' | 'month' | 'year'): Promise<NutritionAnalytics>;
    getMacroBreakdown(period: string): Promise<MacroBreakdown>;
    getMealCategoryStats(period: string): Promise<MealCategoryStats>;
  }
}

// Types
interface NutritionAnalytics {
  dailyData: {
    date: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }[];
  averageCalories: number;
  totalCalories: number;
  goalAchievement: number;
}

interface MacroBreakdown {
  protein: number;
  carbohydrates: number;
  fat: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

interface MealCategoryStats {
  categories: {
    name: string;
    count: number;
    calories: number;
  }[];
}

interface CuisineStats {
  cuisines: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

interface FavoriteMeal {
  id: string;
  name: string;
  count: number;
  category: string;
  imageUrl?: string;
}

interface NutritionGoals {
  calorieGoal: number;
  proteinGoal: number;
  currentCalories: number;
  currentProtein: number;
}

type Period = 'week' | 'month' | 'year';

// Mock data for development (will be replaced by API)
const generateMockData = (period: Period) => {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return {
      date: date.toISOString().split('T')[0],
      calories: 1800 + Math.random() * 800,
      protein: 80 + Math.random() * 80,
      carbohydrates: 200 + Math.random() * 150,
      fat: 50 + Math.random() * 50,
    };
  });

  return {
    nutritionAnalytics: {
      dailyData,
      averageCalories: dailyData.reduce((acc, d) => acc + d.calories, 0) / days,
      totalCalories: dailyData.reduce((acc, d) => acc + d.calories, 0),
      goalAchievement: 78,
    } as NutritionAnalytics,
    macroBreakdown: {
      protein: dailyData.reduce((acc, d) => acc + d.protein, 0),
      carbohydrates: dailyData.reduce((acc, d) => acc + d.carbohydrates, 0),
      fat: dailyData.reduce((acc, d) => acc + d.fat, 0),
      proteinPercentage: 25,
      carbsPercentage: 50,
      fatPercentage: 25,
    } as MacroBreakdown,
    mealCategoryStats: {
      categories: [
        { name: 'Breakfast', count: Math.floor(days * 0.9), calories: 450 * Math.floor(days * 0.9) },
        { name: 'Lunch', count: Math.floor(days * 0.95), calories: 650 * Math.floor(days * 0.95) },
        { name: 'Dinner', count: Math.floor(days * 0.9), calories: 700 * Math.floor(days * 0.9) },
        { name: 'Snacks', count: Math.floor(days * 0.6), calories: 250 * Math.floor(days * 0.6) },
      ],
    } as MealCategoryStats,
    cuisineStats: {
      cuisines: [
        { name: 'Italian', count: 45, percentage: 28 },
        { name: 'Mexican', count: 32, percentage: 20 },
        { name: 'Asian', count: 28, percentage: 17 },
        { name: 'American', count: 24, percentage: 15 },
        { name: 'Indian', count: 16, percentage: 10 },
        { name: 'Other', count: 16, percentage: 10 },
      ],
    } as CuisineStats,
    favoriteMeals: [
      { id: '1', name: 'Grilled Chicken Salad', count: 12, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
      { id: '2', name: 'Avocado Toast', count: 10, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?w=100&h=100&fit=crop' },
      { id: '3', name: 'Salmon with Vegetables', count: 8, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100&h=100&fit=crop' },
      { id: '4', name: 'Greek Yogurt Bowl', count: 7, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&h=100&fit=crop' },
      { id: '5', name: 'Quinoa Buddha Bowl', count: 6, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' },
    ] as FavoriteMeal[],
    nutritionGoals: {
      calorieGoal: 2200,
      proteinGoal: 150,
      currentCalories: 2150,
      currentProtein: 142,
    } as NutritionGoals,
  };
};

// SVG Line Chart Component
const LineChart: React.FC<{
  data: { date: string; value: number }[];
  target?: number;
  color?: string;
  height?: number;
}> = ({ data, target, color = '#10b981', height = 200 }) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), target || 0);
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const padding = 20;
  const chartWidth = 100;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minValue) / range) * chartHeight + padding;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${chartWidth},${height} L 0,${height} Z`;

  const targetY = target ? chartHeight - ((target - minValue) / range) * chartHeight + padding : null;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1="0"
          y1={padding + t * chartHeight}
          x2={chartWidth}
          y2={padding + t * chartHeight}
          stroke="#e5e7eb"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      ))}

      {/* Area under the line */}
      <motion.path
        d={areaPath}
        fill={color}
        fillOpacity="0.1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Data points */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((d.value - minValue) / range) * chartHeight + padding;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="hover:r-5 transition-all"
          />
        );
      })}

      {/* Target line */}
      {targetY && (
        <>
          <line
            x1="0"
            y1={targetY}
            x2={chartWidth}
            y2={targetY}
            stroke="#f97316"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x="5" y={targetY - 5} fontSize="8" fill="#f97316" fontWeight="500">
            Target: {target}
          </text>
        </>
      )}
    </svg>
  );
};

// SVG Doughnut Chart Component
const DoughnutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
}> = ({ data, size = 160 }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const center = size / 2;
  const radius = (size - 20) / 2;
  const innerRadius = radius * 0.6;

  let currentAngle = -Math.PI / 2;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const angle = (d.value / total) * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);

          const x3 = center + innerRadius * Math.cos(endAngle);
          const y3 = center + innerRadius * Math.sin(endAngle);
          const x4 = center + innerRadius * Math.cos(startAngle);
          const y4 = center + innerRadius * Math.sin(startAngle);

          const largeArcFlag = angle > Math.PI ? 1 : 0;

          const path = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
            Z
          `;

          currentAngle += angle;

          return (
            <motion.path
              key={i}
              d={path}
              fill={d.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Center text */}
        <text x={center} y={center - 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
          {Math.round(total)}
        </text>
        <text x={center} y={center + 12} textAnchor="middle" fontSize="8" fill="#6b7280">
          Total g
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-stone-600">{d.label}</span>
            <span className="text-sm font-semibold text-stone-800 ml-auto">{Math.round(d.value)}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// SVG Bar Chart Component
const BarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  height?: number;
}> = ({ data, height = 160 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 40;
  const gap = 20;
  const totalWidth = data.length * (barWidth + gap) + gap;

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * (height - 40);
        const x = gap + i * (barWidth + gap);
        const y = height - barHeight - 25;

        return (
          <g key={i}>
            {/* Bar */}
            <motion.rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={d.color}
              rx="6"
              initial={{ height: 0, y: height - 25 }}
              animate={{ height: barHeight, y }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
            {/* Label */}
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
              {d.label}
            </text>
            {/* Value */}
            <motion.text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#374151"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
            >
              {Math.round(d.value)}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
};

// Progress Ring Component
const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}> = ({ progress, size = 80, strokeWidth = 8, color = '#10b981' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-stone-800">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Category Icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  Breakfast: <Coffee className="w-5 h-5" />,
  Lunch: <Sun className="w-5 h-5" />,
  Dinner: <Moon className="w-5 h-5" />,
  Snacks: <GlassWater className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  Breakfast: '#f97316',
  Lunch: '#10b981',
  Dinner: '#3b82f6',
  Snacks: '#8b5cf6',
};

export function NutritionDashboard() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<Period>('week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReturnType<typeof generateMockData> | null>(null);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In production, these would call:
      // const [analytics, macros, categories] = await Promise.all([
      //   api.getNutritionAnalytics(period),
      //   api.getMacroBreakdown(period),
      //   api.getMealCategoryStats(period),
      // ]);
      const mockData = generateMockData(period);
      setData(mockData);
    } catch (err) {
      console.error('Failed to load nutrition data:', err);
    } finally {
      setLoading(false);
    }
  };

  const periodLabels: Record<Period, string> = {
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    year: 'Last 365 Days',
  };

  const calorieData = useMemo(() => {
    if (!data) return [];
    return data.nutritionAnalytics.dailyData.map(d => ({
      date: d.date,
      value: Math.round(d.calories),
    }));
  }, [data]);

  const macroData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Protein', value: data.macroBreakdown.protein, color: '#10b981' },
      { label: 'Carbs', value: data.macroBreakdown.carbohydrates, color: '#f59e0b' },
      { label: 'Fat', value: data.macroBreakdown.fat, color: '#8b5cf6' },
    ];
  }, [data]);

  const categoryData = useMemo(() => {
    if (!data) return [];
    return data.mealCategoryStats.categories.map(c => ({
      label: c.name,
      value: c.count,
      color: categoryColors[c.name] || '#6b7280',
    }));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const { nutritionAnalytics, macroBreakdown, mealCategoryStats, cuisineStats, favoriteMeals, nutritionGoals } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Nutrition Insights
          </h1>
          <p className="text-stone-600 mt-2">Track your nutrition goals and eating patterns</p>
        </div>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-stone-500" />
            <span className="font-medium text-stone-700">{periodLabels[period]}</span>
            <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPeriodDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-100 z-10"
              >
                {(Object.keys(periodLabels) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      period === p ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-stone-700'
                    }`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Flame,
            label: 'Avg Calories',
            value: `${Math.round(nutritionAnalytics.averageCalories)}`,
            subtext: 'per day',
            color: 'from-orange-500 to-amber-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
          },
          {
            icon: Dumbbell,
            label: 'Avg Protein',
            value: `${Math.round(macroBreakdown.protein / nutritionAnalytics.dailyData.length)}g`,
            subtext: 'per day',
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
          },
          {
            icon: Utensils,
            label: 'Total Meals',
            value: mealCategoryStats.categories.reduce((acc, c) => acc + c.count, 0).toString(),
            subtext: `${periodLabels[period].split(' ')[1]} tracked`,
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
          },
          {
            icon: Target,
            label: 'Goal Progress',
            value: `${Math.round(nutritionAnalytics.goalAchievement)}%`,
            subtext: 'on track',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + idx * 0.05 }}
            className="glass rounded-2xl p-5 card-hover"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
            <p className="text-xs text-stone-400 mt-1">{stat.subtext}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Trend Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800">Calorie Trend</h3>
                <p className="text-sm text-stone-500">Daily intake vs goal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-500" />
                <span className="text-stone-500">Intake</span>
              </span>
              <span className="flex items-center gap-1 ml-3">
                <span className="w-3 h-0.5 bg-orange-500 border-dashed" />
                <span className="text-stone-500">Goal</span>
              </span>
            </div>
          </div>

          <div className="h-64">
            <LineChart
              data={calorieData}
              target={nutritionGoals.calorieGoal}
              color="#10b981"
              height={256}
            />
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-stone-400">
            {period === 'week' ? (
              ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d}>{d}</span>
              ))
            ) : period === 'month' ? (
              ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(d => (
                <span key={d}>{d}</span>
              ))
            ) : (
              ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(d => (
                <span key={d}>{d}</span>
              ))
            )}
          </div>
        </motion.section>

        {/* Macro Distribution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800">Macronutrients</h3>
                <p className="text-sm text-stone-500">Protein, carbs & fat breakdown</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <DoughnutChart data={macroData} size={180} />
          </div>

          {/* Macro Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: 'Protein', value: macroBreakdown.proteinPercentage, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
              { label: 'Carbs', value: macroBreakdown.carbsPercentage, color: 'text-amber-600', bgColor: 'bg-amber-100' },
              { label: 'Fat', value: macroBreakdown.fatPercentage, color: 'text-purple-600', bgColor: 'bg-purple-100' },
            ].map((macro) => (
              <div key={macro.label} className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full ${macro.bgColor} ${macro.color} text-sm font-bold`}>
                  {macro.value}%
                </div>
                <p className="text-xs text-stone-500 mt-1">{macro.label}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Meal Categories</h3>
              <p className="text-sm text-stone-500">Distribution by meal type</p>
            </div>
          </div>

          <div className="h-40">
            <BarChart data={categoryData} height={160} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {mealCategoryStats.categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${categoryColors[cat.name]}20`, color: categoryColors[cat.name] }}
                >
                  {categoryIcons[cat.name]}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{cat.name}</p>
                  <p className="text-xs text-stone-500">{cat.count} meals</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Cuisine Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Cuisine Preferences</h3>
              <p className="text-sm text-stone-500">Your favorite cuisines</p>
            </div>
          </div>

          <div className="space-y-4">
            {cuisineStats.cuisines.map((cuisine, idx) => (
              <div key={cuisine.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-700">{cuisine.name}</span>
                  <span className="text-sm text-stone-500">{cuisine.count} meals</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cuisine.percentage}%` }}
                    transition={{ delay: 0.4 + idx * 0.05, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${
                        ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'][idx]
                      }, ${
                        ['#fb923c', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#9ca3af'][idx]
                      })`,
                    }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1">{cuisine.percentage}% of meals</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Nutrition Goals Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Goal Progress</h3>
              <p className="text-sm text-stone-500">Daily targets vs actual</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Calorie Goal */}
            <div className="flex items-center gap-4">
              <ProgressRing
                progress={(nutritionGoals.currentCalories / nutritionGoals.calorieGoal) * 100}
                size={70}
                color="#f97316"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-700">Calories</p>
                <p className="text-2xl font-bold text-stone-800">
                  {Math.round(nutritionGoals.currentCalories)}
                  <span className="text-sm font-normal text-stone-400"> / {nutritionGoals.calorieGoal}</span>
                </p>
                <p className="text-xs text-stone-500">kcal consumed today</p>
              </div>
            </div>

            {/* Protein Goal */}
            <div className="flex items-center gap-4">
              <ProgressRing
                progress={(nutritionGoals.currentProtein / nutritionGoals.proteinGoal) * 100}
                size={70}
                color="#10b981"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-700">Protein</p>
                <p className="text-2xl font-bold text-stone-800">
                  {Math.round(nutritionGoals.currentProtein)}
                  <span className="text-sm font-normal text-stone-400"> / {nutritionGoals.proteinGoal}g</span>
                </p>
                <p className="text-xs text-stone-500">grams consumed today</p>
              </div>
            </div>

            {/* Weekly Trend Indicator */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Weekly average</span>
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  +5%
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">Compared to last week</p>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Top Favorite Meals */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Top Favorite Meals</h3>
              <p className="text-sm text-stone-500">Most frequently enjoyed dishes</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {favoriteMeals.map((meal, idx) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              className="group relative bg-white rounded-xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Rank badge */}
              <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </div>

              {/* Image */}
              <div className="h-32 overflow-hidden">
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="font-medium text-stone-800 text-sm line-clamp-1">{meal.name}</p>
                <p className="text-xs text-stone-500 mt-1">{meal.category}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                  <Heart className="w-3 h-3 fill-current" />
                  <span className="font-medium">{meal.count} times</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Detailed Nutrient Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-stone-800 mb-6">Detailed Nutrient Breakdown</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: Flame,
              label: 'Total Calories',
              value: `${Math.round(nutritionAnalytics.totalCalories)}`,
              subtext: `avg ${Math.round(nutritionAnalytics.averageCalories)}/day`,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
            },
            {
              icon: Dumbbell,
              label: 'Total Protein',
              value: `${Math.round(macroBreakdown.protein)}g`,
              subtext: `${macroBreakdown.proteinPercentage}% of macros`,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
            },
            {
              icon: Wheat,
              label: 'Total Carbs',
              value: `${Math.round(macroBreakdown.carbohydrates)}g`,
              subtext: `${macroBreakdown.carbsPercentage}% of macros`,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50',
            },
            {
              icon: Droplets,
              label: 'Total Fat',
              value: `${Math.round(macroBreakdown.fat)}g`,
              subtext: `${macroBreakdown.fatPercentage}% of macros`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
            },
          ].map((nutrient, idx) => (
            <div key={nutrient.label} className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl ${nutrient.bgColor} flex items-center justify-center flex-shrink-0`}>
                <nutrient.icon className={`w-6 h-6 ${nutrient.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-800">{nutrient.value}</p>
                <p className="text-sm text-stone-600">{nutrient.label}</p>
                <p className="text-xs text-stone-400 mt-1">{nutrient.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
