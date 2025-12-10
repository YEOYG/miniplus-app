import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/Card'
import { 
  User, Heart, Bell, Shield, Download, HelpCircle, 
  ChevronRight, LogOut, Moon, Scale, Ruler, Target,
  AlertTriangle
} from 'lucide-react'

export default function Settings() {
  const { profile, signOut, updateProfile } = useAuth()
  const [showHealthEdit, setShowHealthEdit] = useState(false)
  const [healthData, setHealthData] = useState({
    height: profile?.height?.toString() || '',
    weight: profile?.weight?.toString() || '',
    targetWeight: profile?.target_weight?.toString() || '',
    dailyCalorieGoal: (profile?.daily_calorie_goal || 2000).toString(),
  })

  const handleSaveHealth = async () => {
    await updateProfile({
      height: Number(healthData.height),
      weight: Number(healthData.weight),
      target_weight: Number(healthData.targetWeight),
      daily_calorie_goal: Number(healthData.dailyCalorieGoal),
    })
    setShowHealthEdit(false)
  }

  const menuSections = [
    {
      title: '健康档案',
      items: [
        { icon: Ruler, label: '身高体重', value: profile?.height ? `${profile.height}cm / ${profile.weight}kg` : '未设置', action: () => setShowHealthEdit(true) },
        { icon: Target, label: '目标体重', value: profile?.target_weight ? `${profile.target_weight}kg` : '未设置', action: () => setShowHealthEdit(true) },
        { icon: Scale, label: '每日热量目标', value: `${profile?.daily_calorie_goal || 2000} kcal`, action: () => setShowHealthEdit(true) },
      ]
    },
    {
      title: '饮食偏好',
      items: [
        { icon: AlertTriangle, label: '过敏原设置', value: profile?.allergies?.length ? `${profile.allergies.length}项` : '未设置' },
        { icon: Heart, label: '口味偏好', value: '清淡' },
      ]
    },
    {
      title: '应用设置',
      items: [
        { icon: Bell, label: '通知提醒', value: '已开启' },
        { icon: Moon, label: '深色模式', value: '跟随系统' },
        { icon: Shield, label: '隐私设置', value: '' },
      ]
    },
    {
      title: '更多',
      items: [
        { icon: Download, label: '数据导出', value: '' },
        { icon: HelpCircle, label: '帮助与反馈', value: '' },
      ]
    },
  ]

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* Profile Header */}
      <Card variant="elevated" className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary-500" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-heading-md text-neutral-900">{profile?.nickname || '用户'}</h2>
          <p className="text-body-sm text-neutral-500">{profile?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-caption rounded-full">
            {profile?.role === 'admin' ? '家庭管理员' : profile?.role === 'member' ? '家庭成员' : '个人用户'}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400" />
      </Card>

      {/* Menu Sections */}
      {menuSections.map((section, idx) => (
        <div key={idx}>
          <h3 className="text-body-sm text-neutral-500 mb-2 px-1">{section.title}</h3>
          <Card variant="elevated" className="p-0 divide-y divide-neutral-100">
            {section.items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
              >
                <item.icon className="w-5 h-5 text-neutral-500" />
                <span className="flex-1 text-left text-body-md text-neutral-800">{item.label}</span>
                {item.value && <span className="text-body-sm text-neutral-500">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            ))}
          </Card>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3 text-semantic-error hover:bg-semantic-error/5 rounded-xl transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-body-md font-medium">退出登录</span>
      </button>

      {/* Version */}
      <p className="text-center text-caption text-neutral-400">
        MiniPlus v1.0.0
      </p>

      {/* Health Edit Modal */}
      {showHealthEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-md text-neutral-900">健康档案</h3>
              <button onClick={() => setShowHealthEdit(false)} className="text-neutral-400">
                取消
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">身高 (cm)</label>
                <input
                  type="number"
                  value={healthData.height}
                  onChange={(e) => setHealthData({ ...healthData, height: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  placeholder="170"
                />
              </div>
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  value={healthData.weight}
                  onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  placeholder="65"
                />
              </div>
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">目标体重 (kg)</label>
                <input
                  type="number"
                  value={healthData.targetWeight}
                  onChange={(e) => setHealthData({ ...healthData, targetWeight: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">每日热量目标 (kcal)</label>
                <input
                  type="number"
                  value={healthData.dailyCalorieGoal}
                  onChange={(e) => setHealthData({ ...healthData, dailyCalorieGoal: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  placeholder="2000"
                />
              </div>
            </div>
            
            <button
              onClick={handleSaveHealth}
              className="w-full h-12 bg-primary-500 text-white rounded-full font-semibold mt-6"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
