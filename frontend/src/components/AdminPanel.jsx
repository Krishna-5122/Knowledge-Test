import { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusCircle, Loader2, CheckCircle, Users, Link as LinkIcon, Check, X, Copy, Shield, FileText, Clock, Trophy as TrophyIcon } from 'lucide-react'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('questions') // 'questions', 'users', 'invite', 'competitions', 'reports'
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [questionType, setQuestionType] = useState('text') // 'text' or 'mcq'
  const [options, setOptions] = useState(['', '', '', '']) // Default 4 options for MCQ
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  
  // Reports state
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)

  // Competition state
  const [compTitle, setCompTitle] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compTimeLimit, setCompTimeLimit] = useState(5)
  const [compStartTime, setCompStartTime] = useState('')
  const [compEndTime, setCompEndTime] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [allQuestions, setAllQuestions] = useState([])

  // User management state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
    if (activeTab === 'competitions') {
      fetchAllQuestions()
    }
    if (activeTab === 'reports') {
      fetchReports()
    }
  }, [activeTab])

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      const res = await axios.get('/api/admin/reports')
      setReports(res.data)
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoadingReports(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const fetchAllQuestions = async () => {
    try {
      const res = await axios.get('/api/questions')
      setAllQuestions(res.data)
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    }
  }

  const handleCreateCompetition = async (e) => {
    e.preventDefault()
    if (!compTitle) return alert('Title is required')
    if (selectedQuestions.length === 0) return alert('Please select at least one question')

    setLoading(true)
    try {
      await axios.post('/api/competitions', {
        title: compTitle,
        description: compDesc,
        questionIds: selectedQuestions,
        timeLimit: parseInt(compTimeLimit),
        startTime: compStartTime,
        endTime: compEndTime
      })
      alert('Competition created successfully!')
      setCompTitle('')
      setCompDesc('')
      setCompTimeLimit(5)
      setCompStartTime('')
      setCompEndTime('')
      setSelectedQuestions([])
      setActiveTab('questions')
    } catch (err) {
      console.error('Competition creation error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred'
      alert(`Failed to create competition: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestionSelection = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    )
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await axios.get('/api/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/approve`)
      fetchUsers()
    } catch (err) {
      alert('Failed to approve user')
    }
  }

  const handleReject = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/reject`)
      fetchUsers()
    } catch (err) {
      alert('Failed to reject user')
    }
  }

  const handleSave = async (e) => {
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
      const response = await axios.post('/api/questions', { 
        question, 
        answer, 
        type: questionType,
        options: questionType === 'mcq' ? options.filter(opt => opt.trim() !== '') : []
      })
      setStatus({ type: 'success', message: 'Question saved successfully!' })
      setQuestion('')
      setAnswer('')
      setOptions(['', '', '', ''])
      setQuestionType('text')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred'
      setStatus({ type: 'error', message: `Failed to save: ${errorMsg}` })
    } finally {
      setLoading(false)
      setTimeout(() => setStatus(null), 5000)
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const copyInviteLink = () => {
    const link = window.location.origin
    navigator.clipboard.writeText(link)
    alert('Invitation link copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full overflow-hidden border border-gray-100">
      {/* Admin Header */}
      <div className="bg-gray-800 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-400" />
          <h2 className="text-xl font-bold">Admin Control Center</h2>
        </div>
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Questions
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'competitions' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Competition
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Reports
          </button>
          <button 
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'invite' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Invite
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <PlusCircle className="text-blue-500" />
              Add Quiz Question
            </h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setQuestionType('text')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${questionType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  Text Question
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionType('mcq')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${questionType === 'mcq' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  MCQ Question
                </button>
              </div>

              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                  placeholder={questionType === 'mcq' ? "e.g., Which planet is known as the Red Planet?" : "e.g., What is the capital of France?"}
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={questionType === 'mcq' ? "e.g., Mars" : "e.g., Paris"}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-400 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Save Question'}
              </button>
              {status && (
                <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                  status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status.type === 'success' && <CheckCircle size={20} />}
                  {status.message}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Users className="text-blue-500" />
              User Management
            </h3>
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            u.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.status !== 'approved' && (
                              <button 
                                onClick={() => handleApprove(u._id)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {u.status !== 'rejected' && (
                              <button 
                                onClick={() => handleReject(u._id)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>No user registrations yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Competitions Tab */}
        {activeTab === 'competitions' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <PlusCircle className="text-blue-500" />
              Create Competition Test
            </h3>
            <form onSubmit={handleCreateCompetition} className="space-y-6">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Competition Title</label>
                <input
                  type="text"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g., Weekly Math Challenge"
                  required
                />
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                  placeholder="Tell users what this competition is about..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={compStartTime}
                    onChange={(e) => setCompStartTime(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={compEndTime}
                    onChange={(e) => setCompEndTime(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={compTimeLimit}
                  onChange={(e) => setCompTimeLimit(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g., 5"
                  required
                />
              </div>
              
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Select Questions ({selectedQuestions.length} selected)</label>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {allQuestions.length > 0 ? allQuestions.map((q) => (
                    <div 
                      key={q._id} 
                      onClick={() => toggleQuestionSelection(q._id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedQuestions.includes(q._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700 truncate">{q.question}</span>
                      {selectedQuestions.includes(q._id) && <CheckCircle size={18} className="text-blue-500" />}
                    </div>
                  )) : (
                    <p className="text-gray-400 italic">No questions available. Add some first.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || allQuestions.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Launch Competition'}
              </button>
            </form>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-500" />
              Competition Reports & Analytics
            </h3>
            
            {loadingReports ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
              </div>
            ) : reports.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Player</th>
                      <th className="px-6 py-4">Competition</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Time Taken</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{r.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-medium">
                            {r.competitionId?.title || <span className="text-gray-400 italic">General Quiz</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TrophyIcon size={14} className={r.percentage >= 80 ? 'text-yellow-500' : 'text-gray-300'} />
                            <span className={`font-black ${r.percentage >= 80 ? 'text-green-600' : 'text-blue-600'}`}>
                              {r.percentage}%
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">
                            {r.score} / {r.total} Correct
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                            <Clock size={14} className="text-gray-400" />
                            {r.timeTaken ? formatTime(r.timeTaken) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString()}<br/>
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No competition results recorded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Invite Tab */}
        {activeTab === 'invite' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-center py-6">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LinkIcon className="text-blue-600 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Invite Participants</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Share this link with your friends. Once they register and you approve them, they can participate in the competition!</p>
            
            <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-4 max-w-md mx-auto border border-gray-200">
              <code className="flex-1 text-sm text-blue-600 font-bold truncate">
                {window.location.origin}
              </code>
              <button 
                onClick={copyInviteLink}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                title="Copy Link"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
