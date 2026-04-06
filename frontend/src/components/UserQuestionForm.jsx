import { useState } from 'react'
import axios from 'axios'
import { PlusCircle, Loader2, CheckCircle, HelpCircle, Send } from 'lucide-react'

const UserQuestionForm = ({ onCancel }) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [questionType, setQuestionType] = useState('text') // 'text' or 'mcq'
  const [options, setOptions] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question || !answer) return alert('Please fill both fields')

    if (questionType === 'mcq') {
      const filledOptions = options.filter(opt => opt.trim() !== '')
      if (filledOptions.length < 2) return alert('Please provide at least 2 options for MCQ')
      if (!filledOptions.includes(answer)) return alert('The correct answer must be one of the options')
    }

    setLoading(true)
    setStatus(null)
    
    try {
      await axios.post('/api/questions', { 
        question, 
        answer,
        type: questionType,
        options: questionType === 'mcq' ? options.filter(opt => opt.trim() !== '') : []
      })
      setStatus({ type: 'success', message: 'Question contributed successfully! It is now available for the admin to use in competitions.' })
      setQuestion('')
      setAnswer('')
      setOptions(['', '', '', ''])
      setQuestionType('text')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred'
      setStatus({ type: 'error', message: `Failed to contribute: ${errorMsg}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HelpCircle className="text-blue-500" />
          Contribute a Question
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 font-medium text-sm"
        >
          Back to Competitions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setQuestionType('text')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${questionType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'}`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setQuestionType('mcq')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${questionType === 'mcq' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'}`}
          >
            MCQ
          </button>
        </div>

        <div className="text-left">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none bg-gray-50"
            placeholder={questionType === 'mcq' ? "e.g., Which planet is known as the Red Planet?" : "What question would you like to add?"}
            required
          />
        </div>

        {questionType === 'mcq' && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">Options (Enter at least 2)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{String.fromCharCode(65 + idx)}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-left">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {questionType === 'mcq' ? 'Correct Option (Must match one above)' : 'Correct Answer'}
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
            placeholder={questionType === 'mcq' ? "e.g., Mars" : "Enter the correct answer"}
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <Send size={20} />
                Submit Question
              </>
            )}
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
            status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          } animate-in fade-in slide-in-from-top-2`}>
            {status.type === 'success' ? <CheckCircle size={20} className="mt-0.5" /> : <PlusCircle size={20} className="mt-0.5" />}
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        )}
      </form>
    </div>
  )
}

export default UserQuestionForm
