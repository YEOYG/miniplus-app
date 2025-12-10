import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Leaf, MapPin, Sparkles, ChevronRight, Loader2, Flame, Star, Calendar } from 'lucide-react'
import Card from '@/components/Card'
import { useAuth } from '@/contexts/AuthContext'
import { getFoodTrends, getSeasonalIngredients, getRegionalCuisines, getPersonalizedRecommendations } from '@/lib/api'
import type { FoodTrend, SeasonalIngredient, RegionalCuisine } from '@/types'

type TabType = 'trends' | 'seasonal' | 'regional' | 'personalized'

export default function FoodTrends() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('trends')
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState<FoodTrend[]>([])
  const [ingredients, setIngredients] = useState<SeasonalIngredient[]>([])
  const [cuisines, setCuisines] = useState<RegionalCuisine[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    
    async function loadData() {
      // 超时保护
      const timeout = setTimeout(() => {
        if (isMounted) setLoading(false)
      }, 10000)
      
      try {
        const [trendsData, ingredientsData, cuisinesData] = await Promise.all([
          getFoodTrends().catch(() => []),
          getSeasonalIngredients().catch(() => []),
          getRegionalCuisines().catch(() => []),
        ])
        
        if (isMounted) {
          setTrends(trendsData || [])
          setIngredients(ingredientsData || [])
          setCuisines(cuisinesData || [])
        }

        if (user && isMounted) {
          const recs = await getPersonalizedRecommendations(user.id).catch(() => [])
          if (isMounted) setRecommendations(recs)
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        clearTimeout(timeout)
        if (isMounted) setLoading(false)
      }
    }
    
    loadData()
    return () => { isMounted = false }
  }, [user])

  const tabs = [
    { id: 'trends' as TabType, label: '热门趋势', icon: TrendingUp },
    { id: 'seasonal' as TabType, label: '当季食材', icon: Leaf },
    { id: 'regional' as TabType, label: '地域美食', icon: MapPin },
    { id: 'personalized' as TabType, label: '为你推荐', icon: Sparkles },
  ]

  const currentMonth = new Date().getMonth() + 1
  const seasonName = currentMonth >= 3 && currentMonth <= 5 ? '春' : currentMonth >= 6 && currentMonth <= 8 ? '夏' : currentMonth >= 9 && currentMonth <= 11 ? '秋' : '冬'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-heading-lg text-neutral-900">全球美食风向标</h1>
        <p className="text-body-sm text-neutral-500">发现当季美味，探索健康饮食趋势</p>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {activeTab === 'trends' && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <Flame className="w-5 h-5 text-semantic-error" />
              <h2 className="text-heading-sm text-neutral-900">热门饮食趋势</h2>
            </div>
            {trends.map((trend, index) => (
              <Card key={trend.id} variant="elevated" className="overflow-hidden">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-heading-sm text-neutral-900 truncate">{trend.name}</h3>
                      <span className="px-2 py-0.5 bg-semantic-error/10 text-semantic-error text-caption rounded-full shrink-0">
                        {trend.heat_index}
                      </span>
                    </div>
                    <p className="text-body-sm text-neutral-500 line-clamp-2 mt-1">{trend.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {trend.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-caption rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {trend.nutrition_highlights && trend.nutrition_highlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-caption text-neutral-500">营养特点：{trend.nutrition_highlights.join(' | ')}</p>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {activeTab === 'seasonal' && (
          <>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h2 className="text-heading-sm text-neutral-900">{currentMonth}月{seasonName}季食材</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ingredients.map(ing => (
                <Card key={ing.id} variant="elevated" className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shrink-0">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-md font-semibold text-neutral-900 truncate">{ing.name}</h3>
                      <p className="text-caption text-neutral-500">{ing.category}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-caption text-neutral-500">{ing.calories_per_100g} kcal/100g</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-semantic-warning" />
                      <span className="text-caption text-neutral-600">{ing.recommend_index}</span>
                    </div>
                  </div>
                  {ing.health_benefits && ing.health_benefits.length > 0 && (
                    <p className="mt-2 text-caption text-primary-600 line-clamp-1">
                      {ing.health_benefits[0]}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === 'regional' && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <MapPin className="w-5 h-5 text-nutrient-carbs" />
              <h2 className="text-heading-sm text-neutral-900">地域特色美食</h2>
            </div>
            {cuisines.map(cuisine => (
              <Card key={cuisine.id} variant="elevated">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">{cuisine.region.includes('中国') ? '中' : cuisine.region[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-heading-sm text-neutral-900">{cuisine.cuisine_name}</h3>
                      <span className="text-caption text-neutral-400">{cuisine.region}</span>
                    </div>
                    <p className="text-body-sm text-neutral-500 line-clamp-2 mt-1">{cuisine.description}</p>
                    
                    {/* 辣度指示 */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-caption text-neutral-500">辣度：</span>
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= cuisine.spice_level ? 'bg-semantic-error' : 'bg-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
                </div>
                
                {/* 代表菜品 */}
                {cuisine.signature_dishes && cuisine.signature_dishes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-caption text-neutral-500 mb-2">代表菜品</p>
                    <div className="flex flex-wrap gap-2">
                      {cuisine.signature_dishes.map((dish, i) => (
                        <span key={i} className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-caption rounded-full">
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {activeTab === 'personalized' && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <Sparkles className="w-5 h-5 text-nutrient-protein" />
              <h2 className="text-heading-sm text-neutral-900">个性化推荐</h2>
            </div>
            
            {recommendations.length === 0 ? (
              <Card variant="elevated" className="text-center py-8">
                <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 mb-2">暂无个性化推荐</p>
                <p className="text-caption text-neutral-400">请先完善家庭成员的健康档案和饮食偏好</p>
                <button 
                  onClick={() => navigate('/family')}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-full text-body-sm"
                >
                  前往设置
                </button>
              </Card>
            ) : (
              recommendations.map((rec, index) => (
                <Card key={`${rec.type}-${rec.item.id}-${index}`} variant="elevated">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.type === 'trend' ? 'bg-gradient-to-br from-pink-100 to-pink-200' :
                      rec.type === 'ingredient' ? 'bg-gradient-to-br from-green-100 to-green-200' :
                      'bg-gradient-to-br from-orange-100 to-orange-200'
                    }`}>
                      {rec.type === 'trend' && <TrendingUp className="w-6 h-6 text-pink-600" />}
                      {rec.type === 'ingredient' && <Leaf className="w-6 h-6 text-green-600" />}
                      {rec.type === 'cuisine' && <MapPin className="w-6 h-6 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-heading-sm text-neutral-900">
                          {rec.item.name || rec.item.cuisine_name}
                        </h3>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-caption rounded-full">
                          匹配度 {rec.match_score}%
                        </span>
                      </div>
                      <p className="text-body-sm text-neutral-500 line-clamp-2 mt-1">
                        {rec.item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {rec.reasons.map((reason: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-semantic-success/10 text-semantic-success text-caption rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
