import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Pause, SkipForward, Volume2, VolumeX, Mic, MicOff, Flame, Timer, ChefHat, Loader2, AlertCircle } from 'lucide-react'
import Card from '@/components/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useVoice } from '@/hooks/useVoice'
import { getCookingSession, updateCookingSession, startCookingSession, completeCookingSession, generateVoicePrompt } from '@/lib/api'
import type { CookingSession, ScheduledDish, DualBurnerState } from '@/types'

export default function CookingConsole() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<CookingSession | null>(null)
  const [burnerState, setBurnerState] = useState<DualBurnerState>({
    left: { active: false, remainingTime: 0 },
    right: { active: false, remainingTime: 0 },
  })
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleVoiceCommand = useCallback((command: string) => {
    const parsed = voice.parseCommand(command)
    if (!parsed) return

    switch (parsed.type) {
      case 'start':
        handleStart()
        break
      case 'pause':
        handlePause()
        break
      case 'next':
        handleNextStep()
        break
      case 'repeat':
        speakCurrentStep()
        break
      case 'query':
        if (parsed.target === 'time') {
          const remaining = (session?.total_duration || 0) - elapsedTime
          voice.speak(`还需要约${Math.ceil(remaining)}分钟`)
        }
        break
    }
  }, [session, elapsedTime])

  const voice = useVoice({ onCommand: handleVoiceCommand })

  useEffect(() => {
    if (id) loadSession()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [id])

  async function loadSession() {
    try {
      // 先检查是否是临时会话
      if (id?.startsWith('temp-')) {
        const localData = localStorage.getItem(`cooking-session-${id}`)
        if (localData) {
          const tempSession = JSON.parse(localData)
          setSession({
            id: tempSession.id,
            user_id: user?.id || '',
            name: `烹饪会话 ${new Date().toLocaleString('zh-CN')}`,
            recipes: tempSession.recipes?.map((r: any) => r.id) || [],
            scheduled_dishes: tempSession.scheduled_dishes || [],
            status: 'pending',
            total_duration: tempSession.scheduled_dishes?.reduce(
              (max: number, d: any) => Math.max(max, (d.startTime || 0) + (d.duration || 30)), 0
            ) || 30,
            created_at: tempSession.created_at,
          } as CookingSession)
          setLoading(false)
          return
        }
      }
      
      // 正常从数据库加载
      const data = await getCookingSession(id!)
      setSession(data)
      if (data?.status === 'cooking') {
        startTimer()
        updateBurnerState(data.scheduled_dishes || [], 0)
      }
    } catch (e) {
      console.error('加载会话失败:', e)
    } finally {
      setLoading(false)
    }
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1
        if (session) {
          updateBurnerState(session.scheduled_dishes || [], newTime)
        }
        return newTime
      })
    }, 60000) // 每分钟更新
  }

  function updateBurnerState(dishes: ScheduledDish[], elapsed: number) {
    const leftDish = dishes.find(d => 
      d.equipment === 'left' && 
      d.startTime <= elapsed && 
      d.startTime + d.duration > elapsed
    )
    const rightDish = dishes.find(d => 
      d.equipment === 'right' && 
      d.startTime <= elapsed && 
      d.startTime + d.duration > elapsed
    )

    setBurnerState({
      left: {
        active: !!leftDish,
        recipeName: leftDish?.recipeName,
        remainingTime: leftDish ? (leftDish.startTime + leftDish.duration - elapsed) : 0,
        currentTask: leftDish?.tasks?.[0],
      },
      right: {
        active: !!rightDish,
        recipeName: rightDish?.recipeName,
        remainingTime: rightDish ? (rightDish.startTime + rightDish.duration - elapsed) : 0,
        currentTask: rightDish?.tasks?.[0],
      },
    })
  }

  async function handleStart() {
    if (!session || session.status === 'cooking') return
    setIsPaused(false)
    await startCookingSession(session.id)
    loadSession()
    startTimer()
    if (voiceEnabled) {
      voice.speak('烹饪开始，请按照步骤操作')
    }
  }

  function handlePause() {
    setIsPaused(true)
    if (timerRef.current) clearInterval(timerRef.current)
    if (voiceEnabled) {
      voice.speak('烹饪已暂停')
    }
  }

  function handleResume() {
    setIsPaused(false)
    startTimer()
    if (voiceEnabled) {
      voice.speak('继续烹饪')
    }
  }

  function handleNextStep() {
    setCurrentStep(prev => prev + 1)
    speakCurrentStep()
  }

  function speakCurrentStep() {
    if (!voiceEnabled) return
    const dishes = session?.scheduled_dishes || []
    const activeDish = dishes.find(d => d.status === 'cooking' || d.status === 'pending')
    if (activeDish?.tasks?.[currentStep]) {
      const task = activeDish.tasks[currentStep]
      voice.speak(`当前步骤：${task.name}，预计${task.duration}分钟`)
    }
  }

  async function handleComplete() {
    if (!session) return
    await completeCookingSession(session.id)
    if (timerRef.current) clearInterval(timerRef.current)
    if (voiceEnabled) {
      voice.speak('恭喜，所有菜品已完成')
    }
    navigate('/cooking/history')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-neutral-400" />
        <p className="text-neutral-500">烹饪会话不存在</p>
      </div>
    )
  }

  const totalDuration = session.total_duration || 60
  const progress = Math.min(100, (elapsedTime / totalDuration) * 100)
  const remainingMinutes = Math.max(0, totalDuration - elapsedTime)

  return (
    <div className="pb-32 bg-neutral-900 min-h-screen text-white">
      {/* Header */}
      <div className="sticky top-0 bg-neutral-900 z-10 px-4 py-3 flex items-center gap-3 border-b border-neutral-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-heading-md">Smart Chef</h1>
          <p className="text-caption text-neutral-400">{session.name}</p>
        </div>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-full ${voiceEnabled ? 'bg-primary-500' : 'bg-neutral-700'}`}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-4">
        <div className="flex justify-between text-body-sm mb-2">
          <span>烹饪进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-caption text-neutral-400 mt-1">
          <span>已用 {elapsedTime} 分钟</span>
          <span>剩余 {remainingMinutes} 分钟</span>
        </div>
      </div>

      {/* Dual Burner Display */}
      <div className="px-4 py-2 grid grid-cols-2 gap-4">
        {/* Left Burner */}
        <Card variant="elevated" className={`bg-neutral-800 ${burnerState.left.active ? 'ring-2 ring-orange-500' : ''}`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
              burnerState.left.active ? 'bg-orange-500/20' : 'bg-neutral-700'
            }`}>
              <Flame className={`w-8 h-8 ${burnerState.left.active ? 'text-orange-500 animate-pulse' : 'text-neutral-500'}`} />
            </div>
            <h3 className="text-heading-sm mb-1">左灶</h3>
            {burnerState.left.active ? (
              <>
                <p className="text-body-sm text-primary-400">{burnerState.left.recipeName}</p>
                <p className="text-caption text-neutral-400">{burnerState.left.currentTask?.name}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-orange-400">
                  <Timer className="w-4 h-4" />
                  <span className="text-number-md">{burnerState.left.remainingTime}</span>
                  <span className="text-caption">分钟</span>
                </div>
              </>
            ) : (
              <p className="text-caption text-neutral-500">空闲中</p>
            )}
          </div>
        </Card>

        {/* Right Burner */}
        <Card variant="elevated" className={`bg-neutral-800 ${burnerState.right.active ? 'ring-2 ring-orange-500' : ''}`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
              burnerState.right.active ? 'bg-orange-500/20' : 'bg-neutral-700'
            }`}>
              <Flame className={`w-8 h-8 ${burnerState.right.active ? 'text-orange-500 animate-pulse' : 'text-neutral-500'}`} />
            </div>
            <h3 className="text-heading-sm mb-1">右灶</h3>
            {burnerState.right.active ? (
              <>
                <p className="text-body-sm text-primary-400">{burnerState.right.recipeName}</p>
                <p className="text-caption text-neutral-400">{burnerState.right.currentTask?.name}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-orange-400">
                  <Timer className="w-4 h-4" />
                  <span className="text-number-md">{burnerState.right.remainingTime}</span>
                  <span className="text-caption">分钟</span>
                </div>
              </>
            ) : (
              <p className="text-caption text-neutral-500">空闲中</p>
            )}
          </div>
        </Card>
      </div>

      {/* Current Tasks */}
      <div className="px-4 py-3">
        <h2 className="text-heading-sm mb-3">当前任务</h2>
        <div className="space-y-2">
          {(session.scheduled_dishes || []).map((dish, i) => (
            <Card 
              key={i}
              variant="elevated"
              className={`bg-neutral-800 ${dish.status === 'cooking' ? 'border-l-4 border-primary-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  dish.status === 'completed' ? 'bg-semantic-success/20' :
                  dish.status === 'cooking' ? 'bg-primary-500/20' :
                  'bg-neutral-700'
                }`}>
                  <ChefHat className={`w-5 h-5 ${
                    dish.status === 'completed' ? 'text-semantic-success' :
                    dish.status === 'cooking' ? 'text-primary-400' :
                    'text-neutral-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-body-sm">{dish.recipeName}</h3>
                  <p className="text-caption text-neutral-500">
                    {dish.equipment === 'left' ? '左灶' : '右灶'} - {dish.duration}分钟
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-caption ${
                  dish.status === 'completed' ? 'bg-semantic-success/20 text-semantic-success' :
                  dish.status === 'cooking' ? 'bg-primary-500/20 text-primary-400' :
                  'bg-neutral-700 text-neutral-400'
                }`}>
                  {dish.status === 'completed' ? '已完成' : dish.status === 'cooking' ? '烹饪中' : '等待中'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Voice Control */}
      {voice.supported && (
        <div className="px-4 py-3">
          <Card variant="elevated" className="bg-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-heading-sm">语音控制</h3>
                <p className="text-caption text-neutral-400">
                  {voice.isListening ? '正在听...' : voice.transcript || '点击麦克风说话'}
                </p>
              </div>
              <button
                onClick={voice.isListening ? voice.stopListening : voice.startListening}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  voice.isListening 
                    ? 'bg-semantic-error animate-pulse' 
                    : 'bg-primary-500'
                }`}
              >
                {voice.isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Control Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4">
        <div className="flex items-center gap-3">
          {session.status === 'pending' ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-primary-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-heading-sm"
            >
              <Play className="w-6 h-6" />
              开始烹饪
            </button>
          ) : session.status === 'cooking' ? (
            <>
              <button
                onClick={isPaused ? handleResume : handlePause}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-heading-sm ${
                  isPaused ? 'bg-primary-500' : 'bg-neutral-700'
                }`}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {isPaused ? '继续' : '暂停'}
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 bg-neutral-700 py-4 rounded-xl flex items-center justify-center gap-2 text-heading-sm"
              >
                <SkipForward className="w-5 h-5" />
                下一步
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-semantic-success py-4 rounded-xl flex items-center justify-center gap-2 text-heading-sm"
              >
                完成
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/cooking')}
              className="flex-1 bg-primary-500 text-white py-4 rounded-xl text-heading-sm"
            >
              返回
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
