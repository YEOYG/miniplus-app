import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, User, Heart, Utensils, Activity, Save, Trash2, 
  AlertCircle, Loader2, ChevronRight, Scale, Ruler, Droplet
} from 'lucide-react'
import Card from '@/components/Card'
import {
  getFamilyMemberById, getHealthProfile, getDietaryPreference,
  updateFamilyMember, upsertHealthProfile, upsertDietaryPreference,
  deleteFamilyMember, calculateNutritionNeeds, getTodayNutrition
} from '@/lib/api'
import type { FamilyMember, HealthProfile, DietaryPreference } from '@/types'

type TabType = 'basic' | 'health' | 'diet'

const BLOOD_TYPES = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const ALLERGIES = ['花生', '牛奶', '鸡蛋', '海鲜', '小麦', '大豆', '坚果', '芝麻']
const CHRONIC_CONDITIONS = ['高血压', '糖尿病', '高血脂', '痛风', '胃病', '肾病']
const TASTE_PREFS = ['辣', '甜', '酸', '咸', '清淡', '重口味']
const DIET_RESTRICTIONS = ['素食', '纯素', '无糖', '低盐', '低脂', '无麸质', '生酮']
const RELIGIOUS = ['清真', '佛教素食', '印度教素食', '犹太洁食']
const CUISINES = ['中餐', '日料', '韩餐', '西餐', '东南亚', '印度菜', '地中海']

export default function MemberDetail() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [healthProfile, setHealthProfile] = useState<Partial<HealthProfile>>({})
  const [dietPref, setDietPref] = useState<Partial<DietaryPreference>>({})
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [nutritionNeeds, setNutritionNeeds] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (memberId) loadData()
  }, [memberId])

  async function loadData() {
    if (!memberId) return
    setLoading(true)
    try {
      const [memberData, healthData, dietData, nutritionData] = await Promise.all([
        getFamilyMemberById(memberId),
        getHealthProfile(memberId),
        getDietaryPreference(memberId),
        getTodayNutrition(memberId),
      ])
      
      setMember(memberData)
      setHealthProfile(healthData || { member_id: memberId })
      setDietPref(dietData || { member_id: memberId, daily_calorie_goal: 2000, protein_goal: 60, carbs_goal: 250, fat_goal: 65 })
      setNutrition(nutritionData)

      if (memberData && healthData) {
        const needs = calculateNutritionNeeds(healthData as HealthProfile, dietData, memberData)
        setNutritionNeeds(needs)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!memberId || !member) return
    setSaving(true)
    try {
      await updateFamilyMember(memberId, member)
      if (healthProfile.member_id) {
        await upsertHealthProfile(healthProfile as HealthProfile)
      }
      if (dietPref.member_id) {
        await upsertDietaryPreference(dietPref as DietaryPreference)
      }
      // 刷新数据
      await loadData()
      alert('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!memberId) return
    try {
      await deleteFamilyMember(memberId)
      navigate('/family')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  function toggleArrayItem<T>(arr: T[] | undefined, item: T): T[] {
    const current = arr || []
    return current.includes(item) ? current.filter(i => i !== item) : [...current, item]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-4 text-center">
        <p className="text-neutral-500">成员不存在</p>
        <button onClick={() => navigate('/family')} className="mt-4 text-primary-500">返回</button>
      </div>
    )
  }

  const tabs = [
    { id: 'basic' as TabType, label: '基本信息', icon: User },
    { id: 'health' as TabType, label: '健康档案', icon: Heart },
    { id: 'diet' as TabType, label: '饮食偏好', icon: Utensils },
  ]

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate('/family')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-heading-md text-neutral-900">{member.name}</h1>
          <p className="text-body-sm text-neutral-500">{member.relationship}</p>
        </div>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 text-semantic-error"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Nutrition Summary */}
      <div className="px-4 pt-4">
        <Card variant="elevated" className="bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">{member.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-body-sm text-neutral-500">今日热量摄入</p>
              <p className="text-2xl font-bold text-neutral-900">
                {nutrition.calories} <span className="text-body-sm text-neutral-400">/ {dietPref.daily_calorie_goal || 2000} kcal</span>
              </p>
            </div>
            <div className="text-right">
              <Activity className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
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

      {/* Tab Content */}
      <div className="px-4 pt-4 space-y-4">
        {activeTab === 'basic' && (
          <>
            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">基本资料</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">姓名</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => setMember({ ...member, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">关系</label>
                  <select
                    value={member.relationship}
                    onChange={(e) => setMember({ ...member, relationship: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none bg-white"
                  >
                    <option value="本人">本人</option>
                    <option value="配偶">配偶</option>
                    <option value="父亲">父亲</option>
                    <option value="母亲">母亲</option>
                    <option value="儿子">儿子</option>
                    <option value="女儿">女儿</option>
                    <option value="爷爷">爷爷</option>
                    <option value="奶奶">奶奶</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm text-neutral-600 mb-1">性别</label>
                    <div className="flex gap-4">
                      {['male', 'female'].map(g => (
                        <label key={g} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            checked={member.gender === g}
                            onChange={() => setMember({ ...member, gender: g })}
                            className="accent-primary-500"
                          />
                          <span>{g === 'male' ? '男' : '女'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-body-sm text-neutral-600 mb-1">年龄</label>
                    <input
                      type="number"
                      value={member.age || ''}
                      onChange={(e) => setMember({ ...member, age: parseInt(e.target.value) || undefined })}
                      className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                      placeholder="年龄"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">出生日期</label>
                  <input
                    type="date"
                    value={member.birth_date || ''}
                    onChange={(e) => setMember({ ...member, birth_date: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'health' && (
          <>
            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">身体指标</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-primary-500" />
                    <span className="text-body-sm text-neutral-600">身高</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={healthProfile.height || ''}
                      onChange={(e) => setHealthProfile({ ...healthProfile, height: parseFloat(e.target.value) || undefined })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-center"
                      placeholder="170"
                    />
                    <span className="text-body-sm text-neutral-500">cm</span>
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-primary-500" />
                    <span className="text-body-sm text-neutral-600">体重</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={healthProfile.weight || ''}
                      onChange={(e) => setHealthProfile({ ...healthProfile, weight: parseFloat(e.target.value) || undefined })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-center"
                      placeholder="65"
                    />
                    <span className="text-body-sm text-neutral-500">kg</span>
                  </div>
                </div>
              </div>
              {healthProfile.height && healthProfile.weight && (
                <div className="mt-4 bg-primary-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-neutral-600">BMI 指数</span>
                    <span className="text-heading-md text-primary-600">
                      {(healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card variant="elevated">
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-5 h-5 text-semantic-error" />
                <h3 className="text-heading-sm text-neutral-900">血型</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {BLOOD_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setHealthProfile({ ...healthProfile, blood_type: type })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      healthProfile.blood_type === type
                        ? 'bg-semantic-error text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {type}型
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-semantic-warning" />
                <h3 className="text-heading-sm text-neutral-900">过敏原</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map(item => (
                  <button
                    key={item}
                    onClick={() => setHealthProfile({ 
                      ...healthProfile, 
                      allergies: toggleArrayItem(healthProfile.allergies, item) 
                    })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      healthProfile.allergies?.includes(item)
                        ? 'bg-semantic-warning text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-semantic-error" />
                <h3 className="text-heading-sm text-neutral-900">慢性病标签</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {CHRONIC_CONDITIONS.map(item => (
                  <button
                    key={item}
                    onClick={() => setHealthProfile({ 
                      ...healthProfile, 
                      chronic_conditions: toggleArrayItem(healthProfile.chronic_conditions, item) 
                    })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      healthProfile.chronic_conditions?.includes(item)
                        ? 'bg-semantic-error text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">医疗备注</h3>
              <textarea
                value={healthProfile.medical_notes || ''}
                onChange={(e) => setHealthProfile({ ...healthProfile, medical_notes: e.target.value })}
                className="w-full h-24 px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none resize-none"
                placeholder="其他健康相关备注..."
              />
            </Card>
          </>
        )}

        {activeTab === 'diet' && (
          <>
            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">口味偏好</h3>
              <div className="flex flex-wrap gap-2">
                {TASTE_PREFS.map(item => (
                  <button
                    key={item}
                    onClick={() => setDietPref({ 
                      ...dietPref, 
                      taste_preferences: toggleArrayItem(dietPref.taste_preferences, item) 
                    })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      dietPref.taste_preferences?.includes(item)
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">饮食限制</h3>
              <div className="flex flex-wrap gap-2">
                {DIET_RESTRICTIONS.map(item => (
                  <button
                    key={item}
                    onClick={() => setDietPref({ 
                      ...dietPref, 
                      dietary_restrictions: toggleArrayItem(dietPref.dietary_restrictions, item) 
                    })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      dietPref.dietary_restrictions?.includes(item)
                        ? 'bg-nutrient-protein text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">宗教/文化禁忌</h3>
              <div className="flex flex-wrap gap-2">
                {RELIGIOUS.map(item => (
                  <button
                    key={item}
                    onClick={() => setDietPref({ 
                      ...dietPref, 
                      religious_restrictions: toggleArrayItem(dietPref.religious_restrictions, item) 
                    })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      dietPref.religious_restrictions?.includes(item)
                        ? 'bg-nutrient-fat text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">喜欢的菜系</h3>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map(item => (
                  <button
                    key={item}
                    onClick={() => setDietPref({ 
                      ...dietPref, 
                      cuisine_preferences: toggleArrayItem(dietPref.cuisine_preferences, item) 
                    })}
                    className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
                      dietPref.cuisine_preferences?.includes(item)
                        ? 'bg-nutrient-carbs text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">每日营养目标</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-body-sm text-neutral-600">热量目标</span>
                    <span className="text-body-sm text-neutral-900">{dietPref.daily_calorie_goal || 2000} kcal</span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="4000"
                    step="100"
                    value={dietPref.daily_calorie_goal || 2000}
                    onChange={(e) => setDietPref({ ...dietPref, daily_calorie_goal: parseInt(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-body-sm text-neutral-600">蛋白质目标</span>
                    <span className="text-body-sm text-neutral-900">{dietPref.protein_goal || 60} g</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={dietPref.protein_goal || 60}
                    onChange={(e) => setDietPref({ ...dietPref, protein_goal: parseInt(e.target.value) })}
                    className="w-full accent-nutrient-protein"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-body-sm text-neutral-600">碳水目标</span>
                    <span className="text-body-sm text-neutral-900">{dietPref.carbs_goal || 250} g</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={dietPref.carbs_goal || 250}
                    onChange={(e) => setDietPref({ ...dietPref, carbs_goal: parseInt(e.target.value) })}
                    className="w-full accent-nutrient-carbs"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-body-sm text-neutral-600">脂肪目标</span>
                    <span className="text-body-sm text-neutral-900">{dietPref.fat_goal || 65} g</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="5"
                    value={dietPref.fat_goal || 65}
                    onChange={(e) => setDietPref({ ...dietPref, fat_goal: parseInt(e.target.value) })}
                    className="w-full accent-nutrient-fat"
                  />
                </div>
              </div>
            </Card>

            <Card variant="elevated">
              <h3 className="text-heading-sm text-neutral-900 mb-4">特殊需求</h3>
              <textarea
                value={dietPref.special_requirements || ''}
                onChange={(e) => setDietPref({ ...dietPref, special_requirements: e.target.value })}
                className="w-full h-24 px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 outline-none resize-none"
                placeholder="如增肌、减脂、孕期营养等特殊需求..."
              />
            </Card>

            {nutritionNeeds && nutritionNeeds.recommendations.length > 0 && (
              <Card variant="elevated" className="bg-primary-50">
                <h3 className="text-heading-sm text-primary-700 mb-3">营养建议</h3>
                <ul className="space-y-2">
                  {nutritionNeeds.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-body-sm text-neutral-700">
                      <ChevronRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-primary-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 disabled:bg-neutral-300"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-heading-md text-neutral-900 mb-2">确认删除</h3>
            <p className="text-body-md text-neutral-600 mb-6">
              确定要删除成员 "{member.name}" 吗？此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-12 border border-neutral-200 rounded-full text-neutral-700"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-12 bg-semantic-error text-white rounded-full"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
