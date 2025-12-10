import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/Card'
import { getRecipes, searchRecipes } from '@/lib/api'
import { Search, Camera, Clock, Sparkles, ChefHat, Heart, TrendingUp, Loader2 } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  description: string
  image_url: string
  calories: number
  cooking_time: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  difficulty: string
}

const categories = ['推荐', '低脂', '高蛋白', '素食', '快手菜']

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('推荐')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRecipes()
  }, [activeCategory])

  async function loadRecipes() {
    setLoading(true)
    try {
      const tags = activeCategory === '推荐' ? undefined : [activeCategory]
      const data = await getRecipes(tags)
      setRecipes(data || [])
    } catch (error) {
      console.error('加载食谱失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadRecipes()
      return
    }
    setLoading(true)
    try {
      const data = await searchRecipes(searchQuery)
      setRecipes(data || [])
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <button className="w-11 h-11 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
          <Camera className="w-5 h-5 text-primary-500" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索食谱或食材..."
            className="w-full h-11 pl-11 pr-4 bg-neutral-50 rounded-full border border-neutral-100 
              focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-body-md"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-body-sm whitespace-nowrap transition-all
              ${activeCategory === cat 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI Customization CTA */}
      <Card variant="elevated" className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-heading-sm font-semibold">AI定制食谱</h3>
              <p className="text-body-sm opacity-90">根据您的健康目标智能推荐</p>
            </div>
          </div>
          <Link
            to="/ai"
            className="px-4 py-2 bg-white text-primary-500 rounded-full text-body-sm font-medium"
          >
            开始
          </Link>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-4">
          <TrendingUp className="w-5 h-5 text-primary-500 mx-auto mb-1" />
          <div className="text-heading-sm text-neutral-900">{recipes.length}</div>
          <div className="text-caption text-neutral-500">可用食谱</div>
        </Card>
        <Card className="text-center py-4">
          <ChefHat className="w-5 h-5 text-nutrient-carbs mx-auto mb-1" />
          <div className="text-heading-sm text-neutral-900">{favorites.size}</div>
          <div className="text-caption text-neutral-500">我的收藏</div>
        </Card>
        <Card className="text-center py-4">
          <Heart className="w-5 h-5 text-semantic-error mx-auto mb-1" />
          <div className="text-heading-sm text-neutral-900">0</div>
          <div className="text-caption text-neutral-500">本周制作</div>
        </Card>
      </div>

      {/* Recipe List */}
      <div className="space-y-4">
        <h2 className="text-heading-md text-neutral-900">
          {activeCategory === '推荐' ? '热门食谱' : `${activeCategory}食谱`}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <Card variant="elevated" className="text-center py-8">
            <p className="text-neutral-500">暂无食谱，请尝试其他分类</p>
          </Card>
        ) : (
          recipes.map(recipe => (
            <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
              <Card variant="elevated" className="overflow-hidden p-0 active:scale-98 transition-transform mb-4">
                <div className="relative h-40">
                  <img 
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-heading-sm text-white font-semibold">{recipe.name}</h3>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    {recipe.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-black/50 text-white text-caption rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-body-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.cooking_time || 20}分钟
                    </span>
                    <span>{recipe.calories || 300} kcal</span>
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className={`transition-colors ${favorites.has(recipe.id) ? 'text-semantic-error' : 'text-neutral-400 hover:text-semantic-error'}`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(recipe.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
