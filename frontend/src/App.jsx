import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import AdminPanel from './components/AdminPanel'
import AdminLogin from './components/AdminLogin'
import UserAuth from './components/UserAuth'
import QuizPage from './components/QuizPage'
import ResultsPage from './components/ResultsPage'
import CompetitionList from './components/CompetitionList'
import UserQuestionForm from './components/UserQuestionForm'
import { BookOpen, ShieldCheck, LogOut, User as UserIcon, PlusCircle } from 'lucide-react'

// Wrapper component to handle routing for users
const UserFlow = ({ user, onQuizSubmit, setQuizResults }) => {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null)
  const navigate = useNavigate()

  const handleJoinCompetition = (id) => {
    setSelectedCompetitionId(id)
    navigate('/quiz')
  }

  return (
    <Routes>
      <Route path="/" element={<CompetitionList onJoinCompetition={handleJoinCompetition} />} />
      <Route path="/contribute" element={<UserQuestionForm onCancel={() => navigate('/')} />} />
      <Route 
        path="/quiz" 
        element={
          selectedCompetitionId ? (
            <QuizPage 
              onQuizSubmit={(res) => {
                setQuizResults({ ...res, competitionId: selectedCompetitionId })
                navigate('/results')
              }} 
              user={user} 
              competitionId={selectedCompetitionId} 
            />
          ) : (
            <CompetitionList onJoinCompetition={handleJoinCompetition} />
          )
        } 
      />
      <Route path="/results" element={<ResultsPage results={onQuizSubmit} />} />
    </Routes>
  )
}

function App() {
  const [quizResults, setQuizResults] = useState(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Load user from localStorage if exists
  useEffect(() => {
    const storedUser = localStorage.getItem('quiz_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleUserLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('quiz_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('quiz_user')
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {/* Navigation Bar */}
        <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center max-w-4xl mx-auto rounded-b-xl mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <BookOpen size={28} />
            <span>AI Teacher Quiz</span>
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/contribute" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all">
                  <PlusCircle size={18} />
                  <span>Contribute</span>
                </Link>
                <div className="flex items-center gap-2 text-gray-700 font-medium bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <UserIcon size={18} className="text-blue-500" />
                  <span>{user.username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/" className="text-gray-600 hover:text-blue-500 font-medium">Login</Link>
            )}
          </div>
        </nav>

        {/* Main Content Container */}
        <main className="w-full max-w-3xl px-4 py-6">
          <Routes>
            <Route 
              path="/*" 
              element={
                user ? (
                  <UserFlow 
                    user={user} 
                    onQuizSubmit={quizResults} 
                    setQuizResults={setQuizResults} 
                  />
                ) : (
                  <UserAuth onLoginSuccess={handleUserLogin} />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                isAdminAuthenticated ? (
                  <AdminPanel />
                ) : (
                  <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />
                )
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-8 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} AI Teacher Quiz App - Simple & Educational
        </footer>
      </div>
    </Router>
  )
}

export default App

