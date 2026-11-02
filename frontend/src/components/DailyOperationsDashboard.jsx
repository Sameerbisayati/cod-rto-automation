
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const decisionItems = [
    {
        key: "SHIP_AS_IS",
        title: "Ship as-is",
        color: "text-green-400",
    },
    {
        key: "WHATSAPP_CONFIRMATION",
        title: "WhatsApp confirmation",
        color: "text-blue-400",
    },
    {
        key: "PREPAID_NUDGE",
        title: "Prepaid nudge",
        color: "text-purple-400",
    },
    {
        key: "HOLD_REVIEW",
        title: "Hold / Review",
        color: "text-orange-400",
    },
];

function DailyOperationsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDailyOperations = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/operations/daily`
            );

            if (!response.ok) {
                throw new Error("Unable to load daily operations.");
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyOperations();
    }, []);

    const formatDate = (date) => {
        if (!date) return "Yesterday";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <section className="text-slate-300">
                Loading daily operations...
            </section>
        );
    }

    if (error) {
        return (
            <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={fetchDailyOperations}
                    className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-white"
                >
                    Retry
                </button>
            </section>
        );
    }

    const counts = data.decision_counts || {};
    const financial = data.financial_impact || {};

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Daily Operations
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Actual new-order decisions for{" "}
                        {formatDate(data.date)}
                    </p>
                </div>

                <button
                    onClick={fetchDailyOperations}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {decisionItems.map((item) => (
                    <div
                        key={item.key}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                    >
                        <p className="text-sm text-slate-400">
                            {item.title}
                        </p>

                        <h3 className={`mt-3 text-3xl font-bold ${item.color}`}>
                            {counts[item.key] ?? 0}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                    Total orders evaluated
                </p>

                <h3 className="mt-2 text-3xl font-bold text-white">
                    {data.total_evaluated_orders}
                </h3>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                <h3 className="font-semibold text-amber-300">
                    Financial Impact
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                    {financial.note}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-400">
                            Estimated avoided RTO cost
                        </p>
                        <p className="mt-1 font-semibold text-white">
                            {financial.estimated_avoided_rto_cost == null
                                ? "Not measurable"
                                : `₹${financial.estimated_avoided_rto_cost}`}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Potential genuine-order loss
                        </p>
                        <p className="mt-1 font-semibold text-white">
                            {financial.estimated_genuine_order_loss == null
                                ? "Not measurable"
                                : `₹${financial.estimated_genuine_order_loss}`}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Net financial impact
                        </p>
                        <p className="mt-1 font-semibold text-white">
                            {financial.estimated_net_impact == null
                                ? "Not measurable"
                                : `₹${financial.estimated_net_impact}`}
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-xs text-amber-300">
                    Financial savings will be reported only after actual
                    order outcomes and a validated comparison are available.
                </p>
            </div>
        </section>
    );
}

export default DailyOperationsDashboard;
