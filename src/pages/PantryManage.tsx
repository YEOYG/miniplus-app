import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Package, AlertTriangle, Trash2, Edit2, Loader2, X } from 'lucide-react'
import Card from '@/components/Card'
import { useAuth } from '@/contexts/AuthContext'
import { getPantryInventory, addPantryItem, updatePantryItem, deletePantryItem, searchSkus } from '@/lib/api'
import type { PantryItem, IngredientSku } from '@/types'

export default function PantryManage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<PantryItem[]>([])
  const [filter, setFilter] = useState<'all' | 'expiring' | 'low'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<IngredientSku[]>([])
  const [newItem, setNewItem] = useState({
    ingredient_name: '',
    quantity: 1,
    unit: '份',
    purchase_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    sku_id: '',
  })

  useEffect(() => {
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
      const data = await getPantryInventory(user!.id)
      setInventory(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(keyword: string) {
    setSearchKeyword(keyword)
    if (keyword.length >= 1) {
      const results = await searchSkus(keyword).catch(() => [])
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  function selectSku(sku: IngredientSku) {
    setNewItem({
      ...newItem,
      ingredient_name: sku.name,
      unit: sku.unit || '份',
      sku_id: sku.id,
    })
    setSearchKeyword('')
    setSearchResults([])
  }

  async function handleAddItem() {
    if (!user || !newItem.ingredient_name) return
    try {
      await addPantryItem({
        user_id: user.id,
        ...newItem,
        sku_id: newItem.sku_id || undefined,
      })
      setShowAddModal(false)
      setNewItem({
        ingredient_name: '',
        quantity: 1,
        unit: '份',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        sku_id: '',
      })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此食材?')) return
    try {
      await deletePantryItem(id)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleMarkUsed(item: PantryItem) {
    try {
      await updatePantryItem(item.id, { status: 'used' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

  const filteredInventory = inventory.filter(item => {
    if (item.status === 'used') return false
    if (filter === 'expiring') {
      if (!item.expiry_date) return false
      const expiry = new Date(item.expiry_date)
      return expiry <= threeDaysLater
    }
    if (filter === 'low') return item.status === 'low'
    return true
  })

  const expiringCount = inventory.filter(i => {
    if (!i.expiry_date || i.status === 'used') return false
    return new Date(i.expiry_date) <= threeDaysLater
  }).length

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
        <h1 className="text-heading-md text-neutral-900 flex-1">库存管理</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 flex gap-2">
        {[
          { key: 'all', label: `全部 (${inventory.filter(i => i.status !== 'used').length})` },
          { key: 'expiring', label: `即将过期 (${expiringCount})` },
          { key: 'low', label: '库存不足' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
              filter === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory List */}
      <div className="px-4 space-y-3">
        {filteredInventory.length === 0 ? (
          <Card variant="elevated" className="text-center py-8">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-body-sm text-neutral-500">
              {filter === 'all' ? '库存空空如也，快去采购吧' : '没有符合条件的食材'}
            </p>
          </Card>
        ) : (
          filteredInventory.map(item => {
            const isExpiring = item.expiry_date && new Date(item.expiry_date) <= threeDaysLater
            const isExpired = item.expiry_date && new Date(item.expiry_date) < today

            return (
              <Card key={item.id} variant="elevated">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isExpired ? 'bg-semantic-error/10' :
                    isExpiring ? 'bg-semantic-warning/10' :
                    'bg-primary-50'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      isExpired ? 'text-semantic-error' :
                      isExpiring ? 'text-semantic-warning' :
                      'text-primary-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-heading-sm text-neutral-900">{item.ingredient_name}</h3>
                      {isExpired && (
                        <span className="px-2 py-0.5 bg-semantic-error/10 text-semantic-error text-caption rounded">已过期</span>
                      )}
                      {isExpiring && !isExpired && (
                        <span className="px-2 py-0.5 bg-semantic-warning/10 text-semantic-warning text-caption rounded">即将过期</span>
                      )}
                    </div>
                    <p className="text-body-sm text-neutral-500">
                      {item.quantity} {item.unit}
                      {item.expiry_date && ` - 保质期至 ${item.expiry_date}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkUsed(item)}
                      className="p-2 text-neutral-400 hover:text-primary-500"
                      title="标记已用完"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-neutral-400 hover:text-semantic-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md text-neutral-900">添加库存食材</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search/Name Input */}
              <div className="relative">
                <label className="block text-body-sm text-neutral-600 mb-1">食材名称</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchKeyword || newItem.ingredient_name}
                    onChange={(e) => {
                      setNewItem({ ...newItem, ingredient_name: e.target.value })
                      handleSearch(e.target.value)
                    }}
                    placeholder="搜索或输入食材名称"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(sku => (
                      <button
                        key={sku.id}
                        onClick={() => selectSku(sku)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center justify-between"
                      >
                        <span>{sku.name}</span>
                        <span className="text-caption text-neutral-400">{sku.specification}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">数量</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">单位</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                  >
                    <option value="份">份</option>
                    <option value="个">个</option>
                    <option value="g">克</option>
                    <option value="kg">千克</option>
                    <option value="盒">盒</option>
                    <option value="瓶">瓶</option>
                    <option value="袋">袋</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">购买日期</label>
                  <input
                    type="date"
                    value={newItem.purchase_date}
                    onChange={(e) => setNewItem({ ...newItem, purchase_date: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">过期日期</label>
                  <input
                    type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAddItem}
                disabled={!newItem.ingredient_name}
                className="w-full bg-primary-500 text-white py-4 rounded-xl text-heading-sm disabled:opacity-50"
              >
                添加到库存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
