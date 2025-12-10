import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { sendAIMessage } from '@/lib/api'
import Card from '@/components/Card'
import { Send, Camera, Mic, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickPrompts = [
  '今天吃什么？',
  '低脂晚餐推荐',
  '增肌食谱',
  '快手早餐',
  '家庭聚餐菜单',
]

export default function AIAssistant() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是MiniPlus营养助手。我可以根据您的健康目标推荐食谱、分析食物营养、制定饮食计划。有什么可以帮您的？',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)
    
    try {
      // 调用真实AI API
      const response = await sendAIMessage(userInput, profile || undefined)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || '抱歉，我暂时无法回答您的问题，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI请求失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-heading-sm text-neutral-900">AI营养助手</h1>
            <p className="text-caption text-neutral-500">智能饮食建议</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-white shadow-sm rounded-bl-md'
              }`}
            >
              <p className="text-body-md whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-caption mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-neutral-400'}`}>
                {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-white border-t border-neutral-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-2 bg-primary-50 text-primary-700 rounded-full text-body-sm whitespace-nowrap
                hover:bg-primary-100 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200">
            <Camera className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200">
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入您的问题..."
              className="w-full h-10 px-4 bg-neutral-50 rounded-full border border-neutral-100 
                focus:border-primary-500 outline-none text-body-md"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white
              disabled:bg-neutral-300 hover:bg-primary-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
