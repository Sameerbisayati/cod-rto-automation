
import { useEffect, useState } from 'react'

function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders?limit=100`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load orders. Please try again.')
        }
        return response.json()
      })
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchText) ||
      order.order_id?.toLowerCase().includes(searchText) ||
      order.city?.toLowerCase().includes(searchText)

    const matchesFilter =
      filter === 'ALL' || order.final_status === filter

    return matchesSearch && matchesFilter
  })

  const filters = [
    { value: 'ALL', label: 'All Orders' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'RTO', label: 'Returned (RTO)' },
    { value: 'IN_TRANSIT', label: 'Pending Delivery' },
  ]

  const getStatusDetails = (status) => {
    const statuses = {
      DELIVERED: {
        label: 'Delivered',
        style: 'bg-green-500/10 text-green-400 border-green-500/20',
      },
      RTO: {
        label: 'Returned (RTO)',
        style: 'bg-red-500/10 text-red-400 border-red-500/20',
      },
      IN_TRANSIT: {
        label: 'Pending Delivery',
        style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      },
    }

    return statuses[status] || {
      label: status || 'Unknown',
      style: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    }
  }

  if (loading) {
    return (
      <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-slate-300 font-medium">
          Loading your orders...
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Please wait while we retrieve order information.
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-10 rounded-xl border border-red-900 bg-red-950/30 p-6">
        <h3 className="text-red-400 font-semibold">
          Unable to load orders
        </h3>
        <p className="text-sm text-slate-300 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300"
        >
          Try Again
        </button>
      </section>
    )
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Orders Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track customer orders and their delivery outcomes.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by customer, order ID or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500 w-full md:w-80"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Total Orders</p>
          <h3 className="text-2xl font-bold text-white mt-2">
            {orders.length}
          </h3>
        </div>

        <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-4">
          <p className="text-xs text-green-400">Delivered</p>
          <h3 className="text-2xl font-bold text-green-400 mt-2">
            {orders.filter((o) => o.final_status === 'DELIVERED').length}
          </h3>
        </div>

        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-xs text-red-400">Returned (RTO)</p>
          <h3 className="text-2xl font-bold text-red-400 mt-2">
            {orders.filter((o) => o.final_status === 'RTO').length}
          </h3>
        </div>

        <div className="rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-4">
          <p className="text-xs text-yellow-400">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-400 mt-2">
            {orders.filter((o) => o.final_status === 'IN_TRANSIT').length}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === item.value
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">City</th>
              <th className="p-4">Order Value</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Delivery Outcome</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {filteredOrders.map((order) => {
              const status = getStatusDetails(order.final_status)

              return (
                <tr
                  key={order.order_id}
                  className="bg-slate-950 hover:bg-slate-900 transition"
                >
                  <td className="p-4 text-cyan-400 font-medium">
                    {order.order_id}
                  </td>

                  <td className="p-4 text-white">
                    {order.customer_name || 'Not available'}
                  </td>

                  <td className="p-4 text-slate-300">
                    {order.city || 'Not available'}
                  </td>

                  <td className="p-4 text-white whitespace-nowrap">
                    ₹{Number(order.order_value || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="p-4 text-slate-300">
                    {order.payment_method || 'Not available'}
                  </td>

                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full border text-xs font-medium ${status.style}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center">
                  <p className="text-slate-300 font-medium">
                    No matching orders found.
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Try changing your search or selecting another filter.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500 mt-4">
        Showing {filteredOrders.length} of {orders.length} loaded orders.
      </p>

      <button
  className="back-to-top"
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  title="Back to top"
  aria-label="Back to top"
>
  ↑
</button>
    </section>
  )
}

export default OrdersTable
