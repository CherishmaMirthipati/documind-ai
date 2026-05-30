import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Brain, Send, ArrowLeft, FileText, Loader, User, Sparkles } from 'lucide-react'
import { askQuestion, getChatHistory } from '../api/api'

const FloatingOrb = ({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-[80px] opacity-10 ${className}`}
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
)

const Message = ({ msg, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
    >
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
      ${msg.role === 'user'
                ? 'bg-gradient-to-br from-purple-500 to-cyan-500'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10'}`}>
            {msg.role === 'user'
                ? <User size={16} className="text-white" />
                : <Brain size={16} className="text-purple-400" />}
        </div>

        {/* Bubble */}
        <div className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm leading-relaxed
      ${msg.role === 'user'
                ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'}`}>
            {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-2 text-purple-400 text-xs font-medium">
                    <Sparkles size={11} /> DocuMind AI
                </div>
            )}
            <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
    </motion.div>
)

export default function ChatPage() {
    const { pdfId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const filename = location.state?.filename || 'Document'

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const bottomRef = useRef(null)

    useEffect(() => { loadHistory() }, [])
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const loadHistory = async () => {
        try {
            const res = await getChatHistory(pdfId)
            const formatted = res.data.flatMap(h => ([
                { role: 'user', content: h.question },
                { role: 'assistant', content: h.answer }
            ]))
            setMessages(formatted)
        } catch {
            // no history yet
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return
        const question = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: question }])
        setLoading(true)
        try {
            const res = await askQuestion(question, parseInt(pdfId))
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: err.response?.data?.detail || 'Something went wrong. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            <FloatingOrb className="w-96 h-96 bg-purple-600 top-[-150px] left-[-100px]" />
            <FloatingOrb className="w-80 h-80 bg-cyan-500 bottom-[-100px] right-[-80px]" delay={3} />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center gap-4 px-8 py-5 border-b border-white/5 backdrop-blur-sm flex-shrink-0">
                <button
                    onClick={() => navigate('/dashboard', { replace: true })}
                    className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 px-3"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm">Back</span>
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                    <FileText size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-white font-semibold truncate">{filename}</h1>
                    <p className="text-gray-500 text-xs">Ask anything about this document</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">RAG Active</span>
                </div>
            </nav>

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader size={28} className="text-purple-400 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <Brain size={28} className="text-purple-400" />
                            </div>
                            <h2 className="text-white font-bold text-xl mb-2">Ready to answer</h2>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                Ask any question about <span className="text-gray-300">{filename}</span> and I'll find the answer using semantic search.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-6">
                                {['Summarize this document', 'What are the key points?', 'What is this about?'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => setInput(q)}
                                        className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-purple-500/30 hover:text-white transition-all"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        messages.map((msg, i) => <Message key={i} msg={msg} index={i} />)
                    )}

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-4"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center">
                                    <Brain size={16} className="text-purple-400" />
                                </div>
                                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 flex items-center gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-purple-400"
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input */}
            <div className="relative z-10 px-8 py-6 border-t border-white/5 backdrop-blur-sm flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3 p-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus-within:border-purple-500/40 transition-all">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your document..."
                            rows={1}
                            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm resize-none focus:outline-none px-3 py-2.5 max-h-32"
                            style={{ scrollbarWidth: 'none' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed self-end mb-0.5 flex-shrink-0"
                        >
                            <Send size={16} className="text-white" />
                        </button>
                    </div>
                    <p className="text-gray-600 text-xs text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
                </div>
            </div>
        </div>
    )
}