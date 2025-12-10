import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, PieChart, Users, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import Card from '@/components/Card'
import ProgressRing from '@/components/ProgressRing'
import { useAuth } from '@/contexts/AuthContext'
import { getFamilyNutritionAnalysis } from '@/lib/api'

interface MemberAnalysis {
  member_id: string
  member_name: string
  current: { calories: number; protein: number; carbs: number; fat: number }
  goals: { calories: number; protein: number; carbs: number; fat: number }
  completion: { calories: number; protein: number; carbs: number; fat: number }
  health_tags: string[]
  diet_restrictions: string[]
}

export default function NutritionAnalysis() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<{
    members: MemberAnalysis[]
    summary: { avg_calorie_completion: number; members_meeting_goals: number; total_members: number }
  } | null>(null)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    if (!user) return
    setLoading(true)
    try {
      const data = await getFamilyNutritionAnalysis(user.id)
      setAnalysis(data)
    } catch (error) {
      console.error('加载分析数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function getNutrientStatus(completion: number) {
    if (completion >= 80 && completion <= 120) return { color: 'text-semantic-success', label: '良好', bg: 'bg-semantic-success' }
    if (completion >= 50 && completion < 80) return { color: 'text-semantic-warning', label: '不足', bg: 'bg-semantic-warning' }
    if (completion > 120) return { color: 'text-semantic-error', label: '超标', bg: 'bg-semantic-error' }
    return { color: 'text-semantic-error', label: '严重不足', bg: 'bg-semantic-error' }
  }

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
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="text-heading-md text-neutral-900">营养分析</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Summary Card */}
        {analysis && (
          <Card variant="elevated" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm text-white/80">家庭营养达标率</p>
                <p className="text-4xl font-bold mt-1">{analysis.summary.avg_calorie_completion}%</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-4 h-4" />
                  <span className="text-body-sm text-white/80">
                    {analysis.summary.members_meeting_goals}/{analysis.summary.total_members} 成员达标
                  </span>
                </div>
              </div>
              <ProgressRing 
                progress={analysis.summary.avg_calorie_completion} 
                size={80} 
                strokeWidth={6}
                color="#ffffff"
              >
                <PieChart className="w-6 h-6 text-white" />
              </ProgressRing>
            </div>
          </Card>
        )}

        {/* Status Legend */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-semantic-success" />
            <span className="text-caption text-neutral-500">80-120% 良好</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-semantic-warning" />
            <span className="text-caption text-neutral-500">50-80% 不足</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-semantic-error" />
            <span className="text-caption text-neutral-500">超标/严重不足</span>
          </div>
        </div>

        {/* Member Analysis */}
        <h2 className="text-heading-sm text-neutral-900 pt-2">成员营养详情</h2>
        
        {analysis?.members.map(member => (
          <Card key={member.member_id} variant="elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold">{member.member_name[0]}</span>
              </div>
              <div>
                <h3 className="text-heading-sm text-neutral-900">{member.member_name}</h3>
                <div className="flex gap-2 mt-0.5">
                  {member.health_tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-caption text-semantic-warning">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrient Bars */}
            <div className="space-y-3">
              {/* Calories */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm text-neutral-600">热量</span>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-neutral-900">
                      {member.current.calories} / {member.goals.calories} kcal
                    </span>
                    <span className={`text-caption ${getNutrientStatus(member.completion.calories).color}`}>
                      {member.completion.calories}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${getNutrientStatus(member.completion.calories).bg}`}
                    style={{ width: `${Math.min(100, member.completion.calories)}%` }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm text-neutral-600">蛋白质</span>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-neutral-900">
                      {member.current.protein}g / {member.goals.protein}g
                    </span>
                    <span className={`text-caption ${getNutrientStatus(member.completion.protein).color}`}>
                      {member.completion.protein}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all bg-nutrient-protein"
                    style={{ width: `${Math.min(100, member.completion.protein)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm text-neutral-600">碳水化合物</span>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-neutral-900">
                      {member.current.carbs}g / {member.goals.carbs}g
                    </span>
                    <span className={`text-caption ${getNutrientStatus(member.completion.carbs).color}`}>
                      {member.completion.carbs}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all bg-nutrient-carbs"
                    style={{ width: `${Math.min(100, member.completion.carbs)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm text-neutral-600">脂肪</span>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-neutral-900">
                      {member.current.fat}g / {member.goals.fat}g
                    </span>
                    <span className={`text-caption ${getNutrientStatus(member.completion.fat).color}`}>
                      {member.completion.fat}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all bg-nutrient-fat"
                    style={{ width: `${Math.min(100, member.completion.fat)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4 pt-3 border-t border-neutral-100">
              {member.completion.calories < 80 ? (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-semantic-warning mt-0.5 shrink-0" />
                  <p className="text-body-sm text-neutral-600">
                    今日热量摄入不足，建议增加一餐或选择高营养密度食物
                  </p>
                </div>
              ) : member.completion.calories > 120 ? (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-semantic-error mt-0.5 shrink-0" />
                  <p className="text-body-sm text-neutral-600">
                    今日热量超标，建议增加运动或减少晚餐摄入
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-semantic-success mt-0.5 shrink-0" />
                  <p className="text-body-sm text-neutral-600">
                    今日营养摄入均衡，继续保持良好饮食习惯
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* Tips Card */}
        <Card variant="elevated" className="bg-primary-50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-heading-sm text-primary-700">改善建议</h3>
          </div>
          <ul className="space-y-2 text-body-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">-</span>
              根据当季食材调整食谱，获取最佳营养价值
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">-</span>
              保持三餐规律，避免暴饮暴食
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">-</span>
              多样化食材搭配，确保微量元素摄入充足
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
