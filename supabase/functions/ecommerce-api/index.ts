// 电商API模拟Edge Function - 提供统一的商品搜索和价格比较接口
// 后续可替换为真实API调用

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// 模拟电商平台数据
const platforms = {
  jd: { name: '京东', baseUrl: 'https://api.jd.com' },
  meituan: { name: '美团买菜', baseUrl: 'https://api.meituan.com' },
  hema: { name: '盒马', baseUrl: 'https://api.hema.com' },
}

// 模拟商品数据库
const mockProducts: Record<string, any> = {
  '白萝卜': {
    jd: { price: 3.50, originalPrice: 4.20, stock: 'in_stock', discount: '限时特惠' },
    meituan: { price: 3.33, originalPrice: 3.50, stock: 'in_stock', discount: '新人优惠' },
    hema: { price: 3.85, originalPrice: 4.00, stock: 'in_stock', discount: null },
  },
  '羊肉': {
    jd: { price: 45.00, originalPrice: 54.00, stock: 'in_stock', discount: '限时特惠' },
    meituan: { price: 42.75, originalPrice: 45.00, stock: 'in_stock', discount: '新人优惠' },
    hema: { price: 49.50, originalPrice: 51.75, stock: 'low_stock', discount: null },
  },
  '鸡蛋': {
    jd: { price: 18.00, originalPrice: 21.60, stock: 'in_stock', discount: '限时特惠' },
    meituan: { price: 17.10, originalPrice: 18.00, stock: 'in_stock', discount: '新人优惠' },
    hema: { price: 19.80, originalPrice: 20.70, stock: 'in_stock', discount: null },
  },
  '牛奶': {
    jd: { price: 45.00, originalPrice: 54.00, stock: 'in_stock', discount: '限时特惠' },
    meituan: { price: 42.75, originalPrice: 45.00, stock: 'in_stock', discount: '满减优惠' },
    hema: { price: 49.50, originalPrice: 51.75, stock: 'in_stock', discount: null },
  },
  '三文鱼': {
    jd: { price: 58.00, originalPrice: 69.60, stock: 'in_stock', discount: '限时特惠' },
    meituan: { price: 55.10, originalPrice: 58.00, stock: 'low_stock', discount: '新人优惠' },
    hema: { price: 63.80, originalPrice: 66.70, stock: 'in_stock', discount: null },
  },
}

// 搜索商品
function searchProducts(keyword: string, platform?: string) {
  const results: any[] = []
  
  Object.entries(mockProducts).forEach(([name, platforms]) => {
    if (name.includes(keyword) || keyword.includes(name)) {
      if (platform && platforms[platform]) {
        results.push({
          name,
          platform,
          ...platforms[platform],
        })
      } else {
        Object.entries(platforms).forEach(([p, data]: [string, any]) => {
          results.push({
            name,
            platform: p,
            ...data,
          })
        })
      }
    }
  })
  
  return results
}

// 获取价格比较
function getPriceComparison(productName: string) {
  const product = mockProducts[productName]
  if (!product) return null
  
  const prices = Object.entries(product).map(([platform, data]: [string, any]) => ({
    platform: platforms[platform as keyof typeof platforms]?.name || platform,
    platformId: platform,
    price: data.price,
    originalPrice: data.originalPrice,
    stockStatus: data.stock,
    discountInfo: data.discount,
    savings: data.originalPrice - data.price,
  }))
  
  const bestDeal = prices.reduce((best, curr) => 
    curr.price < best.price ? curr : best
  )
  
  return {
    productName,
    prices,
    bestDeal: {
      platform: bestDeal.platform,
      price: bestDeal.price,
      savings: bestDeal.savings,
    },
    lastUpdated: new Date().toISOString(),
  }
}

// 模拟实时价格更新（添加随机波动）
function getRealtimePrice(basePrice: number): number {
  const fluctuation = (Math.random() - 0.5) * 0.1 // +/-5%波动
  return Number((basePrice * (1 + fluctuation)).toFixed(2))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    let result: any = null

    switch (action) {
      case 'search': {
        const keyword = url.searchParams.get('keyword') || ''
        const platform = url.searchParams.get('platform') || undefined
        result = searchProducts(keyword, platform)
        break
      }
      
      case 'compare': {
        const productName = url.searchParams.get('product') || ''
        result = getPriceComparison(productName)
        break
      }
      
      case 'realtime': {
        // 模拟实时价格API
        const products = url.searchParams.get('products')?.split(',') || []
        result = products.map(name => {
          const product = mockProducts[name]
          if (!product) return null
          return {
            name,
            prices: Object.entries(product).map(([platform, data]: [string, any]) => ({
              platform: platforms[platform as keyof typeof platforms]?.name || platform,
              price: getRealtimePrice(data.price),
              stock: data.stock,
            })),
          }
        }).filter(Boolean)
        break
      }
      
      case 'platforms': {
        result = Object.entries(platforms).map(([id, info]) => ({
          id,
          ...info,
        }))
        break
      }
      
      default:
        result = {
          message: 'MiniPlus 电商API服务',
          endpoints: [
            'GET ?action=search&keyword=xxx - 搜索商品',
            'GET ?action=compare&product=xxx - 价格比较',
            'GET ?action=realtime&products=a,b,c - 实时价格',
            'GET ?action=platforms - 支持的平台列表',
          ],
        }
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: { code: 'API_ERROR', message: error.message },
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
