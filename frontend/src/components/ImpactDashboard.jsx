
import { useEffect, useState } from 'react'

function ImpactDashboard() {
  const [impact, setImpact] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/impact`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load financial impact')
        }
        return response.json()
      })
      .then((data) => setImpact(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const actionDetails = [
    {
      key: 'SHIP_AS_IS',
      label: 'Ship as-is',
      color: 'bg-green-400',
      textColor: 'text-green-400',
    },
    {
      key: 'WHATSAPP_CONFIRMATION',
      label: 'WhatsApp confirmation',
      color: 'bg-blue-400',
      textColor: 'text-blue-400',
    },
    {
      key: 'PREPAID_NUDGE',
      label: 'Prepaid nudge',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-400',
    },
    {
      key: 'HOLD_REVIEW',
      label: 'Hold for review',
      color: 'bg-red-400',
      textColor: 'text-red-400',
    },
  ]

  if (loading) {
    return <p className="text-slate-400 mt-10">Loading impact report...</p>
  }

  if (error) {
    return <p className="text-red-400 mt-10">{error}</p>
  }

  if (!impact) return null

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-cyan-400 text-sm font-semibold tracking-widest">
          BUSINESS INTELLIGENCE
        </p>

        <h2 className="text-2xl font-bold text-white mt-2">
          Financial Impact Analysis
        </h2>

        <p className="text-slate-400 text-sm mt-2">
          Historical RTO cost and recommended order decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Orders</p>
          <h3 className="text-3xl font-bold text-white mt-2">
            {impact.total_orders.toLocaleString('en-IN')}
          </h3>
          <p className="text-slate-500 text-xs mt-2">
            Orders analyzed
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Historical RTO Orders</p>
          <h3 className="text-3xl font-bold text-red-400 mt-2">
            {impact.historical_rto_orders.toLocaleString('en-IN')}
          </h3>
          <p className="text-slate-500 text-xs mt-2">
            Returned to origin
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Estimated Historical RTO Cost</p>
          <h3 className="text-3xl font-bold text-yellow-400 mt-2">
            ₹{impact.estimated_historical_rto_cost.toLocaleString('en-IN')}
          </h3>
          <p className="text-slate-500 text-xs mt-2">
            Estimated using supplied cost assumptions
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
        <h3 className="text-white font-semibold text-lg mb-5">
          Decision Distribution
        </h3>

        <div className="space-y-5">
          {actionDetails.map((item) => {
            const count = impact.action_counts[item.key] || 0
            const percentage = impact.total_orders
              ? (count / impact.total_orders) * 100
              : 0

            return (
              <div key={item.key}>
                <div className="flex justify-between gap-3 mb-2">
                  <span className="text-slate-300 text-sm">
                    {item.label}
                  </span>

                  <span className={`font-semibold text-sm ${item.textColor}`}>
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
        <h3 className="text-white font-semibold text-lg mb-4">
          RTO Cost Breakdown
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Forward shipping</span>
            <span className="text-white">
              ₹{impact.cost_assumptions.forward_shipping}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Return shipping</span>
            <span className="text-white">
              ₹{impact.cost_assumptions.return_shipping}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Packaging and handling</span>
            <span className="text-white">
              ₹{impact.cost_assumptions.packaging_handling}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">
              Expected damaged-product cost per RTO
            </span>
            <span className="text-white">
              ₹{(
                impact.cost_assumptions.damaged_return_rate *
                impact.cost_assumptions.damaged_product_cost
              ).toFixed(2)}
            </span>
          </div>

          <div className="border-t border-slate-700 pt-3 flex justify-between">
            <span className="text-white font-semibold">
              Estimated cost per RTO
            </span>
            <span className="text-cyan-400 font-bold">
              ₹{impact.average_estimated_rto_cost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-4">
        {impact.note}
      </p>
    </section>
  )
}

export default ImpactDashboard
