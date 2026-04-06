import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, Navigate } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, Home, RefreshCw, AlertCircle, Medal, Users } from 'lucide-react'

const ResultsPage = ({ results }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const competitionId = results?.competitionId;
        const url = competitionId ? `/api/leaderboard?competitionId=${competitionId}` : '/api/leaderboard';
        const res = await axios.get(url)
        setLeaderboard(res.data)
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
      } finally {
        setLoadingLeaderboard(false)
      }
    }
    fetchLeaderboard()
  }, [results])

  // If no results, redirect back to quiz
  if (!results) return <Navigate to="/" />

  const { totalQuestions, correctCount, scorePercentage, results: detailedResults } = results

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in duration-500">
      {/* Score Header */}
      <div className="bg-white p-8 rounded-3xl shadow-xl space-y-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-10 rounded-2xl text-white shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={120} />
          </div>
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-300" />
            Quiz Result
          </h2>
          <div className="flex justify-center gap-10 mt-6 flex-wrap">
            <div className="flex flex-col items-center bg-white/20 p-4 rounded-xl backdrop-blur-sm min-w-[120px]">
              <span className="text-4xl font-black">{scorePercentage}%</span>
              <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Score</span>
            </div>
            <div className="flex flex-col items-center bg-white/20 p-4 rounded-xl backdrop-blur-sm min-w-[120px]">
              <span className="text-4xl font-black">{correctCount} / {totalQuestions}</span>
              <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Correct</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b pb-4 border-gray-100">
            <Medal className="text-yellow-500" />
            Top 10 Leaderboard
          </h3>
          
          {loadingLeaderboard ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin text-blue-500" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Rank</th>
                    <th className="px-6 py-4 font-bold">Player</th>
                    <th className="px-6 py-4 font-bold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((entry, index) => (
                    <tr key={entry._id} className={`${index === 0 ? 'bg-yellow-50/50' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Medal size={18} className="text-yellow-500" />}
                          {index === 1 && <Medal size={18} className="text-gray-400" />}
                          {index === 2 && <Medal size={18} className="text-amber-600" />}
                          <span className="font-bold text-gray-700">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{entry.username}</td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">{entry.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="mx-auto mb-2 opacity-20" size={48} />
              <p>No results yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b pb-4 border-gray-100">
          Detailed Feedback
        </h3>
        <div className="space-y-4">
          {detailedResults.map((res, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 text-left ${
                res.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
              }`}
            >
              <div className="flex-1 space-y-3">
                <p className="text-lg font-bold text-gray-800 flex gap-2">
                  <span className="text-blue-500 font-black">Q{index + 1}.</span>
                  {res.question}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="text-gray-500 uppercase text-[10px] font-bold">Your Answer:</span>
                    <span className={res.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {res.userAnswer || <i className="text-gray-400 italic">No answer provided</i>}
                    </span>
                  </div>
                  
                  {!res.isCorrect && (
                    <div className="flex items-center gap-2 bg-green-100/50 px-3 py-1.5 rounded-lg border border-green-200">
                      <span className="text-green-700 uppercase text-[10px] font-bold">Correct Answer:</span>
                      <span className="text-green-700">{res.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-sm whitespace-nowrap self-start md:self-center ${
                res.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {res.isCorrect ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Correct</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    <span>Incorrect</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/" 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw size={20} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default ResultsPage
