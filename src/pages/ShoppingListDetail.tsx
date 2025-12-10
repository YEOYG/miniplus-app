import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Check, Trash2, TrendingDown, Loader2, ShoppingCart, X } from 'lucide-react'
import Card from '@/components/Card'
import { useAuth } from '@/contexts/AuthContext'
import { updateShoppingList, deleteShoppingList, searchSkus, getPriceComparison } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { ShoppingList, ShoppingListItem, IngredientSku, PriceComparison } from '@/types'

export default function ShoppingListDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<ShoppingList | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null)
  const [priceData, setPriceData] = useState<PriceComparison | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<IngredientSku[]>([])
  const [newItem, setNewItem] = useState<Partial<ShoppingListItem>>({
    name: '',
    quantity: 1,
    unit: '份',
    checked: false,
  })

  useEffect(() => {
    if (id) loadList()
  }, [id])

  async function loadList() {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      setList({
        ...data,
        items: data?.items || [],
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(keyword: string) {
    setSearchKeyword(keyword)
    setNewItem({ ...newItem, name: keyword })
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
      name: sku.name,
      unit: sku.unit || '份',
      sku_id: sku.id,
      estimated_price: sku.average_price,
    })
    setSearchKeyword('')
    setSearchResults([])
  }

  async function handleAddItem() {
    if (!list || !newItem.name) return
    const item: ShoppingListItem = {
      name: newItem.name,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || '份',
      estimated_price: newItem.estimated_price,
      sku_id: newItem.sku_id,
      checked: false,
    }
    
    const newItems = [...list.items, item]
    const newTotal = newItems.reduce((sum, i) => sum + (i.estimated_price || 0) * i.quantity, 0)
    
    await updateShoppingList(list.id, { items: newItems, estimated_total: newTotal })
    setShowAddModal(false)
    setNewItem({ name: '', quantity: 1, unit: '份', checked: false })
    loadList()
  }

  async function handleToggleItem(index: number) {
    if (!list) return
    const newItems = [...list.items]
    newItems[index].checked = !newItems[index].checked
    await updateShoppingList(list.id, { items: newItems })
    loadList()
  }

  async function handleRemoveItem(index: number) {
    if (!list) return
    const newItems = list.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((sum, i) => sum + (i.estimated_price || 0) * i.quantity, 0)
    await updateShoppingList(list.id, { items: newItems, estimated_total: newTotal })
    loadList()
  }

  async function handleShowPrice(item: ShoppingListItem) {
    if (!item.sku_id) return
    setSelectedItem(item)
    setShowPriceModal(true)
    const data = await getPriceComparison(item.sku_id).catch(() => null)
    setPriceData(data)
  }

  async function handleDeleteList() {
    if (!list || !confirm('确定删除此购物清单?')) return
    await deleteShoppingList(list.id)
    navigate('/shopping')
  }

  async function handleUpdateStatus(status: 'pending' | 'shopping' | 'completed') {
    if (!list) return
    await updateShoppingList(list.id, { status })
    loadList()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-neutral-500">清单不存在</p>
      </div>
    )
  }

  const checkedCount = list.items.filter(i => i.checked).length

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-heading-md text-neutral-900">{list.name}</h1>
          <p className="text-caption text-neutral-500">{checkedCount}/{list.items.length} 已勾选</p>
        </div>
        <button onClick={handleDeleteList} className="p-2 text-neutral-400">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-3 flex gap-2">
        {(['pending', 'shopping', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => handleUpdateStatus(status)}
            className={`px-4 py-2 rounded-full text-body-sm transition-colors ${
              list.status === status
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {status === 'pending' ? '待采购' : status === 'shopping' ? '采购中' : '已完成'}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="px-4 space-y-2">
        {list.items.length === 0 ? (
          <Card variant="elevated" className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-body-sm text-neutral-500">清单是空的，添加一些商品吧</p>
          </Card>
        ) : (
          list.items.map((item, index) => (
            <Card key={index} variant="elevated">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleItem(index)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-neutral-300'
                  }`}
                >
                  {item.checked && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className={`flex-1 ${item.checked ? 'opacity-50' : ''}`}>
                  <h3 className={`text-heading-sm text-neutral-900 ${item.checked ? 'line-through' : ''}`}>
                    {item.name}
                  </h3>
                  <p className="text-body-sm text-neutral-500">
                    {item.quantity} {item.unit}
                    {item.estimated_price && ` - ¥${(item.estimated_price * item.quantity).toFixed(2)}`}
                  </p>
                </div>
                {item.sku_id && (
                  <button
                    onClick={() => handleShowPrice(item)}
                    className="p-2 text-primary-500"
                  >
                    <TrendingDown className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 text-neutral-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-neutral-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-body-sm text-neutral-600">预估总价</span>
          <span className="text-heading-md text-primary-500">
            ¥{list.estimated_total?.toFixed(2) || '0.00'}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-primary-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加商品
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md text-neutral-900">添加商品</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="搜索或输入商品名称"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(sku => (
                      <button
                        key={sku.id}
                        onClick={() => selectSku(sku)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center justify-between"
                      >
                        <span>{sku.name}</span>
                        <span className="text-caption text-neutral-400">¥{sku.average_price}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">数量</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    min={1}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">单位</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                onClick={handleAddItem}
                disabled={!newItem.name}
                className="w-full bg-primary-500 text-white py-4 rounded-xl text-heading-sm disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Comparison Modal */}
      {showPriceModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md text-neutral-900">{selectedItem.name} 比价</h2>
              <button onClick={() => { setShowPriceModal(false); setPriceData(null) }}>
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>

            {!priceData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {priceData.prices.map((p, i) => (
                  <Card
                    key={i}
                    variant="elevated"
                    className={p.platform === priceData.best_deal.platform ? 'border-2 border-primary-500' : ''}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-heading-sm text-neutral-900">{p.platform}</h3>
                          {p.platform === priceData.best_deal.platform && (
                            <span className="px-2 py-0.5 bg-primary-500 text-white text-caption rounded">最优</span>
                          )}
                        </div>
                        {p.discount_info && (
                          <p className="text-caption text-semantic-error">{p.discount_info}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-heading-md text-primary-500">¥{p.price.toFixed(2)}</div>
                        {p.original_price && p.original_price > p.price && (
                          <div className="text-caption text-neutral-400 line-through">
                            ¥{p.original_price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {priceData.best_deal.savings > 0 && (
                  <div className="text-center text-body-sm text-semantic-success mt-4">
                    选择 {priceData.best_deal.platform} 可节省 ¥{priceData.best_deal.savings.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
