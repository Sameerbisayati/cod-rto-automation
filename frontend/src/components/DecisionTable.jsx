
import { Fragment, useEffect, useState } from 'react'

function DecisionTable() {
  const [decisions, setDecisions] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/decisions`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load decisions')
        }
        return response.json()
      })
      .then((data) => setDecisions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredDecisions = decisions.filter((item) => {
    const customerName = String(item.customer_name || '').toLowerCase()
    const orderId = String(item.order_id || '').toLowerCase()
    const searchText = search.trim().toLowerCase()
    const itemAction = String(item.action || '').trim().toUpperCase()

    const matchesSearch =
      customerName.includes(searchText) ||
      orderId.includes(searchText)

    const matchesFilter = filter === 'ALL' || itemAction === filter

    return matchesSearch && matchesFilter
  })

  const getActionStyle = (action) => {
    const styles = {
      SHIP_AS_IS: 'bg-green-500/10 text-green-400',
      WHATSAPP_CONFIRMATION: 'bg-blue-500/10 text-blue-400',
      PREPAID_NUDGE: 'bg-yellow-500/10 text-yellow-400',
      HOLD_REVIEW: 'bg-red-500/10 text-red-400',
    }

    return styles[action] || 'bg-slate-700 text-white'
  }

  const actionLabels = {
    SHIP_AS_IS: 'Ship as-is',
    WHATSAPP_CONFIRMATION: 'WhatsApp confirmation',
    PREPAID_NUDGE: 'Prepaid nudge',
    HOLD_REVIEW: 'Hold for review',
  }

  if (loading) {
    return <p className="text-slate-400">Loading decisions...</p>
  }

  if (error) {
    return <p className="text-red-400">{error}</p>
  }

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-cyan-400 text-sm font-semibold tracking-widest">
          INTELLIGENCE
        </p>

        <h2 className="text-2xl font-bold text-white mt-2">
          COD Decision Engine
        </h2>

        <p className="text-slate-400 text-sm mt-2">
          Risk analysis and recommended actions for every order.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search order or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white w-full md:w-80 outline-none focus:border-cyan-500"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
        >
          <option value="ALL">All actions</option>
          <option value="SHIP_AS_IS">Ship as-is</option>
          <option value="WHATSAPP_CONFIRMATION">WhatsApp confirmation</option>
          <option value="PREPAID_NUDGE">Prepaid nudge</option>
          <option value="HOLD_REVIEW">Hold for review</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Order Value</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Recommended Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {filteredDecisions.map((item, index) => {
              const action = String(item.action || '').trim().toUpperCase()
              const rowKey = `${item.order_id}-${index}`
              const isExpanded = expandedOrder === rowKey

              return (
                <Fragment key={rowKey}>
                  <tr className="bg-slate-950 hover:bg-slate-900">
                    <td className="p-4 text-cyan-400">
                      {item.order_id}
                    </td>

                    <td className="p-4 text-white">
                      {item.customer_name}
                    </td>

                    <td className="p-4 text-white">
                      ₹{Number(item.order_value).toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">
                          {item.risk_score ?? 'N/A'}/100
                        </span>

                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, Number(item.risk_score) || 0))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${getActionStyle(action)}`}
                      >
                        {actionLabels[action] || action}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : rowKey)
                        }
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        {isExpanded ? 'Hide Details ↑' : 'View Details ↓'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-900">
                      <td colSpan="6" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-white font-semibold mb-3">
                              Decision Explanation
                            </h3>

                            <p className="text-slate-300 text-sm leading-6">
                              {item.explanation || 'No explanation available'}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-white font-semibold mb-3">
                              Risk Factors
                            </h3>

                            {item.reasons?.length > 0 ? (
                              <ul className="space-y-2">
                                {item.reasons.map((reason, reasonIndex) => (
                                  <li
                                    key={reasonIndex}
                                    className="text-slate-300 text-sm flex gap-2"
                                  >
                                    <span className="text-cyan-400">•</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 text-sm">
                                No additional risk factors recorded.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-700">
                          <p className="text-xs text-slate-500">
                            Recommended action: {actionLabels[action] || action}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {filteredDecisions.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">
                  No decisions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-slate-500 text-sm mt-4">
        Showing {filteredDecisions.length} of {decisions.length} decisions
      </p>
    </section>
  )
}

export default DecisionTable
