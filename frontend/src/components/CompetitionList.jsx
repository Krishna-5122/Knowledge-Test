import { useState, useEffect } from 'react'
import axios from 'axios'
import { Trophy, ArrowRight, Loader2, AlertCircle, Calendar, MessageSquare } from 'lucide-react'

const CompetitionList = ({ onJoinCompetition }) => {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await axios.get('/api/competitions')
        setCompetitions(res.data)
      } catch (err) {
        console.error('Failed to fetch competitions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCompetitions()
  }, [])

  const getStatus = (comp) => {
    const now = new Date()
    const start = comp.startTime ? new Date(comp.startTime) : null
    const end = comp.endTime ? new Date(comp.endTime) : null

    if (start && now < start) return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-700', canJoin: false }
    if (end && now > end) return { label: 'Ended', color: 'bg-red-100 text-red-700', canJoin: false }
    return { label: 'Active', color: 'bg-green-100 text-green-700', canJoin: true }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading active competitions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-800">Available Competitions</h2>
        <p className="text-gray-500">Select a challenge below and show your skills!</p>
      </div>

      {competitions.length > 0 ? (
        <div className="grid gap-6">
          {competitions.map((comp) => {
            const status = getStatus(comp)
            return (
              <div 
                key={comp._id} 
                className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy size={80} />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        {comp.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{comp.description || 'No description provided.'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={16} />
                        <span>{comp.questions?.length || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        <span>Created {new Date(comp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {(comp.startTime || comp.endTime) && (
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold pt-2 border-t border-gray-50">
                        {comp.startTime && (
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <span className="text-gray-400 uppercase tracking-tighter">Starts:</span>
                            {formatDateTime(comp.startTime)}
                          </div>
                        )}
                        {comp.endTime && (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <span className="text-gray-400 uppercase tracking-tighter">Ends:</span>
                            {formatDateTime(comp.endTime)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => status.canJoin && onJoinCompetition(comp._id)}
                    disabled={!status.canJoin}
                    className={`px-8 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 group-hover:px-10 font-bold ${
                      status.canJoin 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {status.label === 'Upcoming' ? 'Not Started' : status.label === 'Ended' ? 'Test Ended' : 'Participate'}
                    {status.canJoin && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 space-y-4">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <p className="text-xl font-bold text-gray-500">No active competitions</p>
            <p className="text-gray-400">Ask your admin to launch a new competition!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitionList
