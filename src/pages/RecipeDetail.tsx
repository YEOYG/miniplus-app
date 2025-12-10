import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getRecipeById, addToShoppingList } from '@/lib/api'
import Card from '@/components/Card'
import { ArrowLeft, Heart, Share2, Clock, Users, Flame, ChefHat, ShoppingCart, Check, Loader2 } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  description: string
  image_url: string
  calories: number
  protein: number
  carbs: number
  fat: number
  cooking_time: number
  difficulty: string
  ingredients: { name: string; amount: string }[]
  steps: { step_number: number; description: string; title?: string }[]
  tags: string[]
}

export default function RecipeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients')
  const [checkedSteps, setCheckedSteps] = useState<number[]>([])
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    async function loadRecipe() {
      if (!id) return
      setLoading(true)
      try {
        const data = await getRecipeById(id)
        setRecipe(data)
      } catch (error) {
        console.error('加载食谱失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRecipe()
  }, [id])

  const toggleStep = (step: number) => {
    setCheckedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    )
  }

  const handleAddToShoppingList = async () => {
    if (!user || !recipe?.ingredients) return
    setAddingToCart(true)
    try {
      await addToShoppingList(user.id, recipe.ingredients)
      alert('已添加到购物清单')
    } catch (error) {
      console.error('添加失败:', error)
      alert('添加失败，请重试')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-neutral-500 mb-4">食谱不存在</p>
        <button onClick={() => navigate('/recipes')} className="text-primary-500">返回食谱列表</button>
      </div>
    )
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Image */}
      <div className="relative h-72">
        <img 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} 
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setLiked(!liked)}
              className={`w-10 h-10 backdrop-blur rounded-full flex items-center justify-center ${liked ? 'bg-semantic-error' : 'bg-black/30'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'text-white fill-current' : 'text-white'}`} />
            </button>
            <button className="w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            {recipe.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur text-white text-caption rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-heading-lg text-white font-bold">{recipe.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 relative z-10 space-y-4 pb-24">
        {/* Stats Card */}
        <Card variant="elevated">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <Flame className="w-5 h-5 text-nutrient-carbs mx-auto mb-1" />
              <div className="text-heading-sm text-neutral-900">{recipe.calories || 0}</div>
              <div className="text-caption text-neutral-500">千卡</div>
            </div>
            <div>
              <Clock className="w-5 h-5 text-semantic-info mx-auto mb-1" />
              <div className="text-heading-sm text-neutral-900">{recipe.cooking_time || 20}</div>
              <div className="text-caption text-neutral-500">分钟</div>
            </div>
            <div>
              <Users className="w-5 h-5 text-primary-500 mx-auto mb-1" />
              <div className="text-heading-sm text-neutral-900">2</div>
              <div className="text-caption text-neutral-500">人份</div>
            </div>
            <div>
              <ChefHat className="w-5 h-5 text-semantic-warning mx-auto mb-1" />
              <div className="text-heading-sm text-neutral-900">{recipe.difficulty || '简单'}</div>
              <div className="text-caption text-neutral-500">难度</div>
            </div>
          </div>
        </Card>

        {/* Nutrition */}
        <Card variant="elevated">
          <h3 className="text-heading-sm text-neutral-900 mb-3">营养成分</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-nutrient-protein/10 rounded-xl">
              <div className="text-heading-md text-nutrient-protein">{recipe.protein || 0}g</div>
              <div className="text-body-sm text-neutral-600">蛋白质</div>
            </div>
            <div className="text-center p-3 bg-nutrient-carbs/10 rounded-xl">
              <div className="text-heading-md text-nutrient-carbs">{recipe.carbs || 0}g</div>
              <div className="text-body-sm text-neutral-600">碳水</div>
            </div>
            <div className="text-center p-3 bg-nutrient-fat/10 rounded-xl">
              <div className="text-heading-md text-nutrient-fat">{recipe.fat || 0}g</div>
              <div className="text-body-sm text-neutral-600">脂肪</div>
            </div>
          </div>
        </Card>

        {/* Description */}
        {recipe.description && (
          <Card variant="elevated">
            <p className="text-body-md text-neutral-600">{recipe.description}</p>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-3 rounded-xl text-body-md font-medium transition-all
              ${activeTab === 'ingredients' ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600'}`}
          >
            食材清单 ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-3 rounded-xl text-body-md font-medium transition-all
              ${activeTab === 'steps' ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600'}`}
          >
            制作步骤 ({steps.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'ingredients' ? (
          <Card variant="elevated" className="space-y-3">
            {ingredients.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">暂无食材信息</p>
            ) : (
              ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <span className="text-body-md text-neutral-800">{ing.name}</span>
                  <span className="text-body-sm text-neutral-500">{ing.amount}</span>
                </div>
              ))
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {steps.length === 0 ? (
              <Card variant="elevated" className="text-center py-4">
                <p className="text-neutral-500">暂无制作步骤</p>
              </Card>
            ) : (
              steps.map((step) => (
                <Card 
                  key={step.step_number}
                  variant="elevated"
                  className={`transition-all ${checkedSteps.includes(step.step_number) ? 'bg-primary-50' : ''}`}
                >
                  <button 
                    onClick={() => toggleStep(step.step_number)}
                    className="w-full flex items-start gap-3 text-left"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
                      ${checkedSteps.includes(step.step_number) ? 'bg-primary-500' : 'bg-neutral-200'}`}>
                      {checkedSteps.includes(step.step_number) ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-body-sm text-neutral-600">{step.step_number}</span>
                      )}
                    </div>
                    <p className={`text-body-md ${checkedSteps.includes(step.step_number) ? 'text-neutral-500 line-through' : 'text-neutral-800'}`}>
                      {step.title ? <span className="font-medium">{step.title}：</span> : null}{step.description}
                    </p>
                  </button>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100">
        <div className="flex gap-3">
          <button 
            onClick={handleAddToShoppingList}
            disabled={addingToCart || ingredients.length === 0}
            className="flex-1 h-12 bg-primary-50 text-primary-500 rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {addingToCart ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            加入购物清单
          </button>
          <button className="flex-1 h-12 bg-primary-500 text-white rounded-full font-semibold">
            开始制作
          </button>
        </div>
      </div>
    </div>
  )
}
