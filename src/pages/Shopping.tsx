import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, TrendingDown, Sparkles, ChevronRight, Loader2, AlertTriangle, Plus } from 'lucide-react'
import Card from '@/components/Card'
import { useAuth } from '@/contexts/AuthContext'
import { getPantryStats, getUserShoppingLists, getExpiringItems, generateSmartShoppingList } from '@/lib/api'
import type { ShoppingList, PantryItem } from '@/types'

export default function Shopping() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([])

  useEffect(() => {
    // 超时保护
    const timeout = setTimeout(() => setLoading(false), 8000)
    
    if (!user) {
      setLoading(false)
      return
    }
    
    loadData().finally(() => clearTimeout(timeout))
    
    return () => clearTimeout(timeout)
  }, [user])

  async function loadData() {
    try {
      const [statsData, listsData, expiring] = await Promise.all([
        getPantryStats(user!.id).catch(() => null),
        getUserShoppingLists(user!.id).catch(() => []),
        getExpiringItems(user!.id, 3).catch(() => []),
      ])
      setStats(statsData)
      setLists(listsData)
      setExpiringItems(expiring)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateList() {
    if (!user || generating) return
    setGenerating(true)
    try {
      const list = await generateSmartShoppingList(user.id)
      if (list) {
        navigate(`/shopping/list/${list.id}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  const pendingLists = lists.filter(l => l.status === 'pending')
  const pendingItemsCount = pendingLists.reduce((sum, l) => sum + (l.items?.length || 0), 0)

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-heading-lg text-neutral-900">智能采购</h1>
        <p className="text-body-sm text-neutral-500">从厨房到购物车，一键搞定</p>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3">
        <Card variant="elevated" className="text-center p-3" onClick={() => navigate('/shopping/pantry')}>
          <Package className="w-6 h-6 text-primary-500 mx-auto mb-1" />
          <div className="text-number-lg text-neutral-900">{stats?.total_items || 0}</div>
          <div className="text-caption text-neutral-500">库存食材</div>
        </Card>
        <Card variant="elevated" className="text-center p-3" onClick={() => navigate('/shopping/lists')}>
          <ShoppingCart className="w-6 h-6 text-semantic-warning mx-auto mb-1" />
          <div className="text-number-lg text-neutral-900">{pendingItemsCount}</div>
          <div className="text-caption text-neutral-500">待购商品</div>
        </Card>
        <Card variant="elevated" className="text-center p-3" onClick={() => navigate('/shopping/compare')}>
          <TrendingDown className="w-6 h-6 text-semantic-success mx-auto mb-1" />
          <div className="text-number-lg text-neutral-900">省</div>
          <div className="text-caption text-neutral-500">智能比价</div>
        </Card>
      </div>

      {/* Expiring Items Alert */}
      {expiringItems.length > 0 && (
        <div className="px-4 py-2">
          <Card variant="elevated" className="bg-semantic-warning/10 border border-semantic-warning/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-semantic-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-semantic-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-heading-sm text-neutral-900">{expiringItems.length}种食材即将过期</h3>
                <p className="text-body-sm text-neutral-600">
                  {expiringItems.slice(0, 3).map(i => i.ingredient_name).join('、')}
                  {expiringItems.length > 3 && '...'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Smart Generate Button */}
      <div className="px-4 py-3">
        <button
          onClick={handleGenerateList}
          disabled={generating}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {generating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
          <span className="text-heading-sm">{generating ? '生成中...' : '一键生成智能购物清单'}</span>
        </button>
      </div>

      {/* Shopping Lists */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-heading-md text-neutral-900">我的购物清单</h2>
          <button 
            onClick={() => navigate('/shopping/lists')}
            className="text-body-sm text-primary-500"
          >
            查看全部
          </button>
        </div>

        {lists.length === 0 ? (
          <Card variant="elevated" className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-body-sm text-neutral-500 mb-4">还没有购物清单</p>
            <button
              onClick={handleGenerateList}
              className="inline-flex items-center gap-2 text-primary-500"
            >
              <Plus className="w-4 h-4" />
              创建第一个清单
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {lists.slice(0, 3).map(list => (
              <Card
                key={list.id}
                variant="elevated"
                onClick={() => navigate(`/shopping/list/${list.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-heading-sm text-neutral-900">{list.name}</h3>
                    <p className="text-body-sm text-neutral-500">
                      {list.items?.length || 0}件商品 
                      {list.estimated_total && ` - 预估 ¥${list.estimated_total.toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-caption ${
                      list.status === 'completed' ? 'bg-semantic-success/10 text-semantic-success' :
                      list.status === 'shopping' ? 'bg-primary-100 text-primary-600' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {list.status === 'completed' ? '已完成' : list.status === 'shopping' ? '采购中' : '待采购'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3">
        <h2 className="text-heading-md text-neutral-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card variant="elevated" onClick={() => navigate('/shopping/pantry')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-heading-sm text-neutral-900">管理库存</h3>
                <p className="text-caption text-neutral-500">查看家中食材</p>
              </div>
            </div>
          </Card>
          <Card variant="elevated" onClick={() => navigate('/shopping/compare')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-semantic-success/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-semantic-success" />
              </div>
              <div>
                <h3 className="text-heading-sm text-neutral-900">比价购买</h3>
                <p className="text-caption text-neutral-500">找最优价格</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
