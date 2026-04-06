import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Timer, Send, Loader2, AlertCircle } from 'lucide-react'

const QuizPage = ({ onQuizSubmit, user, competitionId }) => {
  const [questions, setQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [isStarted, setIsStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // Default 5 minutes (300 seconds)
  const [initialTime, setInitialTime] = useState(300)
  const [compDetails, setCompDetails] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        let res;
        if (competitionId) {
          res = await axios.get(`/api/competitions/${competitionId}`)
          setCompDetails(res.data)
          setQuestions(res.data.questions)
          // Set time left based on competition details (convert minutes to seconds)
          if (res.data.timeLimit) {
            const totalSeconds = res.data.timeLimit * 60;
            setTimeLeft(totalSeconds)
            setInitialTime(totalSeconds)
          }
        } else {
          res = await axios.get('/api/questions')
          setQuestions(res.data)
          setInitialTime(300)
        }
      } catch (err) {
        console.error('Failed to fetch quiz data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuizData()
  }, [competitionId])

  useEffect(() => {
    if (!isStarted) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      // Check if we hit the hard end time of the competition
      if (compDetails?.endTime) {
        const now = new Date()
        const end = new Date(compDetails.endTime)
        if (now >= end) {
          clearInterval(timer)
          handleSubmit()
          return
        }
      }
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isStarted, compDetails])

  const handleStart = (e) => {
    if (e) e.preventDefault()
    
    // Final check for scheduled time
    const now = new Date()
    if (compDetails?.startTime && now < new Date(compDetails.startTime)) {
      return alert(`This test starts at ${new Date(compDetails.startTime).toLocaleString()}`)
    }
    if (compDetails?.endTime && now > new Date(compDetails.endTime)) {
      return alert('This test has already ended.')
    }

    setIsStarted(true)
  }

  const handleInputChange = (id, value) => {
    setUserAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    // Basic validation (Bonus Feature)
    const answersArray = questions.map((q) => ({
      id: q._id,
      answer: userAnswers[q._id] || ''
    }))

    if (answersArray.every(a => !a.answer.trim())) {
      return alert('Please answer at least one question before submitting!')
    }

    setSubmitting(true)
    const timeTaken = initialTime - timeLeft;
    try {
      const res = await axios.post('/api/submit', { 
        userAnswers: answersArray,
        username: user.username,
        competitionId: competitionId,
        timeTaken: timeTaken
      })
      onQuizSubmit(res.data)
    } catch (err) {
      console.error('Submission failed:', err)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading your quiz...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="bg-yellow-50 p-8 rounded-2xl text-center border border-yellow-100 flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-500" />
        <p className="text-yellow-800 font-semibold text-lg">No questions available!</p>
        <p className="text-yellow-700">This competition has no questions yet.</p>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md mx-auto space-y-8 animate-in fade-in zoom-in">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Send className="text-blue-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {compDetails ? compDetails.title : 'Ready?'}
          </h2>
          <p className="text-gray-500">
            {compDetails ? compDetails.description : `Hi ${user.username}, ready to start the quiz?`}
          </p>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-700 text-sm font-bold">
            Time Limit: {compDetails ? compDetails.timeLimit : 5} Minutes
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3 text-xl active:scale-95"
        >
          Start Now
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quiz Header with Timer */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm sticky top-4 z-10 border border-gray-100">
        <span className="text-gray-500 font-medium">Progress: {Object.keys(userAnswers).length} / {questions.length}</span>
        <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Timer size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, index) => (
          <div key={q._id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-left transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex gap-3">
              <span className="text-blue-500">Q{index + 1}.</span>
              {q.question}
            </h3>
            
            {q.type === 'mcq' && q.options && q.options.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleInputChange(q._id, opt)}
                    disabled={submitting}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      userAnswers[q._id] === opt 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-[1.02]' 
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                      userAnswers[q._id] === opt ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="font-medium">{opt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Type your answer here..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={userAnswers[q._id] || ''}
                onChange={(e) => handleInputChange(q._id, e.target.value)}
                disabled={submitting}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all disabled:bg-gray-400 flex justify-center items-center gap-3 text-lg"
        >
          {submitting ? <Loader2 className="animate-spin" /> : (
            <>
              <Send size={20} />
              Submit Quiz
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default QuizPage
