import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ShoppingCart, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import Card from '@/components/Card'
import { useAuth } from '@/contexts/AuthContext'
import { getUserShoppingLists, createShoppingList, deleteShoppingList } from '@/lib/api'
import type { ShoppingList } from '@/types'

export default function ShoppingLists() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<ShoppingList[]>([])

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    try {
      const data = await getUserShoppingLists(user!.id)
      setLists(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!user) return
    try {
      const list = await createShoppingList(user.id)
      navigate(`/shopping/list/${list.id}`)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('确定删除此清单?')) return
    try {
      await deleteShoppingList(id)
      loadData()
    } catch (e) {
      console.error(e)
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
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h1 className="text-heading-md text-neutral-900 flex-1">购物清单</h1>
        <button
          onClick={handleCreate}
          className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Lists */}
      <div className="px-4 py-3 space-y-3">
        {lists.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-body-sm text-neutral-500 mb-4">还没有购物清单</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl"
            >
              <Plus className="w-5 h-5" />
              创建清单
            </button>
          </Card>
        ) : (
          lists.map(list => (
            <Card
              key={list.id}
              variant="elevated"
              onClick={() => navigate(`/shopping/list/${list.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  list.status === 'completed' ? 'bg-semantic-success/10' :
                  list.status === 'shopping' ? 'bg-primary-100' :
                  'bg-neutral-100'
                }`}>
                  <ShoppingCart className={`w-6 h-6 ${
                    list.status === 'completed' ? 'text-semantic-success' :
                    list.status === 'shopping' ? 'text-primary-500' :
                    'text-neutral-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-sm text-neutral-900">{list.name}</h3>
                  <p className="text-body-sm text-neutral-500">
                    {list.items?.length || 0}件商品
                    {list.estimated_total && ` - ¥${list.estimated_total.toFixed(2)}`}
                  </p>
                  <p className="text-caption text-neutral-400">
                    {new Date(list.created_at).toLocaleDateString('zh-CN')}
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
                  <button
                    onClick={(e) => handleDelete(e, list.id)}
                    className="p-2 text-neutral-400 hover:text-semantic-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
