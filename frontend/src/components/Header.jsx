
function Header() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <div>
        <p className="text-sm font-semibold tracking-widest text-cyan-400 mb-2">
          COD INTELLIGENCE PLATFORM
        </p>

        <h1 className="text-3xl font-bold text-white">
          COD RTO Automation
        </h1>

        <p className="text-slate-400 mt-2">
          Monitor orders, delivery performance and RTO risk.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-lg w-fit">
        <span className="h-2 w-2 bg-green-400 rounded-full"></span>
        System Online
      </div>
    </header>
  )
}

export default Header
