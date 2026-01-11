import { useState, useRef, useEffect } from 'react'
import { ArrowUp, RefreshCw, Plus, Check, X } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { getRandomVideoUrl, getVideoDuration } from '../../utils/videoLoader'

interface Message {
  id: string
  type: 'assistant' | 'user' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    type?: 'text-to-image' | 'image-to-video' | 'import'
    status?: 'success' | 'error'
    thumbnail?: string
    error?: string
  }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Welcome to Flick! I\'m here to help you create your first visual content.',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'system',
      content: 'Today',
      timestamp: new Date(),
    },
    // Add some sample result messages like in the image
    {
      id: '3',
      type: 'user',
      content: 'Text to Image · Midjourney',
      timestamp: new Date(),
      metadata: {
        type: 'text-to-image',
        status: 'success',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=',
      },
    },
    {
      id: '4',
      type: 'user',
      content: 'Image to Video · Seedance Pro',
      timestamp: new Date(),
      metadata: {
        type: 'image-to-video',
        status: 'success',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=',
      },
    },
    {
      id: '5',
      type: 'user',
      content: 'Image to Video · Seedance Pro',
      timestamp: new Date(),
      metadata: {
        type: 'image-to-video',
        status: 'error',
        error: 'Request failed with status code 400',
      },
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { tracks, addClip, setDuration, selectedClipIds } = useEditorStore()

  const resolveSelectedVideoClips = () => {
    const clips: { trackId: string; clipId: string; startTime: number; duration: number }[] = []
    selectedClipIds.forEach((clipId) => {
      const track = tracks.find(t => t.clips.some(c => c.id === clipId))
      const clip = track?.clips.find(c => c.id === clipId)
      if (track && clip && clip.type === 'video') {
        clips.push({
          trackId: track.id,
          clipId: clip.id,
          startTime: clip.startTime,
          duration: clip.duration,
        })
      }
    })
    return clips
  }

  const maybeMockConnector = (prompt: string) => {
    if (!/connector|connect/i.test(prompt)) return false
    const selectedVideos = resolveSelectedVideoClips()
    if (selectedVideos.length !== 2) return false

    const [first, second] = [...selectedVideos].sort((a, b) => a.startTime - b.startTime)
    const connectorStart = first.startTime + first.duration
    const connectorDuration = Math.max(1, Math.min(2, second.startTime - connectorStart || 2))
    const videoUrl = getRandomVideoUrl()

    addClip(first.trackId, {
      name: 'AI Connector',
      type: 'video',
      startTime: connectorStart,
      duration: connectorDuration,
      trimStart: 0,
      trimEnd: connectorDuration,
      videoUrl,
    })

    const newEndTime = connectorStart + connectorDuration
    const currentDuration = useEditorStore.getState().duration
    if (newEndTime > currentDuration) {
      setDuration(newEndTime)
    }

    const successMessage: Message = {
      id: `result-${Date.now()}`,
      type: 'user',
      content: 'Connector video generated',
      timestamp: new Date(),
      metadata: {
        type: 'image-to-video',
        status: 'success',
      },
    }
    setMessages(prev => [...prev, successMessage])
    return true
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() && !isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const mocked = maybeMockConnector(userMessage.content)
      const response: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: mocked
          ? 'Connector video generated. I added it between your selected clips.'
          : 'I\'ll help you with that. Let me process your request...',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, response])
      setIsLoading(false)
    }, 1000)
  }

  const handleImportTemplate = async () => {
    const videoTrack = tracks.find(t => t.type === 'video') || tracks[0]
    if (!videoTrack) return

    setIsLoading(true)
    try {
      const randomUrl = getRandomVideoUrl()
      const videoDuration = await getVideoDuration(randomUrl)
      const filename = randomUrl.split('/').pop()?.split('?')[0] || 'Sample Video'

      addClip(videoTrack.id, {
        name: filename,
        type: 'video',
        startTime: 0,
        duration: videoDuration,
        trimStart: 0,
        trimEnd: videoDuration,
        videoUrl: randomUrl,
      })

      const currentDuration = useEditorStore.getState().duration
      if (videoDuration > currentDuration) {
        setDuration(videoDuration)
      }

      // Add success message
      const successMessage: Message = {
        id: `result-${Date.now()}`,
        type: 'user',
        content: 'Import Onboarding Template',
        timestamp: new Date(),
        metadata: {
          type: 'import',
          status: 'success',
        },
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-flick-primary relative border-l border-gray-800">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-flick-border">
        <div className="text-sm font-medium text-flick-text">Chat</div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-flick-secondary rounded transition-colors">
            <RefreshCw className="w-4 h-4 text-flick-text" />
          </button>
          <button className="p-1.5 hover:bg-flick-secondary rounded transition-colors">
            <Plus className="w-4 h-4 text-flick-text" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((message) => {
          if (message.type === 'system') {
            return (
              <div key={message.id} className="flex items-center gap-2 py-2">
                <div className="flex-1 border-t border-flick-border" />
                <span className="text-xs text-flick-text-muted px-2">{message.content}</span>
                <div className="flex-1 border-t border-flick-border" />
              </div>
            )
          }

          if (message.type === 'assistant') {
            return (
              <div key={message.id} className="flex flex-col gap-2">
                <div className="text-sm text-flick-text leading-relaxed">
                  {message.content === 'Welcome to Flick! I\'m here to help you create your first visual content.' ? (
                    <>
                      Welcome to Flick! <span>🎬</span> I'm here to help you create your first visual content.
                    </>
                  ) : (
                    message.content
                  )}
                </div>
                {message.content.includes('Welcome to Flick') && (
                  <button
                    onClick={handleImportTemplate}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-flick-secondary hover:bg-flick-accent rounded-full text-xs text-flick-text border border-flick-border transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    Import Onboarding Template
                  </button>
                )}
              </div>
            )
          }

          if (message.type === 'user') {
            // Check if it's a result pill (success/error states)
            if (message.metadata?.type) {
              const isError = message.metadata.status === 'error'
              return (
                <div key={message.id} className="flex justify-end">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    isError 
                      ? 'bg-red-50 border border-red-300 text-flick-text' 
                      : 'bg-flick-secondary border border-flick-border text-flick-text'
                  }`}>
                    {isError ? (
                      <>
                        <X className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <div className="flex flex-col text-xs">
                          <span>{message.metadata.type === 'image-to-video' ? 'Image to Video · Seedance Pro' : message.content}</span>
                          {message.metadata.error && (
                            <span className="text-red-600 text-[10px] mt-0.5">{message.metadata.error}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-xs whitespace-nowrap">{message.metadata.type === 'text-to-image' ? 'Text to Image · Midjourney' : 
                               message.metadata.type === 'image-to-video' ? 'Image to Video · Seedance Pro' : 
                               message.content}</span>
                        {message.metadata.thumbnail && (
                          <div className="w-6 h-6 bg-flick-border rounded overflow-hidden flex-shrink-0">
                            <img src={message.metadata.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            }

            // Regular user message (pill-shaped, right-aligned)
            return (
              <div key={message.id} className="flex justify-end">
                <div className="inline-block px-3 py-1.5 bg-flick-secondary border border-flick-border rounded-full text-xs text-flick-text max-w-[80%] break-words">
                  {message.content}
                </div>
              </div>
            )
          }

          return null
        })}

        {isLoading && (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-flick-text">
              <span className="inline-block animate-pulse">Processing...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area with border on top - Black/darker */}
      <div className="border-t border-flick-border p-4 bg-flick-primary">
        <div className="flex items-end gap-2">
          {/* Controller icon on the left */}
          <div className="p-1.5 text-flick-text-muted flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="8" r="2" fill="currentColor" />
              <circle cx="10" cy="8" r="2" fill="currentColor" />
              <path d="M6 10L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Input field - rounded corners, with border */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Brainstorm or create anything."
              className="w-full px-4 py-2.5 pr-10 text-sm bg-flick-primary border border-flick-border rounded-lg text-flick-text placeholder-flick-text-light resize-none focus:outline-none focus:border-flick-text-muted transition-colors"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Send button - circular with upward arrow */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-flick-border hover:bg-flick-text-muted rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ArrowUp className="w-4 h-4 text-flick-text" />
          </button>
        </div>
      </div>
    </div>
  )
}
