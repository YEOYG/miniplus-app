import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'
import { Eye, EyeOff, Leaf } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [role, setRole] = useState<UserRole>('single')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, nickname, role)
        if (error) throw error
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions: { value: UserRole; label: string; desc: string }[] = [
    { value: 'single', label: '个人用户', desc: '独立管理个人饮食健康' },
    { value: 'admin', label: '家庭管理员', desc: '创建和管理家庭成员' },
    { value: 'member', label: '家庭成员', desc: '加入已有家庭' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <span className="text-heading-xl text-primary-900">MiniPlus</span>
        </div>
        
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h1 className="text-heading-lg text-center mb-6">
              {isLogin ? '登录账户' : '创建账户'}
            </h1>
            
            {error && (
              <div className="bg-semantic-error/10 text-semantic-error text-body-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-1">昵称</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="您的昵称"
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-body-sm text-neutral-600 mb-1">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="至少6位密码"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-body-sm text-neutral-600 mb-2">用户类型</label>
                  <div className="space-y-2">
                    {roleOptions.map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                          ${role === opt.value 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-neutral-300'}`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={opt.value}
                          checked={role === opt.value}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="mt-1 accent-primary-500"
                        />
                        <div>
                          <div className="text-body-md font-medium">{opt.label}</div>
                          <div className="text-body-sm text-neutral-500">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary-500 text-white rounded-full font-semibold
                  hover:bg-primary-700 active:scale-98 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError('') }}
                className="text-body-md text-primary-500 hover:underline"
              >
                {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
              </button>
            </div>
          </div>
          
          <p className="text-caption text-neutral-400 text-center mt-6">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  )
}
