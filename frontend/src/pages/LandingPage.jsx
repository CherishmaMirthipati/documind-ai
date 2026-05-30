import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, FileText, Zap, Shield, ChevronRight, Sparkles } from 'lucide-react'

const FloatingOrb = ({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-[80px] opacity-20 ${className}`}
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
)

const Feature = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.03, y: -4 }}
        className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm group cursor-default"
    >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4">
            <Icon size={22} className="text-white" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
)

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">

            {/* Floating background orbs */}
            <FloatingOrb className="w-96 h-96 bg-purple-600 top-[-100px] left-[-100px]" delay={0} />
            <FloatingOrb className="w-80 h-80 bg-cyan-500 top-[200px] right-[-80px]" delay={2} />
            <FloatingOrb className="w-64 h-64 bg-blue-600 bottom-[100px] left-[30%]" delay={4} />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Brain size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-xl">DocuMind AI</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Get Started
                    </button>
                </motion.div>
            </nav>

            {/* Hero */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8"
                >
                    <Sparkles size={14} />
                    Powered by Groq LLM + RAG Architecture
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl md:text-8xl font-black text-white mb-6 leading-none tracking-tight"
                >
                    Chat with your
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Documents
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Upload any PDF and instantly get AI-powered answers. DocuMind uses semantic search and LLM reasoning to understand your documents deeply.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-4 flex-wrap"
                >
                    <button
                        onClick={() => navigate('/register')}
                        className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
                    >
                        Start for Free
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 rounded-2xl border border-white/10 text-white font-semibold text-lg hover:bg-white/5 transition-all"
                    >
                        Sign In
                    </button>
                </motion.div>

                {/* Floating stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-12 mt-20 flex-wrap"
                >
                    {[["RAG Architecture", "Semantic Search"], ["Groq LLM", "Lightning Fast"], ["JWT Auth", "Secure"]].map(([title, sub]) => (
                        <div key={title} className="text-center">
                            <div className="text-white font-bold text-xl">{title}</div>
                            <div className="text-gray-500 text-sm">{sub}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Features */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl font-bold text-white text-center mb-4"
                >
                    Everything you need
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-gray-400 text-center mb-16"
                >
                    Powerful features for intelligent document analysis
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Feature icon={FileText} title="PDF Upload" desc="Drag and drop any PDF. We extract and index every word automatically." delay={0} />
                    <Feature icon={Brain} title="RAG Pipeline" desc="Retrieval-Augmented Generation finds the most relevant context before answering." delay={0.1} />
                    <Feature icon={Zap} title="Groq LLM" desc="Lightning-fast responses powered by Groq's blazing inference engine." delay={0.2} />
                    <Feature icon={Shield} title="JWT Auth" desc="Secure authentication keeps your documents private and protected." delay={0.3} />
                </div>
            </div>

            {/* CTA */}
            <div className="relative z-10 max-w-4xl mx-auto px-8 pb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-16 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-sm relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-cyan-600/5" />
                    <h2 className="text-5xl font-black text-white mb-4 relative z-10">Ready to start?</h2>
                    <p className="text-gray-400 text-lg mb-8 relative z-10">Join and start chatting with your documents in seconds.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="relative z-10 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-purple-500/30"
                    >
                        Get Started Free
                    </button>
                </motion.div>
            </div>

        </div>
    )
}