import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Brain, Eye, EyeOff, Loader } from 'lucide-react'
import { loginUser, getMe } from '../api/api'
import { useAuth } from '../context/AuthContext'

const FloatingOrb = ({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-[80px] opacity-20 ${className}`}
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
)

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await loginUser(form)
            const token = res.data.access_token
            localStorage.setItem('token', token)
            const me = await getMe()
            login(token, me.data)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
            <FloatingOrb className="w-96 h-96 bg-purple-600 top-[-100px] left-[-100px]" delay={0} />
            <FloatingOrb className="w-80 h-80 bg-cyan-500 bottom-[-80px] right-[-80px]" delay={2} />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-8"
            >
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                        <Brain size={26} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Welcome back</h1>
                    <p className="text-gray-400 mt-2">Sign in to DocuMind AI</p>
                </div>

                <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-2 block">Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                placeholder="Enter your username"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 mt-6 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Create one
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}