import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getFamilyMembers, createFamilyMember, getTodayNutrition } from '@/lib/api'
import Card from '@/components/Card'
import ProgressRing from '@/components/ProgressRing'
import { Users, UserPlus, QrCode, Settings, ChevronRight, Crown, Flame, Target, Loader2, Plus, BarChart3 } from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  relationship: string
  avatar_url: string | null
  is_primary: boolean
  gender: string
  calories?: number
  goal?: number
}

export default function Family() {
  const navigate = useNavigate()
  const { userRole, profile, user } = useAuth()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', relationship: '家人', gender: '' })
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    loadMembers()
  }, [user])

  async function loadMembers() {
    if (!user) return
    setLoading(true)
    try {
      const data = await getFamilyMembers(user.id)
      // 为每个成员获取今日营养数据
      const membersWithNutrition = await Promise.all(
        (data || []).map(async (member: FamilyMember) => {
          try {
            const nutrition = await getTodayNutrition(member.id)
            return {
              ...member,
              calories: nutrition.calories,
              goal: profile?.daily_calorie_goal || 2000,
            }
          } catch {
            return { ...member, calories: 0, goal: 2000 }
          }
        })
      )
      setMembers(membersWithNutrition)
    } catch (error) {
      console.error('加载成员失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddMember() {
    if (!user || !newMember.name) return
    try {
      await createFamilyMember({
        userId: user.id,
        name: newMember.name,
        relationship: newMember.relationship,
        gender: newMember.gender,
        isPrimary: members.length === 0,
      })
      setShowAddMember(false)
      setNewMember({ name: '', relationship: '家人', gender: '' })
      loadMembers()
    } catch (error) {
      console.error('添加成员失败:', error)
      alert('添加失败，请重试')
    }
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
          <h1 className="text-heading-lg text-neutral-900">我的家庭</h1>
          <p className="text-body-sm text-neutral-500">
            {isAdmin ? '管理家庭成员和健康目标' : '查看家庭健康数据'}
          </p>
        </div>
        <button 
          onClick={() => setShowAddMember(true)}
          className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center"
        >
          <UserPlus className="w-5 h-5 text-primary-500" />
        </button>
      </div>

      {/* Family Card */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary-50 to-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading-md text-neutral-900">{profile?.nickname || '我'}的家庭</h2>
            <p className="text-body-sm text-neutral-500">{members.length}位成员</p>
          </div>
          {isAdmin && (
            <button className="text-neutral-400 hover:text-neutral-600">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </Card>

      {/* Nutrition Overview Entry */}
      <Card 
        variant="elevated" 
        className="cursor-pointer active:scale-98 transition-transform"
        onClick={() => navigate('/family/nutrition')}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-nutrient-protein/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-nutrient-protein" />
          </div>
          <div className="flex-1">
            <h3 className="text-heading-sm text-neutral-900">营养概览</h3>
            <p className="text-body-sm text-neutral-500">查看全家营养状况分析</p>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </div>
      </Card>

      {/* Family Goal */}
      <Card variant="elevated">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-primary-500" />
          <h3 className="text-heading-sm text-neutral-900">家庭健康目标</h3>
        </div>
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-body-md text-neutral-700">
            本月目标：全家人均每日蔬菜摄入量达到 500g，减少外卖次数
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-body-sm text-neutral-500">完成进度</span>
            <span className="text-body-sm text-primary-500 font-medium">68%</span>
          </div>
          <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-primary-500 rounded-full" />
          </div>
        </div>
      </Card>

      {/* Members List */}
      <div className="space-y-3">
        <h3 className="text-heading-sm text-neutral-900">家庭成员</h3>
        
        {members.length === 0 ? (
          <Card variant="elevated" className="text-center py-8">
            <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 mb-4">还没有添加家庭成员</p>
            <button 
              onClick={() => setShowAddMember(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-full text-body-sm"
            >
              添加成员
            </button>
          </Card>
        ) : (
          members.map(member => (
            <Card 
              key={member.id} 
              variant="elevated" 
              className="active:scale-98 transition-transform cursor-pointer"
              onClick={() => navigate(`/family/member/${member.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-heading-sm">
                      {member.name[0]}
                    </span>
                  </div>
                  {member.is_primary && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-semantic-warning rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-heading-sm text-neutral-900">{member.name}</span>
                    <span className="text-caption text-neutral-400">{member.relationship}</span>
                  </div>
                  <div className="flex items-center gap-1 text-body-sm text-neutral-500">
                    <Flame className="w-4 h-4 text-nutrient-carbs" />
                    <span>今日 {member.calories || 0}/{member.goal || 2000} kcal</span>
                  </div>
                </div>
                <ProgressRing 
                  progress={((member.calories || 0) / (member.goal || 2000)) * 100} 
                  size={44} 
                  strokeWidth={4}
                >
                  <span className="text-caption text-neutral-600">
                    {Math.round(((member.calories || 0) / (member.goal || 2000)) * 100)}%
                  </span>
                </ProgressRing>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-md text-neutral-900">邀请成员</h3>
              <button 
                onClick={() => setShowInvite(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                关闭
              </button>
            </div>
            <div className="flex flex-col items-center py-8">
              <div className="w-48 h-48 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-neutral-400" />
              </div>
              <p className="text-body-md text-neutral-600 text-center">
                让家人扫描二维码加入家庭
              </p>
              <p className="text-body-sm text-neutral-400 mt-2">
                邀请码: FAMILY{Date.now().toString().slice(-6)}
              </p>
            </div>
            <button className="w-full h-12 bg-primary-500 text-white rounded-full font-semibold">
              复制邀请链接
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-md text-neutral-900">添加家庭成员</h3>
              <button 
                onClick={() => setShowAddMember(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                关闭
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">姓名</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  placeholder="成员姓名"
                />
              </div>
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">关系</label>
                <select
                  value={newMember.relationship}
                  onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="本人">本人</option>
                  <option value="配偶">配偶</option>
                  <option value="父母">父母</option>
                  <option value="子女">子女</option>
                  <option value="家人">其他家人</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">性别</label>
                <div className="flex gap-4">
                  {['male', 'female'].map(g => (
                    <label key={g} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={newMember.gender === g}
                        onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                        className="accent-primary-500"
                      />
                      <span>{g === 'male' ? '男' : '女'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleAddMember}
              disabled={!newMember.name}
              className="w-full h-12 bg-primary-500 text-white rounded-full font-semibold mt-6 disabled:bg-neutral-300"
            >
              添加成员
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
