
import { useEffect, useState } from 'react'

function DecisionLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/decision-log`
        )

        if (!response.ok) {
          throw new Error('Failed to load decision logs')
        }

        const data = await response.json()
        setLogs(data.decision_logs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const getActionStyle = (action) => {
    const styles = {
      SHIP_AS_IS: 'bg-green-500/10 text-green-400',
      WHATSAPP_CONFIRMATION: 'bg-blue-500/10 text-blue-400',
      PREPAID_NUDGE: 'bg-yellow-500/10 text-yellow-400',
      HOLD_REVIEW: 'bg-red-500/10 text-red-400',
    }

    return styles[action] || 'bg-slate-700 text-slate-300'
  }

  if (loading) {
    return <p className="text-slate-400 p-6">Loading decision logs...</p>
  }

  if (error) {
    return <p className="text-red-400 p-6">{error}</p>
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">Decision Log</h2>
          <p className="text-slate-400 text-sm mt-1">
            Historical order recommendations and their explanations
          </p>
        </div>

        <span className="text-slate-400 text-sm">
          Total logs: {logs.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-225">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-700">
              <th className="py-3 px-3">Order ID</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Risk Score</th>
              <th className="py-3 px-3">Recommended Action</th>
              <th className="py-3 px-3">Explanation</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.log_id}
                className="border-b border-slate-800 text-sm"
              >
                <td className="py-4 px-3 text-white">
                  {log.order_id}
                </td>

                <td className="py-4 px-3 text-slate-300">
                  {log.customer_name}
                </td>

                <td className="py-4 px-3 text-white font-semibold">
                  {log.risk_score ?? 'N/A'}
                </td>

                <td className="py-4 px-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionStyle(log.action)}`}>
                    {log.action?.replaceAll('_', ' ')}
                  </span>
                </td>

                <td className="py-4 px-3 text-slate-400 max-w-md">
                  {log.explanation || 'No explanation available'}
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  No decision logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        These are retrospective recommendations generated from historical
        order data, not records of actions actually executed.
      </p>
    </section>
  )
}

export default DecisionLog
