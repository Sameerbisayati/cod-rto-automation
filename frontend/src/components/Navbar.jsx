
const navigationItems = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "evaluator", label: "AI Evaluator" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "analytics", label: "Analytics" },
    { id: "impact", label: "Impact" },
];

function Navbar({ activeSection, onNavigate }) {
    return (
        <nav className="mt-8 border-b border-slate-800">
            <div className="flex gap-2 overflow-x-auto pb-3">
                {navigationItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 ${
                            activeSection === item.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}

export default Navbar;
