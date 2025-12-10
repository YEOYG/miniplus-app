import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, TrendingDown, Loader2, Tag } from 'lucide-react'
import Card from '@/components/Card'
import { getIngredientSkus, getBatchPriceComparison } from '@/lib/api'
import type { IngredientSku, PriceComparison } from '@/types'

const categories = ['全部', '蔬菜', '肉类', '海鲜', '蛋类', '乳制品', '豆制品', '薯类']

export default function PriceCompare() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [skus, setSkus] = useState<IngredientSku[]>([])
  const [comparisons, setComparisons] = useState<PriceComparison[]>([])
  const [category, setCategory] = useState('全部')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadData()
  }, [category])

  async function loadData() {
    setLoading(true)
    try {
      const cat = category === '全部' ? undefined : category
      const data = await getIngredientSkus(cat)
      setSkus(data || [])

      // 获取所有SKU的价格比较
      if (data && data.length > 0) {
        const prices = await getBatchPriceComparison(data.map(s => s.id))
        setComparisons(prices)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredSkus = skus.filter(sku =>
    !searchKeyword || sku.name.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const getComparisonForSku = (skuId: string) => 
    comparisons.find(c => c.sku.id === skuId)

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h1 className="text-heading-md text-neutral-900">智能比价</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索食材..."
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-body-sm transition-colors ${
                category === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price List */}
      <div className="px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredSkus.length === 0 ? (
          <Card variant="elevated" className="text-center py-8">
            <TrendingDown className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-body-sm text-neutral-500">没有找到相关食材</p>
          </Card>
        ) : (
          filteredSkus.map(sku => {
            const comparison = getComparisonForSku(sku.id)
            
            return (
              <Card key={sku.id} variant="elevated">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <Tag className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-heading-sm text-neutral-900">{sku.name}</h3>
                      {comparison?.best_deal && (
                        <span className="px-2 py-1 bg-semantic-success/10 text-semantic-success text-caption rounded">
                          {comparison.best_deal.platform} 最优
                        </span>
                      )}
                    </div>
                    <p className="text-caption text-neutral-500 mb-2">{sku.specification}</p>
                    
                    {/* Price Comparison */}
                    {comparison ? (
                      <div className="flex flex-wrap gap-2">
                        {comparison.prices.slice(0, 3).map((p, i) => (
                          <div
                            key={i}
                            className={`px-3 py-1.5 rounded-lg ${
                              p.platform === comparison.best_deal.platform
                                ? 'bg-primary-50 border border-primary-200'
                                : 'bg-neutral-50'
                            }`}
                          >
                            <div className="text-caption text-neutral-500">{p.platform}</div>
                            <div className={`text-body-sm font-medium ${
                              p.platform === comparison.best_deal.platform
                                ? 'text-primary-600'
                                : 'text-neutral-700'
                            }`}>
                              ¥{p.price.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-body-sm text-neutral-500">
                        参考价: ¥{sku.average_price?.toFixed(2) || '-'}
                      </div>
                    )}

                    {comparison?.best_deal.savings && comparison.best_deal.savings > 0 && (
                      <p className="text-caption text-semantic-success mt-2">
                        选择最优平台可节省 ¥{comparison.best_deal.savings.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
