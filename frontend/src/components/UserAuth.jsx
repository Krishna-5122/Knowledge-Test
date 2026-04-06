import { useState } from 'react'
import axios from 'axios'
import { User, Lock, LogIn, UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const UserAuth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const endpoint = isLogin ? '/api/login' : '/api/register'

    try {
      const res = await axios.post(endpoint, { username, password })
      
      if (isLogin) {
        setStatus({ type: 'success', message: 'Login successful!' })
        setTimeout(() => onLoginSuccess(res.data.user), 1000)
      } else {
        setStatus({ type: 'success', message: 'Registration successful! Please wait for admin approval.' })
        setUsername('')
        setPassword('')
        setIsLogin(true)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong'
      setStatus({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            {isLogin ? <LogIn className="text-blue-600 w-8 h-8" /> : <UserPlus className="text-blue-600 w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{isLogin ? 'User Login' : 'User Registration'}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? 'Welcome back! Ready for the quiz?' : 'Join the competition today!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
              status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
            } animate-in fade-in slide-in-from-top-2`}>
              {status.type === 'success' ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Register now' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserAuth
