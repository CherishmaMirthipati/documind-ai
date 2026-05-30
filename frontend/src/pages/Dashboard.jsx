import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, Upload, FileText, Trash2, MessageSquare, LogOut, Loader, X, History, ChevronDown, ChevronUp, Search, Zap, BarChart2, Sparkles, BookOpen, Shield, Clock } from 'lucide-react'
import { getPDFs, uploadPDF, deletePDF, getChatHistory } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { useDropzone } from 'react-dropzone'

const FloatingOrb = ({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-[80px] opacity-10 ${className}`}
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
)

const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
}

const HistoryPanel = ({ pdfId }) => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getChatHistory(pdfId)
            .then(res => setHistory(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [pdfId])

    if (loading) return <div className="flex justify-center py-4"><Loader size={16} className="text-purple-400 animate-spin" /></div>
    if (history.length === 0) return <p className="text-gray-600 text-xs text-center py-4">No chat history yet</p>

    return (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {history.map((h, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex gap-2">
                        <span className="text-purple-400 text-xs font-medium shrink-0">Q:</span>
                        <p className="text-gray-300 text-xs">{h.question}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-cyan-400 text-xs font-medium shrink-0">A:</span>
                        <p className="text-gray-500 text-xs line-clamp-2">{h.answer}</p>
                    </div>
                    {i < history.length - 1 && <div className="border-t border-white/5 mt-2" />}
                </div>
            ))}
        </div>
    )
}

const PDFCard = ({ pdf, index, onDelete, onChat }) => {
    const [showHistory, setShowHistory] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-all overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                        <FileText size={22} className="text-purple-400" />
                    </div>
                    <span className="text-gray-600 text-xs">
                        {new Date(pdf.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <h3 className="text-white font-semibold mb-1 truncate">{pdf.filename}</h3>
                <p className="text-gray-500 text-xs mb-5">PDF Document</p>
                <div className="flex gap-2 mb-3">
                    <button onClick={() => onChat(pdf)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium hover:opacity-90 transition-all hover:scale-[1.02]">
                        <MessageSquare size={15} /> Chat
                    </button>
                    <button onClick={() => onDelete(pdf.id, pdf.filename)}
                        className="p-2.5 rounded-xl border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all">
                        <Trash2 size={15} />
                    </button>
                </div>
                <button onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/5 hover:border-purple-500/20 text-gray-500 hover:text-gray-300 transition-all text-xs">
                    <div className="flex items-center gap-1.5"><History size={13} /><span>Chat History</span></div>
                    {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                <AnimatePresence>
                    {showHistory && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                            <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                                <HistoryPanel pdfId={pdf.id} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [pdfs, setPdfs] = useState([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [search, setSearch] = useState('')
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => { fetchPDFs() }, [])

    const fetchPDFs = async () => {
        try {
            const res = await getPDFs()
            setPdfs(res.data)
            // Fetch history for all PDFs to get total questions + recent activity
            let allHistory = []
            for (const pdf of res.data) {
                try {
                    const h = await getChatHistory(pdf.id)
                    allHistory = [...allHistory, ...h.data.map(item => ({ ...item, filename: pdf.filename }))]
                } catch { }
            }
            setTotalQuestions(allHistory.length)
            // Sort by created_at and take last 3
            const sorted = allHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            setRecentActivity(sorted.slice(0, 3))
        } catch {
            setError('Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
            await uploadPDF(file)
            setSuccess(`"${file.name}" uploaded successfully!`)
            setTimeout(() => setSuccess(''), 3000)
            fetchPDFs()
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false
    })

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"?`)) return
        try {
            await deletePDF(id)
            setPdfs(pdfs.filter(p => p.id !== id))
            setSuccess('Document deleted')
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Failed to delete document')
        }
    }

    const handleChat = (pdf) => navigate(`/chat/${pdf.id}`, { state: { filename: pdf.filename } })
    const handleLogout = () => { logout(); navigate('/') }
    const filteredPdfs = pdfs.filter(p => p.filename.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            <FloatingOrb className="w-96 h-96 bg-purple-600 top-[-100px] left-[-100px]" />
            <FloatingOrb className="w-80 h-80 bg-cyan-500 bottom-[100px] right-[-80px]" delay={3} />
            <FloatingOrb className="w-64 h-64 bg-blue-600 top-[50%] left-[40%]" delay={5} />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Brain size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">DocuMind AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">Hey, <span className="text-white font-medium">{user?.username}</span></span>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm">
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </nav>

            <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">

                {/* Greeting */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <p className="text-gray-500 text-sm mb-1">{getGreeting()},</p>
                    <h1 className="text-5xl font-black text-white mb-2">{user?.username} 👋</h1>
                    <p className="text-gray-400">Your AI-powered document intelligence platform</p>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { icon: FileText, label: 'Documents', value: pdfs.length, color: 'from-purple-500 to-purple-700' },
                        { icon: MessageSquare, label: 'Questions Asked', value: totalQuestions, color: 'from-cyan-500 to-cyan-700' },
                        { icon: Zap, label: 'RAG Powered', value: 'Active', color: 'from-green-500 to-green-700' },
                        { icon: BarChart2, label: 'AI Model', value: 'Groq LLM', color: 'from-blue-500 to-blue-700' },
                    ].map(({ icon: Icon, label, value, color }, i) => (
                        <motion.div key={label}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-4 hover:border-white/20 transition-all">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center opacity-80 shrink-0`}>
                                <Icon size={18} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-500 text-xs truncate">{label}</p>
                                <p className="text-white font-bold text-lg">{value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Notifications */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
                            {error}<button onClick={() => setError('')}><X size={16} /></button>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center justify-between">
                            {success}<button onClick={() => setSuccess('')}><X size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Upload Zone */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div {...getRootProps()}
                                className={`relative p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer group
                  ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/3'}`}>
                                <input {...getInputProps()} />
                                <div className="text-center">
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader size={40} className="text-purple-400 animate-spin" />
                                            <p className="text-white font-medium">Processing your PDF...</p>
                                            <p className="text-gray-500 text-sm">Extracting text and generating embeddings</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload size={28} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-lg">Drop your PDF here</p>
                                                <p className="text-gray-500 text-sm mt-1">or click to browse — PDF files only</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar: Recent Activity + Tips */}
                    <div className="space-y-4">
                        {/* Recent Activity */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={15} className="text-purple-400" />
                                <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
                            </div>
                            {recentActivity.length === 0 ? (
                                <p className="text-gray-600 text-xs">No activity yet. Start chatting!</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map((item, i) => (
                                        <div key={i} className="border-l-2 border-purple-500/30 pl-3">
                                            <p className="text-gray-300 text-xs line-clamp-1">{item.question}</p>
                                            <p className="text-gray-600 text-xs mt-0.5">{item.filename}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Tips */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                            className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={15} className="text-cyan-400" />
                                <h3 className="text-white font-semibold text-sm">Pro Tips</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: BookOpen, tip: 'Ask specific questions for better answers' },
                                    { icon: Shield, tip: 'Your documents are private and secure' },
                                    { icon: Zap, tip: 'Groq LLM gives lightning fast responses' },
                                ].map(({ icon: Icon, tip }) => (
                                    <div key={tip} className="flex items-start gap-2">
                                        <Icon size={12} className="text-gray-500 mt-0.5 shrink-0" />
                                        <p className="text-gray-500 text-xs">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Search + Documents */}
                {pdfs.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex items-center justify-between mb-6 gap-4">
                        <h2 className="text-white font-bold text-xl">Your Documents</h2>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search documents..."
                                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50 transition-all w-56" />
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader size={32} className="text-purple-400 animate-spin" />
                    </div>
                ) : pdfs.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 rounded-3xl border border-white/5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <FileText size={36} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-lg font-medium mb-1">No documents yet</p>
                        <p className="text-gray-600 text-sm">Upload your first PDF above to get started</p>
                    </motion.div>
                ) : filteredPdfs.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No documents match "{search}"</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPdfs.map((pdf, i) => (
                            <PDFCard key={pdf.id} pdf={pdf} index={i} onDelete={handleDelete} onChat={handleChat} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}