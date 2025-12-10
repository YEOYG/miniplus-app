import { supabase } from './supabase'
import type { Recipe, HealthRecord, MealPlan, ExerciseRecord, Profile, FamilyMember, HealthProfile, DietaryPreference, FoodTrend, SeasonalIngredient, RegionalCuisine, IngredientSku, PantryItem, ShoppingList, ShoppingListItem, PriceRecord, PriceComparison } from '@/types'

// ============ 食谱相关 ============
export async function getRecipes(tags?: string[]) {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getRecipeById(id: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error

  // 获取制作步骤
  const { data: steps } = await supabase
    .from('cooking_steps')
    .select('*')
    .eq('recipe_id', id)
    .order('step_number', { ascending: true })

  return { ...data, steps: steps || [] }
}

export async function searchRecipes(query: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .ilike('name', `%${query}%`)

  if (error) throw error
  return data
}

// ============ 健康数据相关 ============
export async function getTodayNutrition(memberId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: mealPlans, error } = await supabase
    .from('meal_plans')
    .select('calories, protein, carbs, fat')
    .eq('member_id', memberId)
    .eq('plan_date', today)

  if (error) throw error

  const summary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  mealPlans?.forEach(meal => {
    summary.calories += meal.calories || 0
    summary.protein += Number(meal.protein) || 0
    summary.carbs += Number(meal.carbs) || 0
    summary.fat += Number(meal.fat) || 0
  })

  return summary
}

export async function getHealthRecords(memberId: string, days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('member_id', memberId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addMealPlan(mealPlan: {
  memberId: string
  planDate: string
  mealType: string
  recipeId?: string
  calories: number
  protein: number
  carbs: number
  fat: number
}) {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      member_id: mealPlan.memberId,
      plan_date: mealPlan.planDate,
      meal_type: mealPlan.mealType,
      recipe_id: mealPlan.recipeId,
      calories: mealPlan.calories,
      protein: mealPlan.protein,
      carbs: mealPlan.carbs,
      fat: mealPlan.fat,
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// ============ 家庭成员相关 ============
export async function getFamilyMembers(userId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })

  if (error) throw error
  return data
}

export async function getPrimaryMember(userId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createFamilyMember(member: {
  userId: string
  name: string
  relationship: string
  gender?: string
  birthDate?: string
  isPrimary?: boolean
}) {
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      user_id: member.userId,
      name: member.name,
      relationship: member.relationship,
      gender: member.gender,
      birth_date: member.birthDate,
      is_primary: member.isPrimary || false,
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// ============ 运动记录相关 ============
export async function getTodayExercise(memberId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('member_id', memberId)
    .gte('recorded_at', today)

  if (error) throw error
  return data
}

// ============ AI聊天相关 ============
export async function sendAIMessage(message: string, userProfile?: Profile) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL || 'https://uwpgbynmxteretbjssfh.supabase.co'}/functions/v1/ai-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cGdieW5teHRlcmV0Ympzc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTM0ODMsImV4cCI6MjA3NzYyOTQ4M30._PpWP_4ktmA-3h3GbO5kHeAuZRxpyxnt-wnIa1VSaOc'}`,
      },
      body: JSON.stringify({ message, userProfile }),
    }
  )

  if (!response.ok) {
    throw new Error('AI请求失败')
  }

  return response.json()
}

// ============ 购物清单相关 ============
export async function getShoppingLists(userId: string) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addToShoppingList(userId: string, items: { name: string; amount: string }[]) {
  // 获取或创建当前购物清单
  let { data: list } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!list) {
    const { data: newList, error } = await supabase
      .from('shopping_lists')
      .insert({ user_id: userId, name: '购物清单' })
      .select()
      .maybeSingle()

    if (error) throw error
    list = newList
  }

  // 添加购物项
  const { error } = await supabase
    .from('shopping_items')
    .insert(items.map(item => ({
      list_id: list.id,
      name: item.name,
      quantity: item.amount,
    })))

  if (error) throw error
  return list
}


// ============ 健康档案相关 ============
export async function getHealthProfile(memberId: string): Promise<HealthProfile | null> {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertHealthProfile(profile: Partial<HealthProfile> & { member_id: string }): Promise<HealthProfile> {
  // 计算BMI
  let bmi = profile.bmi
  if (profile.height && profile.weight && profile.height > 0) {
    const heightM = profile.height / 100
    bmi = Number((profile.weight / (heightM * heightM)).toFixed(2))
  }

  const { data, error } = await supabase
    .from('health_profiles')
    .upsert({
      ...profile,
      bmi,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'member_id' })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// ============ 饮食偏好相关 ============
export async function getDietaryPreference(memberId: string): Promise<DietaryPreference | null> {
  const { data, error } = await supabase
    .from('dietary_preferences')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertDietaryPreference(pref: Partial<DietaryPreference> & { member_id: string }): Promise<DietaryPreference> {
  const { data, error } = await supabase
    .from('dietary_preferences')
    .upsert({
      ...pref,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'member_id' })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// ============ 家庭成员扩展 ============
export async function getFamilyMemberById(memberId: string): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', memberId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
  const { data, error } = await supabase
    .from('family_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

export async function deleteFamilyMember(memberId: string): Promise<void> {
  // 先删除关联的健康档案和饮食偏好
  await supabase.from('health_profiles').delete().eq('member_id', memberId)
  await supabase.from('dietary_preferences').delete().eq('member_id', memberId)
  
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}

// ============ 营养平衡算法框架 ============
export function calculateNutritionNeeds(profile: HealthProfile, preference: DietaryPreference | null, member: FamilyMember) {
  // 基础代谢率 (BMR) - Harris-Benedict 公式
  let bmr = 1500 // 默认值
  
  if (profile.weight && profile.height && member.age) {
    if (member.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * member.age)
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * member.age)
    }
  }

  // 活动系数 (假设轻度活动)
  const activityFactor = 1.375
  const tdee = bmr * activityFactor

  // 宏量营养素分配
  const proteinRatio = 0.2
  const carbsRatio = 0.5
  const fatRatio = 0.3

  return {
    calories: Math.round(preference?.daily_calorie_goal || tdee),
    protein: Math.round(preference?.protein_goal || (tdee * proteinRatio / 4)),
    carbs: Math.round(preference?.carbs_goal || (tdee * carbsRatio / 4)),
    fat: Math.round(preference?.fat_goal || (tdee * fatRatio / 9)),
    fiber: 25,
    recommendations: generateNutritionRecommendations(profile, preference),
  }
}

function generateNutritionRecommendations(profile: HealthProfile, preference: DietaryPreference | null): string[] {
  const recommendations: string[] = []

  // 基于BMI的建议
  if (profile.bmi) {
    if (profile.bmi < 18.5) {
      recommendations.push('BMI偏低，建议适当增加蛋白质和健康脂肪摄入')
    } else if (profile.bmi > 24) {
      recommendations.push('BMI偏高，建议控制热量摄入，增加蔬菜比例')
    }
  }

  // 基于过敏原的建议
  if (profile.allergies && profile.allergies.length > 0) {
    recommendations.push(`注意避开过敏原：${profile.allergies.join('、')}`)
  }

  // 基于慢性病的建议
  if (profile.chronic_conditions?.includes('高血压')) {
    recommendations.push('建议低盐饮食，每日盐摄入量不超过5克')
  }
  if (profile.chronic_conditions?.includes('糖尿病')) {
    recommendations.push('建议控制碳水化合物摄入，选择低GI食物')
  }

  return recommendations
}

// ============ 家庭营养概览 ============
export async function getFamilyNutritionOverview(userId: string) {
  const members = await getFamilyMembers(userId)
  
  const memberData = await Promise.all(
    (members || []).map(async (member: FamilyMember) => {
      const todayNutrition = await getTodayNutrition(member.id)
      const healthProfile = await getHealthProfile(member.id)
      const dietPref = await getDietaryPreference(member.id)
      
      const dailyGoal = dietPref?.daily_calorie_goal || 2000
      const progress = Math.round((todayNutrition.calories / dailyGoal) * 100)
      
      // 计算营养评分 (0-100)
      const score = calculateNutritionScore(todayNutrition, dietPref)
      
      // 生成警告
      const alerts: string[] = []
      if (progress > 120) alerts.push('热量摄入超标')
      if (todayNutrition.protein < (dietPref?.protein_goal || 60) * 0.5) alerts.push('蛋白质摄入不足')
      
      return {
        id: member.id,
        name: member.name,
        daily_progress: progress,
        nutrition_score: score,
        alerts,
      }
    })
  )

  const overallScore = memberData.length > 0 
    ? Math.round(memberData.reduce((sum, m) => sum + m.nutrition_score, 0) / memberData.length)
    : 0

  return {
    family_members: memberData,
    overall_score: overallScore,
    recommendations: generateFamilyRecommendations(memberData),
  }
}

function calculateNutritionScore(nutrition: any, preference: DietaryPreference | null): number {
  const goals = {
    calories: preference?.daily_calorie_goal || 2000,
    protein: preference?.protein_goal || 60,
    carbs: preference?.carbs_goal || 250,
    fat: preference?.fat_goal || 65,
  }

  // 计算每个营养素的达成率
  const calorieScore = Math.min(100, (nutrition.calories / goals.calories) * 100)
  const proteinScore = Math.min(100, (nutrition.protein / goals.protein) * 100)
  const carbsScore = Math.min(100, (nutrition.carbs / goals.carbs) * 100)
  const fatScore = Math.min(100, (nutrition.fat / goals.fat) * 100)

  // 加权平均
  return Math.round((calorieScore * 0.4 + proteinScore * 0.3 + carbsScore * 0.15 + fatScore * 0.15))
}

function generateFamilyRecommendations(members: any[]): string[] {
  const recommendations: string[] = []
  
  const lowProgressMembers = members.filter(m => m.daily_progress < 50)
  if (lowProgressMembers.length > 0) {
    recommendations.push(`${lowProgressMembers.map(m => m.name).join('、')}今日摄入不足，请注意按时用餐`)
  }

  const highProgressMembers = members.filter(m => m.daily_progress > 120)
  if (highProgressMembers.length > 0) {
    recommendations.push(`${highProgressMembers.map(m => m.name).join('、')}今日热量超标，建议增加运动`)
  }

  return recommendations
}


// ============ 全球美食风向标 API ============
export async function getFoodTrends() {
  const { data, error } = await supabase
    .from('food_trends')
    .select('*')
    .eq('is_active', true)
    .order('heat_index', { ascending: false })

  if (error) throw error
  return data
}

export async function getSeasonalIngredients(month?: number) {
  const currentMonth = month || new Date().getMonth() + 1
  
  const { data, error } = await supabase
    .from('seasonal_ingredients')
    .select('*')
    .contains('months', [currentMonth])
    .order('recommend_index', { ascending: false })

  if (error) throw error
  return data
}

export async function getRegionalCuisines() {
  const { data, error } = await supabase
    .from('regional_cuisines')
    .select('*')
    .order('popularity_index', { ascending: false })

  if (error) throw error
  return data
}

export async function getPersonalizedRecommendations(userId: string) {
  // 获取用户的家庭成员
  const members = await getFamilyMembers(userId)
  if (!members || members.length === 0) return []

  // 收集所有成员的健康档案和饮食偏好
  const memberProfiles = await Promise.all(
    members.map(async (member: FamilyMember) => {
      const health = await getHealthProfile(member.id).catch(() => null)
      const diet = await getDietaryPreference(member.id).catch(() => null)
      return { member, health, diet }
    })
  )

  // 获取趋势和食材数据
  const [trends, ingredients, cuisines] = await Promise.all([
    getFoodTrends(),
    getSeasonalIngredients(),
    getRegionalCuisines(),
  ])

  // 生成个性化推荐
  const recommendations: any[] = []

  // 基于饮食偏好匹配趋势
  memberProfiles.forEach(({ member, health, diet }) => {
    if (!diet) return

    // 匹配趋势
    trends?.forEach((trend: any) => {
      let score = trend.heat_index
      const reasons: string[] = []

      // 基于慢性病调整
      if (health?.chronic_conditions?.includes('高血压') && trend.tags?.includes('低盐')) {
        score += 20
        reasons.push('适合高血压人群的低盐饮食')
      }
      if (health?.chronic_conditions?.includes('糖尿病') && trend.tags?.includes('控糖')) {
        score += 20
        reasons.push('有助于血糖控制')
      }

      // 基于饮食限制匹配
      if (diet.dietary_restrictions?.includes('素食') && trend.tags?.includes('素食')) {
        score += 15
        reasons.push('符合素食饮食偏好')
      }

      if (reasons.length > 0) {
        recommendations.push({
          type: 'trend',
          item: trend,
          match_score: Math.min(100, score),
          reasons,
          member_name: member.name,
        })
      }
    })

    // 匹配当季食材
    ingredients?.forEach((ing: any) => {
      let score = ing.recommend_index
      const reasons: string[] = ['当季新鲜食材']

      // 基于过敏原排除
      if (health?.allergies?.some((a: string) => ing.name.includes(a))) {
        return // 跳过过敏食材
      }

      // 基于健康需求调整
      if (health?.chronic_conditions?.includes('贫血') && ing.minerals?.includes('铁')) {
        score += 15
        reasons.push('富含铁元素，适合补血')
      }

      // 基于营养目标调整
      if (diet.dietary_restrictions?.includes('低脂') && ing.fat_g && ing.fat_g < 2) {
        score += 10
        reasons.push('低脂食材，符合饮食目标')
      }

      recommendations.push({
        type: 'ingredient',
        item: ing,
        match_score: Math.min(100, score),
        reasons,
        member_name: member.name,
      })
    })

    // 匹配地域美食
    cuisines?.forEach((cuisine: any) => {
      let score = cuisine.popularity_index
      const reasons: string[] = []

      // 基于口味偏好匹配
      if (diet.taste_preferences?.includes('辣') && cuisine.spice_level >= 4) {
        score += 15
        reasons.push('符合喜辣口味')
      }
      if (diet.taste_preferences?.includes('清淡') && cuisine.spice_level <= 2) {
        score += 15
        reasons.push('口味清淡健康')
      }

      // 基于菜系偏好匹配
      if (diet.cuisine_preferences?.some((c: string) => cuisine.cuisine_name.includes(c))) {
        score += 20
        reasons.push('喜爱的菜系风格')
      }

      if (reasons.length > 0) {
        recommendations.push({
          type: 'cuisine',
          item: cuisine,
          match_score: Math.min(100, score),
          reasons,
          member_name: member.name,
        })
      }
    })
  })

  // 去重并排序
  const uniqueRecs = recommendations
    .reduce((acc: any[], curr) => {
      const existing = acc.find(r => r.item.id === curr.item.id && r.type === curr.type)
      if (existing) {
        existing.match_score = Math.max(existing.match_score, curr.match_score)
        existing.reasons = [...new Set([...existing.reasons, ...curr.reasons])]
      } else {
        acc.push(curr)
      }
      return acc
    }, [])
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20)

  return uniqueRecs
}

// 营养分析数据
export async function getFamilyNutritionAnalysis(userId: string) {
  const members = await getFamilyMembers(userId)
  if (!members || members.length === 0) return null

  const analysis = await Promise.all(
    members.map(async (member: FamilyMember) => {
      const health = await getHealthProfile(member.id).catch(() => null)
      const diet = await getDietaryPreference(member.id).catch(() => null)
      const nutrition = await getTodayNutrition(member.id).catch(() => ({ calories: 0, protein: 0, carbs: 0, fat: 0 }))

      const goals = {
        calories: diet?.daily_calorie_goal || 2000,
        protein: diet?.protein_goal || 60,
        carbs: diet?.carbs_goal || 250,
        fat: diet?.fat_goal || 65,
      }

      return {
        member_id: member.id,
        member_name: member.name,
        current: nutrition,
        goals,
        completion: {
          calories: Math.round((nutrition.calories / goals.calories) * 100),
          protein: Math.round((nutrition.protein / goals.protein) * 100),
          carbs: Math.round((nutrition.carbs / goals.carbs) * 100),
          fat: Math.round((nutrition.fat / goals.fat) * 100),
        },
        health_tags: health?.chronic_conditions || [],
        diet_restrictions: diet?.dietary_restrictions || [],
      }
    })
  )

  return {
    members: analysis,
    summary: {
      avg_calorie_completion: Math.round(analysis.reduce((s, m) => s + m.completion.calories, 0) / analysis.length),
      members_meeting_goals: analysis.filter(m => m.completion.calories >= 80 && m.completion.calories <= 120).length,
      total_members: analysis.length,
    },
  }
}


// ============ 智能采购决策系统 API ============

// SKU食材库
export async function getIngredientSkus(category?: string) {
  let query = supabase
    .from('ingredient_skus')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data as IngredientSku[]
}

export async function searchSkus(keyword: string) {
  const { data, error } = await supabase
    .from('ingredient_skus')
    .select('*')
    .eq('is_active', true)
    .ilike('name', `%${keyword}%`)
    .limit(20)

  if (error) throw error
  return data as IngredientSku[]
}

// 家庭库存管理
export async function getPantryInventory(userId: string) {
  const { data, error } = await supabase
    .from('pantry_inventory')
    .select('*, sku:ingredient_skus(*)')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })

  if (error) throw error
  return data as PantryItem[]
}

export async function addPantryItem(item: {
  user_id: string
  sku_id?: string
  ingredient_name: string
  quantity?: number
  unit?: string
  purchase_date?: string
  expiry_date?: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('pantry_inventory')
    .insert({
      ...item,
      status: 'available',
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data as PantryItem
}

export async function updatePantryItem(id: string, updates: Partial<PantryItem>) {
  const { data, error } = await supabase
    .from('pantry_inventory')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data as PantryItem
}

export async function deletePantryItem(id: string) {
  const { error } = await supabase
    .from('pantry_inventory')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 获取即将过期的食材
export async function getExpiringItems(userId: string, daysAhead: number = 3) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)

  const { data, error } = await supabase
    .from('pantry_inventory')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'available')
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .order('expiry_date', { ascending: true })

  if (error) throw error
  return data as PantryItem[]
}

// 购物清单管理
export async function getUserShoppingLists(userId: string) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(list => ({
    ...list,
    items: list.items || [],
  })) as ShoppingList[]
}

export async function createShoppingList(userId: string, name?: string) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({
      user_id: userId,
      name: name || '我的购物清单',
      items: [],
      status: 'pending',
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data as ShoppingList
}

export async function updateShoppingList(id: string, updates: Partial<ShoppingList>) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data as ShoppingList
}

export async function deleteShoppingList(id: string) {
  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 添加商品到购物清单
export async function addItemToShoppingList(listId: string, item: ShoppingListItem) {
  // 获取当前清单
  const { data: list, error: fetchError } = await supabase
    .from('shopping_lists')
    .select('items, estimated_total')
    .eq('id', listId)
    .maybeSingle()

  if (fetchError) throw fetchError

  const currentItems = list?.items || []
  const newItems = [...currentItems, item]
  const newTotal = newItems.reduce((sum, i) => sum + (i.estimated_price || 0) * i.quantity, 0)

  const { data, error } = await supabase
    .from('shopping_lists')
    .update({
      items: newItems,
      estimated_total: newTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data as ShoppingList
}

// 价格比较
export async function getPriceComparison(skuId: string): Promise<PriceComparison | null> {
  // 获取SKU信息
  const { data: sku, error: skuError } = await supabase
    .from('ingredient_skus')
    .select('*')
    .eq('id', skuId)
    .maybeSingle()

  if (skuError || !sku) return null

  // 获取各平台价格
  const { data: prices, error: priceError } = await supabase
    .from('price_history')
    .select('*')
    .eq('sku_id', skuId)
    .order('recorded_at', { ascending: false })

  if (priceError) throw priceError

  // 每个平台只取最新价格
  const latestPrices = new Map<string, PriceRecord>()
  prices?.forEach(p => {
    if (!latestPrices.has(p.platform)) {
      latestPrices.set(p.platform, p)
    }
  })

  const priceList = Array.from(latestPrices.values()).map(p => ({
    platform: p.platform,
    price: p.price,
    original_price: p.original_price,
    discount_info: p.discount_info,
    stock_status: p.stock_status,
    savings: p.original_price ? p.original_price - p.price : 0,
  }))

  // 找出最优价格
  const bestDeal = priceList.reduce((best, curr) => 
    curr.price < best.price ? curr : best
  , priceList[0] || { platform: '', price: 0, savings: 0 })

  return {
    sku,
    prices: priceList,
    best_deal: {
      platform: bestDeal.platform,
      price: bestDeal.price,
      savings: bestDeal.savings || 0,
    },
  }
}

// 批量获取价格比较
export async function getBatchPriceComparison(skuIds: string[]) {
  const comparisons = await Promise.all(
    skuIds.map(id => getPriceComparison(id))
  )
  return comparisons.filter(c => c !== null) as PriceComparison[]
}

// 智能购物清单生成
export async function generateSmartShoppingList(userId: string) {
  // 获取家庭成员数据
  const members = await getFamilyMembers(userId)
  const memberCount = members?.length || 1

  // 获取当季食材推荐
  const seasonalIngredients = await getSeasonalIngredients()

  // 获取现有库存
  const inventory = await getPantryInventory(userId)
  const inventoryNames = inventory.map(i => i.ingredient_name.toLowerCase())

  // 获取所有SKU
  const allSkus = await getIngredientSkus()

  // 智能推荐逻辑
  const recommendations: ShoppingListItem[] = []

  // 1. 基于当季食材推荐
  seasonalIngredients?.slice(0, 5).forEach((ing: any) => {
    // 检查库存中是否已有
    if (!inventoryNames.includes(ing.name.toLowerCase())) {
      const matchingSku = allSkus.find(s => s.name.includes(ing.name))
      recommendations.push({
        sku_id: matchingSku?.id,
        name: ing.name,
        quantity: memberCount,
        unit: matchingSku?.unit || '份',
        estimated_price: matchingSku?.average_price,
        checked: false,
        notes: `当季推荐: ${ing.health_benefits?.[0] || '营养丰富'}`,
      })
    }
  })

  // 2. 基于常用食材补充
  const essentials = ['鸡蛋', '牛奶', '豆腐']
  essentials.forEach(name => {
    if (!inventoryNames.includes(name.toLowerCase())) {
      const matchingSku = allSkus.find(s => s.name === name)
      if (matchingSku) {
        recommendations.push({
          sku_id: matchingSku.id,
          name: matchingSku.name,
          quantity: 1,
          unit: matchingSku.unit || '份',
          estimated_price: matchingSku.average_price,
          checked: false,
          notes: '日常必备',
        })
      }
    }
  })

  // 计算预估总价
  const estimatedTotal = recommendations.reduce(
    (sum, item) => sum + (item.estimated_price || 0) * item.quantity,
    0
  )

  // 创建购物清单
  const list = await createShoppingList(userId, `智能推荐 ${new Date().toLocaleDateString('zh-CN')}`)
  
  // 更新清单项目
  const { data } = await supabase
    .from('shopping_lists')
    .update({
      items: recommendations,
      estimated_total: estimatedTotal,
    })
    .eq('id', list.id)
    .select()
    .maybeSingle()

  return data as ShoppingList
}

// 库存概览统计
export async function getPantryStats(userId: string) {
  const inventory = await getPantryInventory(userId)
  const expiringItems = await getExpiringItems(userId, 3)

  // 按类别统计
  const categories = new Map<string, number>()
  inventory.forEach(item => {
    const cat = item.sku?.category || '其他'
    categories.set(cat, (categories.get(cat) || 0) + 1)
  })

  return {
    total_items: inventory.length,
    expiring_soon: expiringItems.length,
    expired: inventory.filter(i => i.status === 'expired').length,
    categories: Object.fromEntries(categories),
    low_stock: inventory.filter(i => i.status === 'low').length,
  }
}


// ============ 电商API集成 ============
const ECOMMERCE_API_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://uwpgbynmxteretbjssfh.supabase.co'}/functions/v1/ecommerce-api`

// 从电商API搜索商品
export async function searchEcommerceProducts(keyword: string, platform?: string) {
  const params = new URLSearchParams({ action: 'search', keyword })
  if (platform) params.append('platform', platform)
  
  const response = await fetch(`${ECOMMERCE_API_URL}?${params}`)
  if (!response.ok) throw new Error('搜索失败')
  const { data } = await response.json()
  return data
}

// 获取实时价格比较
export async function getRealtimePriceComparison(productName: string) {
  const params = new URLSearchParams({ action: 'compare', product: productName })
  
  const response = await fetch(`${ECOMMERCE_API_URL}?${params}`)
  if (!response.ok) throw new Error('获取价格失败')
  const { data } = await response.json()
  return data
}

// 批量获取实时价格
export async function getBatchRealtimePrices(productNames: string[]) {
  const params = new URLSearchParams({ 
    action: 'realtime', 
    products: productNames.join(',') 
  })
  
  const response = await fetch(`${ECOMMERCE_API_URL}?${params}`)
  if (!response.ok) throw new Error('获取价格失败')
  const { data } = await response.json()
  return data
}

// 获取支持的电商平台列表
export async function getEcommercePlatforms() {
  const params = new URLSearchParams({ action: 'platforms' })
  
  const response = await fetch(`${ECOMMERCE_API_URL}?${params}`)
  if (!response.ok) throw new Error('获取平台列表失败')
  const { data } = await response.json()
  return data
}


// ============ Smart Chef Flow 智能烹饪引擎 API ============

// 获取菜谱详情（包含步骤）
export async function getRecipeWithSteps(recipeId: string) {
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .maybeSingle()

  if (error) throw error
  if (!recipe) return null

  const { data: steps } = await supabase
    .from('cooking_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('step_number', { ascending: true })

  return {
    ...recipe,
    steps: steps || [],
  }
}

// 获取所有可烹饪菜谱
export async function getCookableRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('name')
    .limit(20)

  if (error) {
    console.error('获取菜谱失败:', error)
    return []
  }
  return data || []
}

// 创建烹饪会话
export async function createCookingSession(
  userId: string,
  recipeIds: string[],
  scheduledDishes: any[]
) {
  const totalDuration = scheduledDishes.reduce(
    (max, dish) => Math.max(max, dish.startTime + dish.duration),
    0
  )

  const { data, error } = await supabase
    .from('cooking_sessions')
    .insert({
      user_id: userId,
      name: `烹饪会话 ${new Date().toLocaleString('zh-CN')}`,
      recipes: recipeIds,
      scheduled_dishes: scheduledDishes,
      status: 'pending',
      total_duration: totalDuration,
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// 获取用户烹饪会话
export async function getCookingSessions(userId: string) {
  const { data, error } = await supabase
    .from('cooking_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// 获取单个烹饪会话
export async function getCookingSession(sessionId: string) {
  const { data, error } = await supabase
    .from('cooking_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()

  if (error) throw error
  return data
}

// 更新烹饪会话
export async function updateCookingSession(sessionId: string, updates: any) {
  const { data, error } = await supabase
    .from('cooking_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// 开始烹饪会话
export async function startCookingSession(sessionId: string) {
  const now = new Date()
  const { data: session } = await supabase
    .from('cooking_sessions')
    .select('total_duration')
    .eq('id', sessionId)
    .maybeSingle()

  const estimatedEnd = new Date(now.getTime() + (session?.total_duration || 60) * 60 * 1000)

  return updateCookingSession(sessionId, {
    status: 'cooking',
    started_at: now.toISOString(),
    estimated_end_time: estimatedEnd.toISOString(),
  })
}

// 完成烹饪会话
export async function completeCookingSession(sessionId: string) {
  return updateCookingSession(sessionId, {
    status: 'completed',
    actual_end_time: new Date().toISOString(),
  })
}

// 记录烹饪进度
export async function recordCookingProgress(progress: {
  session_id: string
  step_index: number
  equipment: string
  status: string
  duration_seconds?: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('cooking_progress')
    .insert({
      ...progress,
      started_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// 双灶头并行调度算法
export function scheduleDualBurner(recipes: any[]): any[] {
  const scheduledDishes: any[] = []
  let leftBurnerEndTime = 0
  let rightBurnerEndTime = 0

  // 按烹饪时间降序排序（长时间任务优先）
  const sortedRecipes = [...recipes].sort((a, b) => 
    (b.cooking_time || 0) - (a.cooking_time || 0)
  )

  sortedRecipes.forEach(recipe => {
    const duration = (recipe.cooking_time || 30) + (recipe.prep_time || 10)
    const preferredEquipment = recipe.equipment_needed?.[0] || 'shared'

    let equipment: 'left' | 'right'
    let startTime: number

    if (preferredEquipment === 'left' || leftBurnerEndTime <= rightBurnerEndTime) {
      equipment = 'left'
      startTime = leftBurnerEndTime
      leftBurnerEndTime = startTime + duration
    } else {
      equipment = 'right'
      startTime = rightBurnerEndTime
      rightBurnerEndTime = startTime + duration
    }

    scheduledDishes.push({
      recipeId: recipe.id,
      recipeName: recipe.name,
      equipment,
      startTime,
      duration,
      tasks: recipe.parallel_tasks || [],
      status: 'pending',
    })
  })

  return scheduledDishes
}

// 计算预计完成时间
export function calculateEstimatedEndTime(scheduledDishes: any[]): number {
  return scheduledDishes.reduce(
    (max, dish) => Math.max(max, dish.startTime + dish.duration),
    0
  )
}

// 生成语音提示文本
export function generateVoicePrompt(step: any, action: 'start' | 'remind' | 'complete'): string {
  switch (action) {
    case 'start':
      return `开始${step.title}。${step.description}${step.tips ? `。提示：${step.tips}` : ''}`
    case 'remind':
      return `请注意，${step.title}还有${step.duration_minutes}分钟`
    case 'complete':
      return `${step.title}已完成，请进行下一步`
    default:
      return ''
  }
}
