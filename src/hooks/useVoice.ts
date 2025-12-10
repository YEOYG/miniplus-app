import { useState, useCallback, useEffect, useRef } from 'react'

interface UseVoiceOptions {
  onCommand?: (command: string) => void
  lang?: string
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { onCommand, lang = 'zh-CN' } = options
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(true)
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // 检查浏览器支持
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = lang

    recognitionRef.current.onresult = (event: any) => {
      const result = event.results[0][0].transcript
      setTranscript(result)
      onCommand?.(result)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.onerror = () => {
      setIsListening(false)
    }

    synthesisRef.current = window.speechSynthesis

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [lang, onCommand])

  const startListening = useCallback(() => {
    if (!supported || !recognitionRef.current) return
    
    try {
      recognitionRef.current.start()
      setIsListening(true)
      setTranscript('')
    } catch (e) {
      console.error('语音识别启动失败:', e)
    }
  }, [supported])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string, rate = 1) => {
    if (!synthesisRef.current) return
    
    // 取消当前正在播放的语音
    synthesisRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = 1
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    synthesisRef.current.speak(utterance)
  }, [lang])

  const stopSpeaking = useCallback(() => {
    if (!synthesisRef.current) return
    synthesisRef.current.cancel()
    setIsSpeaking(false)
  }, [])

  // 解析语音命令
  const parseCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('开始') || lowerText.includes('继续')) {
      return { type: 'start' as const }
    }
    if (lowerText.includes('暂停') || lowerText.includes('停止')) {
      return { type: 'pause' as const }
    }
    if (lowerText.includes('下一步') || lowerText.includes('下一个')) {
      return { type: 'next' as const }
    }
    if (lowerText.includes('重复') || lowerText.includes('再说一遍')) {
      return { type: 'repeat' as const }
    }
    if (lowerText.includes('多久') || lowerText.includes('还有')) {
      return { type: 'query' as const, target: 'time' }
    }
    if (lowerText.includes('温度')) {
      return { type: 'query' as const, target: 'temperature' }
    }
    
    return null
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    supported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    parseCommand,
  }
}

export default useVoice
