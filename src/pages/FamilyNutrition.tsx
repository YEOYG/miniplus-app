import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Activity, Loader2 } from 'lucide-react'
import Card from '@/components/Card'
import ProgressRing from '@/components/ProgressRing'
import { useAuth } from '@/contexts/AuthContext'
import { getFamilyNutritionOverview } from '@/lib/api'

interface MemberNutrition {
  id: string
  name: string
  daily_progress: number
  nutrition_score: number
  alerts: string[]
}

export default function FamilyNutrition() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<{
    family_members: MemberNutrition[]
    overall_score: number
    recommendations: string[]
  } | null>(null)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    if (!user) return
    setLoading(true)
    try {
      const data = await getFamilyNutritionOverview(user.id)
      setOverview(data)
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-semantic-success'
    if (score >= 60) return 'text-semantic-warning'
    return 'text-semantic-error'
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    if (score >= 40) return '一般'
    return '待改善'
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate('/family')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="text-heading-md text-neutral-900">家庭营养概览</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Overall Score */}
        <Card variant="elevated" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm text-white/80">今日家庭营养评分</p>
              <p className="text-4xl font-bold mt-1">{overview?.overall_score || 0}</p>
              <p className="text-body-sm text-white/80 mt-1">{getScoreLabel(overview?.overall_score || 0)}</p>
            </div>
            <div className="relative">
              <ProgressRing 
                progress={overview?.overall_score || 0} 
                size={100} 
                strokeWidth={8}
                color="#ffffff"
              >
                <Activity className="w-8 h-8 text-white" />
              </ProgressRing>
            </div>
          </div>
        </Card>

        {/* Family Recommendations */}
        {overview?.recommendations && overview.recommendations.length > 0 && (
          <Card variant="elevated" className="bg-semantic-warning/10 border border-semantic-warning/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-semantic-warning" />
              <h3 className="text-heading-sm text-neutral-900">今日提醒</h3>
            </div>
            <ul className="space-y-2">
              {overview.recommendations.map((rec, i) => (
                <li key={i} className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <span className="text-semantic-warning mt-0.5">-</span>
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Members List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            <h3 className="text-heading-sm text-neutral-900">成员营养状况</h3>
          </div>
          
          {overview?.family_members.map(member => (
            <Card 
              key={member.id} 
              variant="elevated" 
              className="cursor-pointer active:scale-98 transition-transform"
              onClick={() => navigate(`/family/member/${member.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-heading-sm">
                    {member.name[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-heading-sm text-neutral-900">{member.name}</span>
                    <span className={`text-caption ${getScoreColor(member.nutrition_score)}`}>
                      {getScoreLabel(member.nutrition_score)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-body-sm text-neutral-500 mt-1">
                    <span>热量 {member.daily_progress}%</span>
                    <span>评分 {member.nutrition_score}</span>
                  </div>
                  {member.alerts.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {member.alerts.map((alert, i) => (
                        <span key={i} className="text-caption px-2 py-0.5 bg-semantic-warning/10 text-semantic-warning rounded-full">
                          {alert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ProgressRing 
                  progress={member.nutrition_score} 
                  size={48} 
                  strokeWidth={4}
                >
                  <span className="text-caption text-neutral-600">{member.nutrition_score}</span>
                </ProgressRing>
              </div>
            </Card>
          ))}

          {(!overview?.family_members || overview.family_members.length === 0) && (
            <Card variant="elevated" className="text-center py-8">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">暂无家庭成员数据</p>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            variant="elevated" 
            className="cursor-pointer active:scale-98 transition-transform"
            onClick={() => navigate('/nutrition-analysis')}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-nutrient-protein/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-nutrient-protein" />
              </div>
              <h4 className="text-body-md font-medium text-neutral-900">营养分析</h4>
              <p className="text-caption text-neutral-500 mt-1">查看详细分析</p>
            </div>
          </Card>
          <Card 
            variant="elevated" 
            className="cursor-pointer active:scale-98 transition-transform"
            onClick={() => navigate('/trends')}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="text-body-md font-medium text-neutral-900">美食趋势</h4>
              <p className="text-caption text-neutral-500 mt-1">探索健康饮食</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
