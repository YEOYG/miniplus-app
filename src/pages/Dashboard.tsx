import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/Card'
import ProgressRing from '@/components/ProgressRing'
import NutrientBar from '@/components/NutrientBar'
import { getTodayNutrition, getPrimaryMember, sendAIMessage } from '@/lib/api'
import { ChevronLeft, ChevronRight, Plus, Camera, Flame, Dumbbell, Sparkles, Loader2 } from 'lucide-react'
import type { NutritionSummary } from '@/types'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function getWeekDates() {
  const today = new Date()
  const dates = []
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }
  return dates
}

export default function Dashboard() {
  const { profile, user, userRole } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showFAB, setShowFAB] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [memberId, setMemberId] = useState<string | null>(null)
  const weekDates = getWeekDates()

  const [nutrition, setNutrition] = useState<NutritionSummary>({
    calories: 0,
    caloriesGoal: profile?.daily_calorie_goal || 2000,
    protein: 0,
    proteinGoal: 75,
    carbs: 0,
    carbsGoal: 250,
    fat: 0,
    fatGoal: 65,
  })

  useEffect(() => {
    let isMounted = true
    
    async function loadData() {
      if (!user) {
        setLoading(false)
        return
      }
      
      // 设置超时保护
      const timeout = setTimeout(() => {
        if (isMounted) {
          setLoading(false)
          setAiSuggestion('保持均衡饮食，多吃蔬菜水果。')
        }
      }, 8000)
      
      try {
        // 获取主要家庭成员
        const member = await getPrimaryMember(user.id).catch(() => null)
        if (member && isMounted) {
          setMemberId(member.id)
          // 获取今日营养数据
          const todayNutrition = await getTodayNutrition(member.id).catch(() => ({ calories: 0, protein: 0, carbs: 0, fat: 0 }))
          if (isMounted) {
            setNutrition(prev => ({
              ...prev,
              calories: todayNutrition.calories,
              protein: todayNutrition.protein,
              carbs: todayNutrition.carbs,
              fat: todayNutrition.fat,
              caloriesGoal: profile?.daily_calorie_goal || 2000,
            }))
          }
        }

        // 获取AI建议（不阻塞主流程，异步进行）
        sendAIMessage('给出简短的饮食建议（30字以内）', undefined)
          .then(res => { if (isMounted) setAiSuggestion(res.message || '保持均衡饮食，适量摄入蛋白质和蔬菜。') })
          .catch(() => { if (isMounted) setAiSuggestion('保持均衡饮食，多吃蔬菜水果，适量运动。') })
      } catch (error) {
        console.error('加载数据失败:', error)
        if (isMounted) setAiSuggestion('保持均衡饮食，多吃蔬菜水果，适量运动。')
      } finally {
        clearTimeout(timeout)
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    
    return () => { isMounted = false }
  }, [user])

  const remainingCalories = Math.max(0, nutrition.caloriesGoal - nutrition.calories)
  const calorieProgress = Math.min(100, (nutrition.calories / nutrition.caloriesGoal) * 100)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-lg text-neutral-900">
            {greeting()}，{profile?.nickname || '用户'}
          </h1>
          <p className="text-body-sm text-neutral-500">
            {userRole === 'admin' ? '家庭健康总览' : '今日营养概览'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-primary-700 font-semibold">
            {(profile?.nickname || 'U')[0].toUpperCase()}
          </span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
        <button className="p-2 text-neutral-400 hover:text-neutral-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {weekDates.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center min-w-[44px] py-2 px-2 rounded-xl transition-all
                  ${isSelected ? 'bg-primary-500 text-white' : 'hover:bg-neutral-50'}`}
              >
                <span className={`text-caption ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}>
                  {weekDays[date.getDay()]}
                </span>
                <span className={`text-body-lg font-semibold ${isSelected ? 'text-white' : 'text-neutral-800'}`}>
                  {date.getDate()}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-primary-500 mt-1" />
                )}
              </button>
            )
          })}
        </div>
        <button className="p-2 text-neutral-400 hover:text-neutral-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Nutrition Overview */}
      <div className="grid grid-cols-2 gap-4">
        {/* Calorie Card */}
        <Card variant="elevated">
          <div className="flex flex-col items-center">
            <ProgressRing progress={calorieProgress} size={100} strokeWidth={10}>
              <div className="text-center">
                <div className="text-number-lg text-primary-500">{remainingCalories}</div>
                <div className="text-caption text-neutral-500">剩余</div>
              </div>
            </ProgressRing>
            <div className="mt-3 flex items-center gap-1 text-body-sm text-neutral-600">
              <Flame className="w-4 h-4 text-nutrient-carbs" />
              <span>已摄入 {nutrition.calories} kcal</span>
            </div>
          </div>
        </Card>

        {/* Nutrients Card */}
        <Card variant="elevated" className="space-y-3">
          <NutrientBar 
            label="蛋白质" 
            current={Math.round(nutrition.protein)} 
            goal={nutrition.proteinGoal}
            color="#5F9DF7"
          />
          <NutrientBar 
            label="碳水" 
            current={Math.round(nutrition.carbs)} 
            goal={nutrition.carbsGoal}
            color="#FF9F43"
          />
          <NutrientBar 
            label="脂肪" 
            current={Math.round(nutrition.fat)} 
            goal={nutrition.fatGoal}
            color="#FFD93D"
          />
        </Card>
      </div>

      {/* AI Suggestion Card */}
      <Card variant="elevated" className="bg-gradient-to-r from-primary-50 to-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-heading-sm text-neutral-900 mb-1">AI营养建议</h3>
            <p className="text-body-sm text-neutral-600">
              {aiSuggestion.length > 100 ? aiSuggestion.substring(0, 100) + '...' : aiSuggestion}
            </p>
          </div>
        </div>
      </Card>

      {/* Exercise Summary */}
      <Card variant="elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-semantic-success/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-semantic-success" />
            </div>
            <div>
              <h3 className="text-heading-sm text-neutral-900">今日运动</h3>
              <p className="text-body-sm text-neutral-500">点击添加运动记录</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-heading-md text-semantic-success">0</div>
            <div className="text-caption text-neutral-500">kcal</div>
          </div>
        </div>
      </Card>

      {/* FAB Button */}
      <div className="fixed right-4 bottom-20 z-40">
        <div className={`absolute bottom-16 right-0 space-y-2 transition-all duration-200 ${showFAB ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button className="flex items-center gap-2 bg-white shadow-card rounded-full py-2 px-4 text-body-sm">
            <Camera className="w-5 h-5 text-primary-500" />
            <span>拍照记录</span>
          </button>
          <button className="flex items-center gap-2 bg-white shadow-card rounded-full py-2 px-4 text-body-sm">
            <Plus className="w-5 h-5 text-primary-500" />
            <span>手动添加</span>
          </button>
        </div>
        <button
          onClick={() => setShowFAB(!showFAB)}
          className={`w-14 h-14 rounded-full bg-primary-500 shadow-fab flex items-center justify-center transition-transform ${showFAB ? 'rotate-45' : ''}`}
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  )
}
