export type UserRole = 'admin' | 'member' | 'single'

export interface Profile {
  id: string
  email: string
  nickname?: string
  avatar_url?: string
  role: UserRole
  height?: number
  weight?: number
  birth_date?: string
  gender?: 'male' | 'female' | 'other'
  target_weight?: number
  daily_calorie_goal: number
  allergies?: string[]
  dietary_preferences?: string[]
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  name: string
  admin_id: string
  invite_code?: string
  health_goal?: string
  created_at: string
}

export interface HealthRecord {
  id: string
  user_id: string
  record_date: string
  weight?: number
  bmi?: number
  waist?: number
  chest?: number
  hip?: number
  calories_consumed: number
  calories_burned: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  created_at: string
}

export interface Recipe {
  id: string
  title: string
  description?: string
  image_url?: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  prep_time?: number
  cook_time?: number
  servings: number
  ingredients?: { name: string; amount: string }[]
  steps?: { step: number; description: string }[]
  tags?: string[]
  is_ai_generated: boolean
  created_by?: string
  created_at: string
}

export interface MealPlan {
  id: string
  user_id: string
  family_id?: string
  plan_date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipe_id?: string
  custom_meal?: string
  calories?: number
  created_at: string
}

export interface ExerciseRecord {
  id: string
  user_id: string
  exercise_date: string
  exercise_type: string
  duration_minutes?: number
  calories_burned?: number
  notes?: string
  created_at: string
}

export interface NutritionSummary {
  calories: number
  caloriesGoal: number
  protein: number
  proteinGoal: number
  carbs: number
  carbsGoal: number
  fat: number
  fatGoal: number
}

export interface FamilyMember {
  id: string
  user_id: string
  name: string
  relationship: string
  gender?: string
  age?: number
  birth_date?: string
  avatar_url?: string
  is_primary: boolean
  created_at: string
}

export interface HealthProfile {
  id: string
  member_id: string
  height?: number
  weight?: number
  bmi?: number
  blood_type?: string
  allergies?: string[]
  chronic_conditions?: string[]
  medical_notes?: string
  created_at: string
  updated_at: string
}

export interface DietaryPreference {
  id: string
  member_id: string
  taste_preferences?: string[]
  dietary_restrictions?: string[]
  religious_restrictions?: string[]
  cuisine_preferences?: string[]
  special_requirements?: string
  avoid_ingredients?: string[]
  daily_calorie_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  created_at: string
  updated_at: string
}

// 扩展性接口 - 为后续功能预留
export interface NutritionCalculation {
  member_id: string
  daily_needs: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    vitamins: Record<string, number>
    minerals: Record<string, number>
  }
  recommendations: string[]
}

export interface FamilyNutritionOverview {
  family_members: {
    id: string
    name: string
    daily_progress: number
    nutrition_score: number
    alerts: string[]
  }[]
  overall_score: number
  recommendations: string[]
}


// ============ 全球美食风向标类型 ============
export interface FoodTrend {
  id: string
  name: string
  description?: string
  image_url?: string
  heat_index: number
  category?: string
  origin_region?: string
  nutrition_highlights?: string[]
  tags?: string[]
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
}

export interface SeasonalIngredient {
  id: string
  name: string
  description?: string
  image_url?: string
  season: string
  months: number[]
  region?: string
  category: string
  calories_per_100g?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
  vitamins?: string[]
  minerals?: string[]
  health_benefits?: string[]
  recommend_index: number
  created_at: string
}

export interface RegionalCuisine {
  id: string
  region: string
  cuisine_name: string
  description?: string
  image_url?: string
  signature_dishes?: string[]
  nutrition_features?: string[]
  spice_level: number
  dietary_tags?: string[]
  popularity_index: number
  created_at: string
}

export interface TrendRecommendation {
  id: string
  user_id: string
  member_id?: string
  trend_id?: string
  ingredient_id?: string
  cuisine_id?: string
  recommendation_type: string
  reason?: string
  match_score: number
  is_dismissed: boolean
  created_at: string
}

// 推荐结果类型
export interface PersonalizedRecommendation {
  type: 'trend' | 'ingredient' | 'cuisine'
  item: FoodTrend | SeasonalIngredient | RegionalCuisine
  match_score: number
  reasons: string[]
}

// ============ 智能采购决策系统类型 ============
export interface IngredientSku {
  id: string
  name: string
  category?: string
  specification?: string
  unit?: string
  default_quantity?: number
  nutrition_per_100g?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  platform_mappings?: Record<string, string>
  average_price?: number
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface PantryItem {
  id: string
  user_id: string
  sku_id?: string
  ingredient_name: string
  quantity?: number
  unit?: string
  purchase_date?: string
  expiry_date?: string
  status: 'available' | 'low' | 'expired' | 'used'
  notes?: string
  created_at: string
  sku?: IngredientSku
}

export interface ShoppingListItem {
  sku_id?: string
  name: string
  quantity: number
  unit: string
  estimated_price?: number
  platform?: string
  checked: boolean
  notes?: string
}

export interface ShoppingList {
  id: string
  user_id: string
  name: string
  items: ShoppingListItem[]
  estimated_total?: number
  actual_total?: number
  status: 'pending' | 'shopping' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface PriceRecord {
  id: string
  sku_id?: string
  platform: string
  price: number
  original_price?: number
  discount_info?: string
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  recorded_at: string
}

export interface PriceComparison {
  sku: IngredientSku
  prices: {
    platform: string
    price: number
    original_price?: number
    discount_info?: string
    stock_status: string
    savings?: number
  }[]
  best_deal: {
    platform: string
    price: number
    savings: number
  }
}


// ============ Smart Chef Flow 智能烹饪引擎类型 ============
export interface CookingTask {
  id: string
  name: string
  duration: number // 分钟
  equipment: 'left' | 'right' | 'shared'
  dependencies?: string[]
  priority?: number
  status?: 'pending' | 'active' | 'completed'
}

export interface ScheduledDish {
  recipeId: string
  recipeName: string
  equipment: 'left' | 'right'
  startTime: number // 相对开始时间(分钟)
  duration: number
  tasks: CookingTask[]
  status: 'pending' | 'cooking' | 'completed'
}

export interface CookingSession {
  id: string
  user_id: string
  name?: string
  recipes: string[] // recipe IDs
  status: 'pending' | 'cooking' | 'paused' | 'completed'
  scheduled_dishes: ScheduledDish[]
  current_step_index: number
  started_at?: string
  estimated_end_time?: string
  actual_end_time?: string
  total_duration?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CookingProgress {
  id: string
  session_id: string
  step_id?: string
  step_index: number
  equipment: 'left' | 'right' | 'shared'
  status: 'pending' | 'active' | 'completed' | 'skipped'
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  temperature?: number
  notes?: string
  voice_prompts?: string[]
  created_at: string
}

export interface CookingStep {
  id: string
  recipe_id: string
  step_number: number
  title: string
  description: string
  duration_minutes: number
  temperature?: number
  tips?: string
  equipment?: 'left' | 'right' | 'shared'
  created_at: string
}

export interface RecipeWithSteps {
  id: string
  name: string
  description?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  cooking_time?: number
  prep_time?: number
  servings?: number
  ingredients?: { name: string; amount: string }[]
  tags?: string[]
  difficulty?: string
  equipment_needed?: string[]
  parallel_tasks?: CookingTask[]
  steps?: CookingStep[]
}

export interface DualBurnerState {
  left: {
    active: boolean
    currentTask?: CookingTask
    recipeName?: string
    remainingTime: number
    temperature?: number
  }
  right: {
    active: boolean
    currentTask?: CookingTask
    recipeName?: string
    remainingTime: number
    temperature?: number
  }
}

export interface VoiceCommand {
  type: 'start' | 'pause' | 'resume' | 'next' | 'repeat' | 'query' | 'stop'
  target?: string
  value?: string
}
