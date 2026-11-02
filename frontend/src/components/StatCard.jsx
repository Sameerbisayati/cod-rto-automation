
function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/40 transition">
      <p className="text-sm text-slate-400">{title}</p>

      <h2 className="text-3xl font-bold text-white mt-3">
        {value}
      </h2>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-3">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default StatCard
